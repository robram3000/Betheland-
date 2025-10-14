// Services/useAgents.jsx
import { useState, useCallback } from 'react';
import { message } from 'antd';
import agentService from './AgentService';

const useAgents = () => {
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [agents, setAgents] = useState([]);
    const [currentAgent, setCurrentAgent] = useState(null);
    const [error, setError] = useState(null);

    const getAgents = useCallback(async (showMessage = false) => {
        console.log('🔄 useAgents - Starting getAgents...');
        setLoading(true);
        setError(null);

        try {
            const result = await agentService.getAgents();
            console.log('✅ useAgents - Result from service:', result);

            if (result.success && result.data) {
                console.log('📋 useAgents - Setting agents data:', result.data);
                setAgents(result.data);
                if (showMessage) {
                    message.success('Agents loaded successfully');
                }
            } else {
                console.log('❌ useAgents - Failed to get agents:', result.message);
                setError(result.message);
                if (showMessage) {
                    message.error(result.message || 'Failed to load agents');
                }
            }

            setLoading(false);
            return result;
        } catch (error) {
            console.error('❌ useAgents - Unexpected error:', error);
            setError(error.message);
            setLoading(false);

            if (showMessage) {
                message.error('Failed to load agents');
            }

            return {
                success: false,
                message: 'Failed to load agents',
                error: error
            };
        }
    }, []);

    const getAgentByBaseMemberId = useCallback(async (baseMemberId, showMessage = false) => {
        console.log(`🔍 useAgents - Getting agent by base member ID ${baseMemberId}...`);
        setLoading(true);
        setError(null);

        try {
            const result = await agentService.getAgentByBaseMemberId(baseMemberId);
            console.log('🔍 useAgents - Get agent by base member ID result:', result);

            if (result.success && result.data) {
                console.log('✅ useAgents - Setting current agent by base member ID:', result.data);
                setCurrentAgent(result.data);
                if (showMessage) {
                    message.success('Agent profile loaded successfully');
                }
            } else {
                console.log('❌ useAgents - Failed to get agent by base member ID:', result.message);
                setError(result.message);
                if (showMessage) {
                    message.error(result.message || 'Failed to load agent profile');
                }
            }

            setLoading(false);
            return result;
        } catch (error) {
            console.error('❌ useAgents - Get agent by base member ID error:', error);
            setError(error.message);
            setLoading(false);

            if (showMessage) {
                message.error('Failed to load agent profile');
            }

            return {
                success: false,
                message: 'Failed to load agent profile',
                error: error
            };
        }
    }, []);

    const createAgent = useCallback(async (agentData) => {
        console.log('🔄 useAgents - Creating agent with data:', agentData);
        setUpdating(true);
        setError(null);

        try {
            const result = await agentService.createAgent(agentData);
            console.log('✅ useAgents - Create result:', result);

            if (result.success) {
                message.success('Agent created successfully');
                await getAgents(false);
            } else {
                message.error(result.message || 'Failed to create agent');
                setError(result.message);
            }

            setUpdating(false);
            return result;
        } catch (error) {
            console.error('❌ useAgents - Create agent error:', error);
            setError(error.message);
            setUpdating(false);
            message.error('Failed to create agent');

            return {
                success: false,
                message: 'Failed to create agent',
                error: error
            };
        }
    }, [getAgents]);

    const updateAgent = useCallback(async (id, agentData) => {
        console.log(`🔄 useAgents - Updating agent ${id} with data:`, agentData);
        setUpdating(true);
        setError(null);

        try {
            const result = await agentService.updateAgent(id, agentData);
            console.log('✅ useAgents - Update result:', result);

            if (result.success) {
                message.success('Agent updated successfully');
                await getAgents(false);
                if (currentAgent?.id === id) {
                    await getAgentByBaseMemberId(currentAgent.baseMemberId, false);
                }
            } else {
                message.error(result.message || 'Failed to update agent');
                setError(result.message);
            }

            setUpdating(false);
            return result;
        } catch (error) {
            console.error('❌ useAgents - Update agent error:', error);
            setError(error.message);
            setUpdating(false);
            message.error('Failed to update agent');

            return {
                success: false,
                message: 'Failed to update agent',
                error: error
            };
        }
    }, [getAgents, getAgentByBaseMemberId, currentAgent]);

    const updateAgentStatus = useCallback(async (id, status) => {
        console.log(`🔄 useAgents - Updating agent ${id} status to:`, status);
        setUpdating(true);
        setError(null);

        try {
            const result = await agentService.updateAgentStatus(id, status);
            console.log('✅ useAgents - Status update result:', result);

            if (result.success) {
                message.success('Agent status updated successfully');
                await getAgents(false);
            } else {
                message.error(result.message || 'Failed to update agent status');
                setError(result.message);
            }

            setUpdating(false);
            return result;
        } catch (error) {
            console.error('❌ useAgents - Update agent status error:', error);
            setError(error.message);
            setUpdating(false);
            message.error('Failed to update agent status');

            return {
                success: false,
                message: 'Failed to update agent status',
                error: error
            };
        }
    }, [getAgents]);

    const deleteAgent = useCallback(async (id) => {
        console.log(`🔄 useAgents - Deleting agent ${id}...`);
        setUpdating(true);
        setError(null);

        try {
            const result = await agentService.deleteAgent(id);
            console.log('✅ useAgents - Delete result:', result);

            if (result.success) {
                message.success('Agent deleted successfully');
                await getAgents(false);
                if (currentAgent?.id === id) {
                    setCurrentAgent(null);
                }
            } else {
                message.error(result.message || 'Failed to delete agent');
                setError(result.message);
            }

            setUpdating(false);
            return result;
        } catch (error) {
            console.error('❌ useAgents - Delete agent error:', error);
            setError(error.message);
            setUpdating(false);
            message.error('Failed to delete agent');

            return {
                success: false,
                message: 'Failed to delete agent',
                error: error
            };
        }
    }, [getAgents, currentAgent]);

    const uploadAgentProfilePicture = useCallback(async (baseMemberId, file) => {
        setUpdating(true);
        setError(null);

        try {
            const result = await agentService.uploadAgentProfilePicture(baseMemberId, file);

            if (result.success) {
                message.success('Profile picture updated successfully');
                await getAgentByBaseMemberId(baseMemberId, false);
            } else {
                message.error(result.message || 'Failed to upload profile picture');
                setError(result.message);
            }

            setUpdating(false);
            return result;
        } catch (error) {
            console.error('❌ useAgents - Upload profile picture error:', error);
            setError(error.message);
            setUpdating(false);
            message.error('Failed to upload profile picture');

            return {
                success: false,
                message: 'Failed to upload profile picture',
                error: error
            };
        }
    }, [getAgentByBaseMemberId]);

    const testApiConnection = useCallback(async () => {
        console.log('🧪 useAgents - Testing API connection...');
        setLoading(true);

        try {
            const result = await agentService.testApiConnection();
            console.log('🧪 useAgents - API test result:', result);

            setLoading(false);
            return result;
        } catch (error) {
            console.error('🧪 useAgents - API test error:', error);
            setLoading(false);
            return {
                success: false,
                message: 'API test failed',
                error: error
            };
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const clearCurrentAgent = useCallback(() => {
        setCurrentAgent(null);
    }, []);

    return {
        loading,
        updating,
        agents,
        currentAgent,
        error,
        getAgents,
        getAgentByBaseMemberId,
        createAgent,
        updateAgent,
        updateAgentStatus,
        deleteAgent,
        uploadAgentProfilePicture,
        testApiConnection,
        clearError,
        clearCurrentAgent
    };
};

export default useAgents;