const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI is not set in environment variables.');
    console.error('   Please copy server/.env.example to server/.env and fill in your MongoDB URI.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('');
    console.error('   To start MongoDB locally, run one of the following:');
    console.error('   - If installed as a service: Start-Service MongoDB');
    console.error('   - If installed manually: mongod --dbpath C:\\data\\db');
    console.error('   - Or use MongoDB Atlas: https://www.mongodb.com/atlas');
    console.error('');
    console.error('   The application cannot run without a database connection.');
    process.exit(1);
  }
};

module.exports = connectDB;
