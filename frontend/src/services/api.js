// src/services/api.js - Axios instance with auth interceptor
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});

// Attach JWT token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 — token expired, force logout
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  signup: (data) => API.post('/auth/signup', data),
  login:  (data) => API.post('/auth/login', data),
  getProfile: () => API.get('/auth/profile'),
  updateProfile: (data) => API.put('/auth/profile', data),
};

// ─── Products ────────────────────────────────────────────────────────────────
export const productAPI = {
  getAll:      (params) => API.get('/products', { params }),
  getFeatured: ()       => API.get('/products/featured'),
  getById:     (id)     => API.get(`/products/${id}`),
  create:      (data)   => API.post('/products', data),
  update:      (id, data) => API.put(`/products/${id}`, data),
  delete:      (id)     => API.delete(`/products/${id}`),
  addReview:   (id, data) => API.post(`/products/${id}/reviews`, data),
  getAdminStats: () => API.get('/products/admin/stats'),
};

// ─── Orders ──────────────────────────────────────────────────────────────────
export const orderAPI = {
  create:        (data) => API.post('/orders', data),
  getMyOrders:   ()     => API.get('/orders/my-orders'),
  getById:       (id)   => API.get(`/orders/${id}`),
  getAllAdmin:    (params) => API.get('/orders', { params }),
  updateStatus:  (id, data) => API.put(`/orders/${id}/status`, data),
  getAdminStats: () => API.get('/orders/admin/stats'),
};

// ─── Payments ────────────────────────────────────────────────────────────────
export const paymentAPI = {
  createOrder: (amount) => API.post('/payment/create-order', { amount }),
  verify: (data)        => API.post('/payment/verify', data),
};

// ─── Upload ──────────────────────────────────────────────────────────────────
export const uploadAPI = {
  images: (formData) =>
    API.post('/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteImage: (publicId) => API.delete('/upload/images', { data: { publicId } }),
};

export default API;
