const path = require('path');
// Load environment variables from the root-level .env file
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./config/db');
const seedAdmin = require('./config/seed');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.USER_SERVICE_PORT || 3001;

// ── Global middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ── Health-check endpoint ───────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'user-service',
    timestamp: new Date().toISOString(),
  });
});

// ── Application routes ──────────────────────────────────────────────
app.use(userRoutes);

// ── Global error handler (must be registered AFTER routes) ──────────
app.use(errorHandler);

// ── Start server ────────────────────────────────────────────────────
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Seed default admin user
    await seedAdmin();

    app.listen(PORT, () => {
      logger.info(`✅ User Service is running on port ${PORT}`);
      logger.info(`🩺 Health check active at: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error(`❌ Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
