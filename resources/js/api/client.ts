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
// Response interceptor: handle auth errors intelligently
client.interceptors.response.use(
    (res) => res,
    (error) => {
        const status = error?.response?.status;

        // 401: Unauthorized
        if (status === 401) {
            useAuthStore.getState().clear();

            // Only redirect to login for certain paths that definitely require auth
            // Don't redirect for API calls that guests should be able to make
            const pathname = window.location.pathname;
            const isAuthRequiredPage =
                pathname.includes('/my-') ||
                pathname.includes('/checkout') ||
                pathname.includes('/profile') ||
                pathname.includes('/dashboard') ||
                pathname.includes('/admin') ||
                pathname.includes('/teaching');

            if (isAuthRequiredPage && pathname !== '/login') {
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
