import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Interceptor request — baca token yang sesuai
api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('admin_token');
  const customerToken = localStorage.getItem('customer_token');

  // Tentukan token berdasarkan URL yang dipanggil
  if (config.url?.includes('/admin')) {
    if (adminToken) config.headers.Authorization = `Bearer ${adminToken}`;
  } else {
    if (customerToken) config.headers.Authorization = `Bearer ${customerToken}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor response — redirect sesuai konteks
api.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response?.status === 401) {
    const url = error.config?.url || '';

    if (url.includes('/admin')) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/admin/login';
    } else {
      localStorage.removeItem('customer_token');
      localStorage.removeItem('customer_user');
      window.location.href = '/customer/login';
    }
  }
  return Promise.reject(error);
});

export default api;