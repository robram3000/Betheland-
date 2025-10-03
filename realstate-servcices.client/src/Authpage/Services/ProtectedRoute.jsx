// Components/ProtectedRoute.jsx (Enhanced)
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useUser } from './UserContextService';

const ProtectedRoute = ({
    children,
    requiredRole,
    requiredPermission,
    requiredAnyPermission = [],
    requiredAllPermissions = [],
    fallbackPath = "/unauthorized"
}) => {
    const { isAuthenticated, user, loading, hasRole, hasPermission, hasAnyPermission, hasAllPermissions, canAccessRoute } = useUser();
    const location = useLocation();

    useEffect(() => {
        if (!loading) {
            console.log("🔒 ProtectedRoute Debug:", {
                path: location.pathname,
                userRole: user?.role || user?.userType,
                isAuthenticated,
                requiredRole,
                requiredPermission,
                requiredAnyPermission,
                requiredAllPermissions
            });
        }
    }, [loading, location.pathname, user, isAuthenticated]);

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <Spin size="large" tip="Loading..." />
            </div>
        );
    }

    if (!isAuthenticated) {
        console.log("🔐 Not authenticated, redirecting to login");
        // Redirect to login with return url
        return <Navigate to={`/login?returnUrl=${encodeURIComponent(location.pathname + location.search)}`} replace />;
    }

    // Check route-based permissions first
    const currentPath = location.pathname;
    const routeAccess = canAccessRoute(currentPath);

    console.log("🛣️ Route Access Check Result:", {
        path: currentPath,
        userRole: user?.role || user?.userType,
        routeAccess
    });

    if (!routeAccess) {
        console.log("🚫 Route access denied for path:", currentPath);
        return <Navigate to={fallbackPath} replace />;
    }

    // Check specific role requirement
    if (requiredRole && !hasRole(requiredRole)) {
        console.log("🚫 Role requirement not met. Required:", requiredRole, "User has:", user?.role || user?.userType);
        return <Navigate to={fallbackPath} replace />;
    }

    // Check single permission requirement
    if (requiredPermission && !hasPermission(requiredPermission)) {
        console.log("🚫 Permission requirement not met. Required:", requiredPermission);
        return <Navigate to={fallbackPath} replace />;
    }

    // Check any of multiple permissions
    if (requiredAnyPermission.length > 0 && !hasAnyPermission(requiredAnyPermission)) {
        console.log("🚫 Any permission requirement not met. Required any of:", requiredAnyPermission);
        return <Navigate to={fallbackPath} replace />;
    }

    // Check all of multiple permissions
    if (requiredAllPermissions.length > 0 && !hasAllPermissions(requiredAllPermissions)) {
        console.log("🚫 All permissions requirement not met. Required all of:", requiredAllPermissions);
        return <Navigate to={fallbackPath} replace />;
    }

    console.log("✅ Access granted to:", currentPath);
    return children;
};

export const PublicOnlyRoute = ({ children, fallbackPath = "/properties" }) => {
    const { isAuthenticated, loading, user } = useUser();

    useEffect(() => {
        if (!loading && isAuthenticated) {
            const userRole = user?.role || user?.userType;
            console.log("🔐 User is authenticated, redirecting from public route. User role:", userRole);
        }
    }, [loading, isAuthenticated, user, fallbackPath]);

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <Spin size="large" tip="Loading..." />
            </div>
        );
    }

    if (isAuthenticated) {
        // Get appropriate redirect path based on user role
        const userRole = user?.role || user?.userType;
        let redirectPath = fallbackPath;

        if (userRole === 'Agent') redirectPath = '/portal/agent/all-properties';
        else if (userRole === 'Admin') redirectPath = '/portal/admin';
        else if (userRole === 'SuperAdmin') redirectPath = '/portal/super-admin';
        else if (userRole === 'Client') redirectPath = '/properties';

        return <Navigate to={redirectPath} replace />;
    }

    return children;
};

export const RoleSpecificRoute = ({
    children,
    allowedRoles = [],
    fallbackPath = "/unauthorized"
}) => {
    const { user, loading } = useUser();

    useEffect(() => {
        if (!loading && user) {
            const userRole = user?.role || user?.userType;
            console.log("🎯 RoleSpecificRoute Debug:", {
                userRole,
                allowedRoles,
                hasAccess: allowedRoles.includes(userRole)
            });
        }
    }, [loading, user, allowedRoles]);

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <Spin size="large" tip="Loading..." />
            </div>
        );
    }

    const userRole = user?.role || user?.userType;
    if (!allowedRoles.includes(userRole)) {
        console.log("🚫 Role not in allowed roles. User role:", userRole, "Allowed:", allowedRoles);
        return <Navigate to={fallbackPath} replace />;
    }

    console.log("✅ Role access granted for:", userRole);
    return children;
};

export default ProtectedRoute;