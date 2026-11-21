const express = require('express');
const { body, query } = require('express-validator');
const AiController = require('../controllers/aiController');
const validate = require('../middleware/validate');

const router = express.Router();

/**
 * @route POST /api/ai/analyze
 * @desc Execute AI BlindSpot Analysis over validated evidence
 */
router.post(
  '/analyze',
  validate([
    body('destination')
      .trim()
      .notEmpty()
      .withMessage('Destination is required')
      .isLength({ min: 2, max: 120 })
      .withMessage('Destination must be between 2 and 120 characters'),
  ]),
  AiController.analyzeDestination
);

/**
 * @route GET /api/ai/forgotten-checklist
 * @desc Retrieve the Forgotten Checklist identifying inadequately checked categories
 */
router.get(
  '/forgotten-checklist',
  validate([
    query('destination')
      .trim()
      .notEmpty()
      .withMessage('Destination query parameter is required')
      .isLength({ min: 2, max: 120 })
      .withMessage('Destination must be between 2 and 120 characters'),
  ]),
  AiController.getForgottenChecklist
);

/**
 * @route POST /api/ai/validate-output
 * @desc Test and validate any candidate AI output against evidence ground truth
 */
router.post('/validate-output', AiController.validateOutput);

/**
 * @route POST /api/ai/awareness-index
 * @desc Calculate the reproducible Awareness Index measuring investigation coverage
 */
router.post(
  '/awareness-index',
  validate([
    body('destination')
      .trim()
      .notEmpty()
      .withMessage('Destination is required')
      .isLength({ min: 2, max: 120 })
      .withMessage('Destination must be between 2 and 120 characters'),
  ]),
  AiController.calculateAwarenessIndex
);

/**
 * @route POST /api/ai/personalized-report
 * @desc Generate the 7-section personalized intelligence report
 */
router.post(
  '/personalized-report',
  validate([
    body('destination')
      .trim()
      .notEmpty()
      .withMessage('Destination is required')
      .isLength({ min: 2, max: 120 })
      .withMessage('Destination must be between 2 and 120 characters'),
  ]),
  AiController.getPersonalizedReport
);

module.exports = router;
