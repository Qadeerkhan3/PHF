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
// MONGODB CONNECTION — CACHED (Vercel serverless ke liye)
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

  // Connection in progress — wait karo
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,           // Timeout ke bajaye turant error
      maxPoolSize: 10,                 // Max 10 connections
      minPoolSize: 2,                  // Min 2 connections ready
      serverSelectionTimeoutMS: 30000, // 30 sec server dhoondne ke liye
      socketTimeoutMS: 45000,          // 45 sec socket timeout
      connectTimeoutMS: 30000,         // 30 sec connect timeout
      maxIdleTimeMS: 270000,           // 4.5 min idle timeout
      heartbeatFrequencyMS: 10000      // 10 sec heartbeat
    };

    console.log('Connecting to MongoDB...');

    cached.promise = mongoose.connect(process.env.MONGO_URI, opts)
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
// DB CONNECTION MIDDLEWARE — Har request se pehle
// ═══════════════════════════════════════════════════

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB middleware error:', err.message);
    res.status(500).json({
      error: 'Database connection failed',
      details: err.message
    });
  }
});

// ═══════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════

// Root route — health check
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Peshawar Hotel Finder API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Health check
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

// Error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

// ═══════════════════════════════════════════════════
// LOCAL DEVELOPMENT vs VERCEL
// ═══════════════════════════════════════════════════

// Local development — server start karo
if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`✓ Server running on port ${PORT}`);
        console.log(`✓ MongoDB connected`);
      });
    })
    .catch((err) => {
      console.error('Failed to start server:', err.message);
      process.exit(1);
    });
}

// Vercel ke liye — app export karo (serverless function)
module.exports = app;