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

// REMOVED: agentValidator and all validation functions

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