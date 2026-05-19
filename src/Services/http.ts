import axios from 'axios';

const baseURL = 'http://localhost:9090'; 

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