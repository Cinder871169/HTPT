const { createLogger } = require('../shared/logger');

const logger = createLogger('restaurant-error-handler');

module.exports = (err, _req, res, _next) => {
  logger.error(`${err.name}: ${err.message}`, { stack: err.stack });

  if (err.name === 'CastError') {
    return res.status(404).json({
      success: false,
      message: 'Resource not found',
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate value already exists',
    });
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((value) => value.message)
      .join(', ');

    return res.status(400).json({
      success: false,
      message,
    });
  }

  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
};
