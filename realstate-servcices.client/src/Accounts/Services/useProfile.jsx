// Services/useProfile.jsx
import { useState, useCallback } from 'react';
import { message } from 'antd';
import profileService from './ProfileService';
import authService from '../../Authpage/Services/LoginAuth';

const useProfile = () => {
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);

    // Get user profile
    const getProfile = useCallback(async () => {
        setLoading(true);
        try {
            const result = await profileService.getProfile();
            setLoading(false);
            return result;
        } catch (error) {
            setLoading(false);
            console.error('Get profile hook error:', error);
            return {
                success: false,
                message: 'Failed to load profile'
            };
        }
    }, []);

    // Update profile
    const updateProfile = useCallback(async (profileData) => {
        setUpdating(true);
        try {
            const result = await profileService.updateProfile(profileData);

            if (result.success) {
                message.success(result.message || 'Profile updated successfully');

                // Update localStorage if email changed
                if (profileData.email) {
                    const userData = localStorage.getItem('userData');
                    if (userData) {
                        const parsedData = JSON.parse(userData);
                        localStorage.setItem('userData', JSON.stringify({
                            ...parsedData,
                            email: profileData.email
                        }));
                    }
                }
            } else {
                message.error(result.message || 'Failed to update profile');
            }

            setUpdating(false);
            return result;
        } catch (error) {
            setUpdating(false);
            console.error('Update profile hook error:', error);
            message.error('Failed to update profile');
            return {
                success: false,
                message: 'Failed to update profile'
            };
        }
    }, []);

    // Update single field
    const updateField = useCallback(async (fieldName, value) => {
        setUpdating(true);
        try {
            const result = await profileService.updateProfileField(fieldName, value);

            if (result.success) {
                message.success(`${fieldName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} updated successfully`);

                // Update localStorage
                const userData = localStorage.getItem('userData');
                if (userData) {
                    const parsedData = JSON.parse(userData);
                    localStorage.setItem('userData', JSON.stringify({
                        ...parsedData,
                        [fieldName]: value
                    }));
                }
            } else {
                message.error(result.message || `Failed to update ${fieldName}`);
            }

            setUpdating(false);
            return result;
        } catch (error) {
            setUpdating(false);
            console.error(`Update ${fieldName} hook error:`, error);
            message.error(`Failed to update ${fieldName}`);
            return {
                success: false,
                message: `Failed to update ${fieldName}`
            };
        }
    }, []);

    // Change password
    const changePassword = useCallback(async (passwordData) => {
        setUpdating(true);
        try {
            const result = await profileService.changePassword(passwordData);

            if (result.success) {
                message.success(result.message || 'Password changed successfully');
            } else {
                message.error(result.message || 'Failed to change password');
            }

            setUpdating(false);
            return result;
        } catch (error) {
            setUpdating(false);
            console.error('Change password hook error:', error);
            message.error('Failed to change password');
            return {
                success: false,
                message: 'Failed to change password'
            };
        }
    }, []);

    // Verify OTP
    const verifyOtp = useCallback(async (otpData) => {
        setUpdating(true);
        try {
            const result = await profileService.verifyOtpForPasswordChange(otpData);

            if (result.success) {
                message.success(result.message || 'OTP verified successfully');
            } else {
                message.error(result.message || 'Invalid OTP');
            }

            setUpdating(false);
            return result;
        } catch (error) {
            setUpdating(false);
            console.error('OTP verification hook error:', error);
            message.error('OTP verification failed');
            return {
                success: false,
                message: 'OTP verification failed'
            };
        }
    }, []);

    // Resend OTP
    const resendOtp = useCallback(async () => {
        try {
            const result = await profileService.resendOtp();

            if (result.success) {
                message.success(result.message || 'OTP sent successfully');
            } else {
                message.error(result.message || 'Failed to send OTP');
            }

            return result;
        } catch (error) {
            console.error('Resend OTP hook error:', error);
            message.error('Failed to send OTP');
            return {
                success: false,
                message: 'Failed to send OTP'
            };
        }
    }, []);

    // Upload profile picture
    const uploadProfilePicture = useCallback(async (file) => {
        setUpdating(true);
        try {
            const result = await profileService.uploadProfilePicture(file);

            if (result.success) {
                message.success(result.message || 'Profile picture updated successfully');
            } else {
                message.error(result.message || 'Failed to upload profile picture');
            }

            setUpdating(false);
            return result;
        } catch (error) {
            setUpdating(false);
            console.error('Upload profile picture hook error:', error);
            message.error('Failed to upload profile picture');
            return {
                success: false,
                message: 'Failed to upload profile picture'
            };
        }
    }, []);

    return {
        loading,
        updating,
        getProfile,
        updateProfile,
        updateField,
        changePassword,
        verifyOtp,
        resendOtp,
        uploadProfilePicture
    };
};

export default useProfile;