const config = require('../config/env');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // Log server errors for backend debugging
  if (statusCode >= 500) {
    console.error('[SERVER ERROR]', {
      method: req.method,
      path: req.originalUrl,
      error: err.message,
      stack: err.stack,
    });
  }

  res.status(statusCode).json({
    success: false,
    status: err.status || 'error',
    statusCode,
    message,
    errors,
    timestamp: new Date().toISOString(),
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
