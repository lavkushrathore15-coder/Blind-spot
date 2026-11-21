import axios from 'axios';

/**
 * Centralized Axios instance configured for API communication.
 * Defaults to relative /api (proxied in Vite) or VITE_API_BASE_URL.
 */
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// In-flight request deduplication map for GET requests
const inFlightRequests = new Map();

// Helper to generate unique request signature key
function getRequestKey(config) {
  const method = (config.method || 'get').toLowerCase();
  const url = config.url || '';
  const params = config.params ? JSON.stringify(config.params) : '';
  return `${method}:${url}:${params}`;
}

// Custom request wrapper with deduplication
const originalGet = apiClient.get.bind(apiClient);
apiClient.get = function (url, config = {}) {
  const key = getRequestKey({ method: 'get', url, ...config });

  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key);
  }

  const promise = originalGet(url, config).finally(() => {
    inFlightRequests.delete(key);
  });

  inFlightRequests.set(key, promise);
  return promise;
};

// Request interceptor (for auth tokens or logging if needed)
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for centralized error transformation
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    let errorMessage = 'An unexpected network error occurred.';
    let validationErrors = [];

    if (error.response) {
      // Backend returned an error response
      errorMessage = error.response.data?.message || `Request failed with status ${error.response.status}`;
      validationErrors = error.response.data?.errors || [];
    } else if (error.request) {
      // Backend didn't respond
      errorMessage = 'Could not connect to backend service. Please ensure the server is running.';
    }

    return Promise.reject({
      message: errorMessage,
      statusCode: error.response?.status,
      errors: validationErrors,
      raw: error,
    });
  }
);

export default apiClient;
