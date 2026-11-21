const express = require('express');
const { query } = require('express-validator');
const IntelligenceController = require('../controllers/intelligenceController');
const validate = require('../middleware/validate');

const router = express.Router();

const destinationValidation = [
  query('destination')
    .trim()
    .notEmpty()
    .withMessage('Destination query parameter is required')
    .isLength({ min: 2, max: 120 })
    .withMessage('Destination must be between 2 and 120 characters'),
];

/**
 * @route GET /api/intelligence/status
 * @desc Get SerpApi configuration and live verification status
 */
router.get('/status', IntelligenceController.getStatus);

/**
 * @route GET /api/intelligence/search
 * @desc 1. Destination-specific Google Search
 */
router.get('/search', validate(destinationValidation), IntelligenceController.searchDestination);

/**
 * @route GET /api/intelligence/news
 * @desc 2. Google News search
 */
router.get('/news', validate(destinationValidation), IntelligenceController.searchNews);

/**
 * @route GET /api/intelligence/advisories
 * @desc 3. Travel advisory discovery
 */
router.get('/advisories', validate(destinationValidation), IntelligenceController.searchAdvisories);

/**
 * @route GET /api/intelligence/transit-disruptions
 * @desc 4. Transport disruption discovery
 */
router.get('/transit-disruptions', validate(destinationValidation), IntelligenceController.searchTransit);

/**
 * @route GET /api/intelligence/scams
 * @desc 5. Local concern and reported scam discovery
 */
router.get('/scams', validate(destinationValidation), IntelligenceController.searchScams);

/**
 * @route GET /api/intelligence/live-feed
 * @desc Multi-stream aggregated intelligence telemetry
 */
router.get('/live-feed', validate(destinationValidation), IntelligenceController.getAggregatedFeed);

module.exports = router;
