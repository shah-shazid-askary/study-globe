import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// FIX: No interceptor existed — Bearer token was NEVER sent to backend, causing all 401 errors
api.interceptors.request.use((config) => {
  const session = localStorage.getItem('supabase_session');
  if (session) {
    try {
      const parsed = JSON.parse(session);
      if (parsed?.access_token) {
        config.headers.Authorization = `Bearer ${parsed.access_token}`;
      }
    } catch (e) {
      localStorage.removeItem('supabase_session');
    }
  }
  return config;
}, (error) => Promise.reject(error));

// FIX: Auto-redirect on expired/invalid token
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('supabase_session');
      // Do not force a hard page reload if the user is already on the login page or explicitly trying to authenticate
      if (window.location.pathname !== '/login' && !error.config?.url?.includes('/auth/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  requestPasswordReset: (email) => api.post('/auth/request-password-reset', { email }),
  resetPassword: (access_token, new_password) => api.post('/auth/reset-password', { access_token, new_password }),
};

export const countriesAPI = {
  getAll: () => api.get('/countries'),
  getById: (id) => api.get(`/countries/${id}`),
  create: (data) => api.post('/countries', data),
  update: (id, data) => api.put(`/countries/${id}`, data),
  delete: (id) => api.delete(`/countries/${id}`),
};

export const universitiesAPI = {
  getAll: (params) => api.get('/universities', { params }),
  getById: (id) => api.get(`/universities/${id}`),
  create: (data) => api.post('/universities', data),
  update: (id, data) => api.put(`/universities/${id}`, data),
  delete: (id) => api.delete(`/universities/${id}`),
};

export const programsAPI = {
  getAll: (params) => api.get('/programs', { params }),
  getByUniversity: (universityId, params) => api.get(`/programs/university/${universityId}`, { params }),
  create: (data) => api.post('/programs', data),
  update: (id, data) => api.put(`/programs/${id}`, data),
  delete: (id) => api.delete(`/programs/${id}`),
};

export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
  getRecommendations: () => api.get('/profile/recommendations'),
};

export const tasksAPI = {
  getAll: () => api.get('/tasks'),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
};

export const documentsAPI = {
  getAll: () => api.get('/documents'),
  submit: (data) => api.post('/documents', data),
  verify: (id, status) => api.put(`/documents/${id}/verify`, { status }),
};

export const predepartureAPI = {
  get: () => api.get('/predeparture'),
  update: (data) => api.put('/predeparture', data),
};

export const resourcesAPI = {
  getAll: () => api.get('/resources'),
  create: (data) => api.post('/resources', data),
  update: (id, data) => api.put(`/resources/${id}`, data),
  delete: (id) => api.delete(`/resources/${id}`),
};

export const guidelinesAPI = {
  get: (countryId) => api.get(`/guidelines/${countryId}`),
  update: (countryId, data) => api.post(`/guidelines/${countryId}`, data),
};

export const aiAPI = {
  reviewSop: (data) => api.post('/ai/review-sop', data),
};

export const usersAPI = {
  getAll: () => api.get('/users'),
  updateRole: (id, role) => api.put(`/users/${id}/role`, { role }),
};

export const analyticsAPI = {
  getSystemMetrics: () => api.get('/analytics/metrics'),
};

export default api;
