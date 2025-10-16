import axios from 'axios';
import propertyMapper from './PropertyMapper.jsx';

const API_BASE_URL = '/api';

class PropertyService {
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

    // Create property
    async createProperty(propertyData) {
        try {
            console.log('Creating property with data:', propertyData);
            const createRequest = propertyMapper.toCreateRequest(propertyData);
            console.log('Mapped create request:', createRequest);

            const response = await this.client.post('/CreationProperty', createRequest);

            if (response.data && response.data.success) {
                console.log('Property created successfully:', response.data);
                return response.data.property || response.data;
            } else {
                throw new Error(response.data.message || 'Failed to create property');
            }
        } catch (error) {
            console.error('Error creating property:', error);
            throw error;
        }
    }

    // Create property with media
    async createPropertyWithMedia(propertyData, images = [], videos = []) {
        try {
            console.log('Creating property with media:', { propertyData, images, videos });

            const formData = new FormData();
            const propertyDto = {
                title: propertyData.title,
                type: propertyData.type,
                description: propertyData.description,
                price: propertyData.price,
                status: propertyData.status,
                listedDate: propertyData.listedDate,
                address: propertyData.address,
                city: propertyData.city,
                state: propertyData.state,
                zipCode: propertyData.zipCode,
                country: propertyData.country,
                latitude: propertyData.latitude,
                longitude: propertyData.longitude,
                bedrooms: propertyData.bedrooms,
                bathrooms: propertyData.bathrooms,
                kitchen: propertyData.kitchen,
                garage: propertyData.garage,
                areaSqm: propertyData.areaSqm,
                propertyAge: propertyData.propertyAge,
                propertyFloor: propertyData.propertyFloor,
                amenities: propertyData.amenities || [],
                ownerId: propertyData.ownerId,
                agentId: propertyData.agentId
            };

            let serializedPropertyData;
            try {
                serializedPropertyData = JSON.stringify(propertyDto);
            } catch (serializeError) {
                console.error('Error serializing property data:', serializeError);
                throw new Error('Invalid property data format');
            }

            formData.append('propertyData', serializedPropertyData);

            if (images && images.length > 0) {
                images.forEach((image) => {
                    if (image instanceof File) {
                        formData.append('images', image);
                    }
                });
            }

            if (videos && videos.length > 0) {
                videos.forEach((video) => {
                    if (video instanceof File) {
                        formData.append('videos', video);
                    }
                });
            }

            const response = await this.client.post('/CreationProperty/with-media', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 60000,
                maxContentLength: 100 * 1024 * 1024,
                maxBodyLength: 100 * 1024 * 1024,
            });

            if (response.data && response.data.success) {
                return response.data.property || response.data;
            } else {
                throw new Error(response.data.message || 'Failed to create property with media');
            }
        } catch (error) {
            console.error('Error creating property with media:', error);
            throw error;
        }
    }

    // Update property
    async updateProperty(id, propertyData) {
        try {
            console.log('Updating property:', id, propertyData);
            const updateRequest = propertyMapper.toUpdateRequest({
                ...propertyData,
                id: id
            });

            const response = await this.client.put(`/CreationProperty/${id}`, updateRequest);

            if (response.data && response.data.success) {
                return response.data.property || response.data;
            } else {
                throw new Error(response.data.message || 'Failed to update property');
            }
        } catch (error) {
            console.error('Error updating property:', error);
            throw error;
        }
    }

    // Update property with media
    async updatePropertyWithMedia(id, propertyData, images = [], videos = []) {
        try {
            const formData = propertyMapper.toUpdateFormData({
                ...propertyData,
                id: id
            }, images, videos);

            const response = await this.client.put(`/CreationProperty/with-media/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 60000,
            });

            if (response.data && response.data.success) {
                return response.data.property || response.data;
            } else {
                throw new Error(response.data.message || 'Failed to update property with media');
            }
        } catch (error) {
            console.error('Error updating property with media:', error);
            throw error;
        }
    }

    // Get property by ID
    async getProperty(id) {
        try {
            const response = await this.client.get(`/CreationProperty/${id}`);

            if (response.data && response.data.success) {
                return propertyMapper.toFrontend(response.data.property);
            } else {
                throw new Error(response.data.message || 'Property not found');
            }
        } catch (error) {
            console.error('Error getting property:', error);
            throw error;
        }
    }

    // Get all properties
    async getAllProperties() {
        try {
            const response = await this.client.get('/CreationProperty');

            if (response.data && response.data.success) {
                return propertyMapper.toFrontendList(response.data.properties);
            } else {
                throw new Error(response.data.message || 'Failed to fetch properties');
            }
        } catch (error) {
            console.error('Error getting all properties:', error);
            throw error;
        }
    }

    // Get properties by status
    async getPropertiesByStatus(status) {
        try {
            const response = await this.client.get(`/CreationProperty/status/${status}`);

            if (response.data && response.data.success) {
                return propertyMapper.toFrontendList(response.data.properties);
            } else {
                throw new Error(response.data.message || 'Failed to fetch properties by status');
            }
        } catch (error) {
            console.error('Error getting properties by status:', error);
            throw error;
        }
    }

    // Get properties by owner
    async getPropertiesByOwner(ownerId) {
        try {
            const response = await this.client.get(`/CreationProperty/owner/${ownerId}`);

            if (response.data && response.data.success) {
                return propertyMapper.toFrontendList(response.data.properties);
            } else {
                throw new Error(response.data.message || 'Failed to fetch properties by owner');
            }
        } catch (error) {
            console.error('Error getting properties by owner:', error);
            throw error;
        }
    }

    // Get properties by agent
    async getPropertiesByAgent(agentId) {
        try {
            const response = await this.client.get(`/CreationProperty/agent/${agentId}`);

            if (response.data && response.data.success) {
                return propertyMapper.toFrontendList(response.data.properties);
            } else {
                throw new Error(response.data.message || 'Failed to fetch properties by agent');
            }
        } catch (error) {
            console.error('Error getting properties by agent:', error);
            throw error;
        }
    }

    // Search properties
    async searchProperties(searchCriteria) {
        try {
            const response = await this.client.get('/CreationProperty/search', {
                params: { q: searchCriteria }
            });

            if (response.data && response.data.success) {
                return propertyMapper.toFrontendList(response.data.properties);
            } else {
                throw new Error(response.data.message || 'Search failed');
            }
        } catch (error) {
            console.error('Error searching properties:', error);
            throw error;
        }
    }

    // Delete property
    async deleteProperty(id) {
        try {
            const response = await this.client.delete(`/CreationProperty/${id}`);

            if (response.data && response.data.success) {
                return response.data;
            } else {
                throw new Error(response.data.message || 'Failed to delete property');
            }
        } catch (error) {
            console.error('Error deleting property:', error);
            throw error;
        }
    }

    // Change property status
    async changePropertyStatus(propertyId, status) {
        try {
            console.log('Changing property status:', propertyId, status);

            const updateData = {
                status: status
            };

            const response = await this.client.put(`/CreationProperty/${propertyId}`, {
                property: updateData
            });

            if (response.data && response.data.success) {
                return response.data.property || response.data;
            } else {
                throw new Error(response.data.message || 'Failed to change property status');
            }
        } catch (error) {
            console.error('Error changing property status:', error);
            throw error;
        }
    }

    // Change property handler (agent)
    async changePropertyHandler(propertyId, agentId) {
        try {
            console.log('Changing property handler:', propertyId, agentId);

            const updateData = {
                agentId: agentId
            };

            const response = await this.client.put(`/CreationProperty/${propertyId}`, {
                property: updateData
            });

            if (response.data && response.data.success) {
                return response.data.property || response.data;
            } else {
                throw new Error(response.data.message || 'Failed to change property handler');
            }
        } catch (error) {
            console.error('Error changing property handler:', error);
            throw error;
        }
    }

    // Approve property
    async approveProperty(propertyId) {
        try {
            console.log('Approving property:', propertyId);

            const updateData = {
                status: 'approved'
            };

            const response = await this.client.put(`/CreationProperty/${propertyId}`, {
                property: updateData
            });

            if (response.data && response.data.success) {
                return response.data.property || response.data;
            } else {
                throw new Error(response.data.message || 'Failed to approve property');
            }
        } catch (error) {
            console.error('Error approving property:', error);
            throw error;
        }
    }

    // Reject property
    async rejectProperty(propertyId, reason) {
        try {
            console.log('Rejecting property:', propertyId, reason);

            const updateData = {
                status: 'rejected'
            };

            const response = await this.client.put(`/CreationProperty/${propertyId}`, {
                property: updateData
            });

            if (response.data && response.data.success) {
                return response.data.property || response.data;
            } else {
                throw new Error(response.data.message || 'Failed to reject property');
            }
        } catch (error) {
            console.error('Error rejecting property:', error);
            throw error;
        }
    }

    // Upload images only
    async uploadImages(files) {
        try {
            const formData = new FormData();
            files.forEach(file => {
                formData.append('files', file);
            });

            const response = await this.client.post('/CreationProperty/upload-images', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 60000,
            });

            if (response.data && response.data.success) {
                return response.data.imageUrls || [];
            } else {
                throw new Error(response.data.message || 'Failed to upload images');
            }
        } catch (error) {
            console.error('Error uploading images:', error);
            throw error;
        }
    }

    // Upload videos only
    async uploadVideos(files) {
        try {
            const formData = new FormData();
            files.forEach(file => {
                formData.append('files', file);
            });

            const response = await this.client.post('/CreationProperty/upload-videos', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 60000,
            });

            if (response.data && response.data.success) {
                return response.data.videoUrls || [];
            } else {
                throw new Error(response.data.message || 'Failed to upload videos');
            }
        } catch (error) {
            console.error('Error uploading videos:', error);
            throw error;
        }
    }

    // Add images to existing property
    async addPropertyImages(propertyId, imageUrls) {
        try {
            const response = await this.client.post(`/CreationProperty/${propertyId}/images`, {
                imageUrls: imageUrls
            });

            if (response.data && response.data.success) {
                return response.data.property || response.data;
            } else {
                throw new Error(response.data.message || 'Failed to add images to property');
            }
        } catch (error) {
            console.error('Error adding property images:', error);
            throw error;
        }
    }

    // Add videos to existing property
    async addPropertyVideos(propertyId, videoUrls) {
        try {
            const response = await this.client.post(`/CreationProperty/${propertyId}/videos`, {
                videoUrls: videoUrls
            });

            if (response.data && response.data.success) {
                return response.data.property || response.data;
            } else {
                throw new Error(response.data.message || 'Failed to add videos to property');
            }
        } catch (error) {
            console.error('Error adding property videos:', error);
            throw error;
        }
    }

    // Delete image
    async deleteImage(imageUrl) {
        try {
            const response = await this.client.delete(`/CreationProperty/image/${encodeURIComponent(imageUrl)}`);

            if (response.data && response.data.success) {
                return response.data;
            } else {
                throw new Error(response.data.message || 'Failed to delete image');
            }
        } catch (error) {
            console.error('Error deleting image:', error);
            throw error;
        }
    }

    // Delete video
    async deleteVideo(videoUrl) {
        try {
            const response = await this.client.delete(`/CreationProperty/video/${encodeURIComponent(videoUrl)}`);

            if (response.data && response.data.success) {
                return response.data;
            } else {
                throw new Error(response.data.message || 'Failed to delete video');
            }
        } catch (error) {
            console.error('Error deleting video:', error);
            throw error;
        }
    }

    // Get video info
    async getVideoInfo(videoUrl) {
        try {
            const response = await this.client.get('/CreationProperty/video-info', {
                params: { videoUrl }
            });

            if (response.data && response.data.success) {
                return response.data;
            } else {
                throw new Error(response.data.message || 'Failed to get video info');
            }
        } catch (error) {
            console.error('Error getting video info:', error);
            throw error;
        }
    }

    // Error handler
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

const propertyService = new PropertyService();
export default propertyService;