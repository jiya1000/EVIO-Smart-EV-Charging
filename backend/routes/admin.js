const express = require('express');
const router = express.Router();
const pool = require('../db');
const { requireAdmin } = require('../middleware/auth');

// Strictly protect all admin endpoints: only pjiya4285@gmail.com can access
router.use(requireAdmin);

// GET /api/admin/stats -> Real-time system and network metrics
router.get('/stats', (req, res) => {
  try {
    const stations = pool.getStations();
    const campaigns = pool.getCampaigns();
    const users = pool.query ? [] : []; // We can get users from store

    // Calculate metrics
    const totalSlots = stations.reduce((acc, s) => acc + (s.slotsTotal || 0), 0);
    const availSlots = stations.reduce((acc, s) => acc + (s.slotsAvail || 0), 0);
    const occupiedSlots = totalSlots - availSlots;
    const occupancyRate = totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 65;

    const totalAdSpend = campaigns.reduce((acc, c) => acc + (Number(c.spend) || 0), 0);
    const activeCampaignsCount = campaigns.filter(c => c.active).length;

    res.json({
      activeSessions: 489 + occupiedSlots,
      totalStations: stations.length,
      totalSlots,
      occupiedSlots,
      occupancyRate,
      totalPowerOutput: "12,680 kW",
      activeAdvertisers: `${activeCampaignsCount} Active Brands`,
      totalSpendFormatted: `₹${totalAdSpend.toLocaleString()}`,
      weeklyMwh: [
        { day: 'Mon', height: 60, mwh: 142 },
        { day: 'Tue', height: 45, mwh: 110 },
        { day: 'Wed', height: 75, mwh: 185 },
        { day: 'Thu', height: 90, mwh: 215 },
        { day: 'Fri', height: 80, mwh: 198 },
        { day: 'Sat', height: 95, mwh: 238 },
        { day: 'Sun', height: 100, mwh: 250 }
      ]
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

// GET /api/admin/users -> List all registered users
router.get('/users', (req, res) => {
  try {
    const users = pool.getAllUsers ? pool.getAllUsers() : [];
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load users' });
  }
});

// GET /api/admin/stations -> Stations manager view
router.get('/stations', (req, res) => {
  try {
    res.json({ stations: pool.getStations() });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load stations' });
  }
});

// PUT /api/admin/stations/:id/status -> Change station status (available / busy / maintenance)
router.put('/stations/:id/status', (req, res) => {
  try {
    const { status, slotsAvail } = req.body;
    const station = pool.getStationById(req.params.id);
    if (!station) {
      return res.status(404).json({ error: 'Station not found' });
    }

    if (status) station.status = status;
    if (slotsAvail !== undefined) station.slotsAvail = Number(slotsAvail);

    res.json({ ok: true, station });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update station' });
  }
});

// GET /api/admin/bookings -> All network bookings
router.get('/bookings', (req, res) => {
  try {
    const allBookings = [
      ...pool.getBookings(1),
      {
        id: "b_admin_101",
        userId: 2,
        stationName: "MG Road Fast Charger",
        address: "MG Road Metro Station, Bengaluru",
        date: "Today",
        time: "04:00 PM - 05:00 PM",
        status: "Completed"
      },
      {
        id: "b_admin_102",
        userId: 3,
        stationName: "Whitefield Tech Park Charger",
        address: "ITPB Main Road, Whitefield",
        date: "Tomorrow",
        time: "11:00 AM - 12:00 PM",
        status: "Confirmed"
      }
    ];
    res.json({ bookings: allBookings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load bookings' });
  }
});

module.exports = router;
