const ApiError = require('../utils/apiError');

const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound(`Cannot ${req.method} ${req.originalUrl} - Route not found`));
};

module.exports = notFoundHandler;
