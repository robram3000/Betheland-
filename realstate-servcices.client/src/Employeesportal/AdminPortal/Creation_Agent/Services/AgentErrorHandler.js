export class AgentError extends Error {
    constructor(message, code = 'AGENT_ERROR', details = null) {
        super(message);
        this.name = 'AgentError';
        this.code = code;
        this.details = details;
        this.timestamp = new Date().toISOString();

        // Maintain proper prototype chain
        Object.setPrototypeOf(this, AgentError.prototype);
    }
}

export const agentErrorHandler = {
    handleServiceError: (error, operation) => {
        console.log('Handling service error:', { error, operation });

        // Handle Axios errors
        if (error.isAxiosError) {
            const status = error.response?.status;
            const data = error.response?.data;

            console.log('Axios error details:', { status, data });

            switch (status) {
                case 400:
                    return new AgentError(
                        data?.message || 'Invalid agent data provided',
                        'VALIDATION_ERROR',
                        data?.errors || data
                    );
                case 401:
                    return new AgentError(
                        'Authentication required for agent operations',
                        'AUTH_ERROR'
                    );
                case 403:
                    return new AgentError(
                        'Access denied to agent resources',
                        'PERMISSION_ERROR'
                    );
                case 404:
                    return new AgentError(
                        data?.message || 'Agent resource not found',
                        'NOT_FOUND'
                    );
                case 409:
                    return new AgentError(
                        data?.message || 'Agent already exists or duplicate entry',
                        'CONFLICT'
                    );
                case 422:
                    return new AgentError(
                        data?.message || 'Unprocessable agent entity',
                        'UNPROCESSABLE_ENTITY',
                        data?.errors
                    );
                case 500:
                    return new AgentError(
                        data?.message || 'Server error occurred while processing agent',
                        'SERVER_ERROR'
                    );
                case 502:
                case 503:
                case 504:
                    return new AgentError(
                        'Agent service temporarily unavailable',
                        'SERVICE_UNAVAILABLE'
                    );
                default:
                    // Handle network errors
                    if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
                        return new AgentError(
                            'Network connection failed. Please check your internet connection.',
                            'NETWORK_ERROR'
                        );
                    }

                    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
                        return new AgentError(
                            'Request timeout. Please try again.',
                            'REQUEST_TIMEOUT'
                        );
                    }

                    return new AgentError(
                        data?.message || `Network error: ${error.message}`,
                        'NETWORK_ERROR',
                        { status, data }
                    );
            }
        }

        // Handle our custom AgentError
        if (error instanceof AgentError) {
            return error;
        }

        // Handle specific error patterns
        if (error.message?.includes('Failed to map') || error.message?.includes('JSON')) {
            return new AgentError(
                'Agent data formatting error',
                'MAPPING_ERROR',
                { originalError: error.message }
            );
        }

        if (error.message?.includes('license') || error.message?.includes('License')) {
            return new AgentError(
                'License validation failed. Please check license number and expiry date.',
                'LICENSE_ERROR',
                { originalError: error.message }
            );
        }

        if (error.message?.includes('password') || error.message?.includes('Password')) {
            return new AgentError(
                'Password validation failed',
                'PASSWORD_ERROR',
                { originalError: error.message }
            );
        }

        // Generic error
        return new AgentError(
            error.message || `Agent operation failed: ${operation}`,
            'UNKNOWN_ERROR',
            { originalError: error }
        );
    },

    handleValidationError: (fieldErrors) => {
        return new AgentError(
            'Agent form validation failed',
            'FORM_VALIDATION_ERROR',
            fieldErrors
        );
    },

    handleProfilePictureError: (error) => {
        if (error.code === 'FILE_TOO_LARGE') {
            return new AgentError(
                'Profile picture file is too large',
                'FILE_TOO_LARGE'
            );
        }

        if (error.code === 'INVALID_FILE_TYPE') {
            return new AgentError(
                'Invalid profile picture file type',
                'INVALID_FILE_TYPE'
            );
        }

        return new AgentError(
            'Failed to upload profile picture',
            'UPLOAD_ERROR',
            { originalError: error }
        );
    },

    handleNetworkError: (error) => {
        if (error.message?.includes('Network Error')) {
            return new AgentError(
                'Network connection failed. Please check your internet connection.',
                'NETWORK_OFFLINE'
            );
        }

        if (error.message?.includes('timeout')) {
            return new AgentError(
                'Request timeout. Please try again.',
                'REQUEST_TIMEOUT'
            );
        }

        return new AgentError(
            'Network error occurred while accessing agent service',
            'NETWORK_ERROR',
            { originalError: error }
        );
    },

    handleLicenseError: (error) => {
        if (error.message?.includes('expired') || error.message?.includes('expiry')) {
            return new AgentError(
                'Agent license has expired',
                'LICENSE_EXPIRED'
            );
        }

        if (error.message?.includes('invalid') || error.message?.includes('number')) {
            return new AgentError(
                'Invalid license number format',
                'INVALID_LICENSE'
            );
        }

        return new AgentError(
            'License validation error',
            'LICENSE_ERROR',
            { originalError: error }
        );
    }
};

export const createAgentServiceWithErrorHandling = (agentService) => {
    const withErrorHandling = (operation, serviceMethod) => {
        return async (...args) => {
            try {
                console.log(`Executing agent operation: ${operation}`, args);
                const result = await serviceMethod(...args);
                console.log(`Agent operation ${operation} completed successfully:`, result);
                return result;
            } catch (error) {
                console.error(`Agent operation ${operation} failed:`, error);

                const handledError = agentErrorHandler.handleServiceError(error, operation);

                // Log the error details
                console.error(`Agent Service Error - ${operation}:`, {
                    error: handledError,
                    args: args.map(arg =>
                        typeof arg === 'object' && arg !== null && !(arg instanceof FormData)
                            ? { ...arg, password: arg.password ? '***' : undefined }
                            : arg
                    )
                });

                throw handledError;
            }
        };
    };

    return {
        getAgents: withErrorHandling('getAgents', agentService.getAgents),
        getAgent: withErrorHandling('getAgent', agentService.getAgent),
        createAgent: withErrorHandling('createAgent', agentService.createAgent),
        updateAgent: withErrorHandling('updateAgent', agentService.updateAgent),
        deleteAgent: withErrorHandling('deleteAgent', agentService.deleteAgent),
        verifyAgent: withErrorHandling('verifyAgent', agentService.verifyAgent),
        uploadImage: withErrorHandling('uploadImage', agentService.uploadImage)
    };
};

export const agentValidator = {
    validateCreateAgent: (agentData) => {
        const errors = {};

        // Required personal information
        if (!agentData.firstName?.trim()) {
            errors.firstName = 'First name is required';
        } else if (agentData.firstName.trim().length < 2) {
            errors.firstName = 'First name must be at least 2 characters';
        }

        if (!agentData.lastName?.trim()) {
            errors.lastName = 'Last name is required';
        } else if (agentData.lastName.trim().length < 2) {
            errors.lastName = 'Last name must be at least 2 characters';
        }

        if (!agentData.cellPhoneNo?.trim()) {
            errors.cellPhoneNo = 'Cell phone number is required';
        }

        // Email validation
        if (!agentData.email?.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(agentData.email)) {
            errors.email = 'Valid email is required';
        }

        // Required professional information
        if (!agentData.licenseNumber?.trim()) {
            errors.licenseNumber = 'License number is required';
        }

        // FIXED: License expiry validation - handle both moment objects and string dates
        let licenseExpiryValue = agentData.licenseExpiry;

        // If it's a moment object, convert to Date for validation
        if (licenseExpiryValue && typeof licenseExpiryValue === 'object' && licenseExpiryValue._isAMomentObject) {
            licenseExpiryValue = licenseExpiryValue.toDate();
        }

        if (!licenseExpiryValue) {
            errors.licenseExpiry = 'License expiry date is required';
        } else {
            const expiryDate = new Date(licenseExpiryValue);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (expiryDate <= today) {
                errors.licenseExpiry = 'License expiry date must be in the future';
            }
        }

        // Account information validation (only for new agents)
        if (!agentData.id) {
            if (!agentData.username?.trim()) {
                errors.username = 'Username is required';
            } else if (agentData.username.length < 3) {
                errors.username = 'Username must be at least 3 characters';
            } else if (!/^[a-zA-Z0-9_]+$/.test(agentData.username)) {
                errors.username = 'Username can only contain letters, numbers and underscore';
            }

            if (!agentData.password?.trim()) {
                errors.password = 'Password is required for new agents';
            } else if (agentData.password.length < 6) {
                errors.password = 'Password must be at least 6 characters';
            } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(agentData.password)) {
                errors.password = 'Password must contain at least one uppercase letter, one lowercase letter and one number';
            }
        }

        // Years of experience validation
        if (agentData.yearsOfExperience !== undefined && agentData.yearsOfExperience !== null) {
            if (agentData.yearsOfExperience < 0) {
                errors.yearsOfExperience = 'Years of experience cannot be negative';
            }
            if (agentData.yearsOfExperience > 50) {
                errors.yearsOfExperience = 'Years of experience cannot exceed 50';
            }
        }

        if (Object.keys(errors).length > 0) {
            throw agentErrorHandler.handleValidationError(errors);
        }

        return true;
    },

    validateUpdateAgent: (agentData) => {
        const errors = {};

        if (!agentData.id) {
            errors.id = 'Agent ID is required for update';
        }

        // Reuse create validation for common fields
        try {
            agentValidator.validateCreateAgent(agentData);
        } catch (error) {
            if (error.code === 'FORM_VALIDATION_ERROR') {
                Object.assign(errors, error.details);
            } else {
                throw error;
            }
        }

        if (Object.keys(errors).length > 0) {
            throw agentErrorHandler.handleValidationError(errors);
        }

        return true;
    },

    validateProfilePicture: (file, options = {}) => {
        const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/gif'] } = options;
        const errors = [];

        if (file.size > maxSize) {
            errors.push({
                fileName: file.name,
                error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit`
            });
        }

        if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
            errors.push({
                fileName: file.name,
                error: `File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(', ')}`
            });
        }

        if (errors.length > 0) {
            throw agentErrorHandler.handleProfilePictureError(
                new Error('Profile picture validation failed'),
                { fileErrors: errors }
            );
        }

        return true;
    }
};

export const useAgentErrorHandler = () => {
    const handleError = (error, userMessage = null) => {
        let message = userMessage;
        let code = 'UNKNOWN_ERROR';
        let details = null;

        if (error instanceof AgentError) {
            message = error.message;
            code = error.code;
            details = error.details;
        } else if (error.isAxiosError) {
            message = error.response?.data?.message || error.message;
            code = 'NETWORK_ERROR';
            details = error.response?.data;
        } else {
            message = error.message || 'An unexpected error occurred';
        }

        return {
            message,
            code,
            details,
            isNetworkError: code.includes('NETWORK'),
            isValidationError: code.includes('VALIDATION'),
            isAuthError: code.includes('AUTH'),
            isLicenseError: code.includes('LICENSE')
        };
    };

    return { handleError };
};

export default agentErrorHandler;