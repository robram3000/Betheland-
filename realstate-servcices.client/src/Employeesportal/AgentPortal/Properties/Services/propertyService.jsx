// services/propertyService.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'https://localhost:7074/api',
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

export const propertyService = {
    // Get all properties
    getAllProperties: async () => {
        try {
            const response = await api.get('/CreationProperty');
            return response.data;
        } catch (error) {
            throw new Error(`Failed to fetch properties: ${error.response?.data || error.message}`);
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
            throw new Error(`Failed to fetch property: ${error.response?.data || error.message}`);
        }
    },

    // Create new property
    createProperty: async (propertyData) => {
        try {
            const response = await api.post('/CreationProperty', propertyData);
            return response.data;
        } catch (error) {
            if (error.response?.status === 400) {
                throw new Error(`Validation error: ${JSON.stringify(error.response.data)}`);
            }
            throw new Error(`Failed to create property: ${error.response?.data || error.message}`);
        }
    },

    // Update property
    updateProperty: async (id, propertyData) => {
        try {
            const response = await api.put(`/CreationProperty/${id}`, propertyData);
            return response.data;
        } catch (error) {
            if (error.response?.status === 400) {
                throw new Error(`Validation error: ${JSON.stringify(error.response.data)}`);
            }
            if (error.response?.status === 404) {
                throw new Error('Property not found');
            }
            throw new Error(`Failed to update property: ${error.response?.data || error.message}`);
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
            throw new Error(`Failed to delete property: ${error.response?.data || error.message}`);
        }
    },

    // Get properties by status
    getPropertiesByStatus: async (status) => {
        try {
            const response = await api.get(`/CreationProperty/status/${status}`);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to fetch properties by status: ${error.response?.data || error.message}`);
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
            throw new Error(`Failed to search properties: ${error.response?.data || error.message}`);
        }
    },

    // Add property images
    addPropertyImages: async (propertyId, images) => {
        try {
            const response = await api.post(`/CreationProperty/${propertyId}/images`, images);
            return response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                throw new Error('Property not found');
            }
            throw new Error(`Failed to add property images: ${error.response?.data || error.message}`);
        }
    },

    // Get properties by agent ID
    getPropertiesByAgentId: async (agentId) => {
        try {
            const response = await api.get(`/CreationProperty/agent/${agentId}`);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to fetch agent properties: ${error.response?.data || error.message}`);
        }
    },

    // Get properties by owner ID
    getPropertiesByOwnerId: async (ownerId) => {
        try {
            const response = await api.get(`/CreationProperty/owner/${ownerId}`);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to fetch owner properties: ${error.response?.data || error.message}`);
        }
    }
};

// Utility functions for common property operations
export const propertyUtils = {
    // Format property data for API
    formatPropertyData: (property) => {
        return {
            title: property.title,
            description: property.description,
            type: property.type,
            price: property.price,
            propertyAge: property.propertyAge,
            propertyFloor: property.propertyFloor,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            areaSqft: property.areaSqft,
            address: property.address,
            city: property.city,
            state: property.state,
            zipCode: property.zipCode,
            latitude: property.latitude,
            longitude: property.longitude,
            status: property.status || 'available',
            ownerId: property.ownerId,
            agentId: property.agentId,
            amenities: property.amenities || '[]',
            listedDate: property.listedDate || new Date().toISOString()
        };
    },

    // Create property with images
    createPropertyWithImages: async (propertyData, imageUrls = []) => {
        const property = propertyUtils.formatPropertyData(propertyData);

        // First create the property
        const createdProperty = await propertyService.createProperty(property);

        // Then add images if provided
        if (imageUrls.length > 0) {
            const images = imageUrls.map(url => ({
                imageUrl: url,
                createdAt: new Date().toISOString()
            }));
            await propertyService.addPropertyImages(createdProperty.id, images);
        }

        return createdProperty;
    },

    // Update property with images
    updatePropertyWithImages: async (id, propertyData, imageUrls = []) => {
        const property = propertyUtils.formatPropertyData(propertyData);
        property.id = id;

        // Update the property
        const updatedProperty = await propertyService.updateProperty(id, property);

        // Update images if provided
        if (imageUrls.length > 0) {
            const images = imageUrls.map(url => ({
                imageUrl: url,
                createdAt: new Date().toISOString()
            }));
            await propertyService.addPropertyImages(id, images);
        }

        return updatedProperty;
    }
};

export default propertyService;