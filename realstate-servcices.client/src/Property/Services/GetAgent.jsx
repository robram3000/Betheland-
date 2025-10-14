
import api from '../../Authpage/Services/Api';

export const agentService = {
  
    getAgentById: async (id) => {
        try {
            const response = await api.get(`/Agent/${id}`);
            console.log('Get agent by ID full response:', response);
            console.log('Get agent by ID response data:', response.data);

            // Handle different response formats
            if (response.data && response.data.success !== undefined) {
                // If it's a wrapped response with success flag
                if (response.data.success && response.data.data) {
                    return response.data.data;
                } else if (!response.data.success) {
                    throw new Error(response.data.message || 'Failed to fetch agent');
                }
            } else if (response.data && response.data.id) {
                // If the response data is directly the agent object
                return response.data;
            } else {
                // If response.data exists but doesn't have expected structure
                console.warn('Unexpected response format:', response.data);
                return response.data; // Return whatever we got
            }

            throw new Error('Invalid response format');
        } catch (error) {
            console.error('Agent service error details:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });

            if (error.response?.status === 404) {
                throw new Error('Agent not found');
            }

            const errorMessage = error.response?.data?.message ||
                error.response?.data ||
                error.message;
            throw new Error(`Failed to fetch agent: ${errorMessage}`);
        }
    },
    getAllAgents: async () => {
        try {
            const response = await api.get('/Agent');
            console.log('Get all agents response:', response.data);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.response?.data || error.message;
            throw new Error(`Failed to fetch agents: ${errorMessage}`);
        }
    },
    getAgentByBaseMemberId: async (baseMemberId) => {
        try {
            const response = await api.get(`/Agent/base-member/${baseMemberId}`);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.response?.data || error.message;
            throw new Error(`Failed to fetch agent by base member ID: ${errorMessage}`);
        }
    },
    searchAgents: async (searchTerm) => {
        try {
            const response = await api.get('/Agent/search', {
                params: { q: searchTerm }
            });
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.response?.data || error.message;
            throw new Error(`Failed to search agents: ${errorMessage}`);
        }
    }
};

export default agentService;