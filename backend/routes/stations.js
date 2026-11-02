const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/stations -> list all charging stations
router.get('/', (req, res) => {
  try {
    const stations = pool.getStations();
    res.json({ stations });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stations' });
  }
});

// GET /api/stations/map -> map-ready station pins with coordinates
router.get('/map', (req, res) => {
  try {
    const stations = pool.getStations().map(s => ({
      id: s.id,
      name: s.name,
      address: s.address,
      type: s.type,
      power: s.power,
      rate: s.rate,
      status: s.status,
      slotsTotal: s.slotsTotal,
      slotsAvail: s.slotsAvail,
      lat: s.lat,
      lng: s.lng
    }));
    res.json({ stations });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch map stations' });
  }
});

// GET /api/stations/:id -> station by id
router.get('/:id', (req, res) => {
  const station = pool.getStationById(req.params.id);
  if (!station) {
    return res.status(404).json({ error: 'Station not found' });
  }
  res.json({ station });
});

module.exports = router;
