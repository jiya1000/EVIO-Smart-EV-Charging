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

// GET /api/rewards/ads -> list sponsored ads
router.get('/ads', (req, res) => {
  res.json({ ads: pool.getAds() });
});

// POST /api/rewards/claim-ad -> claim reward points for watching an ad
router.post('/claim-ad', (req, res) => {
  const userId = getUserId(req);
  const { adId } = req.body;
  if (!adId) {
    return res.status(400).json({ error: 'adId is required' });
  }

  try {
    const result = pool.claimAdReward(userId, adId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/rewards/vouchers -> list redeemable vouchers
router.get('/vouchers', (req, res) => {
  res.json({ vouchers: pool.getVouchers() });
});

// POST /api/rewards/redeem -> redeem voucher using points
router.post('/redeem', (req, res) => {
  const userId = getUserId(req);
  const { voucherId } = req.body;
  if (!voucherId) {
    return res.status(400).json({ error: 'voucherId is required' });
  }

  try {
    const result = pool.redeemVoucher(userId, voucherId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/rewards/transactions -> list user transactions
router.get('/transactions', (req, res) => {
  const userId = getUserId(req);
  res.json({ transactions: pool.getTransactions(userId) });
});

module.exports = router;
