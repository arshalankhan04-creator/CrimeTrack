const app = require('./app');
const config = require('./config/environment');
const { connectDatabase } = require('./config/database');
const { seedInitialUsers } = require('./utils/seedAdmin');

const startServer = async () => {
  console.log('====================================================');
  console.log('    CrimeTrack — Police Case Management System    ');
  console.log('====================================================');
  console.log(`[Server] Initializing in ${config.nodeEnv} mode...`);

  // Start HTTP Listener
  const server = app.listen(config.port, () => {
    console.log(`[Server] CrimeTrack API running on: http://localhost:${config.port}`);
    console.log(`[Server] Health Endpoint: http://localhost:${config.port}/api/health`);
    console.log('====================================================');
  });

  // Connect to MongoDB and seed initial accounts
  connectDatabase()
    .then(async () => {
      await seedInitialUsers();
    })
    .catch((err) => {
      console.warn(`[Database] Initial MongoDB connection attempt: ${err.message}`);
    });

  // Handle process termination gracefully
  const shutdown = async () => {
    console.log('\n[Server] Shutting down gracefully...');
    server.close(async () => {
      console.log('[Server] HTTP server closed.');
      try {
        const mongoose = require('mongoose');
        await mongoose.connection.close(false);
        console.log('[Database] MongoDB connection closed safely.');
      } catch (e) {
        console.warn('[Database] Error closing MongoDB connection:', e.message);
      }
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  process.on('unhandledRejection', (reason, promise) => {
    console.error('[Server Guard] Unhandled Rejection at:', promise, 'reason:', reason);
  });

  process.on('uncaughtException', (err) => {
    console.error('[Server Guard] Uncaught Exception:', err);
  });
};

startServer();
