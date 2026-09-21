import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api'   // ← BACKEND CONNECT
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (email, password) =>
  API.post('/admin/login', { email, password });

// Hotels
export const getHotels = () => API.get('/admin/hotels');
export const getHotel = (id) => API.get(`/hotels/${id}`);
export const addHotel = (data) => API.post('/admin/hotels', data);
export const updateHotel = (id, data) => API.put(`/admin/hotels/${id}`, data);
export const deleteHotel = (id) => API.delete(`/admin/hotels/${id}`);

// Leads
export const getLeads = () => API.get('/admin/leads');
export const updateLeadStatus = (id, status) =>
  API.put(`/admin/leads/${id}`, { status });

// Analytics
export const getAnalytics = () => API.get('/admin/analytics');

export default API;