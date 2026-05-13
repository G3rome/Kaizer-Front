import axios from 'axios';

const productsApiUrl: string | undefined = import.meta.env
  .VITE_PRODUCTS_API_URL;

const baseURL: string | undefined = import.meta.env
  .VITE_API_URL ?? import.meta.env
  .VITE_API_BASE_URL ?? (
  productsApiUrl
    ? productsApiUrl.replace(/\/api\/productos\/?$/, '')
    : undefined
);

export const http = axios.create({
  baseURL
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
