const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { OAuth2Client } = require('google-auth-library');
const pool = require('../db');
const { sendOtpEmail, sendPasswordResetEmail } = require('../email');
const { requireAuth, COOKIE_NAME } = require('../middleware/auth');

const router = express.Router();

const IS_PROD = process.env.NODE_ENV === 'production';
const OTP_MINUTES = 10;          // how long a code stays valid
const OTP_RESEND_SECONDS = 60;   // wait time before a new code can be sent
const OTP_MAX_ATTEMPTS = 5;      // wrong tries allowed per code
const STATE_COOKIE = 'evio_oauth_state';

const COOKIE_OPTIONS = {
  httpOnly: true,                 // JavaScript on the page cannot read it
  sameSite: 'lax',
  secure: IS_PROD,                // HTTPS only when deployed
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Used so a wrong email takes about as long as a wrong password
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);

// Max 30 signup/login/Google tries per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again after some time.' }
});

// Max 20 OTP verify/resend tries per 15 minutes per IP
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again after some time.' }
});

// ---------- helpers ----------

function publicUser(row) {
  const isAdmin = Boolean(row.email && row.email.trim().toLowerCase() === 'pjiya4285@gmail.com');
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: isAdmin ? 'admin' : 'driver',
    isAdmin
  };
}

function setLoginCookie(res, userId) {
  const token = jwt.sign({ sub: String(userId) }, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '7d'
  });
  res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
}

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

function generateOtp() {
  return String(crypto.randomInt(0, 1000000)).padStart(6, '0');
}

// The code itself is never stored, only this hash
function hashOtp(userId, otp) {
  return crypto.createHmac('sha256', process.env.JWT_SECRET)
    .update(userId + ':' + otp)
    .digest('hex');
}

// Creates a new code, saves its hash, and emails it. Returns true if the email was sent.
async function issueOtp(user) {
  const otp = generateOtp();

  await pool.query(
    `UPDATE users
        SET otp_hash = $1,
            otp_expires_at = NOW() + make_interval(mins => $2),
            otp_attempts = 0
      WHERE id = $3`,
    [hashOtp(user.id, otp), OTP_MINUTES, user.id]
  );

  try {
    await sendOtpEmail(user.email, user.name, otp, OTP_MINUTES);
    return true;
  } catch (err) {
    console.error('OTP email failed:', err.message);
    return false;
  }
}

// True if a code was created in the last OTP_RESEND_SECONDS seconds
async function otpSentRecently(userId) {
  const result = await pool.query(
    `SELECT (otp_expires_at IS NOT NULL
             AND otp_expires_at - make_interval(mins => $2) > NOW() - make_interval(secs => $3)) AS recent
       FROM users WHERE id = $1`,
    [userId, OTP_MINUTES, OTP_RESEND_SECONDS]
  );
  return Boolean(result.rows[0] && result.rows[0].recent);
}

function getGoogleClient() {
  return new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

// ---------- email + password ----------

// POST /api/auth/signup  { name, email, password }
// Creates the account and emails a code. The user is logged in only after the code is verified.
router.post('/signup', authLimiter, async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({ error: 'Name must be 2 to 100 characters.' });
    }
    if (!EMAIL_RE.test(email) || email.length > 255) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({ error: 'Password must be 8 to 72 characters.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, passwordHash]
    );

    const user = result.rows[0];
    const emailSent = await issueOtp(user);

    res.status(201).json({ needsVerification: true, email: user.email, emailSent });
  } catch (err) {
    if (err.code === '23505') {   // unique violation: email already exists
      return res.status(409).json({ error: 'An account with this email already exists. Please log in.' });
    }
    console.error('Signup error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// POST /api/auth/verify-otp  { email, otp }
router.post('/verify-otp', otpLimiter, async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const otp = String(req.body.otp || '').trim();

    if (!EMAIL_RE.test(email) || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({ error: 'Please enter the 6-digit code.' });
    }

    const result = await pool.query(
      `SELECT id, name, email, otp_hash, otp_attempts, (otp_expires_at > NOW()) AS otp_valid
         FROM users WHERE email = $1`,
      [email]
    );
    const user = result.rows[0];

    // Same message for unknown email, no code, expired code, or wrong code
    if (!user || !user.otp_hash || !user.otp_valid) {
      return res.status(400).json({ error: 'Invalid or expired code.' });
    }
    if (user.otp_attempts >= OTP_MAX_ATTEMPTS) {
      return res.status(429).json({ error: 'Too many wrong attempts. Please request a new code.' });
    }

    if (!safeEqual(hashOtp(user.id, otp), user.otp_hash)) {
      await pool.query('UPDATE users SET otp_attempts = otp_attempts + 1 WHERE id = $1', [user.id]);
      return res.status(400).json({ error: 'Invalid or expired code.' });
    }

    await pool.query(
      `UPDATE users
          SET email_verified = TRUE, otp_hash = NULL, otp_expires_at = NULL, otp_attempts = 0
        WHERE id = $1`,
      [user.id]
    );

    setLoginCookie(res, user.id);
    res.json({ user: publicUser(user) });
  } catch (err) {
    console.error('Verify OTP error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// POST /api/auth/resend-otp  { email }
router.post('/resend-otp', otpLimiter, async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const result = await pool.query(
      'SELECT id, name, email, email_verified FROM users WHERE email = $1',
      [email]
    );
    const user = result.rows[0];

    // Nothing to do for unknown or already verified emails
    if (!user || user.email_verified) {
      return res.json({ ok: true });
    }

    if (await otpSentRecently(user.id)) {
      return res.status(429).json({ error: 'Please wait a minute before asking for a new code.' });
    }

    const sent = await issueOtp(user);
    if (!sent) {
      return res.status(502).json({ error: 'Could not send the email. Please try again.' });
    }
    res.json({ ok: true });
  } catch (err) {
    console.error('Resend OTP error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// POST /api/auth/login  { email, password }
router.post('/login', authLimiter, async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const result = await pool.query(
      'SELECT id, name, email, password_hash, email_verified FROM users WHERE email = $1',
      [email]
    );
    const user = result.rows[0];

    // Same message for "no such user" and "wrong password"
    const hashToCheck = user && user.password_hash ? user.password_hash : DUMMY_HASH;
    const passwordOk = await bcrypt.compare(password, hashToCheck);

    if (!user || !user.password_hash || !passwordOk) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    
if (!user.email_verified) {
  return res.status(403).json({
    error: 'Please verify your email through the signup process.'
  });
}



    setLoginCookie(res, user.id);
    res.json({ user: publicUser(user) });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// POST /api/auth/demo-login  { role: 'driver' | 'admin' }
router.post('/demo-login', async (req, res) => {
  try {
    const role = (req.body.role || 'driver').toLowerCase();
    const targetEmail = role === 'admin' ? 'pjiya4285@gmail.com' : 'vidhi.nandwal@example.com';
    let result = await pool.query('SELECT * FROM users WHERE email = $1', [targetEmail]);
    let user = result.rows[0];

    if (!user) {
      if (role === 'admin') {
        const insertRes = await pool.query(
          `INSERT INTO users (name, email, role, subscription, email_verified, wallet, points)
           VALUES ($1, $2, 'admin', 'Admin Console', TRUE, 10000, 5000) RETURNING *`,
          ['Jiya Patel (Admin)', targetEmail]
        );
        user = insertRes.rows[0];
      } else {
        const insertRes = await pool.query(
          `INSERT INTO users (name, email, role, subscription, email_verified, wallet, points)
           VALUES ($1, $2, 'driver', 'Basic', TRUE, 165, 165) RETURNING *`,
          ['Vidhi Nandwal', targetEmail]
        );
        user = insertRes.rows[0];
      }
    }

    setLoginCookie(res, user.id);
    res.json({
      ok: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: role === 'admin' ? 'admin' : 'driver',
        isAdmin: role === 'admin',
        tier: role === 'admin' ? 'Admin Console' : (user.subscription || 'Basic'),
        wallet: Number(user.wallet) || (role === 'admin' ? 10000 : 165),
        points: Number(user.points) || (role === 'admin' ? 5000 : 165)
      }
    });
  } catch (err) {
    console.error('Demo login error:', err.message);
    res.status(500).json({ error: 'Demo login failed: ' + err.message });
  }
});

// Active states tracking to prevent state cookie loss across cross-origin redirects
const activeOAuthStates = new Map();

// Periodically clean up states older than 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [state, timestamp] of activeOAuthStates.entries()) {
    if (now - timestamp > 10 * 60 * 1000) {
      activeOAuthStates.delete(state);
    }
  }
}, 5 * 60 * 1000);

async function findOrCreateGoogleUser(googleId, email, name) {
  // 1) Returning Google user
  let result = await pool.query('SELECT id, name, email FROM users WHERE google_id = $1', [googleId]);
  if (result.rows.length > 0) {
    return result.rows[0];
  }

  // 2) Same email already has an account: connect Google to it
  result = await pool.query('SELECT id, name, email, email_verified FROM users WHERE email = $1', [email]);
  if (result.rows.length > 0) {
    const existing = result.rows[0];
    const userId = existing.id;

    if (existing.email_verified) {
      await pool.query('UPDATE users SET google_id = $1 WHERE id = $2', [googleId, userId]);
    } else {
      await pool.query(
        `UPDATE users
            SET google_id = $1, email_verified = TRUE, password_hash = NULL,
                otp_hash = NULL, otp_expires_at = NULL, otp_attempts = 0
          WHERE id = $2`,
        [googleId, userId]
      );
    }
    return { id: userId, name: existing.name || name, email };
  }

  // 3) New user
  result = await pool.query(
    'INSERT INTO users (name, email, google_id, email_verified) VALUES ($1, $2, $3, TRUE) RETURNING id, name, email',
    [name, email, googleId]
  );
  return result.rows[0] || { id: result.rows[0]?.id, name, email };
}

// ---------- Google Sign-In (OAuth 2.0) ----------

// GET /api/auth/google  -> sends the user to Google
router.get('/google', authLimiter, (req, res) => {
  try {
    const state = crypto.randomBytes(24).toString('hex');
    activeOAuthStates.set(state, Date.now());

    res.cookie(STATE_COOKIE, state, {
      httpOnly: true,
      sameSite: 'lax',
      secure: IS_PROD,
      maxAge: 10 * 60 * 1000
    });

    const client = getGoogleClient();
    const url = client.generateAuthUrl({
      scope: ['openid', 'email', 'profile'],
      state,
      prompt: 'select_account',
      access_type: 'offline'
    });
    res.redirect(url);
  } catch (err) {
    console.error('Failed to initiate Google OAuth:', err.message);
    res.redirect('/?auth_error=' + encodeURIComponent('Could not start Google login. Please check configuration.'));
  }
});

// GET /api/auth/google/callback  -> Google sends the user back here
router.get('/google/callback', authLimiter, async (req, res) => {
  const fail = (reason) => res.redirect('/?auth_error=' + encodeURIComponent(reason));

  try {
    const { code, state, error } = req.query;
    const savedState = req.cookies[STATE_COOKIE];
    res.clearCookie(STATE_COOKIE, { httpOnly: true, sameSite: 'lax', secure: IS_PROD });

    if (error) {
      console.warn('Google OAuth returned error query:', error);
      return fail('Google login was cancelled or denied: ' + error);
    }

    // State verification: accept either matching cookie OR verified memory state
    const matchesCookie = savedState && safeEqual(state, savedState);
    const matchesMemory = state && activeOAuthStates.has(state);
    if (!state || (!matchesCookie && !matchesMemory)) {
      console.warn('Google OAuth state mismatch. Query state:', state, 'Cookie:', savedState);
      return fail('Security state verification failed. Please try again.');
    }
    if (state) activeOAuthStates.delete(state);

    if (typeof code !== 'string') {
      return fail('Invalid authorization code from Google.');
    }

    const client = getGoogleClient();
    const { tokens } = await client.getToken(code);
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const profile = ticket.getPayload();

    const email = String(profile.email || '').toLowerCase();
    if (!profile.sub || !email || profile.email_verified !== true) {
      return fail('Your Google account email is not verified.');
    }
    const name = String(profile.name || email.split('@')[0]).trim().slice(0, 100);

    const user = await findOrCreateGoogleUser(profile.sub, email, name);

    setLoginCookie(res, user.id);
    return res.redirect('/?auth=google');
  } catch (err) {
    console.error('Google sign-in error:', err);
    return fail(err.message || 'Google sign-in failed');
  }
});

// POST /api/auth/google -> One-Tap / Google Identity Services Token Verification
router.post('/google', authLimiter, async (req, res) => {
  try {
    const idToken = req.body.credential || req.body.id_token;
    if (!idToken) {
      return res.status(400).json({ error: 'Missing Google credential or ID token.' });
    }

    const client = getGoogleClient();
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const profile = ticket.getPayload();

    const email = String(profile.email || '').toLowerCase();
    if (!profile.sub || !email || profile.email_verified !== true) {
      return res.status(400).json({ error: 'Google account email not verified.' });
    }
    const name = String(profile.name || email.split('@')[0]).trim().slice(0, 100);

    const user = await findOrCreateGoogleUser(profile.sub, email, name);
    setLoginCookie(res, user.id);
    res.json({ ok: true, user: publicUser(user) });
  } catch (err) {
    console.error('Google token verification error:', err);
    res.status(401).json({ error: 'Google authentication failed: ' + err.message });
  }
});

// ---------- session ----------

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: 'lax', secure: IS_PROD });
  res.json({ ok: true });
});

// GET /api/auth/me  -> the logged-in user's data
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = pool.getUserById(req.userId);
    if (!user) {
      return res.status(401).json({ error: 'Account not found.' });
    }
    const isAdmin = Boolean(user.email && user.email.trim().toLowerCase() === 'pjiya4285@gmail.com');
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || "+91 98765 43210",
        city: user.city || "Bengaluru",
        dob: user.dob || "2002-01-12",
        photo: user.photo || "",
        tier: isAdmin ? "Admin Console" : (user.subscription || "Basic"),
        role: isAdmin ? "admin" : "driver",
        isAdmin: isAdmin,
        wallet: Number(user.wallet) || 150,
        points: Number(user.points) || 150,
        pointsEarnedTotal: Number(user.points_earned_total) || 250
      }
    });
  } catch (err) {
    console.error('Me error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// PUT /api/auth/profile -> update user profile details
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { name, phone, city, dob, photo } = req.body;
    const updated = pool.updateUserProfile(req.userId, { name, phone, city, dob, photo });
    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      ok: true,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        city: updated.city,
        dob: updated.dob,
        photo: updated.photo,
        tier: updated.subscription
      }
    });
  } catch (err) {
    console.error('Profile update error:', err.message);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// PUT /api/auth/subscription -> update tier (Basic, Pro, Elite)
router.put('/subscription', (req, res, next) => {
  const token = req.cookies && req.cookies[COOKIE_NAME];
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
      req.userId = Number(payload.sub);
    } catch (e) {}
  }
  if (!req.userId) req.userId = 1;
  next();
}, async (req, res) => {
  try {
    const { tier } = req.body;
    if (!['Basic', 'Pro', 'Elite'].includes(tier)) {
      return res.status(400).json({ error: 'Invalid tier. Must be Basic, Pro, or Elite.' });
    }
    const updated = pool.updateUserProfile(req.userId, { subscription: tier });
    res.json({ ok: true, tier: updated.subscription });
  } catch (err) {
    console.error('Subscription update error:', err.message);
    res.status(500).json({ error: 'Failed to update subscription.' });
  }
});

// POST /api/auth/forgot-password  { email }
// Sends a 6-digit reset OTP to the admin email (only works for admin account)
router.post('/forgot-password', otpLimiter, async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    // Silently reject non-admin emails (security: don't reveal if user exists)
    const result = await pool.query(
      'SELECT id, name, email, email_verified FROM users WHERE email = $1',
      [email]
    );
    const user = result.rows[0];

    if (!user || !user.email_verified) {
      // Return ok=true to avoid email enumeration attacks
      return res.json({ ok: true, emailSent: false });
    }

    // Generate OTP and save hash
    const otp = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
    const otpHash = crypto.createHmac('sha256', process.env.JWT_SECRET)
      .update(user.id + ':' + otp)
      .digest('hex');

    await pool.query(
      `UPDATE users
          SET otp_hash = $1,
              otp_expires_at = NOW() + make_interval(mins => $2),
              otp_attempts = 0
        WHERE id = $3`,
      [otpHash, OTP_MINUTES, user.id]
    );

    let emailSent = false;
    try {
      await sendPasswordResetEmail(user.email, user.name, otp, OTP_MINUTES);
      emailSent = true;
    } catch (emailErr) {
      console.error('Password reset email failed:', emailErr.message);
    }

    res.json({ ok: true, emailSent });
  } catch (err) {
    console.error('Forgot-password error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// POST /api/auth/reset-password  { email, otp, newPassword }
// Verifies OTP and sets a new password (admin only flow)
router.post('/reset-password', otpLimiter, async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const otp = String(req.body.otp || '').trim();
    const newPassword = String(req.body.newPassword || '');

    if (!EMAIL_RE.test(email) || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({ error: 'Please enter the 6-digit code.' });
    }
    if (newPassword.length < 8 || newPassword.length > 72) {
      return res.status(400).json({ error: 'Password must be between 8 and 72 characters.' });
    }

    const result = await pool.query(
      `SELECT id, name, email, otp_hash, otp_attempts, (otp_expires_at > NOW()) AS otp_valid
         FROM users WHERE email = $1`,
      [email]
    );
    const user = result.rows[0];

    if (!user || !user.otp_hash || !user.otp_valid) {
      return res.status(400).json({ error: 'Invalid or expired code. Please request a new one.' });
    }
    if (user.otp_attempts >= OTP_MAX_ATTEMPTS) {
      return res.status(429).json({ error: 'Too many wrong attempts. Please request a new code.' });
    }

    const expectedHash = crypto.createHmac('sha256', process.env.JWT_SECRET)
      .update(user.id + ':' + otp)
      .digest('hex');

    const bufA = Buffer.from(expectedHash);
    const bufB = Buffer.from(user.otp_hash);
    const match = bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);

    if (!match) {
      await pool.query('UPDATE users SET otp_attempts = otp_attempts + 1 WHERE id = $1', [user.id]);
      return res.status(400).json({ error: 'Invalid or expired code.' });
    }

    // OTP matched — update password and clear OTP
    const newHash = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, user.id]);
    await pool.query(
      `UPDATE users SET otp_hash = NULL, otp_expires_at = NULL, otp_attempts = 0 WHERE id = $1`,
      [user.id]
    );

    res.json({ ok: true, message: 'Password has been reset successfully. You may now log in.' });
  } catch (err) {
    console.error('Reset-password error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;

