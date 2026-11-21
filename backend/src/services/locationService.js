const crypto = require('crypto');
const config = require('../config/env');
const ApiError = require('../utils/apiError');

const SERPAPI_URL = 'https://serpapi.com/search.json';
const REQUEST_TIMEOUT_MS = 12000;

class LocationService {
  /**
   * Helper to execute Google Maps search query via SerpApi with direct Google Maps Places fallback
   */
  static async queryGoogleMaps(searchQuery) {
    const serpKey = config.apiKeys.serpApiKey;
    const gmapsKey = config.apiKeys.googleMapsApiKey;

    // 1. Try SerpApi Google Maps Engine
    if (serpKey && serpKey.trim() !== '' && serpKey !== 'your_serpapi_key_here') {
      try {
        const queryParams = new URLSearchParams({
          engine: 'google_maps',
          q: searchQuery,
          hl: 'en',
          api_key: serpKey,
        });

        const fullUrl = `${SERPAPI_URL}?${queryParams.toString()}`;
        const response = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'BlindSpot-Intelligence/2.0',
          },
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.local_results) {
            return data.local_results;
          }
        }
      } catch (err) {
        console.warn('[LocationService] SerpApi Google Maps query error:', err.message);
      }
    }

    // 2. Direct Google Maps Places API Fallback
    if (gmapsKey && gmapsKey.trim() !== '') {
      try {
        const placesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
          searchQuery
        )}&key=${gmapsKey}`;

        const response = await fetch(placesUrl, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.results && Array.isArray(data.results)) {
            return data.results.map((r) => ({
              place_id: r.place_id,
              title: r.name,
              address: r.formatted_address,
              rating: r.rating,
              reviews: r.user_ratings_total,
              open_state: r.opening_hours?.open_now ? 'Open now' : null,
              gps_coordinates: r.geometry?.location
                ? { latitude: r.geometry.location.lat, longitude: r.geometry.location.lng }
                : null,
            }));
          }
        }
      } catch (err) {
        console.warn('[LocationService] Direct Google Maps Places query error:', err.message);
      }
    }

    return [];
  }

  /**
   * Validate geographical coordinates
   */
  static validateCoordinates(gps) {
    if (!gps || typeof gps !== 'object') return null;

    const lat = typeof gps.latitude === 'number' ? gps.latitude : parseFloat(gps.latitude);
    const lng = typeof gps.longitude === 'number' ? gps.longitude : parseFloat(gps.longitude);

    if (
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    ) {
      return { lat, lng };
    }

    return null;
  }

  /**
   * Normalize a place item strictly using provider data without inventing missing fields
   */
  static normalizePlace(raw, category) {
    const coords = LocationService.validateCoordinates(raw.gps_coordinates);

    // Compute stable ID
    const rawId = raw.place_id || raw.data_id || raw.data_cid || '';
    const hash = crypto
      .createHash('sha256')
      .update(`${rawId}-${raw.title || ''}-${raw.address || ''}`)
      .digest('hex')
      .substring(0, 16);

    return {
      id: raw.place_id ? `place-${raw.place_id}` : `loc-${hash}`,
      title: raw.title ? raw.title.trim() : 'Unnamed Facility',
      category, // 'hospital' | 'pharmacy' | 'police'
      // Only include fields when actually returned by provider
      address: raw.address && raw.address.trim() ? raw.address.trim() : null,
      phone: raw.phone && raw.phone.trim() ? raw.phone.trim() : null,
      rating: typeof raw.rating === 'number' ? raw.rating : null,
      reviews: typeof raw.reviews === 'number' ? raw.reviews : null,
      openState: raw.open_state && raw.open_state.trim() ? raw.open_state.trim() : null,
      website: raw.website ? raw.website.trim() : null,
      thumbnail: raw.thumbnail || null,
      types: Array.isArray(raw.types) ? raw.types : [],
      coordinates: coords,
      hasValidCoordinates: Boolean(coords),
      retrievedAt: new Date().toISOString(),
    };
  }

  /**
   * Deduplicate places by ID and title/address
   */
  static deduplicatePlaces(places) {
    const seenIds = new Set();
    const seenNames = new Set();
    const result = [];

    for (const place of places) {
      const normKey = `${place.title.toLowerCase()}-${(place.address || '').toLowerCase()}`;
      if (seenIds.has(place.id) || seenNames.has(normKey)) {
        continue;
      }
      seenIds.add(place.id);
      seenNames.add(normKey);
      result.push(place);
    }

    return result;
  }

  /**
   * 1. Search Hospitals
   */
  static async searchHospitals(destination) {
    const query = `hospitals in ${destination}`;
    const rawList = await LocationService.queryGoogleMaps(query);
    const normalized = rawList.map((r) => LocationService.normalizePlace(r, 'hospital'));
    return LocationService.deduplicatePlaces(normalized);
  }

  /**
   * 2. Search Pharmacies
   */
  static async searchPharmacies(destination) {
    const query = `pharmacies in ${destination}`;
    const rawList = await LocationService.queryGoogleMaps(query);
    const normalized = rawList.map((r) => LocationService.normalizePlace(r, 'pharmacy'));
    return LocationService.deduplicatePlaces(normalized);
  }

  /**
   * 3. Search Police Stations
   */
  static async searchPoliceStations(destination) {
    const query = `police stations in ${destination}`;
    const rawList = await LocationService.queryGoogleMaps(query);
    const normalized = rawList.map((r) => LocationService.normalizePlace(r, 'police'));
    return LocationService.deduplicatePlaces(normalized);
  }

  /**
   * 4. Search Embassies & Consular Missions
   */
  static async searchEmbassies(destination) {
    const query = `embassy in ${destination}`;
    const rawList = await LocationService.queryGoogleMaps(query);
    const normalized = rawList.map((r) => LocationService.normalizePlace(r, 'embassy'));
    return LocationService.deduplicatePlaces(normalized);
  }

  /**
   * 5. Search Transit Hubs
   */
  static async searchTransitHubs(destination) {
    const query = `transit station in ${destination}`;
    const rawList = await LocationService.queryGoogleMaps(query);
    const normalized = rawList.map((r) => LocationService.normalizePlace(r, 'transit'));
    return LocationService.deduplicatePlaces(normalized);
  }

  /**
   * Geocode destination center coordinates using Google Maps
   */
  static async geocodeDestination(destination) {
    // 1. Try direct Google Geocoding API if key configured
    if (config.apiKeys.googleMapsApiKey) {
      try {
        const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          destination
        )}&key=${config.apiKeys.googleMapsApiKey}`;
        const res = await fetch(geoUrl, { signal: AbortSignal.timeout(5000) });
        if (res.ok) {
          const data = await res.json();
          if (data.results && data.results[0]?.geometry?.location) {
            const loc = data.results[0].geometry.location;
            const valid = LocationService.validateCoordinates({ latitude: loc.lat, longitude: loc.lng });
            if (valid) return valid;
          }
        }
      } catch (e) {
        // Fallback to queryGoogleMaps
      }
    }

    // 2. Try queryGoogleMaps
    try {
      const rawList = await LocationService.queryGoogleMaps(destination);
      if (rawList && rawList.length > 0) {
        for (const item of rawList) {
          const coords = LocationService.validateCoordinates(item.gps_coordinates);
          if (coords) return coords;
        }
      }
    } catch (err) {
      // Non-fatal geocode attempt
    }
    return null;
  }

  /**
   * Complete Location Intelligence Pipeline
   * Queries Hospitals, Pharmacies, Police, Embassies and Transit in parallel
   */
  static async getEmergencyLocations(destination) {
    const [hospitalsRes, pharmaciesRes, policeRes, embassiesRes, transitRes, geoRes] = await Promise.allSettled([
      LocationService.searchHospitals(destination),
      LocationService.searchPharmacies(destination),
      LocationService.searchPoliceStations(destination),
      LocationService.searchEmbassies(destination),
      LocationService.searchTransitHubs(destination),
      LocationService.geocodeDestination(destination),
    ]);

    const hospitals = hospitalsRes.status === 'fulfilled' ? hospitalsRes.value : [];
    const pharmacies = pharmaciesRes.status === 'fulfilled' ? pharmaciesRes.value : [];
    const police = policeRes.status === 'fulfilled' ? policeRes.value : [];
    const embassies = embassiesRes.status === 'fulfilled' ? embassiesRes.value : [];
    const transit = transitRes.status === 'fulfilled' ? transitRes.value : [];
    const centerCoordinates = geoRes.status === 'fulfilled' ? geoRes.value : null;

    const allPlaces = LocationService.deduplicatePlaces([
      ...hospitals,
      ...pharmacies,
      ...police,
      ...embassies,
      ...transit,
    ]);

    return {
      destination,
      centerCoordinates,
      retrievedAt: new Date().toISOString(),
      disclaimer: 'Retrieved facilities reflect actual public Google Maps listings via SerpApi and do not represent every emergency facility in the destination. Verify local emergency dispatch numbers during crises.',
      summary: {
        totalPlaces: allPlaces.length,
        hospitalsCount: hospitals.length,
        pharmaciesCount: pharmacies.length,
        policeCount: police.length,
        embassiesCount: embassies.length,
        transitCount: transit.length,
        placesWithCoordinates: allPlaces.filter((p) => p.hasValidCoordinates).length,
        placesWithPhone: allPlaces.filter((p) => p.phone !== null).length,
      },
      categories: {
        hospitals,
        pharmacies,
        police,
        embassies,
        transit,
      },
      places: allPlaces,
    };
  }
}

module.exports = LocationService;
