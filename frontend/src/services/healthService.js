import apiClient from './apiClient';

export const healthService = {
  /**
   * Fetch backend health and diagnostic details
   */
  getHealth: async () => {
    return await apiClient.get('/health');
  },

  /**
   * Test input validation endpoint
   */
  testValidation: async (payload) => {
    return await apiClient.post('/health/validate-test', payload);
  },
};

export default healthService;
