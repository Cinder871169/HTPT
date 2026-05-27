const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const orderRoutes = require('./routes/orderRoutes');
const errorHandler = require('./middlewares/errorHandler');
const { connectProducer } = require('./shared/kafka');
const { createLogger } = require('./shared/logger');

const logger = createLogger('order-service');
const app = express();

// Middlewares bảo mật và parse payload
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.ORDER_SERVICE_PORT || 3003;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/food_orders_db';

// Health check endpoint (rất cần thiết cho Docker/Kubernetes)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'order-service' });
});

// Gắn routes
app.use('/api/orders', orderRoutes);

// Gắn Error Handler (luôn đặt ở cuối)
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
        logger.info('Ket noi MongoDB thanh cong (Order DB)');
        dbConnected = true;
      } catch (err) {
        retryCount++;
        logger.error(`Ket noi MongoDB that bai (Lan ${retryCount}/${maxRetries}): ${err.message}`);
        if (retryCount >= maxRetries) throw err;
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    // 2. Kết nối Kafka Producer
    await connectProducer();

    // 3. Khởi động server
    app.listen(PORT, () => {
      logger.info(`Order Service dang chay tai port ${PORT}`);
    });

  } catch (error) {
    logger.error('❌ Khởi động Order Service thất bại:', error);
    process.exit(1);
  }
}

// Xử lý các lỗi không được catch (Graceful shutdown)
process.on('unhandledRejection', (err) => {
  logger.error(`UNHANDLED REJECTION: ${err.message}`);
  process.exit(1);
});

startServer();