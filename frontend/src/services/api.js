import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

export const getNearbyHotels = (lat, lng, radius = 3000) =>
  API.get(`/hotels/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);

export const searchHotels = (name) =>
  API.get(`/hotels/search?name=${name}`);

export const getHotel = (id) =>
  API.get(`/hotels/${id}`);

export const saveLead = (data) =>
  API.post('/leads', data);