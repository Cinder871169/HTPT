const mongoose = require('mongoose');
const { createLogger } = require('../shared/logger');

const logger = createLogger('restaurant-db');

const connectDB = async () => {
  const mongoURI =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    'mongodb://localhost:27017/food_restaurants_db';

  const maxRetries = 5;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const conn = await mongoose.connect(mongoURI);
      logger.info(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (error) {
      retryCount++;
      logger.error(`MongoDB connection error (Attempt ${retryCount}/${maxRetries}): ${error.message}`);
      if (retryCount >= maxRetries) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

module.exports = connectDB;
