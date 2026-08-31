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
  const shutdown = () => {
    console.log('\n[Server] Shutting down gracefully...');
    server.close(() => {
      console.log('[Server] HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

startServer();
