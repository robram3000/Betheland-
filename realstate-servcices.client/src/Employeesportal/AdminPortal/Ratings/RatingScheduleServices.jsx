// RatingScheduleService.jsx
import axios from 'axios';
import ratingScheduleMapper from './RatingScheduleMapper.jsx';

const API_BASE_URL = '/api';

class RatingScheduleService {
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

    // Create rating schedule
    async createRatingSchedule(ratingData) {
        try {
            console.log('Creating rating schedule with data:', ratingData);
            const createRequest = ratingScheduleMapper.toCreateRequest(ratingData);
            console.log('Mapped rating schedule create request:', createRequest);

            const response = await this.client.post('/RatingSchedules', createRequest);

            if (response.data) {
                console.log('Rating schedule created successfully:', response.data);
                return ratingScheduleMapper.toFrontend(response.data);
            } else {
                throw new Error(response.data?.message || 'Failed to create rating schedule');
            }
        } catch (error) {
            console.error('Error creating rating schedule:', error);
            throw error;
        }
    }

    // Get rating schedule by ID
    async getRatingSchedule(id) {
        try {
            console.log('🔍 Fetching rating schedule by ID:', id);
            const response = await this.client.get(`/RatingSchedules/${id}`);

            if (response.data) {
                return ratingScheduleMapper.toFrontend(response.data);
            } else {
                throw new Error(response.data?.message || 'Rating schedule not found');
            }
        } catch (error) {
            console.error('Error getting rating schedule:', error);
            throw error;
        }
    }

    // Get all rating schedules
    async getAllRatingSchedules() {
        try {
            console.log('🔍 Fetching all rating schedules from API...');
            const response = await this.client.get('/RatingSchedules');
            console.log('📦 Rating Schedule API Response structure:', {
                status: response.status,
                hasData: !!response.data,
                dataKeys: response.data ? Object.keys(response.data) : 'no data',
                isArray: Array.isArray(response.data),
                dataLength: Array.isArray(response.data) ? response.data.length : 'N/A'
            });

            if (response.data) {
                if (Array.isArray(response.data)) {
                    console.log('✅ Direct array response:', response.data.length);
                    return ratingScheduleMapper.toFrontendList(response.data);
                } else {
                    console.log('❌ Unexpected response structure:', response.data);
                    return [];
                }
            } else {
                console.log('❌ No data in response');
                return [];
            }
        } catch (error) {
            console.error('❌ Error fetching all rating schedules:', error);
            throw error;
        }
    }

    // Get rating schedules by agent
    async getRatingSchedulesByAgent(agentId) {
        try {
            console.log('Fetching rating schedules by agent:', agentId);
            const response = await this.client.get(`/RatingSchedules/agent/${agentId}`);

            if (response.data) {
                return ratingScheduleMapper.toFrontendList(response.data);
            } else {
                throw new Error(response.data?.message || 'Failed to fetch rating schedules by agent');
            }
        } catch (error) {
            console.error('Error getting rating schedules by agent:', error);
            throw error;
        }
    }

    // Get rating schedules by client
    async getRatingSchedulesByClient(clientId) {
        try {
            console.log('Fetching rating schedules by client:', clientId);
            const response = await this.client.get(`/RatingSchedules/client/${clientId}`);

            if (response.data) {
                return ratingScheduleMapper.toFrontendList(response.data);
            } else {
                throw new Error(response.data?.message || 'Failed to fetch rating schedules by client');
            }
        } catch (error) {
            console.error('Error getting rating schedules by client:', error);
            throw error;
        }
    }

    // Get rating summary for agent
    async getRatingSummary(agentId) {
        try {
            console.log('Getting rating summary for agent:', agentId);
            const response = await this.client.get(`/RatingSchedules/agent/${agentId}/summary`);

            if (response.data) {
                return ratingScheduleMapper.toSummaryResponse(response.data);
            } else {
                throw new Error(response.data?.message || 'Failed to get rating summary');
            }
        } catch (error) {
            console.error('Error getting rating summary:', error);
            throw error;
        }
    }

    // Update rating schedule
    async updateRatingSchedule(id, ratingData) {
        try {
            console.log('Updating rating schedule:', id, ratingData);
            const updateRequest = ratingScheduleMapper.toUpdateRequest(ratingData);

            const response = await this.client.put(`/RatingSchedules/${id}`, updateRequest);

            if (response.data) {
                return ratingScheduleMapper.toFrontend(response.data);
            } else {
                throw new Error(response.data?.message || 'Failed to update rating schedule');
            }
        } catch (error) {
            console.error('Error updating rating schedule:', error);
            throw error;
        }
    }

    // Delete rating schedule
    async deleteRatingSchedule(id) {
        try {
            console.log('Deleting rating schedule:', id);
            const response = await this.client.delete(`/RatingSchedules/${id}`);

            if (response.data) {
                return response.data;
            } else {
                throw new Error(response.data?.message || 'Failed to delete rating schedule');
            }
        } catch (error) {
            console.error('Error deleting rating schedule:', error);
            throw error;
        }
    }

    // Check if user can rate schedule
    async canRateSchedule(scheduleId) {
        try {
            console.log('Checking if user can rate schedule:', scheduleId);
            const response = await this.client.get(`/RatingSchedules/can-rate/${scheduleId}`);

            if (response.data !== undefined) {
                return Boolean(response.data);
            } else {
                throw new Error(response.data?.message || 'Failed to check rating eligibility');
            }
        } catch (error) {
            console.error('Error checking rating eligibility:', error);
            throw error;
        }
    }

    // Error handler
    handleError(error) {
        console.error('Rating Schedule API Error:', error);

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
                errorObj.message = 'Authentication required to submit ratings';
            } else if (error.response.status === 403) {
                errorObj.message = 'Access forbidden for rating operations';
            } else if (error.response.status === 404) {
                errorObj.message = 'Rating schedule resource not found';
            } else if (error.response.status === 409) {
                errorObj.message = 'You have already rated this schedule';
            } else if (error.response.status === 500) {
                errorObj.message = 'Internal server error while processing rating schedule';
            }

            return errorObj;
        } else if (error.request) {
            return {
                message: 'Network error: Unable to connect to rating schedule service. Please check your internet connection.',
                code: 'NETWORK_ERROR',
                details: 'The rating schedule service may be down or there may be network issues.'
            };
        } else {
            return {
                message: error.message || 'An unexpected error occurred with rating schedule service',
                code: 'UNKNOWN_ERROR',
                details: error.stack
            };
        }
    }
}

const ratingScheduleService = new RatingScheduleService();
export default ratingScheduleService;