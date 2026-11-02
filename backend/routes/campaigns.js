const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/campaigns -> list all advertiser campaigns
router.get('/', (req, res) => {
  res.json({ campaigns: pool.getCampaigns() });
});

// POST /api/campaigns -> create a new advertiser campaign
router.post('/', (req, res) => {
  const { brand, target, spend } = req.body;
  if (!brand || !target) {
    return res.status(400).json({ error: 'Brand name and target audience are required.' });
  }

  const campaign = pool.createCampaign({ brand, target, spend });
  res.status(201).json({ campaign });
});

// PUT /api/campaigns/:id/toggle -> pause or resume campaign
router.put('/:id/toggle', (req, res) => {
  const campaign = pool.toggleCampaign(req.params.id);
  if (!campaign) {
    return res.status(404).json({ error: 'Campaign not found' });
  }
  res.json({ ok: true, campaign });
});

module.exports = router;
