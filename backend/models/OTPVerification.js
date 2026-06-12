const mongoose = require('mongoose');

const otpVerificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 900, // Document automatically deletes after 15 minutes (900 seconds)
  },
});

module.exports = mongoose.model('OTPVerification', otpVerificationSchema);
