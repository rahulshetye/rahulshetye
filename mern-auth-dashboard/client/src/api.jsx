import axios from 'axios';
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://rahulshetye.onrender.com',
  withCredentials: true
});
export default API;
  