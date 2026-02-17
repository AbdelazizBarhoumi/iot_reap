import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const client = axios.create({
  // session-based auth: cookies are sent automatically
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Response interceptor: handle auth errors
client.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    
    // 401: Clear auth state (session expired or unauthenticated)
    if (status === 401) {
      useAuthStore.getState().clear();
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // 419: CSRF token mismatch - refresh the page to get new token
    if (status === 419) {
      useAuthStore.getState().clear();
      window.location.reload();
    }
    
    return Promise.reject(error);
  },
);

export default client;
