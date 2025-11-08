import axios from 'axios';
import { agentTimeOffMapper } from '../mappers';

const API_BASE_URL = '/api';

class AgentTimeOffService {
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

    async getAllTimeOffs() {
        try {
            const response = await this.client.get('/AgentTimeOff');
            return agentTimeOffMapper.toFrontendList(response.data);
        } catch (error) {
            console.error('Error fetching all time offs:', error);
            throw error;
        }
    }

    async getTimeOffById(id) {
        try {
            const response = await this.client.get(`/AgentTimeOff/${id}`);
            return agentTimeOffMapper.toFrontend(response.data);
        } catch (error) {
            console.error('Error fetching time off by ID:', error);
            throw error;
        }
    }

    async getTimeOffsByAgent(agentId) {
        try {
            const response = await this.client.get(`/AgentTimeOff/agent/${agentId}`);
            return agentTimeOffMapper.toFrontendList(response.data);
        } catch (error) {
            console.error('Error fetching time offs by agent:', error);
            throw error;
        }
    }

    async getUpcomingTimeOffs(daysAhead = 30) {
        try {
            const response = await this.client.get('/AgentTimeOff/upcoming', {
                params: { daysAhead }
            });
            return agentTimeOffMapper.toFrontendList(response.data);
        } catch (error) {
            console.error('Error fetching upcoming time offs:', error);
            throw error;
        }
    }

    async getTimeOffsByDateRange(agentId, startDate, endDate) {
        try {
            const response = await this.client.get(`/AgentTimeOff/agent/${agentId}/date-range`, {
                params: { startDate, endDate }
            });
            return agentTimeOffMapper.toFrontendList(response.data);
        } catch (error) {
            console.error('Error fetching time offs by date range:', error);
            throw error;
        }
    }

    async requestTimeOff(timeOffData) {
        try {
            console.log('Raw time off data before mapping:', timeOffData);
            const backendData = agentTimeOffMapper.toBackend(timeOffData);
            console.log('Mapped backend data:', backendData);

            const response = await this.client.post('/AgentTimeOff', backendData);
            return agentTimeOffMapper.toFrontend(response.data);
        } catch (error) {
            console.error('Error requesting time off:', error);
            throw error;
        }
    }

    async updateTimeOff(id, timeOffData) {
        try {
            const backendData = agentTimeOffMapper.toBackend({
                ...timeOffData,
                id: id
            });
            const response = await this.client.put(`/AgentTimeOff/${id}`, backendData);
            return agentTimeOffMapper.toFrontend(response.data);
        } catch (error) {
            console.error('Error updating time off:', error);
            throw error;
        }
    }

    async approveTimeOff(id) {
        try {
            const response = await this.client.patch(`/AgentTimeOff/${id}/approve`);
            return agentTimeOffMapper.toFrontend(response.data);
        } catch (error) {
            console.error('Error approving time off:', error);
            throw error;
        }
    }

    async rejectTimeOff(id) {
        try {
            const response = await this.client.patch(`/AgentTimeOff/${id}/reject`);
            return agentTimeOffMapper.toFrontend(response.data);
        } catch (error) {
            console.error('Error rejecting time off:', error);
            throw error;
        }
    }

    async deleteTimeOff(id) {
        try {
            const response = await this.client.delete(`/AgentTimeOff/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting time off:', error);
            throw error;
        }
    }

    async checkAgentAvailability(agentId, date) {
        try {
            const response = await this.client.get('/AgentTimeOff/check-availability', {
                params: { agentId, date }
            });
            return response.data;
        } catch (error) {
            console.error('Error checking agent availability:', error);
            throw error;
        }
    }

    async checkTimeOffConflict(agentId, startDate, endDate) {
        try {
            const response = await this.client.get('/AgentTimeOff/check-conflict', {
                params: { agentId, startDate, endDate }
            });
            return response.data;
        } catch (error) {
            console.error('Error checking time off conflict:', error);
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

export default AgentTimeOffService;