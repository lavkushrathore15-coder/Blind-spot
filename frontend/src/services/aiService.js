import apiClient from './apiClient';

/**
 * BlindSpot AI Engine Frontend Service
 * Communicates with backend anti-hallucination grounded AI engine
 */
export const aiService = {
  /**
   * Run AI BlindSpot analysis over destination and validated evidence
   * @param {string} destination Destination name
   * @param {object|null} evidencePackage Optional pre-compiled evidence package
   */
  analyzeDestination: async (destination, evidencePackage = null) => {
    return await apiClient.post(
      '/ai/analyze',
      { destination, evidencePackage },
      { timeout: 35000 }
    );
  },

  /**
   * Evaluate uninvestigated categories / Forgotten Checklist
   * @param {string} destination Destination name
   */
  getForgottenChecklist: async (destination) => {
    return await apiClient.get('/ai/forgotten-checklist', {
      params: { destination },
      timeout: 30000,
    });
  },

  /**
   * Strictly validate candidate AI response against an evidence set
   * @param {object} aiResponse AI response to audit
   * @param {Array} evidenceItems Array of evidence items
   */
  validateOutput: async (aiResponse, evidenceItems = []) => {
    return await apiClient.post('/ai/validate-output', {
      aiResponse,
      evidenceItems,
    });
  },

  /**
   * Calculate transparent Awareness Index measuring investigation coverage
   * @param {string} destination Destination name
   * @param {Array} evidenceItems Ingested evidence records
   * @param {Array} forgottenChecklist Forgotten checklist items
   */
  calculateAwarenessIndex: async (destination, evidenceItems = [], forgottenChecklist = []) => {
    return await apiClient.post('/ai/awareness-index', {
      destination,
      evidenceItems,
      forgottenChecklist,
    });
  },

  /**
   * Fetch 7-section personalized intelligence report
   * @param {object} params Report parameters
   */
  getPersonalizedReport: async (params) => {
    return await apiClient.post('/ai/personalized-report', params, {
      timeout: 35000,
    });
  },
};

export default aiService;
