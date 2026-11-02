const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const pool = require('./db');

// Route modules
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const stationsRoutes = require('./routes/stations');
const bookingsRoutes = require('./routes/bookings');
const chargingRoutes = require('./routes/charging');
const rewardsRoutes = require('./routes/rewards');
const campaignsRoutes = require('./routes/campaigns');
const bmsRoutes = require('./routes/bms');
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');

// ---- Settings check ----
const required = ['JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error('Missing values in .env file: ' + missing.join(', '));
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_DIR = path.join(__dirname, '..');

app.disable('x-powered-by');
app.use(express.json({ limit: '50kb' }));
app.use(cookieParser());

// ---- CORS ----
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// ---- API Routes ----
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/stations', stationsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/charging', chargingRoutes);
app.use('/api/rewards', rewardsRoutes);
app.use('/api/campaigns', campaignsRoutes);
app.use('/api/bms', bmsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'EVIO Smart Charging & AI Rewards Backend',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

app.use('/api', (req, res) => res.status(404).json({ error: 'Endpoint not found.' }));

// ---- Static Frontend Files ----
app.use(express.static(FRONTEND_DIR));
const frontendFiles = ['index.html', 'map.html', 'admin.html', 'script.js', 'style.css'];
app.get('/', (req, res) => res.sendFile(path.join(FRONTEND_DIR, 'index.html')));
// Dedicated admin portal — page itself is public HTML; all data is protected by requireAdmin middleware
app.get('/admin', (req, res) => res.sendFile(path.join(FRONTEND_DIR, 'admin.html')));
frontendFiles.forEach((file) => {
  app.get('/' + file, (req, res) => res.sendFile(path.join(FRONTEND_DIR, file)));
});

// ---- Global Error Handler ----
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request payload.' });
  }
  console.error('Unhandled server error:', err.message);
  res.status(500).json({ error: 'Internal server error.' });
});

// ---- Start Server ----
pool.query('SELECT 1')
  .then(() => pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_attempts INTEGER NOT NULL DEFAULT 0'))
  .catch((err) => {
    console.warn('[Database notice]:', err.message);
  })
  .finally(() => {
    app.listen(PORT, () => {
      console.log('----------------------------------------------------');
      console.log(`⚡ EVIO Backend is online at http://localhost:${PORT}`);
      console.log(`🔌 API Endpoints: /api/auth, /api/user, /api/stations, /api/bookings, /api/charging, /api/rewards, /api/campaigns, /api/bms, /api/chat`);
      console.log('----------------------------------------------------');
    });
  });
