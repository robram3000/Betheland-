
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
    const { isAuthenticated, loading, hasRole, hasPermission, hasAnyPermission, hasAllPermissions, canAccessRoute } = useUser();
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
        return <Navigate to={`/login?returnUrl=${encodeURIComponent(location.pathname + location.search)}`} replace />;
    }

    const currentPath = location.pathname;
    const routeAccess = canAccessRoute(currentPath);


    if (!routeAccess) {
     
        return <Navigate to={fallbackPath} replace />;
    }
    if (requiredRole && !hasRole(requiredRole)) {
       
        return <Navigate to={fallbackPath} replace />;
    }

    if (requiredPermission && !hasPermission(requiredPermission)) {
       
        return <Navigate to={fallbackPath} replace />;
    }

    if (requiredAnyPermission.length > 0 && !hasAnyPermission(requiredAnyPermission)) {
        return <Navigate to={fallbackPath} replace />;
    }

    // Check all of multiple permissions
    if (requiredAllPermissions.length > 0 && !hasAllPermissions(requiredAllPermissions)) {
        return <Navigate to={fallbackPath} replace />;
    }


    return children;
};

export const PublicOnlyRoute = ({ children, fallbackPath = "/properties" }) => {
    const { isAuthenticated, loading, user } = useUser();

    useEffect(() => {
        
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
    if (!allowedRoles.includes(userRole)) {
       
        return <Navigate to={fallbackPath} replace />;
    }
    return children;
};

export default ProtectedRoute;