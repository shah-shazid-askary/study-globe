import axios from 'axios';
import {
  buildCacheKey,
  getCacheEntry,
  isCacheFresh,
  setCacheEntry,
  invalidateCache,
} from '../utils/apiCache';

const resolveApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  if (typeof window === 'undefined') {
    return '/api';
  }

  const { hostname, port } = window.location;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

  if (isLocalhost && port === '8888') {
    return '/api';
  }

  if (isLocalhost) {
    return `http://localhost:${process.env.REACT_APP_BACKEND_PORT || '5000'}/api`;
  }

  if (hostname.includes('netlify.app')) {
    return '/api';
  }

  // Vercel Services — backend mounted at /_/backend
  return '/_/backend';
};

const API_BASE_URL = resolveApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Helper: get stored session
const getStoredSession = () => {
  try {
    const raw = localStorage.getItem('supabase_session');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// Helper: check if JWT is expired (with 60s buffer)
const isTokenExpired = (session) => {
  if (!session?.expires_at) return false;
  // expires_at is epoch seconds
  return Date.now() / 1000 > (session.expires_at - 60);
};

// FIX: Add Bearer token to every request — refresh automatically if expired
api.interceptors.request.use(
  async (config) => {
    let session = getStoredSession();
    if (!session) return config;

    // Refresh if access_token is expired/near-expiry
    if (isTokenExpired(session) && session.refresh_token) {
      try {
        const refreshRes = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          { refresh_token: session.refresh_token },
          { headers: { 'Content-Type': 'application/json' } }
        );
        const newSession = refreshRes.data.session;
        localStorage.setItem('supabase_session', JSON.stringify(newSession));
        session = newSession;
      } catch (refreshErr) {
        // Refresh failed — clear session and redirect to login
        console.error('Token refresh failed, clearing session:', refreshErr);
        localStorage.removeItem('supabase_session');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return config;
      }
    }

    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }

    if (config.method === 'get' && config.cache !== false) {
      const key = buildCacheKey('GET', config.url, config.params);
      const cached = getCacheEntry(key);
      if (cached && isCacheFresh(cached)) {
        config.adapter = () =>
          Promise.resolve({
            data: cached.data,
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
            request: {},
          });
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// FIX: On 401, try to refresh token once before redirecting to login
let isRefreshing = false;
let pendingRequests = [];

api.interceptors.response.use(
  (res) => {
    const { config } = res;
    if (config.method === 'get' && config.cache !== false) {
      const key = buildCacheKey('GET', config.url, config.params);
      setCacheEntry(key, res.data);
    }
    return res;
  },
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh-token')
    ) {
      if (isRefreshing) {
        // Queue the request while refreshing
        return new Promise((resolve, reject) => {
          pendingRequests.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const session = getStoredSession();
      if (session?.refresh_token) {
        try {
          const refreshRes = await axios.post(
            `${API_BASE_URL}/auth/refresh-token`,
            { refresh_token: session.refresh_token },
            { headers: { 'Content-Type': 'application/json' } }
          );
          const newSession = refreshRes.data.session;
          localStorage.setItem('supabase_session', JSON.stringify(newSession));
          isRefreshing = false;

          // Resolve pending requests
          pendingRequests.forEach((p) => p.resolve(newSession.access_token));
          pendingRequests = [];

          originalRequest.headers.Authorization = `Bearer ${newSession.access_token}`;
          return api(originalRequest);
        } catch (refreshErr) {
          isRefreshing = false;
          pendingRequests.forEach((p) => p.reject(refreshErr));
          pendingRequests = [];
          localStorage.removeItem('supabase_session');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshErr);
        }
      } else {
        isRefreshing = false;
        localStorage.removeItem('supabase_session');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refreshToken: (refresh_token) => api.post('/auth/refresh-token', { refresh_token }),
  requestPasswordReset: (email) => api.post('/auth/request-password-reset', { email }),
  resetPassword: (access_token, new_password) => api.post('/auth/reset-password', { access_token, new_password }),
};

const mutating = (request, ...invalidationKeys) =>
  request.then((res) => {
    invalidationKeys.forEach((key) => invalidateCache(key));
    return res;
  });

export const countriesAPI = {
  getAll: () => api.get('/countries'),
  getById: (id) => api.get(`/countries/${id}`),
  create: (data) => mutating(api.post('/countries', data), 'GET:/countries'),
  update: (id, data) => mutating(api.put(`/countries/${id}`, data), 'GET:/countries'),
  delete: (id) => mutating(api.delete(`/countries/${id}`), 'GET:/countries'),
};

export const universitiesAPI = {
  getAll: (params) => api.get('/universities', { params }),
  getById: (id) => api.get(`/universities/${id}`),
  create: (data) => mutating(api.post('/universities', data), 'GET:/universities'),
  update: (id, data) => mutating(api.put(`/universities/${id}`, data), 'GET:/universities'),
  delete: (id) => mutating(api.delete(`/universities/${id}`), 'GET:/universities'),
};

export const programsAPI = {
  getAll: (params) => api.get('/programs', { params }),
  getByUniversity: (universityId, params) => api.get(`/programs/university/${universityId}`, { params }),
  create: (data) => mutating(api.post('/programs', data), 'GET:/programs'),
  update: (id, data) => mutating(api.put(`/programs/${id}`, data), 'GET:/programs'),
  delete: (id) => mutating(api.delete(`/programs/${id}`), 'GET:/programs'),
};

export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data) => mutating(api.put('/profile', data), 'GET:/profile'),
  getRecommendations: () => api.get('/profile/recommendations'),
};

export const tasksAPI = {
  getAll: () => api.get('/tasks'),
  create: (data) => mutating(api.post('/tasks', data), 'GET:/tasks'),
  update: (id, data) => mutating(api.put(`/tasks/${id}`, data), 'GET:/tasks'),
  delete: (id) => mutating(api.delete(`/tasks/${id}`), 'GET:/tasks'),
};

export const documentsAPI = {
  getAll: () => api.get('/documents'),
  submit: (data) => mutating(api.post('/documents', data), 'GET:/documents'),
  verify: (id, status) => mutating(api.put(`/documents/${id}/verify`, { status }), 'GET:/documents'),
};

export const predepartureAPI = {
  get: () => api.get('/predeparture'),
  update: (data) => mutating(api.put('/predeparture', data), 'GET:/predeparture'),
};

export const resourcesAPI = {
  getAll: () => api.get('/resources'),
  create: (data) => mutating(api.post('/resources', data), 'GET:/resources'),
  update: (id, data) => mutating(api.put(`/resources/${id}`, data), 'GET:/resources'),
  delete: (id) => mutating(api.delete(`/resources/${id}`), 'GET:/resources'),
};

export const guidelinesAPI = {
  get: (countryId) => api.get(`/guidelines/${countryId}`),
  update: (countryId, data) => mutating(api.post(`/guidelines/${countryId}`, data), 'GET:/guidelines'),
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
