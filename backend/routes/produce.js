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

// Get all produce listings with filters
router.get('/', async (req, res) => {
  try {
    const {
      produceType,
      minPrice,
      maxPrice,
      grade,
      measurement,
      location,
      sortBy,
      sortOrder
    } = req.query;

    // Build filter object
    const filter = { available: true, isDeleted: false };
    
    if (produceType) {
      filter.produceType = { $regex: produceType, $options: 'i' };
    }
    
    if (minPrice || maxPrice) {
      filter.pricePerMeasurement = {};
      if (minPrice) filter.pricePerMeasurement.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerMeasurement.$lte = Number(maxPrice);
    }
    
    if (grade) {
      filter.grade = grade.toUpperCase();
    }
    
    if (measurement) {
      filter.measurement = measurement;
    }
    
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    // Build sort object
    let sort = { createdAt: -1 }; // default sort
    if (sortBy) {
      sort = {
        [sortBy]: sortOrder === 'desc' ? -1 : 1
      };
    }

    const produces = await Produce.find(filter)
      .populate('farmer', 'name email')
      .sort(sort);

    // Get unique values for filters
    const aggregation = await Produce.aggregate([
      { $match: { available: true, isDeleted: false } },
      {
        $group: {
          _id: null,
          produceTypes: { $addToSet: '$produceType' },
          locations: { $addToSet: '$location' },
          minPrice: { $min: '$pricePerMeasurement' },
          maxPrice: { $max: '$pricePerMeasurement' },
          measurements: { $addToSet: '$measurement' }
        }
      }
    ]);

    const filterOptions = aggregation[0] || {
      produceTypes: [],
      locations: [],
      minPrice: 0,
      maxPrice: 0,
      measurements: []
    };

    res.json({
      produces,
      filterOptions,
      totalCount: produces.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get available filter options
router.get('/filter-options', async (req, res) => {
  try {
    const aggregation = await Produce.aggregate([
      { $match: { available: true, isDeleted: false } },
      {
        $group: {
          _id: null,
          produceTypes: { $addToSet: '$produceType' },
          locations: { $addToSet: '$location' },
          minPrice: { $min: '$pricePerMeasurement' },
          maxPrice: { $max: '$pricePerMeasurement' },
          measurements: { $addToSet: '$measurement' }
        }
      }
    ]);

    const filterOptions = aggregation[0] || {
      produceTypes: [],
      locations: [],
      minPrice: 0,
      maxPrice: 0,
      measurements: []
    };

    res.json(filterOptions);
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

    // Move to history instead of deleting
    produce.isDeleted = true;
    produce.deletedAt = new Date();
    produce.originalAmount = produce.amount;
    await produce.save();

    res.json({ message: 'Listing moved to history' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get farmer's listing history
router.get('/farmer/history', auth, isFarmer, async (req, res) => {
  try {
    const history = await Produce.find({
      farmer: req.user.id,
      isDeleted: true
    }).sort({ deletedAt: -1 }); // Most recent first
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get farmer's active listings
router.get('/farmer/my-listings', auth, isFarmer, async (req, res) => {
  try {
    const produces = await Produce.find({ 
      farmer: req.user.id,
      isDeleted: false 
    }).sort({ createdAt: -1 });
    res.json(produces);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
