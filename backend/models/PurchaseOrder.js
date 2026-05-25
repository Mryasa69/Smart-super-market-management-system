const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema(
  {
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Supplier is required'],
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    expectedDelivery: {
      type: Date,
      required: [true, 'Expected delivery date is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'delivered', 'cancelled'],
      default: 'pending',
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    items: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
