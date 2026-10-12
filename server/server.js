require('dotenv').config();

const connectDB = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Verify required environment variables
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable is not set.');
    console.error('   Copy server/.env.example to server/.env and set your MongoDB URI.');
    process.exit(1);
  }

  // Connect to MongoDB first, then start HTTP server
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log('');
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║   CausalFunnel Analytics API                     ║');
    console.log('╠══════════════════════════════════════════════════╣');
    console.log(`║  Server:    http://localhost:${PORT}                ║`);
    console.log(`║  Health:    http://localhost:${PORT}/api/health      ║`);
    console.log(`║  Events:    POST /api/events                     ║`);
    console.log(`║  Sessions:  GET  /api/sessions                   ║`);
    console.log(`║  Heatmap:   GET  /api/heatmap?url=<url>          ║`);
    console.log(`║  Pages:     GET  /api/pages                      ║`);
    console.log(`║  Env:       ${process.env.NODE_ENV || 'development'}                        ║`);
    console.log('╚══════════════════════════════════════════════════╝');
    console.log('');
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer().catch((err) => {
  console.error('Fatal startup error:', err.message);
  process.exit(1);
});
