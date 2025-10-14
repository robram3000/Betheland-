import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Log request for debugging
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        console.log(`API Response: ${response.status} ${response.config.url}`, response.data);
        return response;
    },
    (error) => {
        console.error('API Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        return Promise.reject(error);
    }
);

export const propertyService = {
    // Get all properties
    getAllProperties: async () => {
        try {
            const response = await api.get('/CreationProperty');
            console.log('Get all properties response:', response.data);

            // Handle nested response structure
            if (response.data && response.data.properties) {
                return response.data.properties;
            }
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.response?.data || error.message;
            console.error('Get all properties error:', errorMessage);
            throw new Error(`Failed to fetch properties: ${errorMessage}`);
        }
    },

    // Get property by ID
    getPropertyById: async (id) => {
        try {
            const response = await api.get(`/CreationProperty/${id}`);
            console.log('Get property by ID response:', response.data);
            return response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                throw new Error('Property not found');
            }
            const errorMessage = error.response?.data?.message || error.response?.data || error.message;
            throw new Error(`Failed to fetch property: ${errorMessage}`);
        }
    },

    // Create new property (JSON)
    createProperty: async (propertyData) => {
        try {
            const requestData = {
                Property: {
                    Title: propertyData.title,
                    Description: propertyData.description,
                    Type: propertyData.type,
                    Price: parseFloat(propertyData.price),
                    PropertyAge: parseInt(propertyData.propertyAge) || 0,
                    PropertyFloor: parseInt(propertyData.propertyFloor) || 1,
                    Bedrooms: parseInt(propertyData.bedrooms),
                    Bathrooms: parseFloat(propertyData.bathrooms),
                    AreaSqft: parseInt(propertyData.areaSqft),
                    Address: propertyData.address,
                    City: propertyData.city,
                    State: propertyData.state,
                    ZipCode: propertyData.zipCode,
                    Latitude: propertyData.latitude ? parseFloat(propertyData.latitude) : null,
                    Longitude: propertyData.longitude ? parseFloat(propertyData.longitude) : null,
                    Status: propertyData.status,
                    Amenities: propertyData.amenities || "[]",
                    OwnerId: propertyData.ownerId || null,
                    AgentId: propertyData.agentId || null,
                    ListedDate: new Date().toISOString()
                },
                ImageUrls: propertyData.imageUrls || [],
                VideoUrls: propertyData.videoUrls || []
            };

            console.log('Creating property with data:', requestData);
            const response = await api.post('/CreationProperty', requestData);
            console.log('Create property response:', response.data);
            return response.data;
        } catch (error) {
            if (error.response?.status === 400) {
                throw new Error(`Validation error: ${JSON.stringify(error.response.data)}`);
            }
            const errorMessage = error.response?.data?.message || error.response?.data || error.message;
            throw new Error(`Failed to create property: ${errorMessage}`);
        }
    },

    // Create property with media (multipart) - FIXED ENDPOINT
    createPropertyWithImages: async (formData) => {
        try {
            console.log('Creating property with media...');
            console.log('FormData entries:');

            // Log form data contents for debugging
            for (let [key, value] of formData.entries()) {
                if (key === 'images' || key === 'videos') {
                    console.log(`${key} file: ${value.name} (${value.size} bytes)`);
                } else {
                    console.log(`${key}:`, value);
                }
            }

            // FIXED: Changed endpoint from '/CreationProperty/with-images' to '/CreationProperty/with-media'
            const response = await api.post('/CreationProperty/with-media', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 60000,
            });

            console.log('Property created successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error creating property with media:', error);
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.errors?.[0] ||
                error.response?.data ||
                error.message;
            throw new Error(`Failed to create property with media: ${errorMessage}`);
        }
    },

    // Update property (JSON)
    updateProperty: async (id, propertyData) => {
        try {
            const requestData = {
                Property: {
                    Id: parseInt(id),
                    Title: propertyData.title,
                    Description: propertyData.description,
                    Type: propertyData.type,
                    Price: parseFloat(propertyData.price),
                    PropertyAge: parseInt(propertyData.propertyAge) || 0,
                    PropertyFloor: parseInt(propertyData.propertyFloor) || 1,
                    Bedrooms: parseInt(propertyData.bedrooms),
                    Bathrooms: parseFloat(propertyData.bathrooms),
                    AreaSqft: parseInt(propertyData.areaSqft),
                    Address: propertyData.address,
                    City: propertyData.city,
                    State: propertyData.state,
                    ZipCode: propertyData.zipCode,
                    Latitude: propertyData.latitude ? parseFloat(propertyData.latitude) : null,
                    Longitude: propertyData.longitude ? parseFloat(propertyData.longitude) : null,
                    Status: propertyData.status,
                    Amenities: propertyData.amenities || "[]",
                    OwnerId: propertyData.ownerId || null,
                    AgentId: propertyData.agentId || null
                },
                ImageUrls: propertyData.imageUrls || [],
                VideoUrls: propertyData.videoUrls || []
            };

            console.log('Updating property with data:', requestData);
            const response = await api.put(`/CreationProperty/${id}`, requestData);
            console.log('Update property response:', response.data);
            return response.data;
        } catch (error) {
            if (error.response?.status === 400) {
                throw new Error(`Validation error: ${JSON.stringify(error.response.data)}`);
            }
            if (error.response?.status === 404) {
                throw new Error('Property not found');
            }
            const errorMessage = error.response?.data?.message || error.response?.data || error.message;
            throw new Error(`Failed to update property: ${errorMessage}`);
        }
    },

    // Update property with media (multipart) - FIXED ENDPOINT
    updatePropertyWithImages: async (id, formData) => {
        try {
            console.log('Updating property with media...');

            // FIXED: Changed endpoint from '/CreationProperty/with-images' to '/CreationProperty/with-media'
            const response = await api.put(`/CreationProperty/with-media/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 60000,
            });

            console.log('Property updated successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error updating property with media:', error);
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.errors?.[0] ||
                error.response?.data ||
                error.message;
            throw new Error(`Failed to update property with media: ${errorMessage}`);
        }
    },

    // Delete property
    deleteProperty: async (id) => {
        try {
            console.log('Deleting property:', id);
            await api.delete(`/CreationProperty/${id}`);
            console.log('Property deleted successfully');
            return true;
        } catch (error) {
            if (error.response?.status === 404) {
                throw new Error('Property not found');
            }
            const errorMessage = error.response?.data?.message || error.response?.data || error.message;
            throw new Error(`Failed to delete property: ${errorMessage}`);
        }
    },

    // Get properties by status
    getPropertiesByStatus: async (status) => {
        try {
            const response = await api.get(`/CreationProperty/status/${status}`);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.response?.data || error.message;
            throw new Error(`Failed to fetch properties by status: ${errorMessage}`);
        }
    },

    // Search properties
    searchProperties: async (searchTerm) => {
        try {
            const response = await api.get('/CreationProperty/search', {
                params: { q: searchTerm }
            });
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.response?.data || error.message;
            throw new Error(`Failed to search properties: ${errorMessage}`);
        }
    },

    // Get properties by agent ID
    getPropertiesByAgentId: async (agentId) => {
        try {
            const response = await api.get(`/CreationProperty/agent/${agentId}`);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.response?.data || error.message;
            throw new Error(`Failed to fetch agent properties: ${errorMessage}`);
        }
    },

    // Get properties by owner ID
    getPropertiesByOwnerId: async (ownerId) => {
        try {
            const response = await api.get(`/CreationProperty/owner/${ownerId}`);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.response?.data || error.message;
            throw new Error(`Failed to fetch owner properties: ${errorMessage}`);
        }
    },

    // Upload images only
    uploadImages: async (formData) => {
        try {
            const response = await api.post('/CreationProperty/upload-images', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 60000,
            });
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.response?.data || error.message;
            throw new Error(`Failed to upload images: ${errorMessage}`);
        }
    },

    // Delete image
    deleteImage: async (imageUrl) => {
        try {
            const response = await api.delete(`/CreationProperty/image/${encodeURIComponent(imageUrl)}`);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.response?.data || error.message;
            throw new Error(`Failed to delete image: ${errorMessage}`);
        }
    },

    // Upload videos only
    uploadVideos: async (formData) => {
        try {
            const response = await api.post('/CreationProperty/upload-videos', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 60000,
            });
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.response?.data || error.message;
            throw new Error(`Failed to upload videos: ${errorMessage}`);
        }
    },

    // Delete video
    deleteVideo: async (videoUrl) => {
        try {
            const response = await api.delete(`/CreationProperty/video/${encodeURIComponent(videoUrl)}`);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.response?.data || error.message;
            throw new Error(`Failed to delete video: ${errorMessage}`);
        }
    }
};

export default propertyService;