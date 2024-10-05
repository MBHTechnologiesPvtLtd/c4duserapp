import axios from 'axios';

const api = axios.create({
  baseURL: 'https://cusv1.click4delivery.in/api/', // Set your API base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
