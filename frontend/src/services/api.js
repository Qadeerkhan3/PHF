import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const API = axios.create({
  baseURL: API_BASE_URL
});

export const getNearbyHotels = (lat, lng, radius = 3000) =>
  API.get(`/hotels/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);

// ↓ YEH MISSING THA — ab add karo
export const getNearbyGoogleHotels = (lat, lng, radius = 3000) =>
  API.get(`/hotels/nearby-google?lat=${lat}&lng=${lng}&radius=${radius}`);

export const searchHotels = (name) =>
  API.get(`/hotels/search?name=${name}`);

export const getHotel = (id) =>
  API.get(`/hotels/${id}`);

export const saveLead = (data) =>
  API.post('/leads', data);

export default API;