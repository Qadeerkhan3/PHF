const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// ═══════════════════════════════════════════════════
// SECURITY
// ═══════════════════════════════════════════════════
app.use(helmet());
app.use(express.json({ limit: '10mb' }));

// CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://phf-frnt.vercel.app',
  'https://phf-sigma.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error('CORS blocked:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api', globalLimiter);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts, please try again after 15 minutes.' },
  skipSuccessfulRequests: true
});
app.use('/api/admin/login', loginLimiter);

// ═══════════════════════════════════════════════════
// MONGODB CONNECTION — GRACEFUL (crash nahi hoga)
// ═══════════════════════════════════════════════════

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  // Already connected — reuse
  if (cached.conn) {
    return cached.conn;
  }

  // Connection in progress
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000, // 5 sec — fast fail
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxIdleTimeMS: 270000
    };

    console.log('Connecting to MongoDB...');

    cached.promise = mongoose
      .connect(process.env.MONGO_URI, opts)
      .then((mongooseInstance) => {
        console.log('✓ MongoDB connected');
        return mongooseInstance;
      })
      .catch((err) => {
        console.error('✗ MongoDB connection failed:', err.message);
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}

// ═══════════════════════════════════════════════════
// DB MIDDLEWARE — Har request se pehle connect (silent)
// ═══════════════════════════════════════════════════
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    // DB fail — request continue karo, route handle karega
    console.error('DB middleware: connection failed, continuing without DB');
  }
  next();
});

// ═══════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════

// Root route
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Peshawar Hotel Finder API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Health check — DB status bhi batao
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    db: cached.conn ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/hotels', require('./routes/hotels'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/admin', require('./routes/admin'));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

// ═══════════════════════════════════════════════════
// LOCAL DEV vs VERCEL
// ═══════════════════════════════════════════════════

// Local development — server start
if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`✓ Server running on port ${PORT}`);
    // Background mein DB connect karo
    connectDB().catch((err) =>
      console.error('MongoDB initial connection failed:', err.message)
    );
  });
}

// Vercel ke liye — app export
module.exports = app;