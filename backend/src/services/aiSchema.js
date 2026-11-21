/**
 * Strict JSON schema and category definitions for BlindSpot AI Engine
 */

const ANALYSIS_CATEGORIES = [
  'travel_advisories',
  'transport_disruptions',
  'weather_concerns',
  'local_scams',
  'emergency_facilities',
  'other_considerations',
];

const CATEGORY_DISPLAY_NAMES = {
  travel_advisories: 'Official Travel Advisories',
  transport_disruptions: 'Transport & Transit Disruptions',
  weather_concerns: 'Weather & Climate Risks',
  local_scams: 'Local Concerns & Reported Scams',
  emergency_facilities: 'Emergency Facility Availability',
  other_considerations: 'Overlooked Cultural & Legal Considerations',
};

const CLAIM_TYPES = ['confirmed_fact', 'reported_event', 'unverified_claim'];
const SEVERITIES = ['critical', 'high', 'moderate', 'low'];
const CHECKLIST_STATUSES = ['adequately_checked', 'insufficient_evidence', 'uninvestigated'];
const SOURCE_TYPES = ['official', 'media', 'unverified'];

module.exports = {
  ANALYSIS_CATEGORIES,
  CATEGORY_DISPLAY_NAMES,
  CLAIM_TYPES,
  SEVERITIES,
  CHECKLIST_STATUSES,
  SOURCE_TYPES,
};
