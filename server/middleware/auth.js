const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');

// allowInactive lets /auth/me be reachable by pending/suspended users so the
// frontend can show them their own status instead of a bare 401
const protect = (options = {}) =>
  asyncHandler(async (req, res, next) => {
    let token;
    const header = req.headers.authorization;

    if (header && header.startsWith('Bearer ')) {
      token = header.split(' ')[1];
    }

    if (!token) {
      res.status(401);
      throw new Error('Not authorized, no token');
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      res.status(401);
      throw new Error('Not authorized, invalid token');
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.status(401);
      throw new Error('Not authorized, user not found');
    }

    if (!options.allowInactive && user.status !== 'active') {
      res.status(401);
      throw new Error('Account is not active');
    }

    req.user = user;
    next();
  });

const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    res.status(403);
    throw new Error('Forbidden: insufficient permissions');
  }
  next();
};

// strips any client-supplied school id for scoped roles so controllers can
// safely trust req.user.school as the sole source of truth for filtering
const scopeToSchool = (req, res, next) => {
  if (req.user && req.user.role !== 'super_admin') {
    if (req.body && 'school' in req.body) delete req.body.school;
    if (req.query && 'school' in req.query) delete req.query.school;
    if (!req.user.school) {
      res.status(403);
      throw new Error('User is not linked to a school');
    }
  }
  next();
};

module.exports = { protect, authorize, scopeToSchool };
