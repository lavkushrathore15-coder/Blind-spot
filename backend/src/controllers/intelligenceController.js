const SerpApiService = require('../services/serpApiService');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

class IntelligenceController {
  /**
   * GET /api/intelligence/status
   * Reports SerpApi configuration status and capabilities
   */
  static getStatus(req, res, next) {
    try {
      const status = SerpApiService.getStatus();
      return res.status(200).json(
        ApiResponse.success(status, 'SerpApi integration status retrieved')
      );
    } catch (err) {
      return next(err);
    }
  }

  /**
   * GET /api/intelligence/search?destination=Bogota
   * 1. Destination-Specific Google Search
   */
  static async searchDestination(req, res, next) {
    try {
      const destination = req.query.destination;
      if (!destination || destination.trim() === '') {
        throw ApiError.badRequest('Destination query parameter is required.');
      }

      const results = await SerpApiService.searchDestination(destination.trim(), {
        hl: req.query.hl,
        gl: req.query.gl,
        num: parseInt(req.query.num, 10) || 10,
        query: req.query.q,
      });

      return res.status(200).json(
        ApiResponse.success(results, `Destination search completed for ${destination}`)
      );
    } catch (err) {
      return next(err);
    }
  }

  /**
   * GET /api/intelligence/news?destination=Bogota
   * 2. Google News Search
   */
  static async searchNews(req, res, next) {
    try {
      const destination = req.query.destination;
      if (!destination || destination.trim() === '') {
        throw ApiError.badRequest('Destination query parameter is required.');
      }

      const results = await SerpApiService.searchNews(destination.trim(), {
        hl: req.query.hl,
        gl: req.query.gl,
        query: req.query.q,
      });

      return res.status(200).json(
        ApiResponse.success(results, `Google News search completed for ${destination}`)
      );
    } catch (err) {
      return next(err);
    }
  }

  /**
   * GET /api/intelligence/advisories?destination=Bogota
   * 3. Travel Advisory Discovery
   */
  static async searchAdvisories(req, res, next) {
    try {
      const destination = req.query.destination;
      if (!destination || destination.trim() === '') {
        throw ApiError.badRequest('Destination query parameter is required.');
      }

      const results = await SerpApiService.searchTravelAdvisories(destination.trim(), {
        hl: req.query.hl,
        gl: req.query.gl,
        query: req.query.q,
      });

      return res.status(200).json(
        ApiResponse.success(results, `Travel advisory discovery completed for ${destination}`)
      );
    } catch (err) {
      return next(err);
    }
  }

  /**
   * GET /api/intelligence/transit-disruptions?destination=Bogota
   * 4. Transport Disruption Discovery
   */
  static async searchTransit(req, res, next) {
    try {
      const destination = req.query.destination;
      if (!destination || destination.trim() === '') {
        throw ApiError.badRequest('Destination query parameter is required.');
      }

      const results = await SerpApiService.searchTransportDisruptions(destination.trim(), {
        hl: req.query.hl,
        gl: req.query.gl,
        query: req.query.q,
      });

      return res.status(200).json(
        ApiResponse.success(results, `Transport disruption discovery completed for ${destination}`)
      );
    } catch (err) {
      return next(err);
    }
  }

  /**
   * GET /api/intelligence/scams?destination=Bogota
   * 5. Local Concern and Reported Scam Discovery
   */
  static async searchScams(req, res, next) {
    try {
      const destination = req.query.destination;
      if (!destination || destination.trim() === '') {
        throw ApiError.badRequest('Destination query parameter is required.');
      }

      const results = await SerpApiService.searchScamsAndConcerns(destination.trim(), {
        hl: req.query.hl,
        gl: req.query.gl,
        query: req.query.q,
      });

      return res.status(200).json(
        ApiResponse.success(results, `Scam and local hazard discovery completed for ${destination}`)
      );
    } catch (err) {
      return next(err);
    }
  }

  /**
   * GET /api/intelligence/live-feed?destination=Bogota
   * Multi-Stream Aggregated Intelligence Telemetry
   */
  static async getAggregatedFeed(req, res, next) {
    try {
      const destination = req.query.destination;
      if (!destination || destination.trim() === '') {
        throw ApiError.badRequest('Destination query parameter is required.');
      }

      const results = await SerpApiService.getAggregatedLiveIntelligence(destination.trim(), {
        hl: req.query.hl,
        gl: req.query.gl,
      });

      return res.status(200).json(
        ApiResponse.success(results, `Live multi-stream intelligence compiled for ${destination}`)
      );
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = IntelligenceController;
