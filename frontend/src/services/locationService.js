import apiClient from './apiClient';

export const locationService = {
  /**
   * Retrieve actual emergency facilities (hospitals, pharmacies, police) via SerpApi Google Maps
   */
  getEmergencyLocations: async (destination, type = 'all') => {
    return await apiClient.get('/location/emergency', {
      params: { destination, type },
    });
  },

  /**
   * Retrieve hospitals
   */
  getHospitals: async (destination) => {
    return await apiClient.get('/location/hospitals', {
      params: { destination },
    });
  },

  /**
   * Retrieve pharmacies
   */
  getPharmacies: async (destination) => {
    return await apiClient.get('/location/pharmacies', {
      params: { destination },
    });
  },

  /**
   * Retrieve police stations
   */
  getPoliceStations: async (destination) => {
    return await apiClient.get('/location/police', {
      params: { destination },
    });
  },

  /**
   * Retrieve embassies & consulates
   */
  getEmbassies: async (destination) => {
    return await apiClient.get('/location/embassies', {
      params: { destination },
    });
  },

  /**
   * Retrieve transit hubs
   */
  getTransitHubs: async (destination) => {
    return await apiClient.get('/location/transit', {
      params: { destination },
    });
  },
};

export default locationService;
