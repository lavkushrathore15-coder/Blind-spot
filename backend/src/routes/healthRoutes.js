const express = require('express');
const { body } = require('express-validator');
const HealthController = require('../controllers/healthController');
const validate = require('../middleware/validate');

const router = express.Router();

/**
 * @route GET /api/health
 * @desc Get application health status and diagnostics
 */
router.get('/', HealthController.getHealth);

/**
 * @route POST /api/health/validate-test
 * @desc Test endpoint for centralized input validation
 */
router.post(
  '/validate-test',
  validate([
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ min: 3, max: 100 })
      .withMessage('Title must be between 3 and 100 characters'),
    body('threshold')
      .notEmpty()
      .withMessage('Threshold is required')
      .isFloat({ min: 0, max: 1 })
      .withMessage('Threshold must be a decimal between 0.0 and 1.0'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array of strings'),
  ]),
  HealthController.echoValidate
);

module.exports = router;
