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
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export const propertyService = {
    // Get all properties
    getAllProperties: async () => {
        try {
            const response = await api.get('/CreationProperty');
            // Handle nested response structure
            if (response.data && response.data.properties) {
                return response.data.properties;
            }
            return response.data;
        } catch (error) {
            throw new Error(`Failed to fetch properties: ${error.response?.data?.message || error.message}`);
        }
    },

    // Get property by ID
    getPropertyById: async (id) => {
        try {
            const response = await api.get(`/CreationProperty/${id}`);
            return response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                throw new Error('Property not found');
            }
            throw new Error(`Failed to fetch property: ${error.response?.data?.message || error.message}`);
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
                ImageUrls: propertyData.imageUrls || []
            };

            console.log('Sending property data:', requestData);
            const response = await api.post('/CreationProperty', requestData);
            return response.data;
        } catch (error) {
            if (error.response?.status === 400) {
                throw new Error(`Validation error: ${JSON.stringify(error.response.data)}`);
            }
            throw new Error(`Failed to create property: ${error.response?.data?.message || error.message}`);
        }
    },

    // Create property with images (multipart) - FIXED
    createPropertyWithImages: async (formData) => {
        try {
            console.log('Creating property with images...');

            const response = await api.post('/CreationProperty/with-images', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 60000, // Increase timeout for file uploads
            });

            console.log('Property created successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error creating property with images:', error);
            const errorMessage = error.response?.data?.message || error.response?.data?.errors?.[0] || error.message;
            throw new Error(`Failed to create property with images: ${errorMessage}`);
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
                ImageUrls: propertyData.imageUrls || []
            };

            const response = await api.put(`/CreationProperty/${id}`, requestData);
            return response.data;
        } catch (error) {
            if (error.response?.status === 400) {
                throw new Error(`Validation error: ${JSON.stringify(error.response.data)}`);
            }
            if (error.response?.status === 404) {
                throw new Error('Property not found');
            }
            throw new Error(`Failed to update property: ${error.response?.data?.message || error.message}`);
        }
    },

    // Update property with images (multipart)
    updatePropertyWithImages: async (id, formData) => {
        try {
            console.log('Updating property with images...');

            const response = await api.put(`/CreationProperty/with-images/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 60000,
            });

            console.log('Property updated successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error updating property with images:', error);
            const errorMessage = error.response?.data?.message || error.response?.data?.errors?.[0] || error.message;
            throw new Error(`Failed to update property with images: ${errorMessage}`);
        }
    },

    // Delete property
    deleteProperty: async (id) => {
        try {
            await api.delete(`/CreationProperty/${id}`);
            return true;
        } catch (error) {
            if (error.response?.status === 404) {
                throw new Error('Property not found');
            }
            throw new Error(`Failed to delete property: ${error.response?.data?.message || error.message}`);
        }
    },

    // Get properties by status
    getPropertiesByStatus: async (status) => {
        try {
            const response = await api.get(`/CreationProperty/status/${status}`);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to fetch properties by status: ${error.response?.data?.message || error.message}`);
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
            throw new Error(`Failed to search properties: ${error.response?.data?.message || error.message}`);
        }
    },

    // Get properties by agent ID
    getPropertiesByAgentId: async (agentId) => {
        try {
            const response = await api.get(`/CreationProperty/agent/${agentId}`);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to fetch agent properties: ${error.response?.data?.message || error.message}`);
        }
    },

    // Get properties by owner ID
    getPropertiesByOwnerId: async (ownerId) => {
        try {
            const response = await api.get(`/CreationProperty/owner/${ownerId}`);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to fetch owner properties: ${error.response?.data?.message || error.message}`);
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
            throw new Error(`Failed to upload images: ${error.response?.data?.message || error.message}`);
        }
    },

    // Delete image
    deleteImage: async (imageUrl) => {
        try {
            const response = await api.delete(`/CreationProperty/image/${encodeURIComponent(imageUrl)}`);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to delete image: ${error.response?.data?.message || error.message}`);
        }
    }
};

export default propertyService;