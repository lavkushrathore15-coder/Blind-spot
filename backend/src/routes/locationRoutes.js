const express = require('express');
const { query } = require('express-validator');
const LocationController = require('../controllers/locationController');
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
 * @route GET /api/location/emergency
 * @desc Retrieve actual hospitals, pharmacies and police stations via SerpApi Google Maps
 */
router.get(
  '/emergency',
  validate(destinationValidation),
  LocationController.getEmergencyLocations
);

/**
 * @route GET /api/location/hospitals
 * @desc Retrieve actual hospitals for destination
 */
router.get(
  '/hospitals',
  validate(destinationValidation),
  LocationController.getHospitals
);

/**
 * @route GET /api/location/pharmacies
 * @desc Retrieve actual pharmacies for destination
 */
router.get(
  '/pharmacies',
  validate(destinationValidation),
  LocationController.getPharmacies
);

/**
 * @route GET /api/location/police
 * @desc Retrieve actual police stations for destination
 */
router.get(
  '/police',
  validate(destinationValidation),
  LocationController.getPoliceStations
);

/**
 * @route GET /api/location/embassies
 * @desc Retrieve actual embassies & consulates for destination
 */
router.get(
  '/embassies',
  validate(destinationValidation),
  LocationController.getEmbassies
);

/**
 * @route GET /api/location/transit
 * @desc Retrieve actual transit hubs for destination
 */
router.get(
  '/transit',
  validate(destinationValidation),
  LocationController.getTransitHubs
);

module.exports = router;
