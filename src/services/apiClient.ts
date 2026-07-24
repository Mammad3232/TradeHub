import axios from 'axios';

// Development environment API base URL
const API_BASE_URL = 'http://localhost:5229/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer Token automatically to every outgoing request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tradehub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // If data is FormData, remove default 'Content-Type: application/json' header
    // so Axios can automatically generate 'multipart/form-data; boundary=...'
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Unwrap global ApiResponse envelope or handle errors
apiClient.interceptors.response.use(
  (response) => {
    // If backend returns standard ApiResponse envelope { success, message, data }
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      if (!response.data.success) {
        return Promise.reject(new Error(response.data.message || 'API request failed'));
      }
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    // 401 Unauthorized — token expired or invalid: clear session and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('tradehub_token');
      localStorage.removeItem('vendora_user');
      localStorage.removeItem('mockUser');
      localStorage.removeItem('vendora_active_user');
      // Only redirect if not already on the login page to avoid redirect loops
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    const customMessage = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(customMessage));
  }
);

export default apiClient;
