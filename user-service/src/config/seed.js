const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Seed default admin account on startup.
 */
const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      // Create admin user. password will be auto-hashed by Mongoose pre-save hook
      await User.create({
        name: 'System Admin',
        email: 'admin@foodapp.com',
        password: 'admin123',
        phone: '0123456789',
        address: 'Microservice Cluster Root',
        role: 'admin'
      });
      logger.info('🔑 Created default admin account: admin@foodapp.com / admin123');
    } else {
      logger.info('🔑 Default admin account already exists.');
    }
  } catch (error) {
    logger.error(`❌ Admin seeding error: ${error.message}`);
  }
};

module.exports = seedAdmin;
