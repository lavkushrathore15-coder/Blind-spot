const app = require('./app');
const config = require('./config/env');

const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(config.port, HOST, () => {
  console.log(`====================================================`);
  console.log(`🚀 BlindSpot Backend Service is running!`);
  console.log(`🌐 Host: ${HOST} | Port: ${config.port}`);
  console.log(`⚙️  Environment: ${config.nodeEnv}`);
  console.log(`📡 Health Check: http://${HOST}:${config.port}/api/health`);
  console.log(`🔒 Allowed Client: ${config.clientUrl}`);
  console.log(`====================================================`);
});

// Graceful shutdown handling
const shutdown = (signal) => {
  console.log(`\nReceived ${signal}. Gracefully shutting down HTTP server...`);
  server.close(() => {
    console.log('HTTP server closed. Exiting process.');
    process.exit(0);
  });

  // Force close after 5 seconds if hanging
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 5000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = server;
