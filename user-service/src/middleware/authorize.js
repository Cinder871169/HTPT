/**
 * Middleware factory to authorize user roles.
 * Expects identity headers injected by the API Gateway:
 * - x-user-id
 * - x-user-role
 * - x-user-email
 * 
 * @param {...string} allowedRoles - List of allowed roles (customer, restaurant_owner, admin)
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    const userId = req.headers['x-user-id'];
    const userRole = req.headers['x-user-role'];
    const userEmail = req.headers['x-user-email'];

    if (!userId || !userRole) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No identity headers provided.'
      });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: role '${userRole}' is not allowed to access this resource.`
      });
    }

    // Attach identity to request for controllers usage
    req.user = {
      id: userId,
      role: userRole,
      email: userEmail
    };

    next();
  };
};

module.exports = authorize;
