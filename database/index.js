const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');

dotenv.config({});

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.warn('MongoDB skipped: MONGO_URI is not defined. Running in mock/local fallback mode.');
      return false;
    }

    // Set DNS servers to Google's to ensure SRV records resolve correctly
    // This fixes the 'querySrv ECONNREFUSED' issue common on some networks
    dns.setServers(['8.8.8.8', '8.8.4.4']);

    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    return false;
  }
};

module.exports = connectDB;
