const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// Get user's notifications
router.get('/my-notifications', auth, async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .sort({ createdAt: -1 })
            .populate('relatedProduce')
            .populate('relatedOrder')
            .limit(50);
        
        res.json(notifications);
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Mark notification as read
router.patch('/:id/read', auth, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user.id },
            { read: true },
            { new: true }
        );
        
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        
        res.json(notification);
    } catch (error) {
        console.error('Mark notification read error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a notification
async function createNotification(recipientId, type, message, produceId = null, orderId = null) {
    try {
        const notification = new Notification({
            recipient: recipientId,
            type,
            message,
            relatedProduce: produceId,
            relatedOrder: orderId
        });
        
        await notification.save();
        return notification;
    } catch (error) {
        console.error('Create notification error:', error);
        return null;
    }
}

module.exports = { router, createNotification };
