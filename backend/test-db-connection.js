const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'env') });

async function testConnection() {
  try {

    console.log('Testing MongoDB connection...');
    console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'NOT SET');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected successfully!');
    
    // Test if we can query the users collection
    const User = require('./models/User');
    const users = await User.find({});
    console.log(`✅ Found ${users.length} users in database`);
    
    users.forEach(user => {
      console.log(`- ${user.role}: ${user.email}`);
    });
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
    
  }
}

testConnection();
