import api from '../../../../Authpage/Services/Api';
import propertyMapper from './PropertyMapper';
import {
    PropertyError,
    propertyErrorHandler,
    propertyValidator,
    createPropertyServiceWithErrorHandling
} from './PropertyErrorHandler';

// Base service methods
const propertyServiceBase = {
    // Create property with different media options
    async createProperty(propertyData) {
        try {
            // Validate data first
            propertyValidator.validateCreateProperty(propertyData);

            const createRequest = propertyMapper.toCreateRequest(propertyData);
            const response = await api.post('/creationproperty', createRequest);

            if (!response.data) {
                throw new Error('No data received from server');
            }

            return propertyMapper.toFrontend(response.data.property || response.data);
        } catch (error) {
            throw propertyErrorHandler.handleServiceError(error, 'createProperty');
        }
    },

    async createPropertyWithImages(propertyData, images = []) {
        try {
            propertyValidator.validateCreateProperty(propertyData);

            const formData = propertyMapper.toFormData(propertyData, images, []);
            const response = await api.post('/creationproperty/with-images', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (!response.data) {
                throw new Error('No data received from server');
            }

            return propertyMapper.toFrontend(response.data.property || response.data);
        } catch (error) {
            throw propertyErrorHandler.handleServiceError(error, 'createPropertyWithImages');
        }
    },

    async createPropertyWithVideos(propertyData, videos = []) {
        try {
            propertyValidator.validateCreateProperty(propertyData);

            const formData = propertyMapper.toFormData(propertyData, [], videos);
            const response = await api.post('/creationproperty/with-videos', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (!response.data) {
                throw new Error('No data received from server');
            }

            return propertyMapper.toFrontend(response.data.property || response.data);
        } catch (error) {
            throw propertyErrorHandler.handleServiceError(error, 'createPropertyWithVideos');
        }
    },

    async createPropertyWithMedia(propertyData, images = [], videos = []) {
        try {
            propertyValidator.validateCreateProperty(propertyData);

            const formData = propertyMapper.toFormData(propertyData, images, videos);
            const response = await api.post('/creationproperty/with-media', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (!response.data) {
                throw new Error('No data received from server');
            }

            return propertyMapper.toFrontend(response.data.property || response.data);
        } catch (error) {
            throw propertyErrorHandler.handleServiceError(error, 'createPropertyWithMedia');
        }
    },

    // Get properties
    async getProperties() {
        try {
            const response = await api.get('/creationproperty');

            if (!response.data) {
                console.warn('No data received from properties API');
                return [];
            }

            // Handle different response structures
            let properties = [];
            if (response.data.properties) {
                properties = response.data.properties;
            } else if (Array.isArray(response.data)) {
                properties = response.data;
            } else if (response.data.data) {
                properties = response.data.data;
            } else if (response.data) {
                properties = [response.data];
            }

            return propertyMapper.toFrontendList(properties);
        } catch (error) {
            throw propertyErrorHandler.handleServiceError(error, 'getProperties');
        }
    },

    async getProperty(id) {
        try {
            if (!id) {
                throw new PropertyError('Property ID is required', 'VALIDATION_ERROR');
            }

            const response = await api.get(`/creationproperty/${id}`);

            if (!response.data) {
                throw new PropertyError('Property not found', 'NOT_FOUND');
            }

            return propertyMapper.toFrontend(response.data.property || response.data);
        } catch (error) {
            throw propertyErrorHandler.handleServiceError(error, 'getProperty');
        }
    },

    async getPropertiesByOwner(ownerId) {
        try {
            if (!ownerId) {
                throw new PropertyError('Owner ID is required', 'VALIDATION_ERROR');
            }

            const response = await api.get(`/creationproperty/owner/${ownerId}`);

            if (!response.data) {
                return [];
            }

            const properties = response.data.properties || response.data || [];
            return propertyMapper.toFrontendList(properties);
        } catch (error) {
            throw propertyErrorHandler.handleServiceError(error, 'getPropertiesByOwner');
        }
    },

    async getPropertiesByAgent(agentId) {
        try {
            if (!agentId) {
                throw new PropertyError('Agent ID is required', 'VALIDATION_ERROR');
            }

            const response = await api.get(`/creationproperty/agent/${agentId}`);

            if (!response.data) {
                return [];
            }

            const properties = response.data.properties || response.data || [];
            return propertyMapper.toFrontendList(properties);
        } catch (error) {
            throw propertyErrorHandler.handleServiceError(error, 'getPropertiesByAgent');
        }
    },

    async getPropertiesByStatus(status) {
        try {
            if (!status) {
                throw new PropertyError('Status is required', 'VALIDATION_ERROR');
            }

            const response = await api.get(`/creationproperty/status/${status}`);

            if (!response.data) {
                return [];
            }

            const properties = response.data.properties || response.data || [];
            return propertyMapper.toFrontendList(properties);
        } catch (error) {
            throw propertyErrorHandler.handleServiceError(error, 'getPropertiesByStatus');
        }
    },

    // Approval queue methods
    async getPendingProperties() {
        try {
            const response = await api.get('/creationproperty/status/pending');

            if (!response.data) {
                return [];
            }

            const properties = response.data.properties || response.data || [];
            return propertyMapper.toFrontendList(properties);
        } catch (error) {
            throw propertyErrorHandler.handleServiceError(error, 'getPendingProperties');
        }
    },

    async approveProperty(propertyId) {
        try {
            if (!propertyId) {
                throw new PropertyError('Property ID is required', 'VALIDATION_ERROR');
            }

            const response = await api.put(`/creationproperty/${propertyId}/approve`);

            if (!response.data) {
                throw new Error('No response from approval API');
            }

            return response.data;
        } catch (error) {
            throw propertyErrorHandler.handleServiceError(error, 'approveProperty');
        }
    },

    async rejectProperty(propertyId, reason) {
        try {
            if (!propertyId) {
                throw new PropertyError('Property ID is required', 'VALIDATION_ERROR');
            }

            if (!reason?.trim()) {
                throw new PropertyError('Rejection reason is required', 'VALIDATION_ERROR');
            }

            const response = await api.put(`/creationproperty/${propertyId}/reject`, { reason });

            if (!response.data) {
                throw new Error('No response from rejection API');
            }

            return response.data;
        } catch (error) {
            throw propertyErrorHandler.handleServiceError(error, 'rejectProperty');
        }
    },

    async changePropertyHandler(propertyId, agentId) {
        try {
            if (!propertyId) {
                throw new PropertyError('Property ID is required', 'VALIDATION_ERROR');
            }

            const response = await api.put(`/creationproperty/${propertyId}/handler`, { agentId });

            if (!response.data) {
                throw new Error('No response from handler change API');
            }

            return propertyMapper.toFrontend(response.data.property || response.data);
        } catch (error) {
            throw propertyErrorHandler.handleServiceError(error, 'changePropertyHandler');
        }
    },

    // Update property with different media options
    async updateProperty(id, propertyData) {
        try {
            if (!id) {
                throw new PropertyError('Property ID is required', 'VALIDATION_ERROR');
            }

            propertyValidator.validateUpdateProperty({ ...propertyData, id });

            const updateRequest = propertyMapper.toUpdateRequest(propertyData);
            const response = await api.put(`/creationproperty/${id}`, updateRequest);

            if (!response.data) {
                throw new Error('No data received from server');
            }

            return propertyMapper.toFrontend(response.data.property || response.data);
        } catch (error) {
            throw propertyErrorHandler.handleServiceError(error, 'updateProperty');
        }
    },

    async updatePropertyWithImages(id, propertyData, images = []) {
        try {
            if (!id) {
                throw new PropertyError('Property ID is required', 'VALIDATION_ERROR');
            }

            propertyValidator.validateUpdateProperty({ ...propertyData, id });

            const formData = propertyMapper.toUpdateFormData(propertyData, images, []);
            const response = await api.put(`/creationproperty/with-images/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (!response.data) {
                throw new Error('No data received from server');
            }

            return propertyMapper.toFrontend(response.data.property || response.data);
        } catch (error) {
            throw propertyErrorHandler.handleServiceError(error, 'updatePropertyWithImages');
        }
    },

    async updatePropertyWithVideos(id, propertyData, videos = []) {
        try {
            if (!id) {
                throw new PropertyError('Property ID is required', 'VALIDATION_ERROR');
            }

            propertyValidator.validateUpdateProperty({ ...propertyData, id });

            const formData = propertyMapper.toUpdateFormData(propertyData, [], videos);
            const response = await api.put(`/creationproperty/with-videos/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (!response.data) {
                throw new Error('No data received from server');
            }

            return propertyMapper.toFrontend(response.data.property || response.data);
        } catch (error) {
            throw propertyErrorHandler.handleServiceError(error, 'updatePropertyWithVideos');
        }
    },

    async updatePropertyWithMedia(id, propertyData, images = [], videos = []) {
        try {
            if (!id) {
                throw new PropertyError('Property ID is required', 'VALIDATION_ERROR');
            }

            propertyValidator.validateUpdateProperty({ ...propertyData, id });

            const formData = propertyMapper.toUpdateFormData(propertyData, images, videos);
            const response = await api.put(`/creationproperty/with-media/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (!response.data) {
                throw new Error('No data received from server');
            }

            return propertyMapper.toFrontend(response.data.property || response.data);
        } catch (error) {
            throw propertyErrorHandler.handleServiceError(error, 'updatePropertyWithMedia');
        }
    },

    // Delete operations
    async deleteProperty(id) {
        try {
            if (!id) {
                throw new PropertyError('Property ID is required', 'VALIDATION_ERROR');
            }

            const response = await api.delete(`/creationproperty/${id}`);

            if (!response.data) {
                throw new Error('No response from delete API');
            }

            return response.data;
        } catch (error) {
            throw propertyErrorHandler.handleServiceError(error, 'deleteProperty');
        }
    },

    async deleteImage(imageUrl) {
        try {
            if (!imageUrl) {
                throw new PropertyError('Image URL is required', 'VALIDATION_ERROR');
            }

            const response = await api.delete(`/creationproperty/image/${encodeURIComponent(imageUrl)}`);
            return response.data;
        } catch (error) {
            throw propertyErrorHandler.handleServiceError(error, 'deleteImage');
        }
    },

    async deleteVideo(videoUrl) {
        try {
            if (!videoUrl) {
                throw new PropertyError('Video URL is required', 'VALIDATION_ERROR');
            }

            const response = await api.delete(`/creationproperty/video/${encodeURIComponent(videoUrl)}`);
            return response.data;
        } catch (error) {
            throw propertyErrorHandler.handleServiceError(error, 'deleteVideo');
        }
    },

    // Search operations
    async searchProperties(searchTerm) {
        try {
            if (!searchTerm?.trim()) {
                return [];
            }

            const response = await api.get('/creationproperty/search', {
                params: { q: searchTerm }
            });

            if (!response.data) {
                return [];
            }

            const properties = response.data.properties || response.data || [];
            return propertyMapper.toFrontendList(properties);
        } catch (error) {
            throw propertyErrorHandler.handleServiceError(error, 'searchProperties');
        }
    },

    async searchPropertiesAdvanced(searchCriteria) {
        try {
            const searchRequest = propertyMapper.toSearchRequest(searchCriteria);
            const response = await api.get('/creationproperty/search', {
                params: searchRequest
            });

            if (!response.data) {
                return [];
            }

            const properties = response.data.properties || response.data || [];
            return propertyMapper.toFrontendList(properties);
        } catch (error) {
            throw propertyErrorHandler.handleServiceError(error, 'searchPropertiesAdvanced');
        }
    },

    // Media upload operations
    async uploadImages(images) {
        try {
            if (!images || !Array.isArray(images) || images.length === 0) {
                throw new PropertyError('No images provided for upload', 'VALIDATION_ERROR');
            }

            // Validate files
            propertyValidator.validateFiles(images, {
                maxSize: 10 * 1024 * 1024, // 10MB
                allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
            });

            const formData = new FormData();
            images.forEach((image, index) => {
                if (image instanceof File) {
                    formData.append('files', image);
                }
            });

            const response = await api.post('/creationproperty/upload-images', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (!response.data) {
                throw new Error('No response from upload API');
            }

            return response.data;
        } catch (error) {
            throw propertyErrorHandler.handleServiceError(error, 'uploadImages');
        }
    },

    async uploadVideos(videos) {
        try {
            if (!videos || !Array.isArray(videos) || videos.length === 0) {
                throw new PropertyError('No videos provided for upload', 'VALIDATION_ERROR');
            }

            // Validate files
            propertyValidator.validateFiles(videos, {
                maxSize: 50 * 1024 * 1024, // 50MB
                allowedTypes: ['video/mp4', 'video/mov', 'video/avi', 'video/webm']
            });

            const formData = new FormData();
            videos.forEach((video, index) => {
                if (video instanceof File) {
                    formData.append('files', video);
                }
            });

            const response = await api.post('/creationproperty/upload-videos', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (!response.data) {
                throw new Error('No response from upload API');
            }

            return response.data;
        } catch (error) {
            throw propertyErrorHandler.handleServiceError(error, 'uploadVideos');
        }
    },

    // Media management
    async addPropertyImages(propertyId, imageUrls) {
        try {
            if (!propertyId) {
                throw new PropertyError('Property ID is required', 'VALIDATION_ERROR');
            }

            if (!imageUrls || !Array.isArray(imageUrls)) {
                throw new PropertyError('Image URLs are required', 'VALIDATION_ERROR');
            }

            const response = await api.post(`/creationproperty/${propertyId}/images`, {
                imageUrls: imageUrls
            });

            if (!response.data) {
                throw new Error('No response from API');
            }

            return propertyMapper.toFrontend(response.data.property || response.data);
        } catch (error) {
            throw propertyErrorHandler.handleServiceError(error, 'addPropertyImages');
        }
    },

    async addPropertyVideos(propertyId, videoUrls) {
        try {
            if (!propertyId) {
                throw new PropertyError('Property ID is required', 'VALIDATION_ERROR');
            }

            if (!videoUrls || !Array.isArray(videoUrls)) {
                throw new PropertyError('Video URLs are required', 'VALIDATION_ERROR');
            }

            const response = await api.post(`/creationproperty/${propertyId}/videos`, {
                videoUrls: videoUrls
            });

            if (!response.data) {
                throw new Error('No response from API');
            }

            return propertyMapper.toFrontend(response.data.property || response.data);
        } catch (error) {
            throw propertyErrorHandler.handleServiceError(error, 'addPropertyVideos');
        }
    },

    // Video info
    async getVideoInfo(videoUrl) {
        try {
            if (!videoUrl) {
                throw new PropertyError('Video URL is required', 'VALIDATION_ERROR');
            }

            const response = await api.get('/creationproperty/video-info', {
                params: { videoUrl: videoUrl }
            });

            if (!response.data) {
                throw new Error('No response from video info API');
            }

            return response.data;
        } catch (error) {
            throw propertyErrorHandler.handleServiceError(error, 'getVideoInfo');
        }
    },

    // Utility methods
    async getPropertyCount() {
        try {
            const response = await api.get('/api/creationproperty');
            return response.data?.totalCount || 0;
        } catch (error) {
            throw propertyErrorHandler.handleServiceError(error, 'getPropertyCount');
        }
    },

    async getPropertiesByAgentCount(agentId) {
        try {
            if (!agentId) {
                return 0;
            }

            const response = await api.get(`/api/creationproperty/agent/${agentId}`);
            return response.data?.totalCount || 0;
        } catch (error) {
            throw propertyErrorHandler.handleServiceError(error, 'getPropertiesByAgentCount');
        }
    },

    async getPropertiesByOwnerCount(ownerId) {
        try {
            if (!ownerId) {
                return 0;
            }

            const response = await api.get(`/api/creationproperty/owner/${ownerId}`);
            return response.data?.totalCount || 0;
        } catch (error) {
            throw propertyErrorHandler.handleServiceError(error, 'getPropertiesByOwnerCount');
        }
    },

    // Simplified data methods
    async getSimpleProperties() {
        try {
            const response = await api.get('/api/creationproperty');

            if (!response.data) {
                return [];
            }

            const properties = response.data.properties || response.data || [];
            return propertyMapper.toSimplePropertyList(properties);
        } catch (error) {
            throw propertyErrorHandler.handleServiceError(error, 'getSimpleProperties');
        }
    },

    async getSimplePropertiesByOwner(ownerId) {
        try {
            if (!ownerId) {
                return [];
            }

            const response = await api.get(`/api/creationproperty/owner/${ownerId}`);

            if (!response.data) {
                return [];
            }

            const properties = response.data.properties || response.data || [];
            return propertyMapper.toSimplePropertyList(properties);
        } catch (error) {
            throw propertyErrorHandler.handleServiceError(error, 'getSimplePropertiesByOwner');
        }
    },

    async getSimplePropertiesByAgent(agentId) {
        try {
            if (!agentId) {
                return [];
            }

            const response = await api.get(`/api/creationproperty/agent/${agentId}`);

            if (!response.data) {
                return [];
            }

            const properties = response.data.properties || response.data || [];
            return propertyMapper.toSimplePropertyList(properties);
        } catch (error) {
            throw propertyErrorHandler.handleServiceError(error, 'getSimplePropertiesByAgent');
        }
    }
};

// Create the enhanced service with error handling
const propertyService = createPropertyServiceWithErrorHandling(propertyServiceBase);

export default propertyService;