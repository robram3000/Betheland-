import axios from 'axios';
import { agentAvailabilityMapper } from '../mappers';

const API_BASE_URL = '/api';

class AgentAvailabilityService {
    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 30000,
        });

        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                return Promise.reject(this.handleError(error));
            }
        );
    }

    async getAllAvailabilities() {
        try {
            const response = await this.client.get('/AgentAvailability');
            return agentAvailabilityMapper.toFrontendList(response.data);
        } catch (error) {
            console.error('Error fetching all availabilities:', error);
            throw error;
        }
    }

    async getAvailabilityById(id) {
        try {
            const response = await this.client.get(`/AgentAvailability/${id}`);
            return agentAvailabilityMapper.toFrontend(response.data);
        } catch (error) {
            console.error('Error fetching availability by ID:', error);
            throw error;
        }
    }

    async getAvailabilitiesByAgent(agentId) {
        try {
            const response = await this.client.get(`/AgentAvailability/agent/${agentId}`);
            return agentAvailabilityMapper.toFrontendList(response.data);
        } catch (error) {
            console.error('Error fetching availabilities by agent:', error);
            throw error;
        }
    }

    async getAvailabilitiesByAgentAndDay(agentId, dayOfWeek) {
        try {
            const response = await this.client.get(`/AgentAvailability/agent/${agentId}/day/${dayOfWeek}`);
            return agentAvailabilityMapper.toFrontendList(response.data);
        } catch (error) {
            console.error('Error fetching availabilities by agent and day:', error);
            throw error;
        }
    }

    async createAvailability(availabilityData) {
        try {
            const backendData = agentAvailabilityMapper.toBackend(availabilityData);
            const response = await this.client.post('/AgentAvailability', backendData);
            return agentAvailabilityMapper.toFrontend(response.data);
        } catch (error) {
            console.error('Error creating availability:', error);
            throw error;
        }
    }

    async updateAvailability(id, availabilityData) {
        try {
            console.log('updateAvailability called with:', { id, availabilityData });

            const backendData = agentAvailabilityMapper.toBackend({
                ...availabilityData,
                id: parseInt(id)
            });

            console.log('Mapped backend data:', backendData);

            const response = await this.client.put(`/AgentAvailability/${id}`, backendData);
            console.log('Update response:', response.data);

            return agentAvailabilityMapper.toFrontend(response.data);
        } catch (error) {
            console.error('Error updating availability:', error);
            console.error('Error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                headers: error.response?.headers
            });
            throw error;
        }
    }
    async deleteAvailability(id) {
        try {
            const response = await this.client.delete(`/AgentAvailability/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting availability:', error);
            throw error;
        }
    }

    async setAgentAvailability(agentId, availabilities) {
        try {
            const backendData = availabilities.map(avail => agentAvailabilityMapper.toBackend(avail));
            const response = await this.client.post(`/AgentAvailability/agent/${agentId}/set-availability`, backendData);
            return response.data;
        } catch (error) {
            console.error('Error setting agent availability:', error);
            throw error;
        }
    }

    async checkAgentAvailability(agentId, dateTime) {
        try {
            const response = await this.client.get('/AgentAvailability/check-availability', {
                params: { agentId, dateTime }
            });
            return response.data;
        } catch (error) {
            console.error('Error checking agent availability:', error);
            throw error;
        }
    }

    async getAvailableDays(agentId) {
        try {
            const response = await this.client.get(`/AgentAvailability/agent/${agentId}/available-days`);
            return response.data;
        } catch (error) {
            console.error('Error fetching available days:', error);
            throw error;
        }
    }

    handleError(error) {
        console.error('API Error:', error);

        if (error.response) {
            const serverError = error.response.data;
            const errorObj = {
                message: serverError.message || `Server error: ${error.response.status}`,
                details: serverError.errors || serverError.details,
                code: serverError.code || 'SERVER_ERROR',
                status: error.response.status
            };

            if (error.response.status === 400) {
                errorObj.message = serverError.message || 'Bad request - please check your data';
            } else if (error.response.status === 401) {
                errorObj.message = 'Authentication required';
            } else if (error.response.status === 403) {
                errorObj.message = 'Access forbidden';
            } else if (error.response.status === 404) {
                errorObj.message = 'Resource not found';
            } else if (error.response.status === 500) {
                errorObj.message = 'Internal server error';
            }

            return errorObj;
        } else if (error.request) {
            return {
                message: 'Network error: Unable to connect to server. Please check your internet connection and try again.',
                code: 'NETWORK_ERROR',
                details: 'The server may be down or there may be network issues.'
            };
        } else {
            return {
                message: error.message || 'An unexpected error occurred',
                code: 'UNKNOWN_ERROR',
                details: error.stack
            };
        }
    }
}

export default AgentAvailabilityService;