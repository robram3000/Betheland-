import axios from 'axios';
import ratingMapper from './RatingMapper.jsx';

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

    // Create rating
    async createRating(ratingData) {
        try {
            console.log('Creating rating with data:', ratingData);
            const createRequest = ratingMapper.toCreateRequest(ratingData);
            console.log('Mapped rating create request:', createRequest);

            const response = await this.client.post('/Rating', createRequest);

            if (response.data) {
                console.log('Rating created successfully:', response.data);
                return ratingMapper.toFrontend(response.data);
            } else {
                throw new Error(response.data?.message || 'Failed to create rating');
            }
        } catch (error) {
            console.error('Error creating rating:', error);
            throw error;
        }
    }

    // Get rating by ID
    async getRating(id) {
        try {
            console.log('🔍 Fetching rating by ID:', id);
            const response = await this.client.get(`/Rating/${id}`);

            if (response.data) {
                return ratingMapper.toFrontend(response.data);
            } else {
                throw new Error(response.data?.message || 'Rating not found');
            }
        } catch (error) {
            console.error('Error getting rating:', error);
            throw error;
        }
    }

    // Get all ratings
    async getAllRatings() {
        try {
            console.log('🔍 Fetching all ratings from API...');
            const response = await this.client.get('/Rating');
            console.log('📦 Rating API Response structure:', {
                status: response.status,
                hasData: !!response.data,
                dataKeys: response.data ? Object.keys(response.data) : 'no data',
                isArray: Array.isArray(response.data),
                dataLength: Array.isArray(response.data) ? response.data.length : 'N/A'
            });

            if (response.data) {
                if (Array.isArray(response.data)) {
                    console.log('✅ Direct array response:', response.data.length);
                    return ratingMapper.toFrontendList(response.data);
                } else if (response.data.ratings && Array.isArray(response.data.ratings)) {
                    console.log('✅ Ratings in data.ratings:', response.data.ratings.length);
                    return ratingMapper.toFrontendList(response.data.ratings);
                } else {
                    console.log('❌ Unexpected response structure:', response.data);
                    return [];
                }
            } else {
                console.log('❌ No data in response');
                return [];
            }
        } catch (error) {
            console.error('❌ Error fetching all ratings:', error);
            throw error;
        }
    }

    // Get ratings by rater (user who gave the rating)
    async getRatingsByRater(raterId) {
        try {
            console.log('Fetching ratings by rater:', raterId);
            const response = await this.client.get(`/Rating/user/${raterId}`);

            if (response.data) {
                return ratingMapper.toFrontendList(response.data);
            } else {
                throw new Error(response.data?.message || 'Failed to fetch ratings by rater');
            }
        } catch (error) {
            console.error('Error getting ratings by rater:', error);
            throw error;
        }
    }

    // Get ratings for user (user who received the rating)
    async getRatingsForUser(ratedId) {
        try {
            console.log('Fetching ratings for user:', ratedId);
            const response = await this.client.get(`/Rating/rated/${ratedId}`);

            if (response.data) {
                return ratingMapper.toFrontendList(response.data);
            } else {
                throw new Error(response.data?.message || 'Failed to fetch ratings for user');
            }
        } catch (error) {
            console.error('Error getting ratings for user:', error);
            throw error;
        }
    }

    // Update rating
    async updateRating(id, ratingData) {
        try {
            console.log('Updating rating:', id, ratingData);
            const updateRequest = ratingMapper.toUpdateRequest(ratingData);

            const response = await this.client.put(`/Rating/${id}`, updateRequest);

            if (response.data) {
                return ratingMapper.toFrontend(response.data);
            } else {
                throw new Error(response.data?.message || 'Failed to update rating');
            }
        } catch (error) {
            console.error('Error updating rating:', error);
            throw error;
        }
    }

    // Delete rating
    async deleteRating(id) {
        try {
            console.log('Deleting rating:', id);
            const response = await this.client.delete(`/Rating/${id}`);

            if (response.data) {
                return response.data;
            } else {
                throw new Error(response.data?.message || 'Failed to delete rating');
            }
        } catch (error) {
            console.error('Error deleting rating:', error);
            throw error;
        }
    }

    // Get average rating for user
    async getAverageRating(ratedId) {
        try {
            console.log('Getting average rating for user:', ratedId);
            const response = await this.client.get(`/Rating/average/${ratedId}`);

            if (response.data) {
                return ratingMapper.toAverageRatingResponse(response.data);
            } else {
                throw new Error(response.data?.message || 'Failed to get average rating');
            }
        } catch (error) {
            console.error('Error getting average rating:', error);
            throw error;
        }
    }

    // Get rating count for user
    async getRatingCount(ratedId) {
        try {
            console.log('Getting rating count for user:', ratedId);
            const response = await this.client.get(`/Rating/count/${ratedId}`);

            if (response.data) {
                return {
                    totalRatings: parseInt(response.data.totalRatings) || 0,
                    ratedId: parseInt(response.data.ratedId) || 0
                };
            } else {
                throw new Error(response.data?.message || 'Failed to get rating count');
            }
        } catch (error) {
            console.error('Error getting rating count:', error);
            throw error;
        }
    }

    // Check if user has already rated
    async hasUserRated(raterId, ratedId, propertyId = null) {
        try {
            console.log('Checking if user has rated:', { raterId, ratedId, propertyId });
            const params = { raterId, ratedId };
            if (propertyId) {
                params.propertyId = propertyId;
            }

            const response = await this.client.get('/Rating/has-rated', { params });

            if (response.data) {
                return response.data.hasRated || false;
            } else {
                throw new Error(response.data?.message || 'Failed to check rating status');
            }
        } catch (error) {
            console.error('Error checking if user has rated:', error);
            throw error;
        }
    }

    // Get ratings by property
    async getRatingsByProperty(propertyId) {
        try {
            console.log('Fetching ratings by property:', propertyId);
            const response = await this.client.get(`/Rating/property/${propertyId}`);

            if (response.data) {
                return ratingMapper.toFrontendList(response.data);
            } else {
                throw new Error(response.data?.message || 'Failed to fetch ratings by property');
            }
        } catch (error) {
            console.error('Error getting ratings by property:', error);
            throw error;
        }
    }

    // Get ratings by agent
    async getRatingsByAgent(agentId) {
        try {
            console.log('Fetching ratings by agent:', agentId);
            const response = await this.client.get(`/Rating/agent/${agentId}`);

            if (response.data) {
                return ratingMapper.toFrontendList(response.data);
            } else {
                throw new Error(response.data?.message || 'Failed to fetch ratings by agent');
            }
        } catch (error) {
            console.error('Error getting ratings by agent:', error);
            throw error;
        }
    }

    // Get ratings by client
    async getRatingsByClient(clientId) {
        try {
            console.log('Fetching ratings by client:', clientId);
            const response = await this.client.get(`/Rating/client/${clientId}`);

            if (response.data) {
                return ratingMapper.toFrontendList(response.data);
            } else {
                throw new Error(response.data?.message || 'Failed to fetch ratings by client');
            }
        } catch (error) {
            console.error('Error getting ratings by client:', error);
            throw error;
        }
    }

    // Get ratings by type
    async getRatingsByType(ratingType) {
        try {
            console.log('Fetching ratings by type:', ratingType);
            const response = await this.client.get(`/Rating/type/${ratingType}`);

            if (response.data) {
                return ratingMapper.toFrontendList(response.data);
            } else {
                throw new Error(response.data?.message || 'Failed to fetch ratings by type');
            }
        } catch (error) {
            console.error('Error getting ratings by type:', error);
            throw error;
        }
    }

    // Search ratings
    async searchRatings(searchCriteria) {
        try {
            console.log('Searching ratings with criteria:', searchCriteria);
            const searchRequest = ratingMapper.toSearchRequest(searchCriteria);

            const response = await this.client.get('/Rating/search', {
                params: searchRequest
            });

            if (response.data) {
                return ratingMapper.toFrontendList(response.data);
            } else {
                throw new Error(response.data?.message || 'Rating search failed');
            }
        } catch (error) {
            console.error('Error searching ratings:', error);
            throw error;
        }
    }

    // Toggle rating visibility
    async toggleRatingVisibility(id, isVisible) {
        try {
            console.log('Toggling rating visibility:', id, isVisible);
            const response = await this.client.patch(`/Rating/${id}/visibility`, {
                isVisible: isVisible
            });

            if (response.data) {
                return ratingMapper.toFrontend(response.data);
            } else {
                throw new Error(response.data?.message || 'Failed to toggle rating visibility');
            }
        } catch (error) {
            console.error('Error toggling rating visibility:', error);
            throw error;
        }
    }

    // Get rating statistics
    async getRatingStatistics(ratedId) {
        try {
            console.log('Getting rating statistics for user:', ratedId);
            const response = await this.client.get(`/Rating/statistics/${ratedId}`);

            if (response.data) {
                return {
                    averageRating: parseFloat(response.data.averageRating) || 0,
                    totalRatings: parseInt(response.data.totalRatings) || 0,
                    ratingDistribution: response.data.ratingDistribution || {
                        1: 0, 2: 0, 3: 0, 4: 0, 5: 0
                    },
                    recentRatings: ratingMapper.toFrontendList(response.data.recentRatings || [])
                };
            } else {
                throw new Error(response.data?.message || 'Failed to get rating statistics');
            }
        } catch (error) {
            console.error('Error getting rating statistics:', error);
            throw error;
        }
    }

    // Error handler
    handleError(error) {
        console.error('Rating API Error:', error);

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
                errorObj.message = 'Rating resource not found';
            } else if (error.response.status === 409) {
                errorObj.message = 'You have already rated this user';
            } else if (error.response.status === 500) {
                errorObj.message = 'Internal server error while processing rating';
            }

            return errorObj;
        } else if (error.request) {
            return {
                message: 'Network error: Unable to connect to rating service. Please check your internet connection.',
                code: 'NETWORK_ERROR',
                details: 'The rating service may be down or there may be network issues.'
            };
        } else {
            return {
                message: error.message || 'An unexpected error occurred with rating service',
                code: 'UNKNOWN_ERROR',
                details: error.stack
            };
        }
    }
}

const ratingService = new RatingService();
export default ratingService;