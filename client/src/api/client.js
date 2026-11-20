// client/src/api/client.js
import axios from 'axios';
import i18n from '../i18n';

export class ApiError extends Error {
  constructor(status, code, details = null, message = '') {
    super(message || code);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: add Token and Accept-Language
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nr_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['Accept-Language'] = i18n.language || 'en';
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: unwrap { ok, data, meta } or throw ApiError
apiClient.interceptors.response.use(
  (response) => {
    const payload = response.data;
    if (payload && typeof payload === 'object') {
      if (payload.ok === undefined) {
        payload.ok = true;
      }
      if (payload.data === undefined) {
        payload.data = payload;
      }
    }
    return payload;
  },
  (error) => {
    if (!error.response) {
      throw new ApiError(0, 'NETWORK_ERROR', null, 'Network connection failed');
    }

    const { status, data } = error.response;
    const errorCode = data?.error?.code || 'UNKNOWN';
    const details = data?.error?.details || null;
    const message = data?.error?.message || errorCode;

    // Handle token expiration / auth required
    if (status === 401 && (errorCode === 'AUTH_TOKEN_EXPIRED' || errorCode === 'AUTH_REQUIRED')) {
      const currentToken = localStorage.getItem('nr_token');
      if (currentToken) {
        localStorage.removeItem('nr_token');
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
          window.location.href = `/login?next=${encodeURIComponent(currentPath)}`;
        }
      }
    }

    throw new ApiError(status, errorCode, details, message);
  }
);

/**
 * Returns user-friendly translated error message using i18next t function
 */
export function errorText(code, details, t) {
  if (!code) return t('errors.UNKNOWN');
  const key = `errors.${code}`;
  const translated = t(key);
  if (translated !== key) {
    return translated;
  }
  return t('errors.UNKNOWN');
}

export default apiClient;
