const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", "..", ".env") });

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const { requestLogger, logger } = require("./middleware/logger");
const { generalLimiter } = require("./middleware/rateLimiter");
const { authMiddleware } = require("./middleware/auth");

const { setupRoutes } = require("./routes");

const { SERVICES } = require("./config/proxy");

const app = express();
const PORT = process.env.API_GATEWAY_PORT || 3000;

app.use(cors());
app.use(morgan("dev"));
app.use(requestLogger);
app.use(generalLimiter);
app.use(authMiddleware);

app.get("/health", (_req, res) => {
  res.json({
    status: "OK",
    service: "api-gateway",
    timestamp: new Date().toISOString(),
    services: SERVICES,
  });
});

setupRoutes(app);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found. Please check the API documentation.",
  });
});

app.use((err, _req, res, _next) => {
  logger.error("Unhandled error", {
    error: err.message,
    stack: err.stack,
  });

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
  logger.info(`✅ API Gateway started on port ${PORT}`);
});

module.exports = app;
