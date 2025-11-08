import axios from 'axios';
import { agentScheduleConfigMapper } from '../mappers';

const API_BASE_URL = '/api';

class AgentScheduleConfigService {
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

    async getAllConfigs() {
        try {
            const response = await this.client.get('/AgentScheduleConfig');
            return agentScheduleConfigMapper.toFrontendList(response.data);
        } catch (error) {
            console.error('Error fetching all configs:', error);
            throw error;
        }
    }

    async getConfigById(id) {
        try {
            const response = await this.client.get(`/AgentScheduleConfig/${id}`);
            return agentScheduleConfigMapper.toFrontend(response.data);
        } catch (error) {
            console.error('Error fetching config by ID:', error);
            throw error;
        }
    }

    async getConfigByAgent(agentId) {
        try {
            const response = await this.client.get(`/AgentScheduleConfig/agent/${agentId}`);
            return agentScheduleConfigMapper.toFrontend(response.data);
        } catch (error) {
            console.error('Error fetching config by agent:', error);
            throw error;
        }
    }

    async getOrCreateDefaultConfig(agentId) {
        try {
            const response = await this.client.get(`/AgentScheduleConfig/agent/${agentId}/default`);
            return agentScheduleConfigMapper.toFrontend(response.data);
        } catch (error) {
            console.error('Error getting or creating default config:', error);
            throw error;
        }
    }

    async createConfig(configData) {
        try {
            const backendData = agentScheduleConfigMapper.toBackend(configData);
            const response = await this.client.post('/AgentScheduleConfig', backendData);
            return agentScheduleConfigMapper.toFrontend(response.data);
        } catch (error) {
            console.error('Error creating config:', error);
            throw error;
        }
    }

    async updateConfig(id, configData) {
        try {
            const backendData = agentScheduleConfigMapper.toBackend({
                ...configData,
                id: id
            });
            const response = await this.client.put(`/AgentScheduleConfig/${id}`, backendData);
            return agentScheduleConfigMapper.toFrontend(response.data);
        } catch (error) {
            console.error('Error updating config:', error);
            throw error;
        }
    }

    async deleteConfig(id) {
        try {
            const response = await this.client.delete(`/AgentScheduleConfig/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting config:', error);
            throw error;
        }
    }

    async validateScheduleTime(agentId, scheduleTime) {
        try {
            const response = await this.client.get('/AgentScheduleConfig/validate-schedule-time', {
                params: { agentId, scheduleTime }
            });
            return response.data;
        } catch (error) {
            console.error('Error validating schedule time:', error);
            throw error;
        }
    }

    async getAvailableTimeSlots(agentId, date) {
        try {
            const response = await this.client.get(`/AgentScheduleConfig/agent/${agentId}/available-slots`, {
                params: { date }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching available time slots:', error);
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

export default AgentScheduleConfigService;