// Services/UserContextService.jsx (Updated)
import { createContext, useContext, useState, useEffect } from 'react';
import authService from './LoginAuth';
import SessionService from './SessionService';
import { rolePermissions, canAccessFeature, routePermissions } from './PermissionConfig';

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
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastActivity, setLastActivity] = useState(Date.now());
    const [userPermissions, setUserPermissions] = useState([]);

    // Update permissions when user changes
    useEffect(() => {
        if (user) {
            const userRole = user?.role || user?.userType;
            const permissions = rolePermissions[userRole] || [];
            setUserPermissions(permissions);
        } else {
            setUserPermissions([]);
        }
    }, [user]);

    // Track user activity
    useEffect(() => {
        const updateActivity = () => setLastActivity(Date.now());

        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        events.forEach(event => {
            document.addEventListener(event, updateActivity);
        });

        return () => {
            events.forEach(event => {
                document.removeEventListener(event, updateActivity);
            });
        };
    }, []);

    // Initialize user from storage
    useEffect(() => {
        const initializeUser = async () => {
            setLoading(true);

            // Check token validity first
            if (!authService.isAuthenticated()) {
                authService.logout();
                setLoading(false);
                return;
            }

            const currentUser = authService.getCurrentUser();

            if (currentUser) {
                setUser(currentUser);

                // Set initial permissions
                const userRole = currentUser?.role || currentUser?.userType;
                setUserPermissions(rolePermissions[userRole] || []);

                // Use stored profile data
                const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
                if (userData) {
                    try {
                        setProfile(JSON.parse(userData));
                    } catch (error) {
                        console.error('Error parsing user data:', error);
                    }
                }
            } else {
                setUser(null);
                setProfile(null);
                setUserPermissions([]);
            }

            setLoading(false);
        };

        initializeUser();
        SessionService.setupActivityListeners();
    }, []);

    // Update user profile
    const updateProfile = async (profileData) => {
        try {
            // Update local state
            const updatedProfile = {
                ...profile,
                ...profileData
            };

            setProfile(updatedProfile);

            // Update storage
            const storage = user?.rememberMe ? localStorage : sessionStorage;
            storage.setItem('userData', JSON.stringify(updatedProfile));

            return {
                success: true,
                message: 'Profile updated successfully'
            };
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
            const updatedProfile = {
                ...profile,
                [fieldName]: value
            };

            setProfile(updatedProfile);

            // Update storage
            const storage = user?.rememberMe ? localStorage : sessionStorage;
            storage.setItem('userData', JSON.stringify(updatedProfile));

            return {
                success: true,
                message: `${fieldName} updated successfully`
            };
        } catch (error) {
            console.error('Update profile field error:', error);
            return {
                success: false,
                message: `Failed to update ${fieldName}`
            };
        }
    };

    // Login function for context
    const login = async (usernameOrEmail, password, rememberMe = false) => {
        setLoading(true);
        try {
            const result = await authService.login(usernameOrEmail, password, rememberMe);

            if (result.success) {
                const currentUser = authService.getCurrentUser();
                console.log("UserContext - Current User:", currentUser);

                // Ensure role consistency
                const normalizedUser = {
                    ...currentUser,
                    role: currentUser?.role || currentUser?.userType // Map userType to role
                };

                setUser(normalizedUser);

                // Set permissions
                const userRole = normalizedUser?.role;
                setUserPermissions(rolePermissions[userRole] || []);

                // Set profile from auth data
                const userData = {
                    userId: result.data.userId,
                    email: result.data.email,
                    userType: result.data.userType,
                    username: result.data.username || '',
                    role: result.data.userType // Ensure role is set
                };
                setProfile(userData);
            }

            return result;
        } catch (error) {
            console.error('Login error in context:', error);
            return {
                success: false,
                message: 'Login failed'
            };
        } finally {
            setLoading(false);
        }
    };

    // Logout user
    const logout = () => {
        authService.logout();
        setUser(null);
        setProfile(null);
        setUserPermissions([]);
        SessionService.cleanup();
    };

    // Refresh user data
    const refreshUser = async () => {
        setLoading(true);
        const currentUser = authService.getCurrentUser();

        if (currentUser && authService.isAuthenticated()) {
            setUser(currentUser);

            // Update permissions
            const userRole = currentUser?.role || currentUser?.userType;
            setUserPermissions(rolePermissions[userRole] || []);

            // Refresh profile from storage
            const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
            if (userData) {
                try {
                    setProfile(JSON.parse(userData));
                } catch (error) {
                    console.error('Error parsing user data:', error);
                }
            }
        } else {
            setUser(null);
            setProfile(null);
            setUserPermissions([]);
        }

        setLoading(false);
    };

    // Check session validity
    const checkSession = async () => {
        const isValid = await SessionService.validateSession();
        if (!isValid) {
            logout();
        }
        return isValid;
    };

    // Enhanced permission system
    const hasRole = (role) => {
        const userRole = user?.role || user?.userType;
        return userRole === role;
    };

    const hasPermission = (permission) => {
        if (!user) return false;
        return userPermissions.includes('all') || userPermissions.includes(permission);
    };

    const hasAnyPermission = (permissions = []) => {
        if (!user) return false;
        return permissions.some(permission => hasPermission(permission));
    };

    const hasAllPermissions = (permissions = []) => {
        if (!user) return false;
        return permissions.every(permission => hasPermission(permission));
    };

    const canAccessRoute = (routePath) => {
        if (!user) return false;

        const allowedRoles = routePermissions[routePath] || [];
        const userRole = user?.role || user?.userType;

        console.log("🔐 Route Access Check:", {
            route: routePath,
            userRole: userRole,
            allowedRoles: allowedRoles,
            hasAccess: allowedRoles.includes(userRole)
        });

        return allowedRoles.includes(userRole);
    };

    const value = {
        user,
        profile,
        loading,
        lastActivity,
        userPermissions,
        isAuthenticated: !!user && authService.isAuthenticated(),
        updateProfile,
        updateProfileField,
        login,
        logout,
        refreshUser,
        checkSession,

        // Enhanced permission system
        hasRole,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        canAccessRoute,
        canAccessFeature: (feature) => canAccessFeature(user?.role || user?.userType, feature),

        // Quick role checks
        isSuperAdmin: () => user?.role === 'SuperAdmin' || user?.userType === 'SuperAdmin',
        isAdmin: () => user?.role === 'Admin' || user?.userType === 'Admin',
        isAgent: () => user?.role === 'Agent' || user?.userType === 'Agent',
        isClient: () => user?.role === 'Client' || user?.userType === 'Client',

        // Quick permission checks for common features
        canManageUsers: () => hasAnyPermission(['manage_users', 'all']),
        canManageProperties: () => hasAnyPermission(['manage_properties', 'all']),
        canViewAnalytics: () => hasAnyPermission(['view_analytics', 'all']),
        canManageSystem: () => hasAnyPermission(['manage_system', 'all'])
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;