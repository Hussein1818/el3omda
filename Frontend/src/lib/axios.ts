import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://el3omda.runasp.net/api',
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response, 
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        
        const refreshResponse = await axios.post(
          'https://el3omda.runasp.net/api/auth/refresh',
          {},
          { withCredentials: true }
        );

        const newToken = refreshResponse.data.token;
        
        if (newToken) {
          localStorage.setItem('token', newToken);
          
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest); 
        }
      } catch (refreshError) {
      
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);