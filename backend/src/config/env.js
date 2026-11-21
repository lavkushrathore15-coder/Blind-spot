const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  // API Keys securely kept on the backend
  apiKeys: {
    blindspotKey: process.env.BLINDSPOT_API_KEY || 'default_dev_key',
    thirdPartyKey: process.env.THIRD_PARTY_API_KEY || 'default_third_party_key',
    serpApiKey: process.env.SERPAPI_API_KEY || '',
    geminiApiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '',
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',
    openWeatherApiKey: process.env.OPENWEATHER_API_KEY || '',
  },
  isSerpApiConfigured: Boolean(process.env.SERPAPI_API_KEY && process.env.SERPAPI_API_KEY.trim().length > 0),
  isGoogleMapsConfigured: Boolean(process.env.GOOGLE_MAPS_API_KEY && process.env.GOOGLE_MAPS_API_KEY.trim().length > 0),
  isOpenWeatherConfigured: Boolean(process.env.OPENWEATHER_API_KEY && process.env.OPENWEATHER_API_KEY.trim().length > 0),
  isGeminiConfigured: Boolean(
    (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0) ||
    (process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY.trim().length > 0)
  ),
};

// Validate critical configuration
if (config.isProduction && !process.env.BLINDSPOT_API_KEY) {
  console.warn('WARNING: BLINDSPOT_API_KEY is not defined in production!');
}

module.exports = config;
