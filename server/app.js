require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');

const eventRoutes = require('./routes/eventRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const heatmapRoutes = require('./routes/heatmapRoutes');
const { getAvailablePages } = require('./controllers/heatmapController');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ── Security middleware ────────────────────────────────────────────────────────

app.use(helmet());

// CORS: allow the configured frontend origin (and demo pages on other ports)
const allowedOrigins = [
  process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5500',  // VS Code Live Server default
  'http://127.0.0.1:5501',  // VS Code Live Server alternate
  'null',                    // file:// origin for locally opened HTML files
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS policy: origin ${origin} not allowed`));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Body parsing with size limits
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: false, limit: '50kb' }));

// ── Health check ──────────────────────────────────────────────────────────────

app.get('/api/health', async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  }[dbState] || 'unknown';

  const isHealthy = dbState === 1;

  return res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    status: isHealthy ? 'ok' : 'degraded',
    database: {
      status: dbStatus,
      host: isHealthy ? mongoose.connection.host : null,
      name: isHealthy ? mongoose.connection.name : null,
    },
    server: {
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      nodeVersion: process.version,
    },
  });
});

// ── Routes ────────────────────────────────────────────────────────────────────

app.use('/api/events', eventRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/heatmap', heatmapRoutes);
app.get('/api/pages', getAvailablePages);

// ── 404 handler ───────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
  });
});

// ── Centralized error handler ─────────────────────────────────────────────────

app.use(errorHandler);

module.exports = app;
