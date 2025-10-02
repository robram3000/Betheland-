// services/propertyService.js
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

export const propertyService = {
    // Get all properties
    getAllProperties: async () => {
        try {
            const response = await api.get('/CreationProperty');
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

    // Create new property
    createProperty: async (propertyData) => {
        try {
            // Format the data to match backend expectation
            const requestData = {
                property: {
                    title: propertyData.title,
                    description: propertyData.description,
                    type: propertyData.type,
                    price: propertyData.price,
                    propertyAge: propertyData.propertyAge,
                    propertyFloor: propertyData.propertyFloor,
                    bedrooms: propertyData.bedrooms,
                    bathrooms: propertyData.bathrooms,
                    areaSqft: propertyData.areaSqft,
                    address: propertyData.address,
                    city: propertyData.city,
                    state: propertyData.state,
                    zipCode: propertyData.zipCode,
                    latitude: propertyData.latitude,
                    longitude: propertyData.longitude,
                    status: propertyData.status,
                    ownerId: propertyData.ownerId,
                    agentId: propertyData.agentId,
                    amenities: propertyData.amenities
                }
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

    // Update property
    updateProperty: async (id, propertyData) => {
        try {
            const requestData = {
                property: {
                    id: id,
                    title: propertyData.title,
                    description: propertyData.description,
                    type: propertyData.type,
                    price: propertyData.price,
                    propertyAge: propertyData.propertyAge,
                    propertyFloor: propertyData.propertyFloor,
                    bedrooms: propertyData.bedrooms,
                    bathrooms: propertyData.bathrooms,
                    areaSqft: propertyData.areaSqft,
                    address: propertyData.address,
                    city: propertyData.city,
                    state: propertyData.state,
                    zipCode: propertyData.zipCode,
                    latitude: propertyData.latitude,
                    longitude: propertyData.longitude,
                    status: propertyData.status,
                    ownerId: propertyData.ownerId,
                    agentId: propertyData.agentId,
                    amenities: propertyData.amenities
                }
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
    }
};

export default propertyService;