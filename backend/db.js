const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const DATA_DIR = path.join(__dirname, 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed data
const DEFAULT_SEED = {
  users: [
    {
      id: 1,
      name: "Vidhi Nandwal",
      email: "vidhi.nandwal@example.com",
      phone: "+91 98765 43210",
      city: "Bengaluru",
      dob: "2002-01-12",
      photo: "",
      password_hash: null,
      google_id: null,
      email_verified: true,
      otp_hash: null,
      otp_expires_at: null,
      otp_attempts: 0,
      wallet: 150,
      points: 150,
      points_earned_total: 250,
      subscription: "Basic",
      created_at: new Date().toISOString()
    }
  ],
  vehicles: [
    { id: "v1", userId: 1, brand: "Tata Nexon EV", plate: "KA-03-MY-4321", active: true }
  ],
  stations: [
    {
      id: "st1",
      name: "Bhawarkua EV Charging Hub",
      address: "Bhawarkua, Indore",
      location: "Bhawarkua, Indore",
      type: "CCS2 & Type 2 (AC/DC Fast)",
      power: "50 kW",
      rate: 18,
      status: "available",
      slotsTotal: 3,
      slotsAvail: 2,
      ac: true,
      dc: true,
      acSlots: 2,
      dcSlots: 1,
      acTimeSlots: ["09:00 AM", "10:00 AM", "11:00 AM"],
      dcTimeSlots: ["09:00 AM", "12:00 PM", "04:00 PM"],
      icon: "fa-bolt",
      bgGrad: "linear-gradient(135deg, #071224 0%, #0c1e35 100%)",
      lat: 22.6868,
      lng: 75.8648
    },
    {
      id: "st2",
      name: "Bhawarkua Green Charge",
      address: "Bhawarkua Square, Indore",
      location: "Bhawarkua Square, Indore",
      type: "Type 2 (AC Green Charger)",
      power: "22 kW",
      rate: 15,
      status: "available",
      slotsTotal: 2,
      slotsAvail: 2,
      ac: true,
      dc: false,
      acSlots: 2,
      dcSlots: 0,
      acTimeSlots: ["09:00 AM", "10:00 AM", "11:00 AM"],
      dcTimeSlots: [],
      icon: "fa-charging-station",
      bgGrad: "linear-gradient(135deg, #070B10 0%, #0E1524 100%)",
      lat: 22.6879,
      lng: 75.8675
    },
    {
      id: "st3",
      name: "Vijay Nagar EV Station",
      address: "Vijay Nagar, Indore",
      location: "Vijay Nagar, Indore",
      type: "CCS2 & Type 2 (AC/DC Hub)",
      power: "60 kW",
      rate: 19,
      status: "busy",
      slotsTotal: 3,
      slotsAvail: 1,
      ac: true,
      dc: true,
      acSlots: 2,
      dcSlots: 1,
      acTimeSlots: ["09:00 AM", "10:00 AM", "11:00 AM"],
      dcTimeSlots: ["09:00 AM", "12:00 PM", "04:00 PM"],
      icon: "fa-plug",
      bgGrad: "linear-gradient(135deg, #071224 0%, #112540 100%)",
      lat: 22.7533,
      lng: 75.8937
    },
    {
      id: "st4",
      name: "Vijay Nagar Fast Charge",
      address: "Scheme No. 54, Vijay Nagar, Indore",
      location: "Scheme No. 54, Vijay Nagar, Indore",
      type: "CCS2 (Ultra DC Fast)",
      power: "120 kW",
      rate: 22,
      status: "available",
      slotsTotal: 3,
      slotsAvail: 2,
      ac: true,
      dc: true,
      acSlots: 2,
      dcSlots: 1,
      acTimeSlots: ["09:00 AM", "10:00 AM", "11:00 AM"],
      dcTimeSlots: ["09:00 AM", "12:00 PM", "04:00 PM"],
      icon: "fa-charging-station",
      bgGrad: "linear-gradient(135deg, #0c1e35 0%, #112540 100%)",
      lat: 22.752,
      lng: 75.9
    }
  ],
  bookings: [
    {
      id: "b_init",
      userId: 1,
      stationId: "st3",
      stationName: "Vijay Nagar EV Station",
      address: "Vijay Nagar, Indore",
      date: "Today",
      time: "06:00 PM - 07:00 PM",
      status: "Confirmed",
      created_at: new Date().toISOString()
    }
  ],
  transactions: [
    { id: "t1", userId: 1, date: "03 Jun 2026", type: "Ad Reward - Nike", energy: "30s view", cost: "+₹15", points: "+15 pts" },
    { id: "t2", userId: 1, date: "02 Jun 2026", type: "Charging Session - Indiranagar", energy: "22.4 kWh", cost: "₹358.40", points: "-358 pts" },
    { id: "t3", userId: 1, date: "02 Jun 2026", type: "Ad Reward - Tesla Campaign", energy: "15s view", cost: "+₹8", points: "+8 pts" },
    { id: "t4", userId: 1, date: "30 May 2026", type: "Voucher Redemption - Amazon", energy: "Voucher", cost: "-₹100", points: "-100 pts" }
  ],
  ads: [
    {
      id: "ad1",
      brand: "Nike India",
      title: "Run Green: Sustainability Meets High Performance",
      duration: 15,
      points: 15,
      icon: "fa-running",
      color: "#ff4d6d",
      img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80"
    },
    {
      id: "ad2",
      brand: "Tesla Campaign",
      title: "Accelerating the World's Transition to Sustainable Energy",
      duration: 10,
      points: 8,
      icon: "fa-car-side",
      color: "#0af",
      img: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400&q=80"
    },
    {
      id: "ad3",
      brand: "Apple Solar Initiative",
      title: "Carbon Neutral by 2030: Powering Apple Devices Cleanly",
      duration: 20,
      points: 20,
      icon: "fa-apple-alt",
      color: "#00e896",
      img: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&q=80"
    },
    {
      id: "ad4",
      brand: "Hyundai Clean Tech",
      title: "Ioniq 5: Electric Mobility That Empowers Your Everyday Life",
      duration: 25,
      points: 25,
      icon: "fa-leaf",
      color: "#ffa94d",
      img: "https://images.unsplash.com/photo-1668472851996-01584cfb776a?w=400&q=80"
    }
  ],
  vouchers: [
    {
      id: "vouch1",
      brand: "Amazon Gift Voucher",
      title: "₹100 Gift Card Voucher",
      pointsCost: 100,
      icon: "fa-shopping-basket",
      bgColor: "rgba(255,212,59,0.12)",
      iconColor: "var(--gold)"
    },
    {
      id: "vouch2",
      brand: "VoltAd Charging Discount",
      title: "₹250 Charging Credits Voucher",
      pointsCost: 200,
      icon: "fa-bolt",
      bgColor: "rgba(0,232,150,0.12)",
      iconColor: "var(--green)"
    },
    {
      id: "vouch3",
      brand: "Tata Power Network Card",
      title: "₹500 Network Charging Card",
      pointsCost: 450,
      icon: "fa-charging-station",
      bgColor: "rgba(0,170,255,0.12)",
      iconColor: "var(--blue)"
    },
    {
      id: "vouch4",
      brand: "Starbucks Green Coffee",
      title: "Free Beverage Vouchers Card",
      pointsCost: 150,
      icon: "fa-mug-hot",
      bgColor: "rgba(255,77,109,0.12)",
      iconColor: "var(--danger)"
    }
  ],
  campaigns: [
    { id: 1, brand: "Nike Green Run", target: "EV Commuters", impressions: 12400, spend: 186000, active: true },
    { id: 2, brand: "Apple Clean Energy", target: "Urban Drivers", impressions: 8900, spend: 160200, active: true },
    { id: 3, brand: "Tesla Drive EV", target: "High Income", impressions: 15300, spend: 122400, active: false },
    { id: 4, brand: "Hyundai Ioniq 5", target: "General Public", impressions: 3400, spend: 85000, active: true }
  ],
  chargingSessions: {
    1: {
      isActive: false,
      stationId: "st1",
      stationName: "Bhawarkua EV Charging Hub",
      vehicleName: "Tata Nexon EV",
      batteryPct: 72,
      energyCharged: 14.6,
      cost: 182,
      cashback: 34,
      timeLeft: 18,
      chargingSpeed: 30,
      baseRate: 18
    }
  },
  bmsTelemetry: {
    1: {
      connected: true,
      soc: 72,
      batteryTemp: 31.4,
      voltage: 352,
      healthPct: 96,
      tyrePressures: [33, 33, 34, 34],
      alerts: []
    }
  }
};

function loadStore() {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const data = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
      // merge with default seed if missing keys
      return { ...DEFAULT_SEED, ...data };
    }
  } catch (err) {
    console.error('[Database Store] Error reading store.json:', err.message);
  }
  saveStore(DEFAULT_SEED);
  return JSON.parse(JSON.stringify(DEFAULT_SEED));
}

function saveStore(data) {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[Database Store] Error saving store.json:', err.message);
  }
}

let store = loadStore();

// PostgreSQL connection pool
let pgPool = null;
let useFallback = false;
let fallbackAnnounced = false;

try {
  pgPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectionTimeoutMillis: 2000
  });

  pgPool.on('error', (err) => {
    if (!useFallback) {
      switchToFallback();
    }
  });
} catch (e) {
  switchToFallback();
}

function switchToFallback() {
  useFallback = true;
  if (!fallbackAnnounced) {
    fallbackAnnounced = true;
    console.log('[Database] Operating with local persistent storage (backend/data/store.json).');
  }
}

// Low-level query emulator
function executeFallbackQuery(text, params = []) {
  const sql = text.trim();
  const lower = sql.toLowerCase();

  if (lower.startsWith('select 1')) {
    return Promise.resolve({ rows: [{ '?column?': 1 }], rowCount: 1 });
  }

  if (lower.startsWith('alter table') || lower.startsWith('create table')) {
    return Promise.resolve({ rows: [], rowCount: 0 });
  }

  // SELECT by id: SELECT id, name, email FROM users WHERE id = $1
  if (lower.includes('from users where id = $1')) {
    const id = Number(params[0]);
    const user = store.users.find((u) => Number(u.id) === id);
    return Promise.resolve({ rows: user ? [user] : [], rowCount: user ? 1 : 0 });
  }

  // SELECT by google_id
  if (lower.includes('from users where google_id = $1')) {
    const googleId = String(params[0]);
    const user = store.users.find((u) => String(u.google_id) === googleId);
    return Promise.resolve({ rows: user ? [user] : [], rowCount: user ? 1 : 0 });
  }

  // SELECT by email
  if (lower.includes('from users where email = $1')) {
    const email = String(params[0]).toLowerCase();
    const user = store.users.find((u) => String(u.email).toLowerCase() === email);

    if (!user) {
      return Promise.resolve({ rows: [], rowCount: 0 });
    }

    if (lower.includes('otp_valid')) {
      const now = Date.now();
      const expires = user.otp_expires_at ? new Date(user.otp_expires_at).getTime() : 0;
      return Promise.resolve({ rows: [{ ...user, otp_valid: expires > now }], rowCount: 1 });
    }

    return Promise.resolve({ rows: [user], rowCount: 1 });
  }

  // Check recent OTP
  if (lower.includes('otp_expires_at - make_interval') || lower.includes('recent')) {
    const id = Number(params[0]);
    const user = store.users.find((u) => Number(u.id) === id);
    const now = Date.now();
    const expires = user && user.otp_expires_at ? new Date(user.otp_expires_at).getTime() : 0;
    const recent = expires > now + (9 * 60 * 1000);
    return Promise.resolve({ rows: [{ recent }], rowCount: 1 });
  }

  // INSERT user from Google
  if (lower.includes('insert into users') && lower.includes('google_id')) {
    const [name, email, googleId] = params;
    const cleanEmail = String(email).trim().toLowerCase();
    const isAdmin = cleanEmail === 'pjiya4285@gmail.com';
    let existing = store.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      existing.google_id = googleId;
      existing.email_verified = true;
      existing.role = isAdmin ? 'admin' : 'driver';
      if (isAdmin) existing.subscription = 'Admin Console';
      saveStore(store);
      return Promise.resolve({ rows: [existing], rowCount: 1 });
    }

    const nextId = store.users.reduce((m, u) => Math.max(m, Number(u.id) || 0), 0) + 1;
    const newUser = {
      id: nextId,
      name: String(name),
      email: cleanEmail,
      phone: "",
      city: "Bengaluru",
      dob: "",
      photo: "",
      google_id: String(googleId),
      email_verified: true,
      password_hash: null,
      otp_hash: null,
      otp_expires_at: null,
      otp_attempts: 0,
      wallet: isAdmin ? 10000 : 150,
      points: isAdmin ? 5000 : 150,
      points_earned_total: isAdmin ? 5000 : 250,
      subscription: isAdmin ? "Admin Console" : "Basic",
      role: isAdmin ? "admin" : "driver",
      created_at: new Date().toISOString()
    };
    store.users.push(newUser);
    saveStore(store);
    return Promise.resolve({ rows: [newUser], rowCount: 1 });
  }

  // INSERT user from Signup
  if (lower.includes('insert into users') && lower.includes('password_hash')) {
    const [name, email, passwordHash] = params;
    const cleanEmail = String(email).trim().toLowerCase();
    const isAdmin = cleanEmail === 'pjiya4285@gmail.com';
    const existing = store.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      const err = new Error('duplicate key value violates unique constraint "users_email_key"');
      err.code = '23505';
      return Promise.reject(err);
    }

    const nextId = store.users.reduce((m, u) => Math.max(m, Number(u.id) || 0), 0) + 1;
    const newUser = {
      id: nextId,
      name: String(name),
      email: cleanEmail,
      phone: "",
      city: "Bengaluru",
      dob: "",
      photo: "",
      password_hash: passwordHash,
      google_id: null,
      email_verified: false,
      otp_hash: null,
      otp_expires_at: null,
      otp_attempts: 0,
      wallet: isAdmin ? 10000 : 50,
      points: isAdmin ? 5000 : 50,
      points_earned_total: isAdmin ? 5000 : 50,
      subscription: isAdmin ? "Admin Console" : "Basic",
      role: isAdmin ? "admin" : "driver",
      created_at: new Date().toISOString()
    };
    store.users.push(newUser);
    saveStore(store);
    return Promise.resolve({ rows: [newUser], rowCount: 1 });
  }

  // UPDATE users
  if (lower.startsWith('update users')) {
    if (lower.includes('otp_hash = $1')) {
      const [otpHash, mins, userId] = params;
      const user = store.users.find((u) => Number(u.id) === Number(userId));
      if (user) {
        user.otp_hash = otpHash;
        user.otp_expires_at = new Date(Date.now() + (Number(mins) || 10) * 60 * 1000).toISOString();
        user.otp_attempts = 0;
        saveStore(store);
      }
      return Promise.resolve({ rows: user ? [user] : [], rowCount: user ? 1 : 0 });
    }

    if (lower.includes('otp_attempts = otp_attempts + 1')) {
      const userId = Number(params[0]);
      const user = store.users.find((u) => Number(u.id) === userId);
      if (user) {
        user.otp_attempts = (user.otp_attempts || 0) + 1;
        saveStore(store);
      }
      return Promise.resolve({ rows: user ? [user] : [], rowCount: user ? 1 : 0 });
    }

    if (lower.includes('email_verified = true')) {
      const userId = Number(params[params.length - 1]);
      const user = store.users.find((u) => Number(u.id) === userId);
      if (user) {
        user.email_verified = true;
        user.otp_hash = null;
        user.otp_expires_at = null;
        user.otp_attempts = 0;
        if (params.length === 2 && lower.includes('google_id = $1')) {
          user.google_id = params[0];
        }
        saveStore(store);
      }
      return Promise.resolve({ rows: user ? [user] : [], rowCount: user ? 1 : 0 });
    }

    if (lower.includes('google_id = $1 where id = $2')) {
      const [googleId, userId] = params;
      const user = store.users.find((u) => Number(u.id) === Number(userId));
      if (user) {
        user.google_id = googleId;
        saveStore(store);
      }
      return Promise.resolve({ rows: user ? [user] : [], rowCount: user ? 1 : 0 });
    }

    if (lower.includes('password_hash = $1') && lower.includes('where id = $2')) {
      const [passwordHash, userId] = params;
      const user = store.users.find((u) => Number(u.id) === Number(userId));
      if (user) {
        user.password_hash = passwordHash;
        saveStore(store);
      }
      return Promise.resolve({ rows: user ? [user] : [], rowCount: user ? 1 : 0 });
    }

    if (lower.includes('otp_hash = null')) {
      const userId = Number(params[params.length - 1]);
      const user = store.users.find((u) => Number(u.id) === userId);
      if (user) {
        user.otp_hash = null;
        user.otp_expires_at = null;
        user.otp_attempts = 0;
        saveStore(store);
      }
      return Promise.resolve({ rows: user ? [user] : [], rowCount: user ? 1 : 0 });
    }
  }

  return Promise.resolve({ rows: [], rowCount: 0 });
}

// ════════════════════════════════════════════════
// REPOSITORY METHODS (Unified Data Layer)
// ════════════════════════════════════════════════

module.exports = {
  // Low-level query
  query: async (text, params) => {
    if (useFallback || !pgPool) {
      return executeFallbackQuery(text, params);
    }
    try {
      return await pgPool.query(text, params);
    } catch (err) {
      switchToFallback();
      return executeFallbackQuery(text, params);
    }
  },

  // Users
  getUserById: (id) => {
    return store.users.find((u) => Number(u.id) === Number(id)) || null;
  },

  getUserByEmail: (email) => {
    return store.users.find((u) => String(u.email).toLowerCase() === String(email).toLowerCase()) || null;
  },

  updateUserProfile: (id, updates) => {
    const user = store.users.find((u) => Number(u.id) === Number(id));
    if (!user) return null;
    const allowed = ['name', 'phone', 'city', 'dob', 'photo', 'subscription', 'wallet', 'points', 'points_earned_total'];
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        user[key] = updates[key];
      }
    }
    saveStore(store);
    return user;
  },

  getAllUsers: () => {
    return store.users.map((u) => {
      const isAdmin = String(u.email || '').trim().toLowerCase() === 'pjiya4285@gmail.com';
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone || '-',
        city: u.city || 'Bengaluru',
        tier: isAdmin ? 'Admin Console' : (u.subscription || 'Basic'),
        wallet: Number(u.wallet) || 0,
        points: Number(u.points) || 0,
        emailVerified: Boolean(u.email_verified),
        role: isAdmin ? 'Administrator' : 'Driver'
      };
    });
  },

  // Full User State for Frontend Sync
  getFullUserState: (userId) => {
    const user = store.users.find((u) => Number(u.id) === Number(userId));
    if (!user) return null;
    const isAdmin = Boolean(user.email && user.email.trim().toLowerCase() === 'pjiya4285@gmail.com');
    const vehicles = store.vehicles.filter((v) => Number(v.userId) === Number(user.id));
    const bookings = store.bookings.filter((b) => Number(b.userId) === Number(user.id));
    const transactions = store.transactions.filter((t) => Number(t.userId) === Number(user.id));
    const session = store.chargingSessions[user.id] || DEFAULT_SEED.chargingSessions[1];

    return {
      loggedIn: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || "+91 98765 43210",
        dob: user.dob || "2002-01-12",
        photo: user.photo || "",
        pointsEarnedTotal: user.points_earned_total || 250,
        city: user.city || "Bengaluru",
        tier: isAdmin ? "Admin Console" : (user.subscription || "Basic"),
        role: isAdmin ? "admin" : "driver",
        isAdmin: isAdmin,
        wallet: Number(user.wallet) || 150,
        points: Number(user.points) || 150,
        vehicles: vehicles.length > 0 ? vehicles : DEFAULT_SEED.vehicles,
        bookings: bookings,
        transactions: transactions
      },
      session: session
    };
  },

  // Vehicles
  getVehicles: (userId) => {
    return store.vehicles.filter((v) => Number(v.userId) === Number(userId));
  },

  addVehicle: (userId, { brand, plate }) => {
    const newVehicle = {
      id: "v_" + Date.now(),
      userId: Number(userId),
      brand: brand.trim(),
      plate: plate.trim().toUpperCase(),
      active: store.vehicles.filter((v) => Number(v.userId) === Number(userId)).length === 0
    };
    store.vehicles.push(newVehicle);
    saveStore(store);
    return newVehicle;
  },

  setActiveVehicle: (userId, vehicleId) => {
    store.vehicles.forEach((v) => {
      if (Number(v.userId) === Number(userId)) {
        v.active = v.id === vehicleId;
      }
    });
    saveStore(store);
    return store.vehicles.filter((v) => Number(v.userId) === Number(userId));
  },

  deleteVehicle: (userId, vehicleId) => {
    const idx = store.vehicles.findIndex((v) => Number(v.userId) === Number(userId) && v.id === vehicleId);
    if (idx !== -1) {
      store.vehicles.splice(idx, 1);
      // Ensure at least one is active if any remain
      const userVehicles = store.vehicles.filter((v) => Number(v.userId) === Number(userId));
      if (userVehicles.length > 0 && !userVehicles.some((v) => v.active)) {
        userVehicles[0].active = true;
      }
      saveStore(store);
      return true;
    }
    return false;
  },

  // Stations
  getStations: () => store.stations,

  getStationById: (id) => store.stations.find((s) => s.id === id) || null,

  // Bookings
  getBookings: (userId) => {
    return store.bookings.filter((b) => Number(b.userId) === Number(userId));
  },

  createBooking: (userId, { stationId, date, time }) => {
    const station = store.stations.find((s) => s.id === stationId);
    if (!station) throw new Error("Station not found");
    if (station.slotsAvail <= 0) throw new Error("No slots available at this station");

    station.slotsAvail = Math.max(0, station.slotsAvail - 1);
    if (station.slotsAvail === 0) station.status = "busy";

    const newBooking = {
      id: "b_" + Date.now(),
      userId: Number(userId),
      stationId: station.id,
      stationName: station.name,
      address: station.address,
      date: date || "Today",
      time: time || "06:00 PM - 07:00 PM",
      status: "Confirmed",
      created_at: new Date().toISOString()
    };

    store.bookings.unshift(newBooking);
    saveStore(store);
    return newBooking
    ;
  },

  cancelBooking: (userId, bookingId) => {
    const booking = store.bookings.find((b) => Number(b.userId) === Number(userId) && b.id === bookingId);
    if (!booking) return false;

    booking.status = "Cancelled";
    // Restore station slot if possible
    const station = store.stations.find((s) => s.id === booking.stationId);
    if (station && station.slotsAvail < station.slotsTotal) {
      station.slotsAvail++;
      station.status = "available";
    }

    saveStore(store);
    return true;
  },

  // Transactions
  getTransactions: (userId) => {
    return store.transactions.filter((t) => Number(t.userId) === Number(userId));
  },

  addTransaction: (userId, tx) => {
    const newTx = {
      id: "t_" + Date.now(),
      userId: Number(userId),
      date: tx.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      type: tx.type,
      energy: tx.energy || "",
      cost: tx.cost || "",
      points: tx.points || "",
      created_at: new Date().toISOString()
    };
    store.transactions.unshift(newTx);
    saveStore(store);
    return newTx;
  },

  // Ads & Rewards
  getAds: () => store.ads,

  claimAdReward: (userId, adId) => {
    const ad = store.ads.find((a) => a.id === adId);
    if (!ad) throw new Error("Ad not found");

    const user = store.users.find((u) => Number(u.id) === Number(userId));
    if (!user) throw new Error("User not found");

    const rewardPoints = Number(ad.points) || 15;
    const rewardCash = rewardPoints; // 1 point = ₹1

    user.points = (Number(user.points) || 0) + rewardPoints;
    user.wallet = (Number(user.wallet) || 0) + rewardCash;
    user.points_earned_total = (Number(user.points_earned_total) || 0) + rewardPoints;

    const tx = {
      id: "t_" + Date.now(),
      userId: user.id,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      type: `Ad Reward - ${ad.brand}`,
      energy: `${ad.duration}s view`,
      cost: `+₹${rewardCash}`,
      points: `+${rewardPoints} pts`
    };

    store.transactions.unshift(tx);
    saveStore(store);

    return {
      success: true,
      rewardPoints,
      wallet: user.wallet,
      points: user.points,
      transaction: tx
    };
  },

  // Vouchers Shop
  getVouchers: () => store.vouchers,

  redeemVoucher: (userId, voucherId) => {
    const voucher = store.vouchers.find((v) => v.id === voucherId);
    if (!voucher) throw new Error("Voucher not found");

    const user = store.users.find((u) => Number(u.id) === Number(userId));
    if (!user) throw new Error("User not found");

    if (user.points < voucher.pointsCost) {
      throw new Error(`Insufficient points. You need ${voucher.pointsCost} points, but have ${user.points}.`);
    }

    user.points -= voucher.pointsCost;

    const tx = {
      id: "t_" + Date.now(),
      userId: user.id,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      type: `Voucher Redemption - ${voucher.brand}`,
      energy: "Voucher",
      cost: `-₹${voucher.pointsCost}`,
      points: `-${voucher.pointsCost} pts`
    };

    store.transactions.unshift(tx);
    saveStore(store);

    return {
      success: true,
      voucherCode: "EVIO-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
      pointsLeft: user.points,
      transaction: tx
    };
  },

  // Campaigns (Advertiser)
  getCampaigns: () => store.campaigns,

  createCampaign: ({ brand, target, spend }) => {
    const newCamp = {
      id: store.campaigns.length + 1,
      brand: brand.trim(),
      target: target.trim(),
      impressions: 0,
      spend: Number(spend) || 50000,
      active: true
    };
    store.campaigns.push(newCamp);
    saveStore(store);
    return newCamp;
  },

  toggleCampaign: (id) => {
    const camp = store.campaigns.find((c) => Number(c.id) === Number(id));
    if (camp) {
      camp.active = !camp.active;
      saveStore(store);
      return camp;
    }
    return null;
  },

  // Live Charging Session
  getChargingSession: (userId) => {
    return store.chargingSessions[userId] || store.chargingSessions[1];
  },

  updateChargingSession: (userId, sessionData) => {
    store.chargingSessions[userId] = {
      ...store.chargingSessions[userId],
      ...sessionData
    };
    saveStore(store);
    return store.chargingSessions[userId];
  },

  stopChargingSession: (userId) => {
    const session = store.chargingSessions[userId] || store.chargingSessions[1];
    session.isActive = false;

    // Add charging reward transaction & credit points directly from charging
    const user = store.users.find((u) => Number(u.id) === Number(userId)) || store.users[0];
    const energy = session.energyCharged || 14.6;
    const cost = session.cost || 182;
    const cashback = session.cashback || 34;
    const netCost = Math.max(0, cost - cashback);

    let multi = 1.0;
    if (user.tier === 'Pro') multi = 1.5;
    if (user.tier === 'Elite') multi = 2.0;
    const pointsEarned = Math.max(1, Math.round(energy * 2 * multi));

    user.points = (Number(user.points) || 0) + pointsEarned;
    user.points_earned_total = (Number(user.points_earned_total) || 0) + pointsEarned;
    user.wallet = Math.max(0, (Number(user.wallet) || 0) - netCost);

    const tx = {
      id: "t_" + Date.now(),
      userId: user.id,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      type: `Charging Reward - ${session.stationName || 'Hub'}`,
      energy: `${energy} kWh`,
      cost: `-₹${netCost}`,
      points: `+${pointsEarned} pts`
    };

    store.transactions.unshift(tx);
    saveStore(store);

    return {
      session,
      transaction: tx,
      pointsEarned,
      wallet: user.wallet,
      points: user.points
    };
  },

  // BMS Telemetry
  getBmsStats: (userId) => {
    return store.bmsTelemetry[userId] || store.bmsTelemetry[1];
  },

  updateBmsStats: (userId, stats) => {
    store.bmsTelemetry[userId] = {
      ...store.bmsTelemetry[userId],
      ...stats
    };
    saveStore(store);
    return store.bmsTelemetry[userId];
  }
};
