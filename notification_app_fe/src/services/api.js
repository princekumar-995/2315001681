import axios from 'axios';

// Express backend API base endpoint using IPv4 explicitly to avoid IPv6 resolution issues
const API_BASE_URL = 'http://127.0.0.1:5000/notifications';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

export const getNotifications = async ({ page = 1, limit = 10, type = '' } = {}) => {
  const params = { page, limit };
  // Only append category filter if active
  if (type && type !== 'All') {
    params.type = type;
  }
  
  const response = await apiClient.get('/', { params });
  return response.data;
};

export const getPriorityNotifications = async ({ limit = 10 } = {}) => {
  const response = await apiClient.get('/priority', { params: { limit } });
  return response.data;
};
