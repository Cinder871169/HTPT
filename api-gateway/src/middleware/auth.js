const jwt = require('jsonwebtoken');

// Whitelist of completely public endpoints that bypass authentication
const PUBLIC_ROUTES = [
  { method: 'POST', path: '/api/auth/register' },
  { method: 'POST', path: '/api/auth/login' },
  { method: 'GET',  path: '/api/restaurants' },
  { method: 'GET',  path: /^\/api\/restaurants\/[a-zA-Z0-9_-]+$/ },
  { method: 'GET',  path: /^\/api\/restaurants\/[a-zA-Z0-9_-]+\/menu$/ },
  { method: 'GET',  path: '/health' }
];

/**
 * Checks if a route request is whitelisted as public
 */
const isPublicRoute = (method, path) => {
  return PUBLIC_ROUTES.some(route => {
    const methodMatch = route.method === method;
    const pathMatch = route.path instanceof RegExp 
      ? route.path.test(path) 
      : route.path === path;
    return methodMatch && pathMatch;
  });
};

/**
 * JWT Authentication Middleware for API Gateway.
 * Validates 'Authorization: Bearer <token>' header,
 * decodes identity payload and forwards it in custom x-* headers.
 */
const authMiddleware = (req, res, next) => {
  // Bypass for public routes
  if (isPublicRoute(req.method, req.path)) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'food-ordering-jwt-secret-key-2024');

    // Inject identity headers into request for downstream microservices to consume safely
    req.headers['x-user-id'] = decoded.id;
    req.headers['x-user-role'] = decoded.role;
    req.headers['x-user-email'] = decoded.email;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

module.exports = {
  authMiddleware,
};
