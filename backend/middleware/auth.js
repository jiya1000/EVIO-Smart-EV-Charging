const jwt = require('jsonwebtoken');
const pool = require('../db');

const COOKIE_NAME = 'evio_token';
const ADMIN_EMAIL = 'pjiya4285@gmail.com';

// Blocks the request unless the user has a valid login cookie.
function requireAuth(req, res, next) {
  const token = req.cookies[COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ error: 'Not logged in.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    req.userId = Number(payload.sub);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
}

// Strictly blocks the request unless the authenticated user is pjiya4285@gmail.com
function requireAdmin(req, res, next) {
  const token = req.cookies[COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please log in as Administrator.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    req.userId = Number(payload.sub);

    const user = pool.getUserById(req.userId);
    if (!user) {
      return res.status(401).json({ error: 'User account not found.' });
    }

    if (String(user.email).trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return res.status(403).json({
        error: `Access Denied: This area is restricted to the administrator (${ADMIN_EMAIL}).`
      });
    }

    req.isAdmin = true;
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
  }
}

module.exports = { requireAuth, requireAdmin, COOKIE_NAME, ADMIN_EMAIL };
