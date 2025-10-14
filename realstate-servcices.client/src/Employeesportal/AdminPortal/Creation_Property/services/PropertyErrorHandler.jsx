// PropertyErrorHandler.js
export class PropertyError extends Error {
    constructor(message, code, details = null) {
        super(message);
        this.name = 'PropertyError';
        this.code = code;
        this.details = details;
        this.timestamp = new Date().toISOString();
    }
}

export const propertyValidator = {
    validateCreateProperty: (propertyData) => {
        const errors = {};

        if (!propertyData.title?.trim()) {
            errors.title = 'Property title is required';
        }

        if (!propertyData.type?.trim()) {
            errors.type = 'Property type is required';
        }

        if (!propertyData.price || propertyData.price <= 0) {
            errors.price = 'Valid price is required';
        }

        if (!propertyData.address?.trim()) {
            errors.address = 'Address is required';
        }

        if (!propertyData.city?.trim()) {
            errors.city = 'City is required';
        }

        if (!propertyData.state?.trim()) {
            errors.state = 'State is required';
        }

        if (!propertyData.zipCode?.trim()) {
            errors.zipCode = 'Zip code is required';
        }

        if (Object.keys(errors).length > 0) {
            throw new PropertyError('Form validation failed', 'FORM_VALIDATION_ERROR', errors);
        }
    },

    validateUpdateProperty: (propertyData) => {
        const errors = {};

        if (!propertyData.id) {
            errors.id = 'Property ID is required for update';
        }

        if (!propertyData.title?.trim()) {
            errors.title = 'Property title is required';
        }

        if (Object.keys(errors).length > 0) {
            throw new PropertyError('Form validation failed', 'FORM_VALIDATION_ERROR', errors);
        }
    },

    validateFiles: (files, options = {}) => {
        const { maxSize = 10 * 1024 * 1024, allowedTypes = [] } = options;
        const errors = [];

        files.forEach((file, index) => {
            if (file.size > maxSize) {
                errors.push(`File ${file.name} exceeds maximum size of ${maxSize / 1024 / 1024}MB`);
            }

            if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
                errors.push(`File ${file.name} has invalid type. Allowed: ${allowedTypes.join(', ')}`);
            }
        });

        if (errors.length > 0) {
            throw new PropertyError('File validation failed', 'FILE_VALIDATION_ERROR', errors);
        }
    }
};

export const propertyErrorHandler = {
    handleServiceError: (error, methodName) => {
        console.error(`Property Service Error in ${methodName}:`, error);

        // If it's already a PropertyError, just re-throw it
        if (error instanceof PropertyError) {
            return error;
        }

        // Handle different types of errors
        if (error.response) {
            // Server responded with error status
            const status = error.response.status;
            const message = error.response.data?.message || error.response.statusText;

            switch (status) {
                case 400:
                    return new PropertyError(message || 'Bad request', 'VALIDATION_ERROR', error.response.data);
                case 401:
                    return new PropertyError('Unauthorized access', 'AUTH_ERROR');
                case 403:
                    return new PropertyError('Access forbidden', 'FORBIDDEN_ERROR');
                case 404:
                    return new PropertyError('Property not found', 'NOT_FOUND_ERROR');
                case 409:
                    return new PropertyError('Property already exists', 'CONFLICT_ERROR');
                case 422:
                    return new PropertyError('Validation failed', 'VALIDATION_ERROR', error.response.data);
                case 500:
                    return new PropertyError('Server error occurred', 'SERVER_ERROR');
                default:
                    return new PropertyError(message || `HTTP Error ${status}`, 'HTTP_ERROR');
            }
        } else if (error.request) {
            // Request was made but no response received
            return new PropertyError('Network error: Unable to connect to server', 'NETWORK_ERROR');
        } else {
            // Something else happened
            return new PropertyError(error.message || 'Unknown error occurred', 'UNKNOWN_ERROR');
        }
    },

    handleValidationError: (errors) => {
        return new PropertyError('Validation failed', 'VALIDATION_ERROR', errors);
    }
};

// Enhanced service wrapper
export const createPropertyServiceWithErrorHandling = (baseService) => {
    const handler = {};

    Object.keys(baseService).forEach(methodName => {
        handler[methodName] = async (...args) => {
            try {
                return await baseService[methodName](...args);
            } catch (error) {
                throw propertyErrorHandler.handleServiceError(error, methodName);
            }
        };
    });

    return handler;
};

export default {
    PropertyError,
    propertyValidator,
    propertyErrorHandler,
    createPropertyServiceWithErrorHandling
};