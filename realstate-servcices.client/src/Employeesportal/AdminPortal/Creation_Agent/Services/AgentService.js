import api from '../../../../Authpage/Services/Api';
import agentMapper from './agentMapper';
import { createAgentServiceWithErrorHandling, agentValidator } from './AgentErrorHandler';

const baseAgentService = {
    async getAgents() {
        console.log('Fetching agents...');
        const response = await api.get('/agent');
        console.log('Agents response:', response);

        // Handle different response formats
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

        // Validate agent data
        agentValidator.validateCreateAgent(agentData);

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
        agentValidator.validateUpdateAgent({ ...agentData, id });
        const updateRequest = agentMapper.toUpdateRequest(agentData);
        console.log('Update request:', updateRequest);

        const response = await api.put(`/agent/${id}`, updateRequest);
        console.log('Update response:', response);

        if (response && response.success) {
            return response;
        }
        throw new Error(response?.message || 'Failed to update agent');
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
        console.log('Uploading image:', file.name);

        const formData = new FormData();
        formData.append('file', file);

        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: onProgress
        };

        const response = await api.post('/agent/upload', formData, config);

        if (response && response.success) {
            return response;
        }
        throw new Error(response?.message || 'Failed to upload image');
    }
};

const agentService = createAgentServiceWithErrorHandling(baseAgentService);

export default agentService;