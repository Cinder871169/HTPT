const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./config/db');
const restaurantRoutes = require('./routes/restaurantRoutes');
const errorHandler = require('./middleware/errorHandler');
const { initOrderConsumer } = require('./consumers/orderConsumer');
const { createLogger } = require('./shared/logger');

const app = express();
const logger = createLogger('restaurant-service');

const PORT = process.env.RESTAURANT_SERVICE_PORT || 3002;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'restaurant-service',
    timestamp: new Date().toISOString(),
  });
});

app.use(restaurantRoutes);
app.use(errorHandler);

async function startServer() {
  try {
    await connectDB();
    await initOrderConsumer();

    app.listen(PORT, () => {
      logger.info(`Restaurant Service is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start Restaurant Service', {
      message: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
}

process.on('unhandledRejection', (err) => {
  logger.error(`UNHANDLED REJECTION: ${err.message}`, { stack: err.stack });
  process.exit(1);
});

startServer();
