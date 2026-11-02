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

// GET /api/bms/stats -> get live vehicle BMS telemetry
router.get('/stats', (req, res) => {
  const userId = getUserId(req);
  const stats = pool.getBmsStats(userId);
  res.json({ bms: stats });
});

// POST /api/bms/update -> update telemetry readings
router.post('/update', (req, res) => {
  const userId = getUserId(req);
  const stats = pool.updateBmsStats(userId, req.body);
  res.json({ ok: true, bms: stats });
});

module.exports = router;
