const mongoose = require('mongoose');

const produceSchema = new mongoose.Schema({
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
    enum: ['kg', 'lbs', 'units', 'boxes', 'bushels']
  },
  grade: {
    type: String,
    required: true,
    enum: ['A', 'B'],
    uppercase: true
  },
  location: {
    type: String,
    required: true,
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
