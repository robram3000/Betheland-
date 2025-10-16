// Services/PermissionConfig.js
export const rolePermissions = {
    'SuperAdmin': [
        'all',
        'manage_users',
        'manage_system',
        'view_reports',
        'manage_admins',
        'manage_agents',
        'manage_clients',
        'manage_properties',
        'manage_schedule',
        'view_analytics',
        'manage_roles',
        'system_config',
        'audit_logs'
    ],
    'Admin': [
        'manage_users',
        'view_reports',
        'manage_agents',
        'manage_clients',
        'manage_properties',
        'view_analytics',
        'manage_schedule',
        'approve_properties'
    ],
    'Agent': [
        'manage_properties',
        'view_clients',
        'update_profile',
        'manage_schedule',
        'view_own_properties',
        'manage_own_schedule',
        'create_properties',
        'edit_own_properties',
        'view_appointments',
        'manage_profile'
    ],
    'Client': [
        'view_properties',
        'manage_own_profile',
        'make_offers',
        'view_wishlist',
        'schedule_viewings',
        'send_messages',
        'view_own_offers'
    ]
};

export const routePermissions = {
    // Super Admin Routes
    '/portal/super-admin': ['SuperAdmin'],
    '/portal/super-admin/users': ['SuperAdmin'],
    '/portal/super-admin/system-settings': ['SuperAdmin'],
    '/portal/super-admin/roles': ['SuperAdmin'],
    '/portal/super-admin/analytics': ['SuperAdmin', 'Admin'],
    '/portal/super-admin/audit-logs': ['SuperAdmin'],

    // Admin Routes
    '/portal/admin': ['SuperAdmin', 'Admin'],
    '/portal/admin/analytics': ['SuperAdmin', 'Admin'],
    '/portal/admin/properties': ['SuperAdmin', 'Admin'],
    '/portal/admin/agent': ['SuperAdmin', 'Admin'],

    // Agent Routes
    '/portal/agent': ['SuperAdmin', 'Admin', 'Agent'],
    '/portal/agent/all-properties': ['SuperAdmin', 'Admin', 'Agent'],
    '/portal/agent/all-schedule': ['SuperAdmin', 'Admin', 'Agent'],
    '/portal/agent/my-properties': ['SuperAdmin', 'Admin', 'Agent'],
    '/portal/agent/my-schedule': ['SuperAdmin', 'Admin', 'Agent'],
    '/portal/agent/clients': ['SuperAdmin', 'Admin', 'Agent'],
    '/portal/agent/profile': ['SuperAdmin', 'Admin', 'Agent'],

    // Client Routes
    '/profile': ['SuperAdmin', 'Admin', 'Agent', 'Client'],
    '/settings': ['SuperAdmin', 'Admin', 'Agent', 'Client'],
    '/wishlist': ['Client'],
    '/schedule': ['Client'],
    '/messages': ['SuperAdmin', 'Admin', 'Agent', 'Client'],
    '/offers': ['Client'],

    // Common Routes
    '/properties': ['SuperAdmin', 'Admin', 'Client'],
    '/properties/view': ['SuperAdmin', 'Admin', 'Agent', 'Client']
};

export const featurePermissions = {
    // User Management
    canManageUsers: ['SuperAdmin', 'Admin'],
    canManageAdmins: ['SuperAdmin'],
    canManageAgents: ['SuperAdmin', 'Admin'],
    canViewAllUsers: ['SuperAdmin', 'Admin'],

    // Property Management
    canManageProperties: ['SuperAdmin', 'Admin', 'Agent'],
    canCreateProperties: ['SuperAdmin', 'Admin', 'Agent'],
    canApproveProperties: ['SuperAdmin', 'Admin'],
    canViewAllProperties: ['SuperAdmin', 'Admin'],
    canEditAnyProperty: ['SuperAdmin', 'Admin'],
    canDeleteProperties: ['SuperAdmin', 'Admin'],

    // Schedule Management
    canManageSchedule: ['SuperAdmin', 'Admin', 'Agent', 'Client'],
    canViewAllSchedules: ['SuperAdmin', 'Admin'],
    canManageOwnSchedule: ['SuperAdmin', 'Admin', 'Agent', 'Client'],

    // Analytics & Reports
    canViewAnalytics: ['SuperAdmin', 'Admin'],
    canGenerateReports: ['SuperAdmin', 'Admin'],
    canViewSystemAnalytics: ['SuperAdmin'],

    // System Management
    canManageSystem: ['SuperAdmin'],
    canConfigureSystem: ['SuperAdmin'],
    canViewAuditLogs: ['SuperAdmin'],

    // Client Features
    canMakeOffers: ['Client'],
    canViewWishlist: ['Client'],
    canScheduleViewings: ['Client']
};

export const getRoutePermissions = (path) => {
    return routePermissions[path] || [];
};

export const getUserPermissions = (userRole) => {
    return rolePermissions[userRole] || [];
};

export const canAccessFeature = (userRole, feature) => {
    const permissions = rolePermissions[userRole] || [];
    return permissions.includes('all') || permissions.includes(feature);
};