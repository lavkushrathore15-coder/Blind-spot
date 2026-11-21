const WeatherService = require('../services/weatherService');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

class WeatherController {
  /**
   * GET /api/weather?destination=Ooty&lat=11.41&lng=76.70
   */
  static async getWeather(req, res, next) {
    try {
      const destination = req.query.destination;
      const lat = req.query.lat ? parseFloat(req.query.lat) : null;
      const lng = req.query.lng ? parseFloat(req.query.lng) : null;

      if (!destination && (lat == null || lng == null)) {
        throw ApiError.badRequest('Destination query parameter or lat/lng coordinates required.');
      }

      const coords = lat != null && lng != null ? { lat, lng } : null;
      const data = await WeatherService.getWeather(destination, coords);

      return res.status(200).json(
        ApiResponse.success(data, `Retrieved live weather telemetry for ${destination || 'coordinates'}`)
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/weather/status
   */
  static getStatus(req, res, next) {
    try {
      const status = WeatherService.getStatus();
      return res.status(200).json(ApiResponse.success(status, 'OpenWeatherMap integration status'));
    } catch (err) {
      next(err);
    }
  }
}

module.exports = WeatherController;
