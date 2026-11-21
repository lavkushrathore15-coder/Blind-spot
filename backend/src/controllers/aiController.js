const AiEngineService = require('../services/aiEngineService');
const AiValidator = require('../services/aiValidator');
const AwarenessIndexService = require('../services/awarenessIndexService');
const ReportPersonalizationService = require('../services/reportPersonalizationService');
const SerpApiService = require('../services/serpApiService');
const LocationService = require('../services/locationService');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

class AiController {
  /**
   * POST /api/ai/analyze
   * Executes AI BlindSpot analysis over validated evidence
   */
  static async analyzeDestination(req, res, next) {
    try {
      const destination = req.body.destination || req.query.destination;
      if (!destination || destination.trim() === '') {
        throw ApiError.badRequest('Destination is required for AI analysis.');
      }

      let evidencePackage = req.body.evidencePackage;

      // If no pre-compiled evidence package is supplied, ingest live streams automatically
      if (!evidencePackage || !Array.isArray(evidencePackage.evidenceItems)) {
        let liveFeed = null;
        let locationData = null;

        try {
          // Parallel fetch of SerpApi intelligence and Google Maps locations
          const [feedResult, locResult] = await Promise.allSettled([
            SerpApiService.getAggregatedLiveIntelligence(destination.trim()),
            LocationService.getEmergencyLocations(destination.trim()),
          ]);

          if (feedResult.status === 'fulfilled') liveFeed = feedResult.value;
          if (locResult.status === 'fulfilled') locationData = locResult.value;
        } catch (fetchErr) {
          console.warn('Live ingestion partial fallback:', fetchErr.message);
        }

        evidencePackage = AiEngineService.buildEvidencePackage(destination.trim(), liveFeed, locationData);
      } else {
        // Re-hydrate Map if evidenceItems were passed in request body
        const map = new Map();
        evidencePackage.evidenceItems.forEach((item) => map.set(item.id, item));
        evidencePackage.evidenceMap = map;
      }

      const analysisResult = await AiEngineService.runAnalysis(destination.trim(), evidencePackage);

      return res.status(200).json(
        ApiResponse.success(
          {
            ...analysisResult.sanitizedOutput,
            evidenceCatalog: evidencePackage.evidenceItems,
            totalEvidenceIngested: evidencePackage.totalEvidenceCount,
          },
          `AI BlindSpot intelligence analysis completed for ${destination}`
        )
      );
    } catch (err) {
      return next(err);
    }
  }

  /**
   * GET /api/ai/forgotten-checklist?destination=Bogota
   * Evaluates categories that lack sufficient or verified evidence
   */
  static async getForgottenChecklist(req, res, next) {
    try {
      const destination = req.query.destination;
      if (!destination || destination.trim() === '') {
        throw ApiError.badRequest('Destination query parameter is required.');
      }

      let liveFeed = null;
      let locationData = null;

      try {
        const [feedResult, locResult] = await Promise.allSettled([
          SerpApiService.getAggregatedLiveIntelligence(destination.trim()),
          LocationService.getEmergencyLocations(destination.trim()),
        ]);
        if (feedResult.status === 'fulfilled') liveFeed = feedResult.value;
        if (locResult.status === 'fulfilled') locationData = locResult.value;
      } catch (e) {
        // Continue with empty package
      }

      const evidencePackage = AiEngineService.buildEvidencePackage(destination.trim(), liveFeed, locationData);
      const analysisResult = await AiEngineService.runAnalysis(destination.trim(), evidencePackage);

      return res.status(200).json(
        ApiResponse.success(
          {
            destination,
            forgottenChecklist: analysisResult.sanitizedOutput.forgottenChecklist,
            totalEvidenceCount: evidencePackage.totalEvidenceCount,
          },
          `Forgotten checklist generated for ${destination}`
        )
      );
    } catch (err) {
      return next(err);
    }
  }

  /**
   * POST /api/ai/validate-output
   * Endpoint for testing and validating any candidate AI response against an evidence package
   */
  static validateOutput(req, res, next) {
    try {
      const { aiResponse, evidenceItems } = req.body;

      if (!aiResponse) {
        throw ApiError.badRequest('aiResponse object is required.');
      }

      const evidenceMap = new Map();
      if (Array.isArray(evidenceItems)) {
        evidenceItems.forEach((e) => evidenceMap.set(e.id, e));
      }

      const validation = AiValidator.validate(aiResponse, evidenceMap);

      return res.status(200).json(
        ApiResponse.success(
          validation,
          validation.isValid
            ? 'AI output strictly validated against evidence schema'
            : 'AI output failed schema or anti-hallucination validation'
        )
      );
    } catch (err) {
      return next(err);
    }
  }

  /**
   * POST /api/ai/awareness-index
   * Calculates the transparent Awareness Index measuring investigation coverage
   */
  static calculateAwarenessIndex(req, res, next) {
    try {
      const { destination, evidenceItems, forgottenChecklist } = req.body;
      if (!destination || destination.trim() === '') {
        throw ApiError.badRequest('Destination is required.');
      }

      const result = AwarenessIndexService.calculateIndex({
        destination: destination.trim(),
        evidenceItems: Array.isArray(evidenceItems) ? evidenceItems : [],
        forgottenChecklist: Array.isArray(forgottenChecklist) ? forgottenChecklist : [],
      });

      return res.status(200).json(
        ApiResponse.success(
          result,
          `Awareness Index calculated: ${result.overall}/100 (${result.tier})`
        )
      );
    } catch (err) {
      return next(err);
    }
  }

  /**
   * POST /api/ai/personalized-report
   * Compiles the 7-section personalized intelligence report
   */
  static async getPersonalizedReport(req, res, next) {
    try {
      const {
        destination,
        travellerType = 'Solo Traveller',
        travelDates,
        evidencePackage: customEvidence,
        facilities: customFacilities,
      } = req.body;

      if (!destination || destination.trim() === '') {
        throw ApiError.badRequest('Destination is required.');
      }

      let evidencePackage = customEvidence;
      let facilities = Array.isArray(customFacilities) ? customFacilities : [];

      // If no pre-compiled evidence is supplied, ingest live streams
      if (!evidencePackage || !Array.isArray(evidencePackage.evidenceItems)) {
        let liveFeed = null;
        let locationData = null;

        try {
          const [feedResult, locResult] = await Promise.allSettled([
            SerpApiService.getAggregatedLiveIntelligence(destination.trim()),
            LocationService.getEmergencyLocations(destination.trim()),
          ]);
          if (feedResult.status === 'fulfilled') liveFeed = feedResult.value;
          if (locResult.status === 'fulfilled') {
            locationData = locResult.value;
            facilities = locationData.places || [];
          }
        } catch (fetchErr) {
          console.warn('Live ingestion partial fallback:', fetchErr.message);
        }

        evidencePackage = AiEngineService.buildEvidencePackage(
          destination.trim(),
          liveFeed,
          locationData
        );
      } else {
        const map = new Map();
        evidencePackage.evidenceItems.forEach((item) => map.set(item.id, item));
        evidencePackage.evidenceMap = map;
      }

      // Execute grounded analysis to get findings and forgotten checklist
      const analysisResult = await AiEngineService.runAnalysis(
        destination.trim(),
        evidencePackage
      );

      const findings = analysisResult.sanitizedOutput.findings || [];
      const forgottenChecklist = analysisResult.sanitizedOutput.forgottenChecklist || [];
      const evidenceItems = evidencePackage.evidenceItems || [];

      // Generate the 7-section personalized report
      const report = ReportPersonalizationService.generateReport({
        destination: destination.trim(),
        travellerType,
        travelDates: travelDates || { start: '2026-12-01', end: '2026-12-10', days: 9 },
        findings,
        evidenceItems,
        facilities,
        forgottenChecklist,
      });

      return res.status(200).json(
        ApiResponse.success(
          report,
          `Personalized intelligence report compiled for ${destination} (${report.travellerType})`
        )
      );
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = AiController;
