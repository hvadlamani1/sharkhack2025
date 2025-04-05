const express = require('express');
const router = express.Router();
const FoodBank = require('../models/FoodBank');
const auth = require('../middleware/auth');

// Get random active food bank
router.get('/random', auth, async (req, res) => {
    try {
        // Get random food bank using MongoDB aggregation
        const foodBanks = await FoodBank.aggregate([
            { $match: { active: true } },
            { $sample: { size: 1 } }
        ]);
        
        if (foodBanks.length === 0) {
            return res.status(404).json({ message: 'No food banks available' });
        }
        
        res.json(foodBanks[0]);
    } catch (error) {
        console.error('Get random food bank error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add a new food bank (admin only)
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const foodBank = new FoodBank(req.body);
        await foodBank.save();
        
        res.status(201).json(foodBank);
    } catch (error) {
        console.error('Add food bank error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
