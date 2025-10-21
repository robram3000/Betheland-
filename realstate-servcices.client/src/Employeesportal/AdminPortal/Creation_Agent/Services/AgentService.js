import api from '../../../../Authpage/Services/Api';
import agentMapper from './agentMapper';

const baseAgentService = {
    async getAgents() {
        console.log('Fetching agents...');
        const response = await api.get('/agent');
        console.log('Agents response:', response);

        if (response && response.success && response.data) {
            return agentMapper.toFrontendList(response.data);
        }

        if (response && Array.isArray(response.data)) {
            return agentMapper.toFrontendList(response.data);
        }

        if (Array.isArray(response)) {
            return agentMapper.toFrontendList(response);
        }

        console.error('Unexpected response format:', response);
        throw new Error('Invalid response format from server');
    },

    async getAgent(id) {
        console.log('Fetching agent:', id);
        const response = await api.get(`/agent/${id}`);
        console.log('Agent response:', response);

        if (response && response.success && response.data) {
            return agentMapper.toFrontend(response.data);
        }

        if (response && response.data) {
            return agentMapper.toFrontend(response.data);
        }

        throw new Error('Agent not found or invalid response format');
    },

    async getAgentByBaseMemberId(baseMemberId) {
        console.log('Fetching agent by base member ID:', baseMemberId);
        const response = await api.get(`/agent/member/${baseMemberId}`);
        console.log('Agent by member response:', response);

        if (response && response.success && response.data) {
            return agentMapper.toFrontend(response.data);
        }

        throw new Error('Agent not found for the specified base member');
    },

    async createAgent(agentData) {
        console.log('Creating agent:', agentData);

        // Map to backend format
        const createRequest = agentMapper.toCreateRequest(agentData);
        console.log('Create request:', createRequest);

        const response = await api.post('/agent/register', createRequest);
        console.log('Create response:', response);

        if (response && response.success) {
            return response;
        }

        throw new Error(response?.message || 'Failed to create agent');
    },

    async updateAgent(id, agentData) {
        console.log('Updating agent:', id, agentData);
        const updateRequest = agentMapper.toUpdateRequest(agentData);
        console.log('Update request:', updateRequest);

        try {
            const response = await api.put(`/agent/${id}`, updateRequest);
            console.log('Update response:', response);

            // Handle different response structures
            if (response && (response.success || response.status === 200)) {
                return response;
            }

            // If response has data with success flag
            if (response && response.data && response.data.success) {
                return response.data;
            }

            throw new Error(response?.message || response?.data?.message || 'Failed to update agent');
        } catch (error) {
            console.error('Update agent error details:', {
                error,
                response: error.response,
                data: error.response?.data
            });
            throw error;
        }
    },

    async deleteAgent(id) {
        console.log('Deleting agent:', id);
        const response = await api.delete(`/agent/${id}`);
        console.log('Delete response:', response);

        if (response && response.success) {
            return response;
        }
        throw new Error(response?.message || 'Failed to delete agent');
    },

    async verifyAgent(id) {
        console.log('Verifying agent:', id);
        const response = await api.patch(`/agent/${id}/verify`);
        console.log('Verify response:', response);

        if (response && response.success) {
            return response;
        }
        throw new Error(response?.message || 'Failed to verify agent');
    },

    async uploadImage(file, onProgress = null) {
        console.log('Uploading profile picture:', file.name);

        const formData = new FormData();
        formData.append('file', file);

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: onProgress
        };

        try {
            const response = await api.post('/agent/upload', formData, config);
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
            throw new Error(response?.message || 'Failed to upload image - unexpected response format');
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    },

    async getAgentsWithProperties() {
        try {
            const allAgents = await this.getAgents();
            const propertyService = await import('../../Creation_Property/services/propertyService');
            const properties = await propertyService.default.getAllProperties();

            const agentsWithProperties = allAgents.map(agent => {
                const agentProperties = properties.filter(property =>
                    property.agentId === agent.id
                );

                return {
                    ...agent,
                    properties: agentProperties,
                    propertyCount: agentProperties.length,
                    totalPropertyValue: agentProperties.reduce((sum, prop) => sum + (prop.price || 0), 0)
                };
            });

            return agentsWithProperties.sort((a, b) => b.propertyCount - a.propertyCount);

        } catch (error) {
            console.error('Error getting agents with properties:', error);
            return [];
        }
    },

    async getFeaturedAgents(limit = 6) {
        try {
            console.log('Getting featured agents, limit:', limit);

            const allAgents = await this.getAgents();
            const propertyService = await import('../../Creation_Property/services/propertyService');
            const properties = await propertyService.default.getAllProperties();

            // Count properties per agent
            const agentPropertyCount = new Map();

            properties.forEach(property => {
                if (property.agentId) {
                    agentPropertyCount.set(
                        property.agentId,
                        (agentPropertyCount.get(property.agentId) || 0) + 1
                    );
                }
            });

            // Sort agents by property count and get top ones
            const featuredAgents = allAgents
                .filter(agent => agentPropertyCount.has(agent.id))
                .sort((a, b) => agentPropertyCount.get(b.id) - agentPropertyCount.get(a.id))
                .slice(0, limit)
                .map(agent => ({
                    ...agent,
                    propertyCount: agentPropertyCount.get(agent.id)
                }));

            console.log('Featured agents:', featuredAgents);
            return featuredAgents;

        } catch (error) {
            console.error('Error getting featured agents:', error);
            // Return random verified agents as fallback
            const allAgents = await this.getAgents();
            const verifiedAgents = allAgents.filter(agent => agent.isVerified);

            if (verifiedAgents.length > 0) {
                return verifiedAgents
                    .sort(() => 0.5 - Math.random())
                    .slice(0, limit);
            }

            // If no verified agents, return random agents
            return allAgents
                .sort(() => 0.5 - Math.random())
                .slice(0, limit);
        }
    },

    async getAgentsByPropertyIds(propertyIds) {
        try {
            console.log('Getting agents for property IDs:', propertyIds);

            if (!Array.isArray(propertyIds) || propertyIds.length === 0) {
                return [];
            }

            // Fetch all agents first
            const allAgents = await this.getAgents();

            const propertyService = await import('../../Creation_Property/services/propertyService');
            const properties = await propertyService.default.getAllProperties();

            // Create agent-property mapping
            const agentPropertyMap = new Map();

            properties.forEach(property => {
                if (property.agentId && propertyIds.includes(property.id)) {
                    const agent = allAgents.find(a => a.id === property.agentId);
                    if (agent) {
                        if (!agentPropertyMap.has(property.agentId)) {
                            agentPropertyMap.set(property.agentId, {
                                agent: agent,
                                properties: []
                            });
                        }
                        agentPropertyMap.get(property.agentId).properties.push(property);
                    }
                }
            });

            // Convert map to array and sort by number of properties
            const agentsWithProperties = Array.from(agentPropertyMap.values())
                .sort((a, b) => b.properties.length - a.properties.length);

            console.log('Agents with properties:', agentsWithProperties);
            return agentsWithProperties;

        } catch (error) {
            console.error('Error getting agents by property IDs:', error);
            return [];
        }
    },

    getFallbackAgent(agentId = null) {
        return {
            id: agentId,
            firstName: 'Unknown',
            lastName: 'Agent',
            email: '',
            profilePictureUrl: '',
            cellPhoneNo: '',
            licenseNumber: '',
            isVerified: false,
            brokerageName: '',
            specialization: []
        };
    },

    async getAgentWithFallback(agentId) {
        try {
            console.log('Fetching agent with fallback:', agentId);
            if (!agentId) {
                return this.getFallbackAgent();
            }

            const agent = await this.getAgent(agentId);
            return agent;
        } catch (error) {
            console.warn('Failed to fetch agent, returning fallback:', error);
            return this.getFallbackAgent(agentId);
        }
    }
};

// Simple error handler wrapper
const createAgentServiceWithErrorHandling = (service) => {
    const handler = {
        get(target, prop) {
            const original = target[prop];
            if (typeof original === 'function') {
                return async function (...args) {
                    try {
                        return await original.apply(target, args);
                    } catch (error) {
                        console.error(`Error in AgentService.${prop}:`, error);
                        throw error;
                    }
                };
            }
            return original;
        }
    };

    return new Proxy(service, handler);
};

const agentService = createAgentServiceWithErrorHandling(baseAgentService);

export default agentService;