const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');
const { COOKIE_NAME } = require('../middleware/auth');

function getUserId(req) {
  const token = req.cookies[COOKIE_NAME];
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
      return Number(payload.sub);
    } catch (e) {
      // ignore
    }
  }
  return 1; // Default guest/demo user
}

// GET /api/bookings -> user's bookings
router.get('/', (req, res) => {
  const userId = getUserId(req);
  const bookings = pool.getBookings(userId);
  res.json({ bookings });
});

// POST /api/bookings -> reserve slot
router.post('/', (req, res) => {
  const userId = getUserId(req);
  const { stationId, date, time } = req.body;
  if (!stationId) {
    return res.status(400).json({ error: 'Please choose a charging station.' });
  }

  try {
    const booking = pool.createBooking(userId, { stationId, date, time });
    res.status(201).json({ ok: true, booking });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/bookings/:id -> cancel booking
router.delete('/:id', (req, res) => {
  const userId = getUserId(req);
  const ok = pool.cancelBooking(userId, req.params.id);
  if (!ok) {
    return res.status(404).json({ error: 'Booking not found or already cancelled.' });
  }
  res.json({ ok: true, message: 'Booking cancelled successfully.' });
});

module.exports = router;
