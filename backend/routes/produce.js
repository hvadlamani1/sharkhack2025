const router = require('express').Router();
const auth = require('../middleware/auth');
const Produce = require('../models/Produce');

// Middleware to check if user is a farmer
const isFarmer = (req, res, next) => {
  if (req.user.userType !== 'farmer') {
    return res.status(403).json({ message: 'Access denied. Farmers only.' });
  }
  next();
};

// Create a new produce listing (farmers only)
router.post('/', auth, isFarmer, async (req, res) => {
  try {
    const { produceType, amount, measurement, grade, location, pricePerMeasurement } = req.body;

    const produce = new Produce({
      farmer: req.user.id,
      produceType,
      amount,
      measurement,
      grade,
      location,
      pricePerMeasurement
    });

    await produce.save();
    res.status(201).json(produce);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all produce listings
router.get('/', async (req, res) => {
  try {
    const produces = await Produce.find({ available: true })
      .populate('farmer', 'name email')
      .sort({ createdAt: -1 });
    res.json(produces);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific produce listing
router.get('/:id', async (req, res) => {
  try {
    const produce = await Produce.findById(req.params.id)
      .populate('farmer', 'name email');
    if (!produce) {
      return res.status(404).json({ message: 'Produce not found' });
    }
    res.json(produce);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a produce listing (farmer only, must be the owner)
router.put('/:id', auth, isFarmer, async (req, res) => {
  try {
    const produce = await Produce.findById(req.params.id);
    if (!produce) {
      return res.status(404).json({ message: 'Produce not found' });
    }

    // Check if the farmer owns this produce listing
    if (produce.farmer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this listing' });
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      produce[key] = updates[key];
    });

    await produce.save();
    res.json(produce);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a produce listing (farmer only, must be the owner)
router.delete('/:id', auth, isFarmer, async (req, res) => {
  try {
    const produce = await Produce.findById(req.params.id);
    if (!produce) {
      return res.status(404).json({ message: 'Produce not found' });
    }

    // Check if the farmer owns this produce listing
    if (produce.farmer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }

    await produce.deleteOne();
    res.json({ message: 'Produce listing deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all produce listings for the logged-in farmer
router.get('/farmer/my-listings', auth, isFarmer, async (req, res) => {
  try {
    const produces = await Produce.find({ farmer: req.user.id })
      .sort({ createdAt: -1 });
    res.json(produces);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
