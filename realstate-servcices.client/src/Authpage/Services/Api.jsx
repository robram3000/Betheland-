// Services/Api.jsx (Enhanced)
import axios from 'axios';
import authService from './LoginAuth';

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
        const token = authService.getToken();
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
        return response.data;
    },
    async (error) => {
        const originalRequest = error.config;

        // Auto-refresh token on 401
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshResult = await authService.refreshToken();
                if (refreshResult.success) {
                    // Retry original request with new token
                    const token = authService.getToken();
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                // Refresh failed, logout user but don't redirect for background requests
                if (!originalRequest._skipAuthRedirect) {
                    authService.logout();
                    setTimeout(() => {
                        window.location.href = '/login?reason=session_expired';
                    }, 100);
                }
                return Promise.reject(refreshError);
            }
        }

        console.error('API Error:', error);

        // Handle specific status codes
        if (error.response?.status === 403) {
            error.message = 'You do not have permission to perform this action.';
        } else if (error.response?.status === 404) {
            error.message = 'The requested resource was not found.';
        } else if (error.response?.status >= 500) {
            error.message = 'Server error. Please try again later.';
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

// Add request timeout handler
api.defaults.timeout = 30000;

// Add request/response logging in development
// Check if we're in development mode by hostname
const isDevelopment =
    typeof window !== 'undefined' &&
    window.location &&
    (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.includes('local'));

if (isDevelopment) {
    api.interceptors.request.use(request => {
        console.log('🚀 Starting Request:', {
            url: request.url,
            method: request.method,
            headers: request.headers,
            data: request.data
        });
        return request;
    });

    api.interceptors.response.use(response => {
        console.log('✅ Response Success:', {
            status: response.status,
            data: response.data,
            headers: response.headers
        });
        return response;
    }, error => {
        console.log('❌ Response Error:', {
            status: error.response?.status,
            message: error.message,
            data: error.response?.data
        });
        return Promise.reject(error);
    });
}

// Add helper methods for common API patterns
api.helpers = {
    // For handling paginated responses
    handlePaginatedResponse: (response) => {
        return {
            data: response.data || response.items || [],
            total: response.totalCount || response.total || 0,
            page: response.page || 1,
            pageSize: response.pageSize || response.limit || 10,
            totalPages: response.totalPages || Math.ceil((response.totalCount || response.total || 0) / (response.pageSize || response.limit || 10))
        };
    },

    // For handling file uploads
    handleFileUpload: (file, onProgress = null) => {
        const formData = new FormData();
        formData.append('file', file);

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: onProgress
        };

        return api.post('/upload', formData, config);
    },

    // For handling cancellable requests
    createCancelToken: () => {
        return axios.CancelToken.source();
    },

    // Check if error is a cancellation
    isCancel: (error) => {
        return axios.isCancel(error);
    }
};

// Add retry functionality for failed requests
api.retry = async (requestFn, maxRetries = 3, delay = 1000) => {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await requestFn();
        } catch (error) {
            lastError = error;

            // Don't retry on 4xx errors (except 429 - too many requests)
            if (error.status && error.status >= 400 && error.status < 500 && error.status !== 429) {
                break;
            }

            // Don't retry on cancellation
            if (axios.isCancel(error)) {
                break;
            }

            if (attempt < maxRetries) {
                console.warn(`API call failed, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                // Exponential backoff
                delay *= 2;
            }
        }
    }

    throw lastError;
};

export default api;