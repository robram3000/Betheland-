// Services/UserContextService.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import authService from './LoginAuth';
import profileService from '../../Accounts/Services/ProfileService';

const UserContext = createContext();

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);

    // Initialize user from localStorage and fetch fresh profile data
    useEffect(() => {
        const initializeUser = async () => {
            setLoading(true);

            // Get basic user info from auth service
            const currentUser = authService.getCurrentUser();

            if (currentUser && authService.isAuthenticated()) {
                setUser(currentUser);

                // Fetch fresh profile data from API
                try {
                    const profileResult = await profileService.getProfile();
                    if (profileResult.success) {
                        setProfile(profileResult.data);
                    } else {
                        // Fallback to localStorage data if API fails
                        const userData = localStorage.getItem('userData');
                        if (userData) {
                            setProfile(JSON.parse(userData));
                        }
                    }
                } catch (error) {
                    console.error('Failed to fetch profile:', error);
                    // Fallback to localStorage data
                    const userData = localStorage.getItem('userData');
                    if (userData) {
                        setProfile(JSON.parse(userData));
                    }
                }
            } else {
                setUser(null);
                setProfile(null);
            }

            setLoading(false);
        };

        initializeUser();
    }, []);

    // Update user profile
    const updateProfile = async (profileData) => {
        try {
            const result = await profileService.updateProfile(profileData);

            if (result.success) {
                setProfile(prevProfile => ({
                    ...prevProfile,
                    ...profileData
                }));

                // Update localStorage
                const userData = localStorage.getItem('userData');
                if (userData) {
                    const parsedData = JSON.parse(userData);
                    localStorage.setItem('userData', JSON.stringify({
                        ...parsedData,
                        ...profileData
                    }));
                }

                return result;
            }

            return result;
        } catch (error) {
            console.error('Update profile error:', error);
            return {
                success: false,
                message: 'Failed to update profile'
            };
        }
    };

    // Update specific profile field
    const updateProfileField = async (fieldName, value) => {
        try {
            const result = await profileService.updateProfileField(fieldName, value);

            if (result.success) {
                setProfile(prevProfile => ({
                    ...prevProfile,
                    [fieldName]: value
                }));

                // Update localStorage
                const userData = localStorage.getItem('userData');
                if (userData) {
                    const parsedData = JSON.parse(userData);
                    localStorage.setItem('userData', JSON.stringify({
                        ...parsedData,
                        [fieldName]: value
                    }));
                }
            }

            return result;
        } catch (error) {
            console.error('Update profile field error:', error);
            return {
                success: false,
                message: `Failed to update ${fieldName}`
            };
        }
    };

    // Logout user
    const logout = () => {
        authService.logout();
        setUser(null);
        setProfile(null);
    };

    // Refresh user data
    const refreshUser = async () => {
        setLoading(true);
        const currentUser = authService.getCurrentUser();

        if (currentUser && authService.isAuthenticated()) {
            setUser(currentUser);

            try {
                const profileResult = await profileService.getProfile();
                if (profileResult.success) {
                    setProfile(profileResult.data);
                }
            } catch (error) {
                console.error('Failed to refresh profile:', error);
            }
        } else {
            setUser(null);
            setProfile(null);
        }

        setLoading(false);
    };

    const value = {
        user,
        profile,
        loading,
        isAuthenticated: !!user && authService.isAuthenticated(),
        updateProfile,
        updateProfileField,
        logout,
        refreshUser,
        hasRole: (role) => user?.role === role || user?.userType === role,
        hasPermission: (permission) => {
            // Implement permission checking logic based on user role/type
            if (!user) return false;

            const userPermissions = {
                'Admin': ['all'],
                'User': ['read', 'write_own'],
                'Premium User': ['read', 'write_own', 'premium_features']
            };

            const permissions = userPermissions[user.role] || userPermissions[user.userType] || [];
            return permissions.includes('all') || permissions.includes(permission);
        }
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;