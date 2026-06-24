const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Product = require('../models/Product');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const allProducts = [
  {
    name: 'Fresh Apples',
    category: 'Fruits',
    sku: 'FRUIT001',
    quantity: 120,
    price: 450,
    minStock: 40,
    supplier: 'Fresh Farms',
    barcode: 'FRUIT001',
    specialOffers: false,
    weeklyDeals: true,
    weeklyDealsAddedAt: new Date(),
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=300&fit=crop',
  },
  {
    name: 'Milk 1L',
    category: 'Dairy',
    sku: 'MILK001',
    quantity: 150,
    price: 280,
    minStock: 50,
    supplier: 'Dairy Farm Ltd',
    barcode: 'MILK001',
    specialOffers: true,
    weeklyDeals: false,
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&h=300&fit=crop',
  },
  {
    name: 'White Bread',
    category: 'Bakery',
    sku: 'BREAD001',
    quantity: 80,
    price: 120,
    minStock: 30,
    supplier: 'Golden Bakery',
    barcode: 'BREAD001',
    specialOffers: true,
    weeklyDeals: false,
    image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=300&h=300&fit=crop',
  },
  {
    name: 'Fresh Chicken',
    category: 'Meat',
    sku: 'MEAT001',
    quantity: 45,
    price: 850,
    minStock: 20,
    supplier: 'ABC Poultry',
    barcode: 'MEAT001',
    specialOffers: true,
    weeklyDeals: false,
    image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=300&h=300&fit=crop',
  },
  {
    name: 'Orange Juice',
    category: 'Beverages',
    sku: 'BEV001',
    quantity: 30,
    price: 320,
    minStock: 75,
    supplier: 'Fruit Drinks Co',
    barcode: 'BEV001',
    specialOffers: true,
    weeklyDeals: false,
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300&h=300&fit=crop',
  },
  {
    name: 'Chocolate Bar',
    category: 'Snacks',
    sku: 'SNACK001',
    quantity: 200,
    price: 180,
    minStock: 100,
    supplier: 'Sweet Treats',
    barcode: 'SNACK001',
    specialOffers: false,
    weeklyDeals: false,
    image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=300&h=300&fit=crop',
  },
  {
    name: 'Premium Rice 5kg',
    category: 'Grains',
    sku: 'RICE001',
    quantity: 60,
    price: 720,
    minStock: 10,
    supplier: 'Rice Mills',
    barcode: 'RICE001',
    specialOffers: true,
    weeklyDeals: true,
    weeklyDealsAddedAt: new Date(),
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop',
  },
  {
    name: 'Fresh Salmon',
    category: 'Meat',
    sku: 'MEAT002',
    quantity: 35,
    price: 1750,
    minStock: 15,
    supplier: 'ABC Poultry',
    barcode: 'MEAT002',
    specialOffers: true,
    weeklyDeals: false,
    image: 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=400&h=400&fit=crop',
  },
  {
    name: 'Imported Cheese',
    category: 'Dairy',
    sku: 'DAIRY003',
    quantity: 60,
    price: 665,
    minStock: 20,
    supplier: 'Dairy Farm Ltd',
    barcode: 'DAIRY003',
    specialOffers: true,
    weeklyDeals: false,
    image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=400&fit=crop',
  },
  {
    name: 'Breakfast Cereal',
    category: 'Snacks',
    sku: 'SNACK002',
    quantity: 90,
    price: 476,
    minStock: 30,
    supplier: 'Sweet Treats',
    barcode: 'SNACK002',
    specialOffers: true,
    weeklyDeals: true,
    weeklyDealsAddedAt: new Date(),
    image: 'https://media.istockphoto.com/id/2248185261/photo/breakfast-cereals-on-the-kitchen-table-three-bowls-filled-with-healthy-wholegrain-cereals.jpg?s=1024x1024&w=is&k=20&c=zFnfLpfJvfPFs3aYIBoEt4W6VxlCDWmEtKNglWMSCdo=',
  },
  {
    name: 'Olive Oil 1L',
    category: 'Other',
    sku: 'OTHER001',
    quantity: 45,
    price: 1260,
    minStock: 15,
    supplier: 'Golden Bakery',
    barcode: 'OTHER001',
    specialOffers: true,
    weeklyDeals: true,
    weeklyDealsAddedAt: new Date(),
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop',
  },
  {
    name: 'Fresh Strawberries',
    category: 'Fruits',
    sku: 'FRUIT002',
    quantity: 50,
    price: 595,
    minStock: 25,
    supplier: 'Fresh Farms',
    barcode: 'FRUIT002',
    specialOffers: true,
    weeklyDeals: true,
    weeklyDealsAddedAt: new Date(),
    image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=400&fit=crop',
  },
  {
    name: 'Greek Yogurt',
    category: 'Dairy',
    sku: 'DAIRY004',
    quantity: 70,
    price: 350,
    minStock: 25,
    supplier: 'Dairy Farm Ltd',
    barcode: 'DAIRY004',
    specialOffers: false,
    weeklyDeals: false,
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&h=300&fit=crop',
  },
  {
    name: 'Croissants',
    category: 'Bakery',
    sku: 'BREAD002',
    quantity: 0,
    price: 450,
    minStock: 20,
    supplier: 'Golden Bakery',
    barcode: 'BREAD002',
    specialOffers: false,
    weeklyDeals: false,
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=300&h=300&fit=crop',
  },
  {
    name: 'Fresh Tomatoes',
    category: 'Vegetables',
    sku: 'VEG001',
    quantity: 100,
    price: 180,
    minStock: 40,
    supplier: 'Fresh Farms',
    barcode: 'VEG001',
    specialOffers: false,
    weeklyDeals: false,
    image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=300&h=300&fit=crop',
  },
];

const syncAllProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected...\n');

    let created = 0;
    let updated = 0;

    for (const product of allProducts) {
      const existing = await Product.findOne({ sku: product.sku });
      if (existing) {
        await Product.findOneAndUpdate({ sku: product.sku }, product, { new: true });
        console.log(`✏️  Updated : ${product.name} (${product.sku})`);
        updated++;
      } else {
        await Product.create(product);
        console.log(`✅ Created : ${product.name} (${product.sku})`);
        created++;
      }
    }

    const total = await Product.countDocuments();
    console.log(`\n========================================`);
    console.log(`Done! Created: ${created}, Updated: ${updated}`);
    console.log(`Total products in database: ${total}`);
    console.log(`========================================\n`);
    process.exit(0);
  } catch (error) {
    console.error('Error syncing products:', error);
    process.exit(1);
  }
};

syncAllProducts();
