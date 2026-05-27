const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const notificationRoutes = require('./routes/notificationRoutes');
const errorHandler = require('./middlewares/errorHandler');
const { initNotificationConsumer } = require('./consumers/notificationConsumer');
const { createLogger } = require('./shared/logger');

const logger = createLogger('notification-service');
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const PORT = process.env.NOTIFICATION_SERVICE_PORT || 3004;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/food_notifications_db';

app.get('/health', (req, res) => res.status(200).json({ status: 'UP' }));

app.use('/api/notifications', notificationRoutes);
app.use(errorHandler);

async function startServer() {
  try {
    // 1. Kết nối DB
    const maxRetries = 5;
    let retryCount = 0;
    let dbConnected = false;
    while (retryCount < maxRetries && !dbConnected) {
      try {
        await mongoose.connect(MONGODB_URI);
        logger.info('Ket noi MongoDB thanh cong (Notification DB)');
        dbConnected = true;
      } catch (err) {
        retryCount++;
        logger.error(`Ket noi MongoDB that bai (Lan ${retryCount}/${maxRetries}): ${err.message}`);
        if (retryCount >= maxRetries) throw err;
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    // 2. Khởi động Kafka Consumer (Cực kỳ quan trọng)
    await initNotificationConsumer();

    // 3. Khởi động HTTP Server
    app.listen(PORT, () => {
      logger.info(`Notification Service dang chay tai port ${PORT}`);
    });

  } catch (error) {
    logger.error('❌ Khởi động Notification Service thất bại:', error);
    process.exit(1);
  }
}

process.on('unhandledRejection', (err) => {
  logger.error(`UNHANDLED REJECTION: ${err.message}`);
  process.exit(1);
});

startServer();