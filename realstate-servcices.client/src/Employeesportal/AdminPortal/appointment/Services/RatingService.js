import axios from 'axios';
import { ratingMapper } from '../mappers';

const API_BASE_URL = '/api';

class RatingService {
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

    async getAllRatings() {
        try {
            const response = await this.client.get('/RatingSchedules');
            return ratingMapper.toFrontendList(response.data);
        } catch (error) {
            console.error('Error fetching all ratings:', error);
            throw error;
        }
    }

    async getRatingById(id) {
        try {
            const response = await this.client.get(`/RatingSchedules/${id}`);
            return ratingMapper.toFrontend(response.data);
        } catch (error) {
            console.error('Error fetching rating by ID:', error);
            throw error;
        }
    }

    async getRatingsByAgent(agentId) {
        try {
            const response = await this.client.get(`/RatingSchedules/agent/${agentId}`);
            return ratingMapper.toFrontendList(response.data);
        } catch (error) {
            console.error('Error fetching ratings by agent:', error);
            throw error;
        }
    }

    async getRatingsByClient(clientId) {
        try {
            const response = await this.client.get(`/RatingSchedules/client/${clientId}`);
            return ratingMapper.toFrontendList(response.data);
        } catch (error) {
            console.error('Error fetching ratings by client:', error);
            throw error;
        }
    }

    async getRatingSummary(agentId) {
        try {
            const response = await this.client.get(`/RatingSchedules/agent/${agentId}/summary`);
            return ratingMapper.toSummaryFrontend(response.data);
        } catch (error) {
            console.error('Error fetching rating summary:', error);
            throw error;
        }
    }

    async createRating(ratingData) {
        try {
            console.log('Raw rating data before mapping:', ratingData);
            const backendData = ratingMapper.toBackend(ratingData);
            console.log('Mapped backend data:', backendData);

            const response = await this.client.post('/RatingSchedules', backendData);
            return ratingMapper.toFrontend(response.data);
        } catch (error) {
            console.error('Error creating rating:', error);
            throw error;
        }
    }

    async updateRating(id, ratingData) {
        try {
            const backendData = ratingMapper.toBackend({
                ...ratingData,
                id: id
            });
            console.log('Updating rating with data:', backendData);
            const response = await this.client.put(`/RatingSchedules/${id}`, backendData);
            return ratingMapper.toFrontend(response.data);
        } catch (error) {
            console.error('Error updating rating:', error);
            throw error;
        }
    }

    async deleteRating(id) {
        try {
            const response = await this.client.delete(`/RatingSchedules/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting rating:', error);
            throw error;
        }
    }

    async canRateSchedule(scheduleId) {
        try {
            const response = await this.client.get(`/RatingSchedules/can-rate/${scheduleId}`);
            return response.data;
        } catch (error) {
            console.error('Error checking if can rate schedule:', error);
            throw error;
        }
    }

    async checkRatingExists(scheduleId) {
        try {
            // This would check if a rating already exists for the schedule
            const ratings = await this.getAllRatings();
            return ratings.some(rating => rating.scheduleId === scheduleId);
        } catch (error) {
            console.error('Error checking rating existence:', error);
            throw error;
        }
    }

    async getRecentRatings(limit = 10) {
        try {
            const ratings = await this.getAllRatings();
            return ratings
                .sort((a, b) => new Date(b.ratingDate) - new Date(a.ratingDate))
                .slice(0, limit);
        } catch (error) {
            console.error('Error fetching recent ratings:', error);
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
                errorObj.message = serverError.message || 'Bad request - please check your rating data';
            } else if (error.response.status === 401) {
                errorObj.message = 'Authentication required';
            } else if (error.response.status === 403) {
                errorObj.message = 'Access forbidden';
            } else if (error.response.status === 404) {
                errorObj.message = 'Rating not found';
            } else if (error.response.status === 409) {
                errorObj.message = 'Rating already exists for this schedule';
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

export default RatingService;