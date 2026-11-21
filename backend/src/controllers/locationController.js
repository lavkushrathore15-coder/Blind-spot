const LocationService = require('../services/locationService');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

class LocationController {
  /**
   * GET /api/location/emergency?destination=Paris
   * Retrieves hospitals, pharmacies, and police stations with synchronized coordinates
   */
  static async getEmergencyLocations(req, res, next) {
    try {
      const destination = req.query.destination;
      if (!destination || destination.trim() === '') {
        throw ApiError.badRequest('Destination query parameter is required.');
      }

      const type = req.query.type;
      let data;

      if (type === 'hospital') {
        const places = await LocationService.searchHospitals(destination.trim());
        data = {
          destination,
          summary: { totalPlaces: places.length, category: 'hospital' },
          places,
        };
      } else if (type === 'pharmacy') {
        const places = await LocationService.searchPharmacies(destination.trim());
        data = {
          destination,
          summary: { totalPlaces: places.length, category: 'pharmacy' },
          places,
        };
      } else if (type === 'police') {
        const places = await LocationService.searchPoliceStations(destination.trim());
        data = {
          destination,
          summary: { totalPlaces: places.length, category: 'police' },
          places,
        };
      } else if (type === 'embassy') {
        const places = await LocationService.searchEmbassies(destination.trim());
        data = {
          destination,
          summary: { totalPlaces: places.length, category: 'embassy' },
          places,
        };
      } else if (type === 'transit') {
        const places = await LocationService.searchTransitHubs(destination.trim());
        data = {
          destination,
          summary: { totalPlaces: places.length, category: 'transit' },
          places,
        };
      } else {
        data = await LocationService.getEmergencyLocations(destination.trim());
      }

      return res.status(200).json(
        ApiResponse.success(data, `Retrieved actual location intelligence for ${destination}`)
      );
    } catch (err) {
      return next(err);
    }
  }

  /**
   * GET /api/location/hospitals?destination=Paris
   */
  static async getHospitals(req, res, next) {
    try {
      const destination = req.query.destination;
      if (!destination || destination.trim() === '') {
        throw ApiError.badRequest('Destination query parameter is required.');
      }
      const places = await LocationService.searchHospitals(destination.trim());
      return res.status(200).json(
        ApiResponse.success(
          { destination, total: places.length, places },
          `Retrieved actual hospitals for ${destination}`
        )
      );
    } catch (err) {
      return next(err);
    }
  }

  /**
   * GET /api/location/pharmacies?destination=Paris
   */
  static async getPharmacies(req, res, next) {
    try {
      const destination = req.query.destination;
      if (!destination || destination.trim() === '') {
        throw ApiError.badRequest('Destination query parameter is required.');
      }
      const places = await LocationService.searchPharmacies(destination.trim());
      return res.status(200).json(
        ApiResponse.success(
          { destination, total: places.length, places },
          `Retrieved actual pharmacies for ${destination}`
        )
      );
    } catch (err) {
      return next(err);
    }
  }

  /**
   * GET /api/location/police?destination=Paris
   */
  static async getPoliceStations(req, res, next) {
    try {
      const destination = req.query.destination;
      if (!destination || destination.trim() === '') {
        throw ApiError.badRequest('Destination query parameter is required.');
      }
      const places = await LocationService.searchPoliceStations(destination.trim());
      return res.status(200).json(
        ApiResponse.success(
          { destination, total: places.length, places },
          `Retrieved actual police stations for ${destination}`
        )
      );
    } catch (err) {
      return next(err);
    }
  }

  /**
   * GET /api/location/embassies?destination=Paris
   */
  static async getEmbassies(req, res, next) {
    try {
      const destination = req.query.destination;
      if (!destination || destination.trim() === '') {
        throw ApiError.badRequest('Destination query parameter is required.');
      }
      const places = await LocationService.searchEmbassies(destination.trim());
      return res.status(200).json(
        ApiResponse.success(
          { destination, total: places.length, places },
          `Retrieved actual embassies for ${destination}`
        )
      );
    } catch (err) {
      return next(err);
    }
  }

  /**
   * GET /api/location/transit?destination=Paris
   */
  static async getTransitHubs(req, res, next) {
    try {
      const destination = req.query.destination;
      if (!destination || destination.trim() === '') {
        throw ApiError.badRequest('Destination query parameter is required.');
      }
      const places = await LocationService.searchTransitHubs(destination.trim());
      return res.status(200).json(
        ApiResponse.success(
          { destination, total: places.length, places },
          `Retrieved actual transit hubs for ${destination}`
        )
      );
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = LocationController;
