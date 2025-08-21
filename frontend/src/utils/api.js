import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post('/api/auth/token/refresh/', {
            refresh: refreshToken
          });
          
          const newToken = response.data.access;
          localStorage.setItem('access_token', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      } else {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// API service functions
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/register/', userData),
  logout: (refreshToken) => api.post('/auth/logout/', { refresh: refreshToken }),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (profileData) => api.put('/auth/profile/update/', profileData),
  changePassword: (passwordData) => api.post('/auth/change-password/', passwordData),
};

export const dashboardAPI = {
  getHighlights: () => api.get('/dashboard/highlights/'),
  getAllCoins: (params) => api.get('/dashboard/coins/', { params }),
  getCoinDetails: (coinId) => api.get(`/dashboard/coins/${coinId}/`),
  getCoinHistory: (coinId, days) => api.get(`/dashboard/coins/${coinId}/history/`, { params: { days } }),
  getGlobalStats: () => api.get('/dashboard/global-stats/'),
  searchCoins: (query) => api.get('/dashboard/search/', { params: { q: query } }),
};

export const portfolioAPI = {
  getPortfolio: () => api.get('/portfolio/'),
  addPortfolioItem: (itemData) => api.post('/portfolio/add/', itemData),
  updatePortfolioItem: (itemId, updateData) => api.put(`/portfolio/item/${itemId}/update/`, updateData),
  deletePortfolioItem: (itemId) => api.delete(`/portfolio/item/${itemId}/delete/`),
  getPortfolioPerformance: () => api.get('/portfolio/performance/'),
};

export const collectionAPI = {
  getCollections: () => api.get('/collection/'),
  getCollectionDetails: (collectionId) => api.get(`/collection/${collectionId}/`),
  getFeaturedCollections: () => api.get('/collection/featured/'),
  createDefaultCollections: () => api.post('/collection/create-defaults/'),
};

export default api;
