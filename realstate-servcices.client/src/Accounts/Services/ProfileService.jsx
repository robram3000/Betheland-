
import api from '../../Authpage/Services/Api';
import authService from '../../Authpage/Services/LoginAuth';

class ProfileService {
    async getProfile() {
        try {
            const currentUser = authService.getCurrentUser();

            if (!currentUser) {
                return {
                    success: false,
                    message: 'User not authenticated'
                };
            }

            const response = await api.get(`/Client/${currentUser.userId}`);
            if (!response) {
                return {
                    success: false,
                    message: 'No response from server'
                };
            }

            let clientData = response.data || response;
            const mappedData = {
                id: clientData.baseMemberId || clientData.id || currentUser.userId,
                clientId: clientData.id,
                baseMemberId: clientData.baseMemberId,
                email: clientData.email || currentUser.email,
                username: clientData.username || currentUser.username,
                firstName: clientData.firstName,
                lastName: clientData.lastName,
                middleName: clientData.middleName,
                suffix: clientData.suffix,
                cellPhoneNo: clientData.cellPhoneNo,
                country: clientData.country,
                city: clientData.city,
                street: clientData.street,
                zipCode: clientData.zipCode,
                gender: clientData.gender,
                status: clientData.status,
                createdAt: clientData.createdAt,
                dateRegistered: clientData.dateRegistered,
                profilePicture: clientData.profilePictureUrl || clientData.profilePicture,
                address: clientData.address // Make sure this line is present
            };

            console.log('📋 ProfileService - Mapped data:', mappedData); // Debug log

            return {
                success: true,
                data: mappedData,
                message: 'Profile loaded successfully'
            };
        } catch (error) {
            let errorMessage = 'Failed to load profile';
            if (error.response) {
                console.error('Response error details:', error.response);
                errorMessage = `Server error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`;
            } else if (error.request) {
                errorMessage = 'No response from server - network error';
            } else {
                errorMessage = error.message || 'Failed to load profile';
            }

            return {
                success: false,
                message: errorMessage,
                error: error
            };
        }
    }
    async updateProfile(profileData) {
        try {
            const currentUser = authService.getCurrentUser();
            if (!currentUser) {
                return {
                    success: false,
                    message: 'User not authenticated'
                };
            }
            const backendData = {
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                middleName: profileData.middleName,
                cellPhoneNo: profileData.cellPhoneNo,
                country: profileData.country,
                city: profileData.city,
                street: profileData.street,
                zipCode: profileData.zipCode,
                gender: profileData.gender,
                address: profileData.address
            };
            const response = await api.put(`/Client/${currentUser.userId}`, backendData);
            return {
                success: true,
                data: response.data,
                message: 'Profile updated successfully'
            };
        } catch (error) {
        

            let errorMessage = 'Failed to update profile';
            if (error.response) {
                errorMessage = `Server error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`;
            } else if (error.request) {
                errorMessage = 'No response from server - network error';
            } else {
                errorMessage = error.message || 'Failed to update profile';
            }

            return {
                success: false,
                message: errorMessage,
                error: error
            };
        }
    }
    async uploadProfilePicture(file) {
        try {
            const currentUser = authService.getCurrentUser();

            if (!currentUser) {
                return {
                    success: false,
                    message: 'User not authenticated'
                };
            }

            const formData = new FormData();
            formData.append('file', file);
            const response = await api.post(`/Client/${currentUser.userId}/profile-picture`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return {
                success: true,
                data: response.data,
                message: 'Profile picture updated successfully'
            };
        } catch (error) {
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
    async deleteProfilePicture() {
        try {
            const currentUser = authService.getCurrentUser();

            if (!currentUser) {
                return {
                    success: false,
                    message: 'User not authenticated'
                };
            }

            const response = await api.delete(`/Client/${currentUser.userId}/profile-picture`);

            return {
                success: true,
                data: response.data,
                message: 'Profile picture deleted successfully'
            };
        } catch (error) {
            let errorMessage = 'Failed to delete profile picture';
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
    async changePassword(passwordData) {
        try {
            const response = await api.post('/Login/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            return {
                success: true,
                data: response.data,
                message: 'Password changed successfully'
            };
        } catch (error) {
            let errorMessage = 'Failed to change password';
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
    async updateProfileField(fieldName, value) {
        try {
            const currentUser = authService.getCurrentUser();
            if (!currentUser) {
                return {
                    success: false,
                    message: 'User not authenticated'
                };
            }

            const updateData = { [fieldName]: value };
            const response = await api.put(`/Client/${currentUser.userId}`, updateData);

            return {
                success: true,
                data: response.data,
                message: `${fieldName} updated successfully`
            };
        } catch (error) {
            console.error(`❌ ProfileService - Update ${fieldName} error:`, error);
            return {
                success: false,
                message: error.message || `Failed to update ${fieldName}`
            };
        }
    }
    async testApiConnection() {
        try {
            const currentUser = authService.getCurrentUser();
            if (!currentUser) {
                return { success: false, message: 'No user' };
            }
            const testResponse = await api.get(`/Client/${currentUser.userId}`);
            return {
                success: true,
                data: testResponse.data,
                message: 'API test successful'
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
                error: error
            };
        }
    }
}

const profileService = new ProfileService();
export default profileService;