// Switch this to your deployed backend URL when hosting
// e.g. const API_BASE = 'https://stegosphere-api.onrender.com';
const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export default API_BASE;
