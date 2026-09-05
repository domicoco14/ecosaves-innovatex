import axios from 'axios';
import { tokenStorage } from './tokenStorage';

// Default base URL for EcoSaves FastAPI backend
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.ecosaves.app/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to attach Bearer token from expo-secure-store
api.interceptors.request.use(
  async (config) => {
    const token = await tokenStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized session / token expiration if needed
      await tokenStorage.removeToken();
    }
    return Promise.reject(error);
  }
);
