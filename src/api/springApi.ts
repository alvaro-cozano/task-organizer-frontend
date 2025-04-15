import axios, { InternalAxiosRequestConfig } from 'axios';
import { getEnvVariables } from '../helpers/getEnvVariables';

const { VITE_API_URL } = getEnvVariables();

const springApi = axios.create({
  baseURL: VITE_API_URL,
});

springApi.interceptors.request.use((config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const token = localStorage.getItem('token') || '';

  if (config.headers && typeof config.headers.set === 'function') {
    config.headers.set('x-token', token);
  }

  return config;
});

export default springApi;
