const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  subtotal: {
    type: Number,
    required: true,
  },
});

const saleSchema = new mongoose.Schema(
  {
    items: {
      type: [saleItemSchema],
      required: true,
      validate: {
        validator: function (v) {
          return v.length > 0;
        },
        message: 'Sale must have at least one item',
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'qr'],
      required: [true, 'Payment method is required'],
    },
    cashier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Sale', saleSchema);
