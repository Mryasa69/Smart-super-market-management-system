const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    googleId: {
      type: String,
      default: null,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false,
    },
    loyaltyPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPurchases: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastPurchase: {
      type: Date,
      default: null,
    },
    tier: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
      default: 'Bronze',
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpire: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
customerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Auto-calculate tier before saving based on loyalty points
customerSchema.pre('save', function (next) {
  if (this.loyaltyPoints >= 5000) {
    this.tier = 'Platinum';
  } else if (this.loyaltyPoints >= 2000) {
    this.tier = 'Gold';
  } else if (this.loyaltyPoints >= 1000) {
    this.tier = 'Silver';
  } else {
    this.tier = 'Bronze';
  }
  next();
});

module.exports = mongoose.model('Customer', customerSchema);
