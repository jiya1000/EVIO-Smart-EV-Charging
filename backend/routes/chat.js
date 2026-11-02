const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pool = require('../db');

const MAX_HISTORY = 10;
const MAX_MESSAGE_CHARS = 1000;

const SYSTEM_PROMPT = `You are EVIO Assistant, the friendly in-app helper for EVIO (Electric Vehicle Charging & AI Rewards platform).

You help users with:
- EV charging: AC/DC fast chargers, connectors (CCS2, Type 2), charging speeds, booking slots, pricing.
- EV batteries & BMS: State of Charge (SOC), voltage, temperature, battery health, tyre pressure warnings.
- Rewards: Earning cashback points by watching sponsored ads, redeeming vouchers (Amazon, VoltAd, Starbucks).
- Safety First: If a user reports smoke, burning smell, swollen battery, or sparking cables, strictly advise them to stop charging immediately, stay clear, and call emergency services or an authorized center.

Rules:
- Reply in the same language the user writes in (English, Hindi, or Hinglish).
- Keep answers short, practical, and step-by-step (3 to 6 lines or bullet points).
- If unrelated to EVs or EVIO, politely redirect the user back.`;

const KNOWLEDGE_BASE = [
  {
    keywords: ['rate', 'price', 'cost', 'charge', 'kwh', 'fees', 'paisa'],
    answer: "⚡ EVIO Charging Rates:\n• AC Normal (Type 2): ₹15 per kWh\n• DC Fast (CCS2): ₹18 - ₹22 per kWh\n• Idle fee: ₹5/min after 100% full charge (waived for Pro & Elite members!)."
  },
  {
    keywords: ['plan', 'subscription', 'membership', 'tier', 'pro', 'elite', 'upgrade'],
    answer: "🌟 EVIO Membership Tiers:\n• Free (Basic): Pay as you go, earn standard cashback.\n• Pro (₹500/mo): 10% off charging, 1.5x cashback multiplier, zero idle fee for first 30 mins.\n• Elite (₹1000/mo): 15% off charging, 2x cashback, priority fast-slot booking!"
  },
  {
    keywords: ['ad', 'reward', 'cashback', 'point', 'voucher', 'earn', 'watch'],
    answer: "🎁 EVIO Cashback & Rewards:\n• Go to the 'Rewards' tab to watch sponsored partner videos (Nike, Apple, Tesla).\n• Earn 15 to 25 points per video (1 Point = ₹1).\n• Redeem points for Amazon vouchers, charging discount credits, and partner perks!"
  },
  {
    keywords: ['battery', 'bms', 'temperature', 'soc', 'health', 'heat', 'range'],
    answer: "🔋 Battery Health & BMS Tips:\n• Keep daily charge between 20% and 80% to maximize lifespan.\n• Optimal battery temperature is 20°C - 35°C.\n• Avoid DC fast charging when battery is above 45°C or freezing."
  },
  {
    keywords: ['smoke', 'fire', 'spark', 'shock', 'danger', 'water', 'leak', 'smell', 'emergency'],
    answer: "🚨 CRITICAL SAFETY WARNING:\nStop charging immediately! Unplug if safe, step away from the vehicle, and do not touch high-voltage cables. Call emergency services or EVIO 24/7 Helpline: 1800-EVIO-HELP (1800-3846-4357)."
  },
  {
    keywords: ['book', 'slot', 'station', 'reserve', 'find', 'map'],
    answer: "📍 Booking a Charging Slot:\n1. Open the 'Map' tab or Stations section.\n2. Choose an available station (e.g. MG Road, Indiranagar).\n3. Pick your preferred day and time slot, then tap 'Reserve Slot'."
  }
];

function fallbackKnowledgeSearch(query) {
  const q = query.toLowerCase();
  for (const item of KNOWLEDGE_BASE) {
    if (item.keywords.some((k) => q.includes(k))) {
      return item.answer;
    }
  }
  return "👋 Hello! I am your EVIO Assistant. I can help you with charging station locations, booking slots, BMS diagnostics, charging rates, and claiming cashback rewards. How can I help you today?";
}

function cleanMessages(raw) {
  if (!Array.isArray(raw)) return null;
  let msgs = raw
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      content: m.content.trim().slice(0, MAX_MESSAGE_CHARS)
    }))
    .filter((m) => m.content.length > 0)
    .slice(-MAX_HISTORY);

  while (msgs.length && msgs[0].role !== 'user') msgs.shift();
  if (!msgs.length || msgs[msgs.length - 1].role !== 'user') return null;
  return msgs;
}

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many messages. Please wait a minute and try again.' }
});

router.post('/', chatLimiter, async (req, res) => {
  const messages = cleanMessages(req.body && req.body.messages);
  if (!messages) {
    return res.status(400).json({ error: 'Please send a valid message.' });
  }

  const lastMessage = messages[messages.length - 1].content;

  // Check if Gemini API Key is configured
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey.length > 10) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const modelName = process.env.CHAT_MODEL || 'gemini-2.0-flash';
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_PROMPT
      });

      const history = messages.slice(0, -1).map((m) => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      const chat = model.startChat({ history });
      const result = await chat.sendMessage(lastMessage);
      const reply = result.response.text().trim();

      if (reply) {
        return res.json({ reply });
      }
    } catch (err) {
      console.warn('Gemini chat API notice (using fallback knowledge):', err.message);
    }
  }

  // Fallback domain-aware assistant
  const fallbackReply = fallbackKnowledgeSearch(lastMessage);
  res.json({ reply: fallbackReply });
});

module.exports = router;
