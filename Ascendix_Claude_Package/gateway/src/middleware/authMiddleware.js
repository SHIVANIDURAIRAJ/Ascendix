const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware:
 * Inspects Authorization: Bearer <token> header,
 * validates JWT signature, and attaches student identity to req.user.
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Access denied. Missing or invalid Authorization header.',
    });
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET || '[REDACTED]';

  try {
    const decoded = jwt.verify(token, secret);
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      role: (decoded.role || 'STUDENT').toUpperCase(),
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Authentication token has expired. Please log in again.',
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Invalid authentication token.',
    });
  }
}

/**
 * Role-Based Authorization Middleware:
 * Ensures only ADMIN or FACULTY users can access protected management routes.
 */
function requireAdmin(req, res, next) {
  const role = (req.user?.role || 'STUDENT').toUpperCase();
  if (!['ADMIN', 'FACULTY'].includes(role)) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: Only Admin/Faculty users are authorized to manage company requirements.',
    });
  }
  next();
}

module.exports = {
  verifyToken,
  requireAdmin,
};
