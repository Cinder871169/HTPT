const mongoose = require('mongoose');
const { createLogger } = require('../shared/logger');

const logger = createLogger('restaurant-db');

const connectDB = async () => {
  const mongoURI =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    'mongodb://localhost:27017/food_restaurants_db';

  try {
    const conn = await mongoose.connect(mongoURI);
    logger.info(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
