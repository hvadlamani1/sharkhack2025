const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 2
  },
  userType: {
    type: String,
    required: true,
    enum: ['farmer', 'consumer']
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  // Consumer specific fields
  businessName: {
    type: String,
    required: function() { return this.userType === 'consumer'; },
    trim: true
  },
  phoneNumber: {
    type: String,
    required: function() { return this.userType === 'consumer'; },
    trim: true
  },
  businessType: {
    type: String,
    required: function() { return this.userType === 'consumer'; },
    enum: [
      'Restaurant',
      'Grocery Store',
      'Food Processing',
      'Food Bank/Shelter',
      'Other'
    ]
  },
  // Farmer specific fields
  farmName: {
    type: String,
    required: function() { return this.userType === 'farmer'; },
    trim: true
  },
  farmLocation: {
    type: String,
    required: function() { return this.userType === 'farmer'; },
    trim: true
  },
  farmSize: {
    type: Number,
    required: function() { return this.userType === 'farmer'; },
    min: 0
  },
  certifications: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
