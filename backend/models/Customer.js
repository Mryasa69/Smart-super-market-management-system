const mongoose = require('mongoose');

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
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
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
  },
  {
    timestamps: true,
  }
);

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
