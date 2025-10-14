// Services/AgentService.jsx
import api from '../../../../Authpage/Services/Api';

class AgentService {
    async getAgents() {
        try {
            console.log('📡 AgentService - Fetching agents...');
            const response = await api.get('/Agent');
            console.log('✅ AgentService - API response:', response);

            if (!response) {
                return {
                    success: false,
                    message: 'No response from server'
                };
            }

            const agentsData = response.data || response;

            console.log('📋 AgentService - Raw agents data:', agentsData);

            return {
                success: true,
                data: agentsData,
                message: 'Agents loaded successfully'
            };
        } catch (error) {
            console.error('❌ AgentService - Get agents error:', error);

            let errorMessage = 'Failed to load agents';
            if (error.response) {
                console.error('Response error details:', error.response);
                errorMessage = `Server error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`;
            } else if (error.request) {
                errorMessage = 'No response from server - network error';
            } else {
                errorMessage = error.message || 'Failed to load agents';
            }

            return {
                success: false,
                message: errorMessage,
                error: error
            };
        }
    }

    async getAgentByBaseMemberId(baseMemberId) {
        try {
            console.log(`📡 AgentService - Fetching agent by base member ID ${baseMemberId}...`);
            const response = await api.get(`/Agent/member/${baseMemberId}`);
            console.log('✅ AgentService - API response:', response);

            if (!response) {
                return {
                    success: false,
                    message: 'No response from server'
                };
            }

            const agentData = response.data?.data || response.data || response;

            console.log('📋 AgentService - Raw agent data by base member ID:', agentData);

            // Map backend response to frontend expected format
            const mappedData = {
                id: agentData.id,
                baseMemberId: agentData.baseMemberId,
                email: agentData.email,
                username: agentData.username,
                firstName: agentData.firstName,
                lastName: agentData.lastName,
                middleName: agentData.middleName,
                suffix: agentData.suffix,
                cellPhoneNo: agentData.cellPhoneNo,
                licenseNumber: agentData.licenseNumber,
                bio: agentData.bio,
                licenseExpiry: agentData.licenseExpiry,
                experience: agentData.experience,
                specialization: agentData.specialization,
                officeAddress: agentData.officeAddress,
                officePhone: agentData.officePhone,
                website: agentData.website,
                languages: agentData.languages,
                education: agentData.education,
                awards: agentData.awards,
                yearsOfExperience: agentData.yearsOfExperience,
                brokerageName: agentData.brokerageName,
                isVerified: agentData.isVerified,
                verificationDate: agentData.verificationDate,
                status: agentData.status,
                createdAt: agentData.createdAt,
                dateRegistered: agentData.dateRegistered,
                profilePicture: agentData.profilePictureUrl || agentData.profilePicture
            };

            console.log('🗺️ AgentService - Final mapped data by base member ID:', mappedData);

            return {
                success: true,
                data: mappedData,
                message: 'Agent loaded successfully'
            };
        } catch (error) {
            console.error('❌ AgentService - Get agent by base member ID error:', error);

            let errorMessage = 'Failed to load agent';
            if (error.response) {
                if (error.response.status === 404) {
                    errorMessage = 'Agent profile not found for this user';
                } else {
                    errorMessage = `Server error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`;
                }
            } else if (error.request) {
                errorMessage = 'No response from server - network error';
            } else {
                errorMessage = error.message || 'Failed to load agent';
            }

            return {
                success: false,
                message: errorMessage,
                error: error
            };
        }
    }

    async createAgent(agentData) {
        try {
            console.log('🔄 AgentService - Creating agent:', agentData);

            const backendData = {
                firstName: agentData.firstName,
                lastName: agentData.lastName,
                middleName: agentData.middleName,
                suffix: agentData.suffix,
                email: agentData.email,
                username: agentData.username,
                password: agentData.password,
                cellPhoneNo: agentData.cellPhoneNo,
                licenseNumber: agentData.licenseNumber,
                bio: agentData.bio,
                licenseExpiry: agentData.licenseExpiry,
                experience: agentData.experience,
                specialization: agentData.specialization,
                officeAddress: agentData.officeAddress,
                officePhone: agentData.officePhone,
                website: agentData.website,
                languages: agentData.languages,
                education: agentData.education,
                awards: agentData.awards,
                yearsOfExperience: agentData.yearsOfExperience,
                brokerageName: agentData.brokerageName
            };

            console.log('📤 AgentService - Sending create data:', backendData);

            const response = await api.post('/Agent/register', backendData);
            console.log('✅ AgentService - Create response:', response);

            return {
                success: true,
                data: response.data,
                message: 'Agent created successfully'
            };
        } catch (error) {
            console.error('❌ AgentService - Create agent error:', error);

            let errorMessage = 'Failed to create agent';
            if (error.response) {
                errorMessage = `Server error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`;
            } else if (error.request) {
                errorMessage = 'No response from server - network error';
            } else {
                errorMessage = error.message || 'Failed to create agent';
            }

            return {
                success: false,
                message: errorMessage,
                error: error
            };
        }
    }

    async updateAgent(id, agentData) {
        try {
            console.log(`🔄 AgentService - Updating agent ${id}:`, agentData);

            const backendData = {
                firstName: agentData.firstName,
                lastName: agentData.lastName,
                middleName: agentData.middleName,
                suffix: agentData.suffix,
                cellPhoneNo: agentData.cellPhoneNo,
                licenseNumber: agentData.licenseNumber,
                bio: agentData.bio,
                licenseExpiry: agentData.licenseExpiry,
                experience: agentData.experience,
                specialization: agentData.specialization,
                officeAddress: agentData.officeAddress,
                officePhone: agentData.officePhone,
                website: agentData.website,
                languages: agentData.languages,
                education: agentData.education,
                awards: agentData.awards,
                yearsOfExperience: agentData.yearsOfExperience,
                brokerageName: agentData.brokerageName
            };

            const response = await api.put(`/Agent/${id}`, backendData);
            return {
                success: true,
                data: response.data,
                message: 'Agent updated successfully'
            };
        } catch (error) {
            let errorMessage = 'Failed to update agent';
            if (error.response) {
                errorMessage = `Server error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`;
            } else if (error.request) {
                errorMessage = 'No response from server - network error';
            } else {
                errorMessage = error.message || 'Failed to update agent';
            }

            return {
                success: false,
                message: errorMessage,
                error: error
            };
        }
    }

    async updateAgentStatus(id, status) {
        try {
            const response = await api.patch(`/Agent/${id}/status`, { status });

            return {
                success: true,
                data: response.data,
                message: 'Agent status updated successfully'
            };
        } catch (error) {
            let errorMessage = 'Failed to update agent status';
            if (error.response) {
                errorMessage = `Server error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`;
            }

            return {
                success: false,
                message: errorMessage,
                error: error
            };
        }
    }

    async deleteAgent(id) {
        try {
            const response = await api.delete(`/Agent/${id}`);

            return {
                success: true,
                data: response.data,
                message: 'Agent deleted successfully'
            };
        } catch (error) {
            console.error('❌ AgentService - Delete agent error:', error);

            let errorMessage = 'Failed to delete agent';
            if (error.response) {
                errorMessage = `Server error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`;
            }

            return {
                success: false,
                message: errorMessage,
                error: error
            };
        }
    }

    async uploadAgentProfilePicture(baseMemberId, file) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await api.post(`/ProfilePicture/${baseMemberId}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('✅ AgentService - Upload profile picture response:', response);

            return {
                success: true,
                data: response.data,
                message: 'Profile picture updated successfully'
            };
        } catch (error) {
            console.error('❌ AgentService - Upload profile picture error:', error);

            let errorMessage = 'Failed to upload profile picture';
            if (error.response) {
                errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
            }

            return {
                success: false,
                message: errorMessage,
                error: error
            };
        }
    }

    async testApiConnection() {
        try {
            console.log('🧪 AgentService - Testing API connection...');
            const testResponse = await api.get('/Agent');
            console.log('🧪 AgentService - Test API response:', testResponse);

            return {
                success: true,
                data: testResponse.data,
                message: 'API test successful'
            };
        } catch (error) {
            console.error('🧪 AgentService - API test failed:', error);
            return {
                success: false,
                message: error.message,
                error: error
            };
        }
    }
}

const agentService = new AgentService();
export default agentService;