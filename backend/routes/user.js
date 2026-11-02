const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

// Soft auth helper: extracts userId if logged in, otherwise defaults to 1 (demo/guest user)
function getUserId(req) {
  return req.userId || 1;
}

// Optional auth middleware: sets req.userId if cookie present, doesn't reject if not
function optionalAuth(req, res, next) {
  const jwt = require('jsonwebtoken');
  const { COOKIE_NAME } = require('../middleware/auth');
  const token = req.cookies[COOKIE_NAME];
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
      req.userId = Number(payload.sub);
    } catch (e) {
      // ignore
    }
  }
  next();
}

// GET /api/user/state -> Full user state for seamless frontend hydration
router.get('/state', optionalAuth, (req, res) => {
  try {
    if (!req.userId) {
      return res.json({ loggedIn: false, user: null, session: null });
    }
    const state = pool.getFullUserState(req.userId);
    if (!state) {
      return res.json({ loggedIn: false, user: null, session: null });
    }
    res.json(state);
  } catch (err) {
    console.error('Get user state error:', err.message);
    res.status(500).json({ error: 'Failed to load user state' });
  }
});

// GET /api/user/vehicles
router.get('/vehicles', optionalAuth, (req, res) => {
  if (!req.userId) {
    return res.json({ vehicles: [] });
  }
  const vehicles = pool.getVehicles(req.userId);
  res.json({ vehicles });
});

// POST /api/user/vehicles
router.post('/vehicles', requireAuth, (req, res) => {
  const { brand, plate } = req.body;
  if (!brand || !plate) {
    return res.status(400).json({ error: 'Brand and license plate are required.' });
  }
  const vehicle = pool.addVehicle(req.userId, { brand, plate });
  res.status(201).json({ vehicle });
});

// PUT /api/user/vehicles/:id/active
router.put('/vehicles/:id/active', requireAuth, (req, res) => {
  const vehicles = pool.setActiveVehicle(req.userId, req.params.id);
  res.json({ ok: true, vehicles });
});

// DELETE /api/user/vehicles/:id
router.delete('/vehicles/:id', requireAuth, (req, res) => {
  const ok = pool.deleteVehicle(req.userId, req.params.id);
  res.json({ ok });
});

// PUT /api/user/profile -> Update user profile details
router.put('/profile', optionalAuth, (req, res) => {
  try {
    const userId = getUserId(req);
    const { name, phone, city, dob, photo } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name cannot be empty.' });
    }
    const updated = pool.updateUserProfile(userId, {
      name: name.trim(),
      phone: phone !== undefined ? String(phone).trim() : undefined,
      city: city !== undefined ? String(city).trim() : undefined,
      dob: dob !== undefined ? dob : undefined,
      photo: photo !== undefined ? photo : undefined
    });
    if (!updated) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({
      ok: true,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone || '',
        city: updated.city || '',
        dob: updated.dob || '',
        photo: updated.photo || '',
        tier: updated.subscription || 'Basic',
        wallet: Number(updated.wallet) || 0,
        points: Number(updated.points) || 0
      }
    });
  } catch (err) {
    console.error('Profile update error:', err.message);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

module.exports = router;
