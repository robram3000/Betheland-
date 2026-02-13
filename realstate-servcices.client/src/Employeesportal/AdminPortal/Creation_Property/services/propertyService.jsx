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

    async createPropertyWithMedia(propertyData, images = [], videos = []) {
        try {
            console.log('Creating property with media:', { propertyData, images, videos });

            const formData = new FormData();

            // Create a clean property DTO object
            const propertyDto = {
                title: propertyData.title?.trim() || '',
                type: propertyData.type || '',
                description: propertyData.description || '',
                price: parseFloat(propertyData.price) || 0,
                status: propertyData.status || 'available',
                listedDate: propertyData.listedDate || new Date().toISOString(),
                address: propertyData.address || '',
                city: propertyData.city || '',
                state: propertyData.state || '',
                zipCode: propertyData.zipCode || '',
                country: propertyData.country || 'Philippines',
                latitude: parseFloat(propertyData.latitude) || 0,
                longitude: parseFloat(propertyData.longitude) || 0,
                bedrooms: parseInt(propertyData.bedrooms) || 0,
                bathrooms: parseFloat(propertyData.bathrooms) || 0,
                kitchen: parseInt(propertyData.kitchen) || 0,
                garage: parseInt(propertyData.garage) || 0,
                areaSqm: parseInt(propertyData.areaSqm) || 0,
                propertyAge: parseInt(propertyData.propertyAge) || 0,
                propertyFloor: parseInt(propertyData.propertyFloor) || 1,
                amenities: propertyData.amenities || [],
                ownerId: propertyData.ownerId ? parseInt(propertyData.ownerId) : null,
                agentId: propertyData.agentId ? parseInt(propertyData.agentId) : null,
                barangay: propertyData.barangay || '',
                regionCode: propertyData.regionCode || null,
                provinceCode: propertyData.provinceCode || null,
                cityCode: propertyData.cityCode || null,
                barangayCode: propertyData.barangayCode || null
            };

            console.log('Property DTO to be serialized:', propertyDto);

            // Create the complete request object that matches backend expectation
            const requestData = {
                property: propertyDto,
                imageUrls: [],
                videoUrls: []
            };

            let serializedPropertyData;
            try {
                serializedPropertyData = JSON.stringify(requestData);
                console.log('Serialized property data:', serializedPropertyData);

                // Test if it can be parsed back
                JSON.parse(serializedPropertyData);
                console.log('JSON validation passed');
            } catch (serializeError) {
                console.error('Error serializing property data:', serializeError);
                throw new Error('Invalid property data format: ' + serializeError.message);
            }

            formData.append('propertyData', serializedPropertyData);

            // Add images
            if (images && images.length > 0) {
                console.log(`Adding ${images.length} images to formData`);
                images.forEach((image, index) => {
                    if (image instanceof File) {
                        formData.append('images', image, image.name);
                    }
                });
            }

            // Add videos
            if (videos && videos.length > 0) {
                console.log(`Adding ${videos.length} videos to formData`);
                videos.forEach((video, index) => {
                    if (video instanceof File) {
                        formData.append('videos', video, video.name);
                    }
                });
            }

            // Log formData contents for debugging
            console.log('FormData entries:');
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ', pair[1]);
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

    async updatePropertyWithMedia(id, propertyData, images = [], videos = []) {
        try {
            const formData = new FormData();

            // Create a clean property DTO object
            const propertyDto = {
                id: parseInt(id),
                title: propertyData.title?.trim() || '',
                type: propertyData.type || '',
                description: propertyData.description || '',
                price: parseFloat(propertyData.price) || 0,
                status: propertyData.status || 'available',
                listedDate: propertyData.listedDate || new Date().toISOString(),
                address: propertyData.address || '',
                city: propertyData.city || '',
                state: propertyData.state || '',
                zipCode: propertyData.zipCode || '',
                country: propertyData.country || 'Philippines',
                latitude: parseFloat(propertyData.latitude) || 0,
                longitude: parseFloat(propertyData.longitude) || 0,
                bedrooms: parseInt(propertyData.bedrooms) || 0,
                bathrooms: parseFloat(propertyData.bathrooms) || 0,
                kitchen: parseInt(propertyData.kitchen) || 0,
                garage: parseInt(propertyData.garage) || 0,
                areaSqm: parseInt(propertyData.areaSqm) || 0,
                propertyAge: parseInt(propertyData.propertyAge) || 0,
                propertyFloor: parseInt(propertyData.propertyFloor) || 1,
                amenities: propertyData.amenities || [],
                ownerId: propertyData.ownerId ? parseInt(propertyData.ownerId) : null,
                agentId: propertyData.agentId ? parseInt(propertyData.agentId) : null,
                barangay: propertyData.barangay || '',
                regionCode: propertyData.regionCode || null,
                provinceCode: propertyData.provinceCode || null,
                cityCode: propertyData.cityCode || null,
                barangayCode: propertyData.barangayCode || null
            };

            // Create the complete request object
            const requestData = {
                property: propertyDto,
                imageUrls: [],
                videoUrls: []
            };

            let serializedPropertyData;
            try {
                serializedPropertyData = JSON.stringify(requestData);
                console.log('Serialized update property data:', serializedPropertyData);
            } catch (serializeError) {
                console.error('Error serializing update property data:', serializeError);
                throw new Error('Invalid property data format for update');
            }

            formData.append('propertyData', serializedPropertyData);

            // Add images
            if (images && images.length > 0) {
                images.forEach((image) => {
                    if (image instanceof File) {
                        formData.append('images', image, image.name);
                    }
                });
            }

            // Add videos
            if (videos && videos.length > 0) {
                videos.forEach((video) => {
                    if (video instanceof File) {
                        formData.append('videos', video, video.name);
                    }
                });
            }

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

    async getAllProperties() {
        try {
            console.log('🔍 Fetching all properties from API...');
            const response = await this.client.get('/CreationProperty');
            console.log('📦 API Response structure:', {
                status: response.status,
                hasData: !!response.data,
                dataKeys: response.data ? Object.keys(response.data) : 'no data',
                success: response.data?.success,
                propertiesCount: response.data?.properties?.length || 0
            });

            if (response.data) {
                // Handle different response structures
                if (response.data.success && response.data.properties) {
                    console.log('✅ Properties found:', response.data.properties.length);
                    return response.data.properties;
                } else if (Array.isArray(response.data)) {
                    console.log('✅ Direct array response:', response.data.length);
                    return response.data;
                } else if (response.data.properties) {
                    console.log('✅ Properties in data.properties:', response.data.properties.length);
                    return response.data.properties;
                } else {
                    console.log('❌ Unexpected response structure:', response.data);
                    return [];
                }
            } else {
                console.log('❌ No data in response');
                return [];
            }
        } catch (error) {
            console.error('❌ Error fetching all properties:', error);
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
            console.log(`🔍 Fetching properties for agent ID: ${agentId}`);

            const response = await this.client.get(`/CreationProperty/agent/${agentId}`);
            console.log('📦 Agent properties API response:', {
                status: response.status,
                hasData: !!response.data,
                dataKeys: response.data ? Object.keys(response.data) : 'no data',
                success: response.data?.success,
                propertiesCount: response.data?.properties?.length || 0
            });

            if (response.data && response.data.success) {
                console.log(`✅ Found ${response.data.properties?.length || 0} properties for agent ${agentId}`);

                // Handle different response structures
                if (response.data.properties && Array.isArray(response.data.properties)) {
                    return response.data.properties;
                } else if (Array.isArray(response.data)) {
                    return response.data;
                } else {
                    console.warn('❌ Unexpected response structure for agent properties:', response.data);
                    return [];
                }
            } else {
                console.log('❌ No properties found for agent or API returned failure');
                return [];
            }
        } catch (error) {
            console.error(`❌ Error fetching properties for agent ${agentId}:`, error);
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

    // Change property status - FIXED VERSION
    async changePropertyStatus(propertyId, status) {
        try {
            console.log('Changing property status:', propertyId, status);

            // First get the current property data to preserve all fields
            const currentProperty = await this.getProperty(propertyId);

            // Create complete update data with status change
            const updateData = {
                property: {
                    id: parseInt(propertyId),
                    title: currentProperty.title || '',
                    description: currentProperty.description || '',
                    type: currentProperty.type || 'residential',
                    price: parseFloat(currentProperty.price) || 0,
                    status: status, // Use the provided status
                    propertyAge: parseInt(currentProperty.propertyAge) || 0,
                    propertyFloor: parseInt(currentProperty.propertyFloor) || 1,
                    bedrooms: parseInt(currentProperty.bedrooms) || 0,
                    bathrooms: parseFloat(currentProperty.bathrooms) || 0,
                    areaSqm: parseInt(currentProperty.areaSqm) || 0,
                    kitchen: parseInt(currentProperty.kitchen) || 0,
                    garage: parseInt(currentProperty.garage) || 0,
                    address: currentProperty.address || '',
                    city: currentProperty.city || '',
                    state: currentProperty.state || '',
                    zipCode: currentProperty.zipCode || '',
                    country: currentProperty.country || '',
                    barangay: currentProperty.barangay || '',
                    latitude: parseFloat(currentProperty.latitude) || 0,
                    longitude: parseFloat(currentProperty.longitude) || 0,
                    amenities: Array.isArray(currentProperty.amenities)
                        ? JSON.stringify(currentProperty.amenities)
                        : '[]',
                    ownerId: currentProperty.ownerId || null,
                    agentId: currentProperty.agentId || null,
                    listedDate: currentProperty.listedDate || new Date().toISOString(),
                }
            };

            console.log('Sending status update data:', updateData);

            const response = await this.client.put(`/CreationProperty/${propertyId}`, updateData);

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

    // Change property handler (agent) - FIXED VERSION
    async changePropertyHandler(propertyId, agentId) {
        try {
            console.log('Changing property handler:', propertyId, agentId);

            const updateData = {
                agentId: parseInt(agentId)
            };

            const response = await this.client.put(`/CreationProperty/${propertyId}`, {
                property: updateData
            });

            if (response.data && response.data.success) {
                // Return the full updated property if available, otherwise just success
                if (response.data.property) {
                    return propertyMapper.toFrontend(response.data.property);
                }
                return { success: true, propertyId, agentId };
            } else {
                throw new Error(response.data.message || 'Failed to change property handler');
            }
        } catch (error) {
            console.error('Error changing property handler:', error);
            throw error;
        }
    }

    // Approve property - FIXED VERSION
    async approveProperty(propertyId) {
        try {
            console.log('Approving property:', propertyId);
            // Use the fixed changePropertyStatus method with 'available' status
            return await this.changePropertyStatus(propertyId, 'available');
        } catch (error) {
            console.error('Error approving property:', error);
            throw error;
        }
    }

    // Reject property - FIXED VERSION
    async rejectProperty(propertyId, reason) {
        try {
            console.log('Rejecting property:', propertyId, reason);
            // Use the fixed changePropertyStatus method with 'rejected' status
            const result = await this.changePropertyStatus(propertyId, 'rejected');

            // You can store the rejection reason separately if needed
            console.log('Rejection reason:', reason);

            return result;
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