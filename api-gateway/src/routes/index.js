const { createProxyMiddleware, fixRequestBody } = require('http-proxy-middleware');
const { PROXY_CONFIG } = require('../config/proxy');
const { authLimiter } = require('../middleware/rateLimiter');
const { logger } = require('../middleware/logger');

/**
 * Register proxy routes dynamically based on configuration.
 * Configures headers forwarding and handles gateway error scenarios cleanly.
 */
const setupRoutes = (app) => {
  PROXY_CONFIG.forEach((entry) => {
    const proxyOptions = {
      target: entry.target,
      changeOrigin: true,
      pathRewrite: {},
      
      // Handle connection failure of target microservices
      onError: (err, req, res) => {
        logger.error(`❌ Proxy connection failed to ${entry.target}${req.url} | Error: ${err.message}`, {
          correlationId: req.correlationId
        });
        res.status(503).json({
          success: false,
          message: 'Service Temporarily Unavailable. Please try again shortly.'
        });
      },

      // Inject custom correlation & user identity headers into proxy request
      onProxyReq: (proxyReq, req, res) => {
        if (req.correlationId) {
          proxyReq.setHeader('x-correlation-id', req.correlationId);
        }
        
        // Forward user identity headers parsed in authentication middleware
        if (req.headers['x-user-id']) {
          proxyReq.setHeader('x-user-id', req.headers['x-user-id']);
        }
        if (req.headers['x-user-role']) {
          proxyReq.setHeader('x-user-role', req.headers['x-user-role']);
        }
        if (req.headers['x-user-email']) {
          proxyReq.setHeader('x-user-email', req.headers['x-user-email']);
        }

        fixRequestBody(proxyReq, req, res);
      }
    };

    // Stricter rate-limiting for auth endpoints
    if (entry.context.includes('/api/auth')) {
      app.use(entry.context, authLimiter, createProxyMiddleware(proxyOptions));
    } else {
      app.use(entry.context, createProxyMiddleware(proxyOptions));
    }
    
    logger.info(`🔗 Configured Proxy Route: [${entry.context.join(', ')}] ──> ${entry.target}`);
  });
};

module.exports = {
  setupRoutes,
};
