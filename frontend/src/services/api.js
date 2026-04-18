// src/services/api.js - Axios instance with auth interceptor + retry on timeout
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000, // increased to 30s to handle cold starts on free hosting
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

// Auto-retry once on timeout / network error, then handle 401
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Retry once on timeout or network error (cold start scenario)
    if (
      !config._retried &&
      (error.code === 'ECONNABORTED' || !error.response)
    ) {
      config._retried = true;
      config.timeout = 40000; // give extra time on retry
      await new Promise((res) => setTimeout(res, 2000)); // wait 2s then retry
      return API(config);
    }

    // Force logout on 401
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
