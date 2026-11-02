// Sends emails through the Brevo API (https://api.brevo.com/v3/smtp/email)
const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (ch) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
  ));
}

async function sendOtpEmail(toEmail, toName, otp, minutes) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #0f172a;">Verify your email</h2>
      <p>Hi ${escapeHtml(toName)},</p>
      <p>Use this code to finish signing up for EVIO:</p>
      <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px; margin: 24px 0;">${otp}</p>
      <p>This code expires in ${minutes} minutes. If you did not request it, you can ignore this email.</p>
    </div>`;

  const textContent =
    `Hi ${toName},\n\nYour EVIO verification code is ${otp}.\n` +
    `It expires in ${minutes} minutes. If you did not request it, ignore this email.`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(BREVO_URL, {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
        accept: 'application/json'
      },
      body: JSON.stringify({
        sender: { name: process.env.BREVO_SENDER_NAME || 'EVIO', email: process.env.BREVO_SENDER_EMAIL },
        to: [{ email: toEmail, name: toName }],
        subject: 'Your EVIO verification code',
        htmlContent,
        textContent
      }),
      signal: controller.signal
    });

    if (!res.ok) {
      let detail = '';
      try {
        const data = await res.json();
        detail = data.message || data.code || '';
      } catch (e) {}
      throw new Error(`Brevo returned ${res.status} ${detail}`.trim());
    }
  } finally {
    clearTimeout(timer);
  }
}

async function sendPasswordResetEmail(toEmail, toName, otp, minutes) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #3b82f6;">Reset Your EVIO Password</h2>
      <p>Hi ${escapeHtml(toName)},</p>
      <p>We received a request to reset your EVIO password. Use the code below to proceed:</p>
      <p style="font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 28px 0; color: #0f172a;">${otp}</p>
      <p>This code expires in <strong>${minutes} minutes</strong>.</p>
      <p style="color: #6b7280; font-size: 13px;">If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
    </div>`;

  const textContent =
    `Hi ${toName},\n\nYour EVIO password reset code is: ${otp}\n` +
    `It expires in ${minutes} minutes. If you did not request it, ignore this email.`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(BREVO_URL, {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
        accept: 'application/json'
      },
      body: JSON.stringify({
        sender: { name: process.env.BREVO_SENDER_NAME || 'EVIO', email: process.env.BREVO_SENDER_EMAIL },
        to: [{ email: toEmail, name: toName }],
        subject: 'EVIO — Password Reset Code',
        htmlContent,
        textContent
      }),
      signal: controller.signal
    });

    if (!res.ok) {
      let detail = '';
      try {
        const data = await res.json();
        detail = data.message || data.code || '';
      } catch (e) {}
      throw new Error(`Brevo returned ${res.status} ${detail}`.trim());
    }
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { sendOtpEmail, sendPasswordResetEmail };
