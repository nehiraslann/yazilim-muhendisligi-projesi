import axios from 'axios';
import { getPrimaryLanguage, LANGUAGE_STORAGE_KEY } from './utils/i18nUtils';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const lang = getPrimaryLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'tr');

  if ((config.method || '').toLowerCase() === 'get') {
    config.params = { lang, ...config.params };
  }

  return config;
});

export default api;
