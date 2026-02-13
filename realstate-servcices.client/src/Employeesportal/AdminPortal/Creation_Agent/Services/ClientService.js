import api from '../../../../Authpage/Services/Api';
import clientMapper from './clientMapper';

const baseClientService = {
    async getClients() {
        console.log('Fetching clients...');
        const response = await api.get('/client');
        console.log('Clients response:', response);

        // Handle direct array response
        if (Array.isArray(response)) {
            return clientMapper.toFrontendList(response);
        }

        if (response && response.success && response.data) {
            return clientMapper.toFrontendList(response.data);
        }

        if (response && Array.isArray(response.data)) {
            return clientMapper.toFrontendList(response.data);
        }

        console.error('Unexpected response format:', response);
        throw new Error('Invalid response format from server');
    },

    async getClient(id) {
        console.log('Fetching client:', id);
        const response = await api.get(`/client/${id}`);
        console.log('Client response:', response);

        // Handle direct client object response
        if (response && response.id) {
            return clientMapper.toFrontend(response);
        }

        if (response && response.success && response.data) {
            return clientMapper.toFrontend(response.data);
        }

        if (response && response.data) {
            return clientMapper.toFrontend(response.data);
        }

        throw new Error('Client not found or invalid response format');
    },

    async getClientByBaseMemberId(baseMemberId) {
        console.log('Fetching client by base member ID:', baseMemberId);
        const response = await api.get(`/client/${baseMemberId}`);
        console.log('Client by member response:', response);

        // Handle direct client object response
        if (response && response.id) {
            return clientMapper.toFrontend(response);
        }

        if (response && response.success && response.data) {
            return clientMapper.toFrontend(response.data);
        }

        if (response && response.data) {
            return clientMapper.toFrontend(response.data);
        }

        throw new Error('Client not found for the specified base member');
    },

    async getAllClientsByBaseMemberIds(baseMemberIds) {
        console.log('Fetching clients by base member IDs:', baseMemberIds);

        if (!Array.isArray(baseMemberIds) || baseMemberIds.length === 0) {
            console.warn('Empty or invalid baseMemberIds provided');
            return [];
        }

        try {
            const response = await api.post('/client/by-member-ids', baseMemberIds);
            console.log('Clients by member IDs response:', response);

            // Handle direct array response
            if (Array.isArray(response)) {
                return clientMapper.toFrontendList(response);
            }

            if (response && response.success && response.data) {
                return clientMapper.toFrontendList(response.data);
            }

            if (response && Array.isArray(response.data)) {
                return clientMapper.toFrontendList(response.data);
            }

            console.warn('Unexpected response format for clients by member IDs:', response);
            return [];
        } catch (error) {
            console.error('Error fetching clients by base member IDs:', error);
            throw new Error('Failed to fetch clients by base member IDs');
        }
    },

    async createClient(clientData) {
        console.log('Creating client:', clientData);

        // Map to backend format
        const createRequest = clientMapper.toCreateRequest(clientData);
        console.log('Create request:', createRequest);

        const response = await api.post('/client/register', createRequest);
        console.log('Create response:', response);

        if (response && response.success) {
            return response;
        }

        throw new Error(response?.message || 'Failed to create client');
    },

    async updateClient(id, clientData) {
        console.log('Updating client:', id, clientData);
        const updateRequest = clientMapper.toUpdateRequest(clientData);
        console.log('Update request:', updateRequest);

        try {
            const response = await api.put(`/client/${id}`, updateRequest);
            console.log('Update response:', response);

            // Handle different response structures
            if (response && (response.success || response.status === 200)) {
                return response;
            }

            // If response has data with success flag
            if (response && response.data && response.data.success) {
                return response.data;
            }

            throw new Error(response?.message || response?.data?.message || 'Failed to update client');
        } catch (error) {
            console.error('Update client error details:', {
                error,
                response: error.response,
                data: error.response?.data
            });
            throw error;
        }
    },

    async deleteClient(id) {
        console.log('Deleting client:', id);
        const response = await api.delete(`/client/${id}`);
        console.log('Delete response:', response);

        if (response && response.success) {
            return response;
        }
        throw new Error(response?.message || 'Failed to delete client');
    },

    async updateClientStatus(id, status) {
        console.log('Updating client status:', id, status);
        const response = await api.patch(`/client/${id}/status`, { status });
        console.log('Update status response:', response);

        if (response && response.success) {
            return response;
        }
        throw new Error(response?.message || 'Failed to update client status');
    },

    async uploadProfilePicture(baseMemberId, file, onProgress = null) {
        console.log('Uploading profile picture for client:', baseMemberId, file.name);

        const formData = new FormData();
        formData.append('file', file);

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: onProgress
        };

        try {
            const response = await api.post(`/client/${baseMemberId}/profile-picture`, formData, config);
            console.log('FULL UPLOAD RESPONSE:', response);

            // Handle different response structures
            if (response && response.success) {
                // If response has url directly
                if (response.url) {
                    return {
                        success: true,
                        url: response.url,
                        ...response
                    };
                }
                // If response has data with url
                if (response.data && response.data.url) {
                    return {
                        success: true,
                        url: response.data.url,
                        ...response.data
                    };
                }
                // If response is the URL itself (unlikely but possible)
                if (typeof response === 'string' && response.includes('/uploads/')) {
                    return {
                        success: true,
                        url: response
                    };
                }
            }

            // If we have data but no success flag
            if (response && response.data) {
                return {
                    success: true,
                    ...response.data
                };
            }

            console.error('Unexpected upload response structure:', response);
            throw new Error(response?.message || 'Failed to upload profile picture - unexpected response format');
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    },

    async deleteProfilePicture(baseMemberId) {
        console.log('Deleting profile picture for client:', baseMemberId);
        const response = await api.delete(`/client/${baseMemberId}/profile-picture`);
        console.log('Delete profile picture response:', response);

        if (response && response.success) {
            return response;
        }
        throw new Error(response?.message || 'Failed to delete profile picture');
    },

    async getProfilePicture(baseMemberId) {
        console.log('Getting profile picture for client:', baseMemberId);
        const response = await api.get(`/client/${baseMemberId}/profile-picture`);
        console.log('Get profile picture response:', response);

        if (response && response.success && response.data) {
            return response.data;
        }

        throw new Error(response?.message || 'Failed to get profile picture');
    },

    async getClientsWithProperties() {
        try {
            const allClients = await this.getClients();
            const propertyService = await import('../../Creation_Property/services/propertyService');
            const properties = await propertyService.default.getAllProperties();

            const clientsWithProperties = allClients.map(client => {
                const clientProperties = properties.filter(property =>
                    property.clientId === client.id || property.ownerId === client.id
                );

                return {
                    ...client,
                    properties: clientProperties,
                    propertyCount: clientProperties.length,
                    totalPropertyValue: clientProperties.reduce((sum, prop) => sum + (prop.price || 0), 0)
                };
            });

            return clientsWithProperties.sort((a, b) => b.propertyCount - a.propertyCount);

        } catch (error) {
            console.error('Error getting clients with properties:', error);
            return [];
        }
    },

    async getFeaturedClients(limit = 6) {
        try {
            console.log('Getting featured clients, limit:', limit);

            const allClients = await this.getClients();
            const propertyService = await import('../../Creation_Property/services/propertyService');
            const properties = await propertyService.default.getAllProperties();

            // Count properties per client
            const clientPropertyCount = new Map();

            properties.forEach(property => {
                if (property.clientId || property.ownerId) {
                    const clientId = property.clientId || property.ownerId;
                    clientPropertyCount.set(
                        clientId,
                        (clientPropertyCount.get(clientId) || 0) + 1
                    );
                }
            });

            // Sort clients by property count and get top ones
            const featuredClients = allClients
                .filter(client => clientPropertyCount.has(client.id))
                .sort((a, b) => clientPropertyCount.get(b.id) - clientPropertyCount.get(a.id))
                .slice(0, limit)
                .map(client => ({
                    ...client,
                    propertyCount: clientPropertyCount.get(client.id)
                }));

            console.log('Featured clients:', featuredClients);
            return featuredClients;

        } catch (error) {
            console.error('Error getting featured clients:', error);
            // Return random active clients as fallback
            const allClients = await this.getClients();
            const activeClients = allClients.filter(client => client.status === 'Active');

            if (activeClients.length > 0) {
                return activeClients
                    .sort(() => 0.5 - Math.random())
                    .slice(0, limit);
            }

            // If no active clients, return random clients
            return allClients
                .sort(() => 0.5 - Math.random())
                .slice(0, limit);
        }
    },

    getFallbackClient(clientId = null) {
        return {
            id: clientId,
            firstName: 'Unknown',
            lastName: 'Client',
            email: '',
            profilePictureUrl: '',
            cellPhoneNo: '',
            status: 'Unknown',
            propertyCount: 0
        };
    },

    async getClientWithFallback(clientId) {
        try {
            console.log('Fetching client with fallback:', clientId);
            if (!clientId) {
                return this.getFallbackClient();
            }

            const client = await this.getClient(clientId);
            return client;
        } catch (error) {
            console.warn('Failed to fetch client, returning fallback:', error);
            return this.getFallbackClient(clientId);
        }
    }
};

// Simple error handler wrapper
const createClientServiceWithErrorHandling = (service) => {
    const handler = {
        get(target, prop) {
            const original = target[prop];
            if (typeof original === 'function') {
                return async function (...args) {
                    try {
                        return await original.apply(target, args);
                    } catch (error) {
                        console.error(`Error in ClientService.${prop}:`, error);
                        throw error;
                    }
                };
            }
            return original;
        }
    };

    return new Proxy(service, handler);
};

const clientService = createClientServiceWithErrorHandling(baseClientService);

export default clientService;