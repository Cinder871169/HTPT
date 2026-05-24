const winston = require('winston');
const { v4: uuidv4 } = require('uuid');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, correlationId }) => {
      const cidStr = correlationId ? ` [CID: ${correlationId}]` : '';
      return `[${timestamp}] [api-gateway]${cidStr} ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console()
  ]
});

/**
 * Express middleware to inject UUID correlationId to tracing request lifecycle.
 */
const requestLogger = (req, res, next) => {
  req.correlationId = req.headers['x-correlation-id'] || uuidv4();
  
  // Set correlation ID header in the response
  res.setHeader('X-Correlation-ID', req.correlationId);

  const start = Date.now();
  const { method, url } = req;
  const userAgent = req.headers['user-agent'] || 'unknown';

  logger.info(`🛫 HTTP ${method} ${url} | User-Agent: ${userAgent}`, { correlationId: req.correlationId });

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    let level = 'info';
    if (statusCode >= 500) {
      level = 'error';
    } else if (statusCode >= 400) {
      level = 'warn';
    }

    logger.log(level, `🛬 HTTP ${method} ${url} completed | Status: ${statusCode} | Duration: ${duration}ms`, {
      correlationId: req.correlationId
    });
  });

  next();
};

module.exports = {
  logger,
  requestLogger,
};
