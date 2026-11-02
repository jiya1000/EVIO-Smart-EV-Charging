-- EVIO Complete Database Schema (PostgreSQL)
-- Safe to execute repeatedly (uses IF NOT EXISTS)

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(30) DEFAULT '',
    city VARCHAR(100) DEFAULT 'Bengaluru',
    dob VARCHAR(30) DEFAULT '',
    photo TEXT DEFAULT '',
    password_hash TEXT,
    google_id VARCHAR(255) UNIQUE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    otp_hash TEXT,
    otp_expires_at TIMESTAMP,
    otp_attempts INTEGER NOT NULL DEFAULT 0,
    wallet NUMERIC(10, 2) NOT NULL DEFAULT 150.00,
    points INTEGER NOT NULL DEFAULT 150,
    points_earned_total INTEGER NOT NULL DEFAULT 250,
    subscription VARCHAR(50) NOT NULL DEFAULT 'Basic',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
    id VARCHAR(50) PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    brand VARCHAR(100) NOT NULL,
    plate VARCHAR(50) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Stations Table
CREATE TABLE IF NOT EXISTS stations (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    type VARCHAR(100) NOT NULL,
    power VARCHAR(50) NOT NULL,
    rate NUMERIC(6, 2) NOT NULL DEFAULT 18.00,
    status VARCHAR(30) NOT NULL DEFAULT 'available',
    slots_total INTEGER NOT NULL DEFAULT 4,
    slots_avail INTEGER NOT NULL DEFAULT 3,
    icon VARCHAR(50) DEFAULT 'fa-bolt',
    bg_grad TEXT DEFAULT 'linear-gradient(135deg, #071224 0%, #0c1e35 100%)',
    lat NUMERIC(9, 6) DEFAULT 12.9716,
    lng NUMERIC(9, 6) DEFAULT 77.5946
);

-- 4. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(50) PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    station_id VARCHAR(50) REFERENCES stations(id) ON DELETE SET NULL,
    station_name VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    date VARCHAR(50) NOT NULL,
    time VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Confirmed',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(50) PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    date VARCHAR(50) NOT NULL,
    type VARCHAR(100) NOT NULL,
    energy VARCHAR(50) DEFAULT '',
    cost VARCHAR(50) DEFAULT '',
    points VARCHAR(50) DEFAULT '',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Sponsored Advertisements Table
CREATE TABLE IF NOT EXISTS ads (
    id VARCHAR(50) PRIMARY KEY,
    brand VARCHAR(100) NOT NULL,
    title TEXT NOT NULL,
    duration INTEGER NOT NULL DEFAULT 15,
    points INTEGER NOT NULL DEFAULT 15,
    icon VARCHAR(50) DEFAULT 'fa-play',
    color VARCHAR(30) DEFAULT '#00e896',
    img TEXT DEFAULT '',
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 7. Rewards Vouchers Shop Table
CREATE TABLE IF NOT EXISTS vouchers (
    id VARCHAR(50) PRIMARY KEY,
    brand VARCHAR(100) NOT NULL,
    title VARCHAR(150) NOT NULL,
    points_cost INTEGER NOT NULL,
    icon VARCHAR(50) DEFAULT 'fa-gift',
    bg_color VARCHAR(50) DEFAULT 'rgba(0,232,150,0.12)',
    icon_color VARCHAR(50) DEFAULT 'var(--green)'
);

-- 8. Advertiser Campaigns Table
CREATE TABLE IF NOT EXISTS campaigns (
    id SERIAL PRIMARY KEY,
    brand VARCHAR(100) NOT NULL,
    target VARCHAR(100) NOT NULL,
    impressions INTEGER NOT NULL DEFAULT 0,
    spend NUMERIC(12, 2) NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. Active Charging Sessions Table
CREATE TABLE IF NOT EXISTS charging_sessions (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    station_id VARCHAR(50) DEFAULT 'st1',
    station_name VARCHAR(150) DEFAULT 'MG Road Fast Charger',
    vehicle_name VARCHAR(100) DEFAULT 'Tata Nexon EV',
    battery_pct INTEGER DEFAULT 72,
    energy_charged NUMERIC(6, 2) DEFAULT 14.60,
    cost NUMERIC(10, 2) DEFAULT 182.00,
    cashback NUMERIC(10, 2) DEFAULT 34.00,
    time_left INTEGER DEFAULT 18,
    charging_speed INTEGER DEFAULT 30,
    base_rate NUMERIC(6, 2) DEFAULT 18.00,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
