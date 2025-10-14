import { useState, useCallback } from 'react';
import { message } from 'antd';
import profileService from './ProfileService';

const useProfile = () => {
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [error, setError] = useState(null);
    const getProfile = useCallback(async (showMessage = false) => {
        setLoading(true);
        setError(null);
        try {
            const result = await profileService.getProfile();
            if (result.success && result.data) {
                setProfileData(result.data);
                if (showMessage) {
                    message.success('Profile loaded successfully');
                }
            } else {
                setError(result.message);
                if (showMessage) {
                    message.error(result.message || 'Failed to load profile');
                }
            }

            setLoading(false);
            return result;
        } catch (error) {
            setError(error.message);
            setLoading(false);

            if (showMessage) {
                message.error('Failed to load profile');
            }

            return {
                success: false,
                message: 'Failed to load profile',
                error: error
            };
        }
    }, []);

    const updateProfile = useCallback(async (profileData) => {
        console.log('🔄 useProfile - Updating profile with data:', profileData);
        setUpdating(true);
        setError(null);

        try {
            const result = await profileService.updateProfile(profileData);
            console.log('📦 useProfile - Update result:', result);

            if (result.success) {
                message.success('Profile updated successfully');
                // Refresh profile data after update
                await getProfile(false);
            } else {
                message.error(result.message || 'Failed to update profile');
                setError(result.message);
            }

            setUpdating(false);
            return result;
        } catch (error) {
            console.error('💥 useProfile - Update error:', error);
            setError(error.message);
            setUpdating(false);
            message.error('Failed to update profile');

            return {
                success: false,
                message: 'Failed to update profile',
                error: error
            };
        }
    }, [getProfile]);

    const updateField = useCallback(async (fieldName, value) => {
        setUpdating(true);
        setError(null);

        try {
            const result = await profileService.updateProfileField(fieldName, value);

            if (result.success) {
                message.success(`${fieldName} updated successfully`);
                setProfileData(prev => ({ ...prev, [fieldName]: value }));
            } else {
                message.error(result.message || `Failed to update ${fieldName}`);
                setError(result.message);
            }

            setUpdating(false);
            return result;
        } catch (error) {
            console.error(`💥 useProfile - Update ${fieldName} error:`, error);
            setError(error.message);
            setUpdating(false);
            message.error(`Failed to update ${fieldName}`);

            return {
                success: false,
                message: `Failed to update ${fieldName}`,
                error: error
            };
        }
    }, []);

    const changePassword = useCallback(async (passwordData) => {
        setUpdating(true);
        setError(null);

        try {
            const result = await profileService.changePassword(passwordData);

            if (result.success) {
                message.success('Password changed successfully');
            } else {
                message.error(result.message || 'Failed to change password');
                setError(result.message);
            }

            setUpdating(false);
            return result;
        } catch (error) {
            console.error('💥 useProfile - Change password error:', error);
            setError(error.message);
            setUpdating(false);
            message.error('Failed to change password');

            return {
                success: false,
                message: 'Failed to change password',
                error: error
            };
        }
    }, []);

    const uploadProfilePicture = useCallback(async (file) => {
        setUpdating(true);
        setError(null);

        try {
            const result = await profileService.uploadProfilePicture(file);

            if (result.success) {
                message.success('Profile picture updated successfully');
            } else {
                message.error(result.message || 'Failed to upload profile picture');
                setError(result.message);
            }

            setUpdating(false);
            return result;
        } catch (error) {
            console.error('💥 useProfile - Upload profile picture error:', error);
            setError(error.message);
            setUpdating(false);
            message.error('Failed to upload profile picture');

            return {
                success: false,
                message: 'Failed to upload profile picture',
                error: error
            };
        }
    }, []);

    const testApiConnection = useCallback(async () => {
        setLoading(true);

        try {
            const result = await profileService.testApiConnection();

            setLoading(false);
            return result;
        } catch (error) {
            console.error('🧪 useProfile - API test error:', error);
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

    return {
        loading,
        updating,
        profileData,
        error,
        getProfile,
        updateProfile,
        updateField,
        changePassword,
        uploadProfilePicture,
        testApiConnection,
        clearError
    };
};

export default useProfile;