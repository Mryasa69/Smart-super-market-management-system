const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', 'env') });

// Import models
const User = require('../models/User');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const PurchaseOrder = require('../models/PurchaseOrder');
const Employee = require('../models/Employee');
const Customer = require('../models/Customer');
const Sale = require('../models/Sale');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Supplier.deleteMany({});
    await PurchaseOrder.deleteMany({});
    await Employee.deleteMany({});
    await Customer.deleteMany({});
    await Sale.deleteMany({});
    console.log('Cleared existing data');

    // ============ USERS ============
    const users = await User.create([
      {
        firstName: 'Sarah',
        lastName: 'Williams',
        email: 'admin@smartsuper.lk',
        password: 'AdminUser@123',
        role: 'admin',
      },
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@smartsuper.lk',
        password: 'CashierUser@123',
        role: 'cashier',
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@smartsuper.lk',
        password: 'StockUser@123',
        role: 'stock_manager',
      },
    ]);
    console.log(`Created ${users.length} users`);

    // ============ PRODUCTS ============
    const products = await Product.create([
      { name: 'Fresh Milk 1L', category: 'Dairy', sku: 'MILK001', quantity: 150, price: 280, minStock: 50, supplier: 'Dairy Farm Ltd', barcode: 'MILK001', specialOffers: true },
      { name: 'White Bread', category: 'Bakery', sku: 'BREAD001', quantity: 80, price: 120, minStock: 30, supplier: 'Golden Bakery', barcode: 'BREAD001', specialOffers: true },
      { name: 'Tomatoes 1kg', category: 'Vegetables', sku: 'VEG001', quantity: 15, price: 350, minStock: 50, supplier: 'Fresh Farms', barcode: 'VEG001', weeklyDeals: true, weeklyDealsAddedAt: new Date() },
      { name: 'Chicken 1kg', category: 'Meat', sku: 'MEAT001', quantity: 45, price: 850, minStock: 20, supplier: 'ABC Poultry', barcode: 'MEAT001', specialOffers: true },
      { name: 'Rice 5kg', category: 'Grains', sku: 'RICE001', quantity: 0, price: 600, minStock: 10, supplier: 'Rice Mills', barcode: 'RICE001', weeklyDeals: true, weeklyDealsAddedAt: new Date() },
      { name: 'Orange Juice 1L', category: 'Beverages', sku: 'BEV001', quantity: 30, price: 320, minStock: 75, supplier: 'Fruit Drinks Co', barcode: 'BEV001', specialOffers: true },
      { name: 'Chocolate Bar', category: 'Snacks', sku: 'SNACK001', quantity: 200, price: 180, minStock: 100, supplier: 'Sweet Treats', barcode: 'SNACK001' },
      { name: 'Eggs (Dozen)', category: 'Dairy', sku: 'EGG001', quantity: 25, price: 450, minStock: 100, supplier: 'Dairy Farm Ltd', barcode: 'EGG001' },
      { name: 'Fresh Apples 1kg', category: 'Fruits', sku: 'FRUIT001', quantity: 120, price: 450, minStock: 40, supplier: 'Fresh Farms', barcode: 'FRUIT001', weeklyDeals: true, weeklyDealsAddedAt: new Date() },
      { name: 'Butter 500g', category: 'Dairy', sku: 'DAIRY002', quantity: 8, price: 680, minStock: 40, supplier: 'Dairy Farm Ltd', barcode: 'DAIRY002' },
    ]);
    console.log(`Created ${products.length} products`);

    // ============ SUPPLIERS ============
    const suppliers = await Supplier.create([
      {
        name: 'Dairy Farm Ltd',
        contactPerson: 'Sunil Perera',
        email: 'contact@dairyfarm.lk',
        phone: '+94 11 234 5678',
        address: 'Colombo 05, Sri Lanka',
        category: 'Dairy Products',
        rating: 4.5,
        totalOrders: 125,
        activeOrders: 3,
        lastDelivery: new Date('2025-12-09'),
        status: 'active',
      },
      {
        name: 'Fresh Farms',
        contactPerson: 'Kamal Silva',
        email: 'info@freshfarms.lk',
        phone: '+94 11 345 6789',
        address: 'Nuwara Eliya, Sri Lanka',
        category: 'Vegetables & Fruits',
        rating: 4.8,
        totalOrders: 98,
        activeOrders: 2,
        lastDelivery: new Date('2025-12-10'),
        status: 'active',
      },
      {
        name: 'ABC Poultry',
        contactPerson: 'Nimal Fernando',
        email: 'sales@abcpoultry.lk',
        phone: '+94 11 456 7890',
        address: 'Gampaha, Sri Lanka',
        category: 'Meat & Poultry',
        rating: 4.2,
        totalOrders: 87,
        activeOrders: 1,
        lastDelivery: new Date('2025-12-08'),
        status: 'active',
      },
      {
        name: 'Golden Bakery',
        contactPerson: 'Chamari Wickrama',
        email: 'orders@goldenbakery.lk',
        phone: '+94 11 567 8901',
        address: 'Kandy, Sri Lanka',
        category: 'Bakery Products',
        rating: 4.6,
        totalOrders: 156,
        activeOrders: 4,
        lastDelivery: new Date('2025-12-10'),
        status: 'active',
      },
      {
        name: 'Rice Mills Co',
        contactPerson: 'Raveen Mendis',
        email: 'contact@ricemills.lk',
        phone: '+94 11 678 9012',
        address: 'Ampara, Sri Lanka',
        category: 'Grains & Rice',
        rating: 3.9,
        totalOrders: 45,
        activeOrders: 0,
        lastDelivery: new Date('2025-11-28'),
        status: 'inactive',
      },
    ]);
    console.log(`Created ${suppliers.length} suppliers`);

    // ============ PURCHASE ORDERS ============
    const purchaseOrders = await PurchaseOrder.create([
      {
        supplierId: suppliers[0]._id,
        orderDate: new Date('2025-12-08'),
        expectedDelivery: new Date('2025-12-12'),
        status: 'confirmed',
        totalAmount: 125000,
        items: 15,
      },
      {
        supplierId: suppliers[1]._id,
        orderDate: new Date('2025-12-09'),
        expectedDelivery: new Date('2025-12-11'),
        status: 'pending',
        totalAmount: 85000,
        items: 22,
      },
      {
        supplierId: suppliers[3]._id,
        orderDate: new Date('2025-12-10'),
        expectedDelivery: new Date('2025-12-13'),
        status: 'confirmed',
        totalAmount: 45000,
        items: 18,
      },
      {
        supplierId: suppliers[2]._id,
        orderDate: new Date('2025-12-07'),
        expectedDelivery: new Date('2025-12-10'),
        status: 'delivered',
        totalAmount: 156000,
        items: 12,
      },
    ]);
    console.log(`Created ${purchaseOrders.length} purchase orders`);

    // ============ EMPLOYEES ============
    const employees = await Employee.create([
      {
        name: 'John Doe',
        email: 'john@smartsuper.lk',
        role: 'cashier',
        phone: '+94 77 123 4567',
        joinDate: new Date('2024-01-15'),
        status: 'active',
        lastLogin: new Date('2025-12-10T09:30:00'),
        workingHours: 168,
      },
      {
        name: 'Jane Smith',
        email: 'jane@smartsuper.lk',
        role: 'stock_manager',
        phone: '+94 77 234 5678',
        joinDate: new Date('2024-02-20'),
        status: 'active',
        lastLogin: new Date('2025-12-10T08:45:00'),
        workingHours: 156,
      },
      {
        name: 'Mike Johnson',
        email: 'mike@smartsuper.lk',
        role: 'cashier',
        phone: '+94 77 345 6789',
        joinDate: new Date('2024-03-10'),
        status: 'active',
        lastLogin: new Date('2025-12-10T10:15:00'),
        workingHours: 144,
      },
      {
        name: 'Sarah Williams',
        email: 'admin@smartsuper.lk',
        role: 'admin',
        phone: '+94 77 456 7890',
        joinDate: new Date('2023-11-01'),
        status: 'active',
        lastLogin: new Date('2025-12-10T07:00:00'),
        workingHours: 200,
      },
      {
        name: 'David Brown',
        email: 'david@smartsuper.lk',
        role: 'cashier',
        phone: '+94 77 567 8901',
        joinDate: new Date('2024-06-15'),
        status: 'inactive',
        lastLogin: new Date('2025-12-05T17:30:00'),
        workingHours: 88,
      },
    ]);
    console.log(`Created ${employees.length} employees`);

    // ============ CUSTOMERS ============
    const customers = await Customer.create([
      {
        name: 'Kamal Perera',
        email: 'kamal@email.com',
        phone: '+94 77 111 2222',
        password: 'Customer@1',
        loyaltyPoints: 2500,
        totalPurchases: 125000,
        lastPurchase: new Date('2025-12-09'),
        joinDate: new Date('2024-01-15'),
      },
      {
        name: 'Nimal Silva',
        email: 'nimal@email.com',
        phone: '+94 77 222 3333',
        password: 'Customer@1',
        loyaltyPoints: 5000,
        totalPurchases: 250000,
        lastPurchase: new Date('2025-12-10'),
        joinDate: new Date('2023-11-20'),
      },
      {
        name: 'Sunil Fernando',
        email: 'sunil@email.com',
        phone: '+94 77 333 4444',
        password: 'Customer@1',
        loyaltyPoints: 800,
        totalPurchases: 40000,
        lastPurchase: new Date('2025-12-08'),
        joinDate: new Date('2024-05-10'),
      },
      {
        name: 'Chamari Jayasinghe',
        email: 'chamari@email.com',
        phone: '+94 77 444 5555',
        password: 'Customer@1',
        loyaltyPoints: 1500,
        totalPurchases: 75000,
        lastPurchase: new Date('2025-12-07'),
        joinDate: new Date('2024-03-22'),
      },
      {
        name: 'Raveen Mendis',
        email: 'raveen@email.com',
        phone: '+94 77 555 6666',
        password: 'Customer@1',
        loyaltyPoints: 350,
        totalPurchases: 17500,
        lastPurchase: new Date('2025-12-06'),
        joinDate: new Date('2024-08-15'),
      },
    ]);
    console.log(`Created ${customers.length} customers`);

    // ============ SAMPLE SALES ============
    const sales = await Sale.create([
      {
        items: [
          { productId: products[0]._id, name: 'Fresh Milk 1L', price: 280, quantity: 3, subtotal: 840 },
          { productId: products[1]._id, name: 'White Bread', price: 120, quantity: 2, subtotal: 240 },
        ],
        subtotal: 1080,
        discountPercent: 0,
        discountAmount: 0,
        total: 1080,
        paymentMethod: 'cash',
        cashier: users[1]._id,
        customerId: customers[0]._id,
      },
      {
        items: [
          { productId: products[3]._id, name: 'Chicken 1kg', price: 850, quantity: 2, subtotal: 1700 },
          { productId: products[7]._id, name: 'Eggs (Dozen)', price: 450, quantity: 1, subtotal: 450 },
        ],
        subtotal: 2150,
        discountPercent: 5,
        discountAmount: 107.5,
        total: 2042.5,
        paymentMethod: 'card',
        cashier: users[1]._id,
        customerId: customers[1]._id,
      },
      {
        items: [
          { productId: products[5]._id, name: 'Orange Juice 1L', price: 320, quantity: 4, subtotal: 1280 },
          { productId: products[6]._id, name: 'Chocolate Bar', price: 180, quantity: 5, subtotal: 900 },
          { productId: products[8]._id, name: 'Fresh Apples 1kg', price: 450, quantity: 2, subtotal: 900 },
        ],
        subtotal: 3080,
        discountPercent: 0,
        discountAmount: 0,
        total: 3080,
        paymentMethod: 'qr',
        cashier: users[1]._id,
      },
    ]);
    console.log(`Created ${sales.length} sample sales`);

    console.log('\n========================================');
    console.log('Database seeded successfully!');
    console.log('========================================');
    console.log('\nLogin Credentials:');
    console.log('  Admin:         admin@smartsuper.lk / AdminUser@123');
    console.log('  Cashier:       john@smartsuper.lk / CashierUser@123');
    console.log('  Stock Manager: jane@smartsuper.lk / StockUser@123');
    console.log('  Customer:      kamal@email.com   / Customer@1');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
