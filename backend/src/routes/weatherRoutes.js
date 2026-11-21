const express = require('express');
const WeatherController = require('../controllers/weatherController');

const router = express.Router();

/**
 * GET /api/weather - Live current weather and physiological factors
 */
router.get('/', WeatherController.getWeather);

/**
 * GET /api/weather/status - OpenWeatherMap API key verification status
 */
router.get('/status', WeatherController.getStatus);

module.exports = router;
