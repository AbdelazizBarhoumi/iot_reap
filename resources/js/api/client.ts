import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const client = axios.create({
  // session-based endpoints will still send cookies; token (if set) is sent as Bearer
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Attach Authorization header automatically when token exists in the auth store
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    // axios types are strict — mutate header field instead of replacing headers object
    const headers = (config.headers ?? {}) as Record<string, string>;
    headers.Authorization = `Bearer ${token}`;
    // eslint-disable-next-line no-param-reassign
    config.headers = headers as any;
  }
  return config;
});

// On 401: clear auth state (logout) so UI reacts immediately
client.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      useAuthStore.getState().clear();
    }
    return Promise.reject(error);
  },
);

export default client;
