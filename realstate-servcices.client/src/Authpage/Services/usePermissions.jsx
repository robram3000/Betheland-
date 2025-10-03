// Hooks/usePermissions.js
import { useUser } from './UserContextService';
import { canAccessFeature } from './PermissionConfig';

export const usePermissions = () => {
    const {
        user,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        canAccessRoute,
        isSuperAdmin,
        isAdmin,
        isAgent,
        isClient
    } = useUser();

    const currentRole = user?.role || user?.userType;

    return {
        // Basic permission checks
        can: (permission) => hasPermission(permission),
        canAny: (permissions) => hasAnyPermission(permissions),
        canAll: (permissions) => hasAllPermissions(permissions),

        // Route access
        canAccess: (route) => canAccessRoute(route),

        // Role checks
        isSuperAdmin: isSuperAdmin(),
        isAdmin: isAdmin(),
        isAgent: isAgent(),
        isClient: isClient(),
        currentRole,

        // Feature-specific permission checks
        canManageUsers: () => hasAnyPermission(['manage_users', 'all']),
        canManageProperties: () => hasAnyPermission(['manage_properties', 'all']),
        canCreateProperties: () => hasAnyPermission(['create_properties', 'manage_properties', 'all']),
        canApproveProperties: () => hasAnyPermission(['approve_properties', 'all']),
        canViewAnalytics: () => hasAnyPermission(['view_analytics', 'all']),
        canManageSystem: () => hasAnyPermission(['manage_system', 'all']),
        canManageSchedule: () => hasAnyPermission(['manage_schedule', 'all']),
        canMakeOffers: () => hasAnyPermission(['make_offers', 'all']),

        // Quick access to feature permissions
        featureAccess: (feature) => canAccessFeature(currentRole, feature)
    };
};

// Hook for component-level permission guards
export const usePermissionGuard = (requiredPermission, fallbackComponent = null) => {
    const { hasPermission, isAuthenticated, loading } = useUser();

    if (loading) {
        return { hasAccess: false, loading: true };
    }

    if (!isAuthenticated) {
        return { hasAccess: false, loading: false };
    }

    const hasAccess = hasPermission(requiredPermission);

    return {
        hasAccess,
        loading: false,
        FallbackComponent: hasAccess ? null : (() => fallbackComponent)
    };
};