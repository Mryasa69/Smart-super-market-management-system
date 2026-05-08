const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: [true, 'Action is required'],
      enum: [
        'product_created',
        'product_updated', 
        'product_deleted',
        'employee_created',
        'employee_updated',
        'employee_deleted',
        'supplier_created',
        'supplier_updated',
        'supplier_deleted',
        'purchase_order_created',
        'purchase_order_updated',
        'purchase_order_deleted',
        'sale_completed',
        'customer_created',
        'customer_updated'
      ],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    user: {
      type: String,
      required: [true, 'User is required'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    amount: {
      type: String,
    },
    entityType: {
      type: String,
      enum: ['Product', 'Employee', 'Supplier', 'PurchaseOrder', 'Sale', 'Customer'],
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Activity', activitySchema);
