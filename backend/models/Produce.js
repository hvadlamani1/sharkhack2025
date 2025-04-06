const mongoose = require('mongoose');

const produceSchema = new mongoose.Schema({
    thresholdPercentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
        default: 0 // Default 20% threshold
    },
    thresholdReached: {
        type: Boolean,
        default: false
    },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  produceType: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  measurement: {
    type: String,
    required: true,
    enum: ['kg', 'lbs', 'units', 'boxes', 'bushels', 'tons', 'quintals']
  },
  grade: {
    type: String,
    required: true,
    enum: ['A', 'B'],
    uppercase: true
  },
  location: {
    type: String,
    required: false,
    trim: true
  },
  pricePerMeasurement: {
    type: Number,
    required: true,
    min: 0
  },
  available: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
  originalAmount: {
    type: Number,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
produceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Produce', produceSchema);
