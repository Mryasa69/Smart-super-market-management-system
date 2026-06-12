const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Product = require('../models/Product');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const missingProducts = [
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
];

const syncMissingProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected...');

    for (const product of missingProducts) {
      const result = await Product.findOneAndUpdate(
        { sku: product.sku },
        product,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`Synced: ${result.name} (${result.sku})`);
    }

    const total = await Product.countDocuments();
    console.log(`\nDone. Total products in database: ${total}`);
    process.exit(0);
  } catch (error) {
    console.error('Error syncing products:', error);
    process.exit(1);
  }
};

syncMissingProducts();
