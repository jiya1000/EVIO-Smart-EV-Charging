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
  return 1;
}

// GET /api/charging/session -> get active charging session
router.get('/session', (req, res) => {
  const userId = getUserId(req);
  const session = pool.getChargingSession(userId);
  res.json({ session });
});

// PUT /api/charging/update -> update session telemetry/metrics
router.put('/update', (req, res) => {
  const userId = getUserId(req);
  const updated = pool.updateChargingSession(userId, req.body);
  res.json({ session: updated });
});

// POST /api/charging/stop -> complete charging session and record transaction
router.post('/stop', (req, res) => {
  const userId = getUserId(req);
  const result = pool.stopChargingSession(userId);
  res.json({ ok: true, ...result });
});

module.exports = router;
