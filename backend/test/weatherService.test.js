const assert = require('assert');
const WeatherService = require('../src/services/weatherService');

async function runWeatherTests() {
  console.log('🧪 Starting Weather Service Test Suite...\n');

  // Test 1: getStatus returns configured when key is present
  const status = WeatherService.getStatus();
  assert.strictEqual(status.configured, true, 'WeatherService should report configured: true when key is in env');
  console.log('  ✓ Should report configured: true when OPENWEATHER_API_KEY is present');

  // Test 2: formatWeatherData handles raw OpenWeatherMap schema correctly
  const mockRawData = {
    name: 'Ooty',
    sys: { country: 'IN' },
    coord: { lat: 11.41, lon: 76.70 },
    main: {
      temp: 14.3,
      feels_like: 13.8,
      temp_min: 14.3,
      temp_max: 14.3,
      humidity: 78,
      pressure: 1016,
      grnd_level: 845,
    },
    weather: [
      { id: 500, main: 'Rain', description: 'light rain', icon: '10d' },
    ],
    wind: { speed: 0.3, deg: 77 },
  };

  const formatted = WeatherService.formatWeatherData(mockRawData, 'Ooty, India');

  assert.strictEqual(formatted.current.temp, 14);
  assert.strictEqual(formatted.current.condition, 'Rain');
  assert.strictEqual(formatted.current.humidity, 78);
  assert.strictEqual(formatted.seasonalClimate.isLive, true);
  assert(formatted.seasonalClimate.weather.includes('14°C'));
  assert(formatted.seasonalClimate.altitude.includes('High-altitude mountain zone'));
  console.log('  ✓ Should format temperature, humidity, altitude risk, and live seasonalClimate');

  // Test 3: formatWeatherData computes physiological warnings on extreme temperature
  const mockColdData = {
    name: 'Harbin',
    sys: { country: 'CN' },
    main: { temp: -12.0, feels_like: -18.0, humidity: 60, pressure: 1025 },
    weather: [{ main: 'Snow', description: 'light snow' }],
    wind: { speed: 4.5 },
  };
  const formattedCold = WeatherService.formatWeatherData(mockColdData, 'Harbin');
  assert(formattedCold.seasonalClimate.altitude.includes('Cold mountain conditions') || formattedCold.seasonalClimate.altitude.includes('thermal layers'));
  console.log('  ✓ Should generate physiological alerts for extreme freezing temperature');

  console.log('\n========================================');
  console.log('🏁 Weather Service Tests Passed Successfully');
  console.log('========================================\n');
}

runWeatherTests().catch((err) => {
  console.error('❌ Weather test failed:', err);
  process.exit(1);
});
