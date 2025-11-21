
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
    const {
        isAuthenticated,
        loading,
        hasRole,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        canAccessRoute,
        user,
        userPermissions
    } = useUser();
    const location = useLocation();

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
        console.log('ProtectedRoute: Not authenticated, redirecting to login');
        return <Navigate to={`/login?returnUrl=${encodeURIComponent(location.pathname + location.search)}`} replace />;
    }

    // Debug information
    console.log('ProtectedRoute Debug:', {
        currentPath: location.pathname,
        userRole: user?.role || user?.userType,
        userPermissions,
        requiredRole,
        requiredPermission,
        requiredAnyPermission,
        requiredAllPermissions
    });

    const currentPath = location.pathname;
    const routeAccess = canAccessRoute(currentPath);

    if (!routeAccess) {
        console.log('ProtectedRoute: Route access denied for path:', currentPath);
        return <Navigate to={fallbackPath} replace />;
    }

    if (requiredRole && !hasRole(requiredRole)) {
        console.log('ProtectedRoute: Required role not met. Required:', requiredRole, 'User has:', user?.role || user?.userType);
        return <Navigate to={fallbackPath} replace />;
    }

    if (requiredPermission && !hasPermission(requiredPermission)) {
        console.log('ProtectedRoute: Required permission not met. Required:', requiredPermission, 'User permissions:', userPermissions);
        return <Navigate to={fallbackPath} replace />;
    }

    if (requiredAnyPermission.length > 0 && !hasAnyPermission(requiredAnyPermission)) {
        console.log('ProtectedRoute: Required any permission not met. Required any of:', requiredAnyPermission, 'User permissions:', userPermissions);
        return <Navigate to={fallbackPath} replace />;
    }

    if (requiredAllPermissions.length > 0 && !hasAllPermissions(requiredAllPermissions)) {
        console.log('ProtectedRoute: Required all permissions not met. Required all of:', requiredAllPermissions, 'User permissions:', userPermissions);
        return <Navigate to={fallbackPath} replace />;
    }

    console.log('ProtectedRoute: Access granted for:', currentPath);
    return children;
};

export const PublicOnlyRoute = ({ children, fallbackPath = "/properties" }) => {
    const { isAuthenticated, loading, user } = useUser();

    useEffect(() => {
        // Debug public route
        console.log('PublicOnlyRoute Debug:', {
            isAuthenticated,
            userRole: user?.role || user?.userType,
            loading
        });
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
        console.log('PublicOnlyRoute: User is authenticated, redirecting to appropriate portal');
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
    console.log('RoleSpecificRoute Debug:', {
        userRole,
        allowedRoles,
        hasAccess: allowedRoles.includes(userRole)
    });

    if (!allowedRoles.includes(userRole)) {
        console.log('RoleSpecificRoute: User role not in allowed roles. User role:', userRole, 'Allowed roles:', allowedRoles);
        return <Navigate to={fallbackPath} replace />;
    }

    return children;
};

export default ProtectedRoute;