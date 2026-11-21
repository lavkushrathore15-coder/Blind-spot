import apiClient from './apiClient';

export const intelligenceService = {
  /**
   * Check SerpApi backend configuration and verification status
   */
  getStatus: async () => {
    return await apiClient.get('/intelligence/status');
  },

  /**
   * 1. Destination-Specific Google Search
   */
  searchDestination: async (destination, options = {}) => {
    return await apiClient.get('/intelligence/search', {
      params: { destination, ...options },
    });
  },

  /**
   * 2. Google News Search
   */
  searchNews: async (destination, options = {}) => {
    return await apiClient.get('/intelligence/news', {
      params: { destination, ...options },
    });
  },

  /**
   * 3. Travel Advisory Discovery
   */
  searchAdvisories: async (destination, options = {}) => {
    return await apiClient.get('/intelligence/advisories', {
      params: { destination, ...options },
    });
  },

  /**
   * 4. Transport Disruption Discovery
   */
  searchTransit: async (destination, options = {}) => {
    return await apiClient.get('/intelligence/transit-disruptions', {
      params: { destination, ...options },
    });
  },

  /**
   * 5. Local Concern & Reported Scam Discovery
   */
  searchScams: async (destination, options = {}) => {
    return await apiClient.get('/intelligence/scams', {
      params: { destination, ...options },
    });
  },

  /**
   * Multi-Stream Aggregated Live Intelligence Feed
   */
  getLiveFeed: async (destination, options = {}) => {
    return await apiClient.get('/intelligence/live-feed', {
      params: { destination, ...options },
    });
  },
};

export default intelligenceService;
