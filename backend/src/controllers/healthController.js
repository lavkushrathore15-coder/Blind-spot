const HealthService = require('../services/healthService');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

class HealthController {
  /**
   * GET /api/health
   * Main health check endpoint
   */
  static getHealth(req, res, next) {
    try {
      const healthData = HealthService.getHealthData();
      return res.status(200).json(
        ApiResponse.success(healthData, 'BlindSpot API is operating normally')
      );
    } catch (error) {
      return next(ApiError.internal('Unable to retrieve health status'));
    }
  }

  /**
   * POST /api/echo-validate
   * Demonstration endpoint for input validation & error handling
   */
  static echoValidate(req, res, next) {
    try {
      const { title, threshold, tags } = req.body;
      return res.status(200).json(
        ApiResponse.success(
          { title, threshold, tags, processedAt: new Date().toISOString() },
          'Validation passed successfully'
        )
      );
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = HealthController;
