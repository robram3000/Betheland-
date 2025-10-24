import axios from 'axios';

class ApiClient {
    constructor(baseURL) {
        this.client = axios.create({
            baseURL: baseURL || '/api',
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            }
        });

        // Add request interceptor for auth tokens
        this.client.interceptors.request.use(
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

        // Add response interceptor for error handling
        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                return Promise.reject(error);
            }
        );
    }

    async get(url, config = {}) {
        return this.client.get(url, config);
    }

    async post(url, data, config = {}) {
        return this.client.post(url, data, config);
    }

    async put(url, data, config = {}) {
        return this.client.put(url, data, config);
    }

    async patch(url, data, config = {}) {
        return this.client.patch(url, data, config);
    }

    async delete(url, config = {}) {
        return this.client.delete(url, config);
    }
}

export default ApiClient;