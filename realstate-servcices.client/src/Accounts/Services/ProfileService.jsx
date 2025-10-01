// Services/ProfileService.jsx
import api from '../../Authpage/Services/Api';

class ProfileService {
    // Get user profile
    async getProfile() {
        try {
            const response = await api.get('/Client/profile');

            if (response && response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: response.message || 'Profile retrieved successfully'
                };
            }

            return {
                success: false,
                message: response?.message || 'Failed to retrieve profile'
            };
        } catch (error) {
            console.error('Get profile error:', error);

            const errorMessage = error?.message ||
                error?.response?.data?.message ||
                'Failed to retrieve profile';

            return {
                success: false,
                message: errorMessage
            };
        }
    }

    // Update user profile
    async updateProfile(profileData) {
        try {
            // Filter only modifiable fields for submission
            const modifiableData = {
                email: profileData.email,
                firstName: profileData.firstName,
                middleName: profileData.middleName,
                lastName: profileData.lastName,
                suffix: profileData.suffix,
                cellPhoneNo: profileData.cellPhoneNo,
                country: profileData.country,
                city: profileData.city,
                street: profileData.street,
                zipCode: profileData.zipCode
            };

            const response = await api.put('/Client/profile', modifiableData);

            if (response && response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: response.message || 'Profile updated successfully'
                };
            }

            return {
                success: false,
                message: response?.message || 'Failed to update profile'
            };
        } catch (error) {
            console.error('Update profile error:', error);

            const errorMessage = error?.message ||
                error?.response?.data?.message ||
                'Failed to update profile';

            return {
                success: false,
                message: errorMessage
            };
        }
    }

    // Update specific profile field
    async updateProfileField(fieldName, value) {
        try {
            const updateData = { [fieldName]: value };

            const response = await api.patch('/Client/profile/field', updateData);

            if (response && response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: response.message || 'Profile field updated successfully'
                };
            }

            return {
                success: false,
                message: response?.message || 'Failed to update profile field'
            };
        } catch (error) {
            console.error(`Update ${fieldName} error:`, error);

            const errorMessage = error?.message ||
                error?.response?.data?.message ||
                `Failed to update ${fieldName}`;

            return {
                success: false,
                message: errorMessage
            };
        }
    }

    // Change password
    async changePassword(passwordData) {
        try {
            const response = await api.post('/Client/change-password', passwordData);

            if (response && response.success) {
                return {
                    success: true,
                    message: response.message || 'Password changed successfully'
                };
            }

            return {
                success: false,
                message: response?.message || 'Failed to change password'
            };
        } catch (error) {
            console.error('Change password error:', error);

            const errorMessage = error?.message ||
                error?.response?.data?.message ||
                'Failed to change password';

            return {
                success: false,
                message: errorMessage
            };
        }
    }

    // Verify OTP for password change
    async verifyOtpForPasswordChange(otpData) {
        try {
            const response = await api.post('/Client/verify-otp-password', otpData);

            if (response && response.success) {
                return {
                    success: true,
                    message: response.message || 'OTP verified successfully'
                };
            }

            return {
                success: false,
                message: response?.message || 'Invalid OTP'
            };
        } catch (error) {
            console.error('OTP verification error:', error);

            const errorMessage = error?.message ||
                error?.response?.data?.message ||
                'OTP verification failed';

            return {
                success: false,
                message: errorMessage
            };
        }
    }

    // Resend OTP
    async resendOtp() {
        try {
            const response = await api.post('/Client/resend-otp');

            if (response && response.success) {
                return {
                    success: true,
                    message: response.message || 'OTP sent successfully'
                };
            }

            return {
                success: false,
                message: response?.message || 'Failed to resend OTP'
            };
        } catch (error) {
            console.error('Resend OTP error:', error);

            const errorMessage = error?.message ||
                error?.response?.data?.message ||
                'Failed to resend OTP';

            return {
                success: false,
                message: errorMessage
            };
        }
    }

    // Upload profile picture
    async uploadProfilePicture(file) {
        try {
            const formData = new FormData();
            formData.append('profilePicture', file);

            const response = await api.post('/Client/upload-profile-picture', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response && response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: response.message || 'Profile picture uploaded successfully'
                };
            }

            return {
                success: false,
                message: response?.message || 'Failed to upload profile picture'
            };
        } catch (error) {
            console.error('Upload profile picture error:', error);

            const errorMessage = error?.message ||
                error?.response?.data?.message ||
                'Failed to upload profile picture';

            return {
                success: false,
                message: errorMessage
            };
        }
    }

    // Delete profile picture
    async deleteProfilePicture() {
        try {
            const response = await api.delete('/Client/profile-picture');

            if (response && response.success) {
                return {
                    success: true,
                    message: response.message || 'Profile picture removed successfully'
                };
            }

            return {
                success: false,
                message: response?.message || 'Failed to remove profile picture'
            };
        } catch (error) {
            console.error('Delete profile picture error:', error);

            const errorMessage = error?.message ||
                error?.response?.data?.message ||
                'Failed to remove profile picture';

            return {
                success: false,
                message: errorMessage
            };
        }
    }

    // Get user activity/logs
    async getUserActivity() {
        try {
            const response = await api.get('/Client/activity');

            if (response && response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: response.message || 'User activity retrieved successfully'
                };
            }

            return {
                success: false,
                message: response?.message || 'Failed to retrieve user activity'
            };
        } catch (error) {
            console.error('Get user activity error:', error);

            const errorMessage = error?.message ||
                error?.response?.data?.message ||
                'Failed to retrieve user activity';

            return {
                success: false,
                message: errorMessage
            };
        }
    }
}

// Create singleton instance
const profileService = new ProfileService();
export default profileService;