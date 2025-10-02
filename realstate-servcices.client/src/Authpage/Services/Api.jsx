// Services/Api.jsx
import axios from 'axios';

// Use your existing Axios instance
const api = axios.create({
    baseURL: '/api',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        // Directly return the data for successful responses
        return response.data;
    },
    (error) => {
        console.error('API Error:', error);

        if (error.response?.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            localStorage.removeItem('refreshToken');
        
        }

        // Extract error message from various possible locations
        const errorMessage = error.response?.data?.message ||
            error.response?.data?.Message ||
            error.response?.data?.error ||
            error.message ||
            'An error occurred';

        // Create a clean error object
        const cleanError = {
            message: errorMessage,
            status: error.response?.status,
            data: error.response?.data,
            originalError: error
        };

        return Promise.reject(cleanError);
    }
);

export default api;