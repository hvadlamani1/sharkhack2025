const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Produce = require('../models/Produce');
const FoodBank = require('../models/FoodBank');
const auth = require('../middleware/auth');
const { createNotification } = require('./notifications');

// Create a new order
router.post('/', auth, async (req, res) => {
    try {
        const { produceId, quantity } = req.body;
        
        if (!produceId) {
            return res.status(400).json({ message: 'Produce ID is required' });
        }

        if (!quantity || quantity <= 0) {
            return res.status(400).json({ message: 'Valid quantity is required' });
        }
        
        // Verify the produce exists and has enough quantity
        const produce = await Produce.findById(produceId);
        if (!produce) {
            return res.status(404).json({ message: 'Produce not found' });
        }

        // Check if produce is from a different farmer
        if (req.user.userType === 'farmer' && produce.farmer.toString() === req.user.id) {
            return res.status(400).json({ message: 'Cannot purchase your own produce' });
        }
        
        if (produce.amount < quantity) {
            return res.status(400).json({ message: 'Not enough quantity available' });
        }

        // Calculate total price
        const totalPrice = quantity * produce.pricePerMeasurement;

        // Create the order
        const order = new Order({
            consumer: req.user.id,
            produce: produceId,
            farmer: produce.farmer,
            quantity,
            totalPrice
        });

        // Update produce quantity
        produce.amount -= quantity;

        // Check if threshold is reached
        const remainingPercentage = (produce.amount / produce.initialAmount) * 100;
        if (!produce.thresholdReached && remainingPercentage <= produce.thresholdPercentage) {
            produce.thresholdReached = true;
            
            // Get a random food bank
            const foodBanks = await FoodBank.aggregate([{ $match: { active: true } }, { $sample: { size: 1 } }]);
            
            if (foodBanks.length > 0) {
                const foodBank = foodBanks[0];
                
                // Create donation order
                const donationOrder = new Order({
                    consumer: foodBank._id,
                    produce: produceId,
                    farmer: produce.farmer,
                    quantity: produce.amount,
                    totalPrice: 0, // Donated for free
                    isDonation: true
                });
                
                await donationOrder.save();
                
                // Create notifications
                await createNotification(
                    produce.farmer,
                    'threshold',
                    `Your produce ${produce.produceType} has reached the donation threshold. Remaining ${produce.amount} ${produce.measurement} will be donated to ${foodBank.name}.`,
                    produceId
                );
            }
        }

        await produce.save();

        // Save the order
        await order.save();

        // Create notifications for purchase
        await createNotification(
            produce.farmer,
            'purchase',
            `${req.user.name} has purchased ${quantity} ${produce.measurement} of your ${produce.produceType}.`,
            produceId,
            order._id
        );

        await createNotification(
            req.user.id,
            'purchase',
            `Your purchase of ${quantity} ${produce.measurement} of ${produce.produceType} was successful. Contact farmer at ${produce.farmer.email} to arrange pickup.`,
            produceId,
            order._id
        );

        res.status(201).json(order);
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get consumer's orders
router.get('/my-orders', auth, async (req, res) => {
    try {
        const orders = await Order.find({ consumer: req.user.id })
            .populate('produce')
            .populate('farmer', 'name email')
            .sort({ orderDate: -1 });
        res.json(orders);
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get farmer's received orders
router.get('/received-orders', auth, async (req, res) => {
    try {
        const orders = await Order.find({ farmer: req.user.id })
            .populate('produce')
            .populate('consumer', 'name email businessName')
            .sort({ orderDate: -1 });
        res.json(orders);
    } catch (error) {
        console.error('Get received orders error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update order status
router.patch('/:orderId/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.orderId);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        // Only farmer can update order status
        if (order.farmer.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        order.status = status;
        await order.save();
        
        res.json(order);
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
