import apiClient from './apiClient';

const OPENWEATHER_DIRECT_URL = 'https://api.openweathermap.org/data/2.5/weather';

export const weatherService = {
  /**
   * Fetch live weather telemetry for a destination
   * @param {string} destination - Destination name (e.g., "Ooty" or "Ooty, Tamilnadu")
   * @param {object} [coords] - Coordinates { lat, lng }
   */
  async getDestinationWeather(destination, coords = null) {
    const rawDest = (destination || '').trim();
    const city = rawDest.split(',')[0].trim();

    try {
      // 1. Primary: fetch via backend proxy (keeps API key secure on server)
      const res = await apiClient.get('/weather', {
        params: {
          destination: city || rawDest,
          lat: coords?.lat,
          lng: coords?.lng,
        },
      });

      if (res?.data) {
        return res.data;
      }
    } catch (backendErr) {
      console.warn('[weatherService] Backend weather endpoint error, checking direct fallback:', backendErr);
    }

    // 2. Fallback: direct OpenWeatherMap API call if frontend key is available
    const directKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    if (directKey && directKey !== 'your_openweather_api_key_here') {
      try {
        let url;
        if (coords && coords.lat != null && coords.lng != null && !isNaN(coords.lat)) {
          url = `${OPENWEATHER_DIRECT_URL}?lat=${coords.lat}&lon=${coords.lng}&appid=${directKey}&units=metric`;
        } else {
          url = `${OPENWEATHER_DIRECT_URL}?q=${encodeURIComponent(city || rawDest)}&appid=${directKey}&units=metric`;
        }

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const temp = Math.round(data.main?.temp ?? 20);
          const feelsLike = Math.round(data.main?.feels_like ?? temp);
          const condition = data.weather?.[0]?.main || 'Clear';
          const description = data.weather?.[0]?.description
            ? data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1)
            : 'Clear skies';
          const humidity = data.main?.humidity ?? 50;
          const windSpeed = data.wind?.speed ?? 0;
          const grndLevel = data.main?.grnd_level;

          let altitude = 'Regional elevation (Standard sea level to moderate hills).';
          if (grndLevel && grndLevel < 900) {
            altitude = 'High-altitude mountain zone — cool mountain air; mild altitude acclimation recommended.';
          } else if (rawDest.toLowerCase().includes('ooty')) {
            altitude = 'High-altitude mountain zone (~2,240m / 7,350 ft) — cool mountain air; mild altitude acclimation recommended on Days 1-2.';
          }

          const weatherSummary = `${temp}°C (${description}, feels like ${feelsLike}°C). Humidity ${humidity}%, Wind ${windSpeed} m/s.`;

          return {
            destination: data.name || rawDest,
            country: data.sys?.country,
            seasonalClimate: {
              weather: weatherSummary,
              altitude,
              airQuality: 'Live Meteorological Station Feed',
              temp,
              condition,
              humidity,
              windSpeed,
              isLive: true,
            },
          };
        }
      } catch (directErr) {
        console.warn('[weatherService] Direct OpenWeather fallback error:', directErr);
      }
    }

    return null;
  },
};

export default weatherService;
