export class ApiError extends Error {
    constructor(message, status, code, details = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
        this.details = details;
        this.timestamp = new Date().toISOString();
    }

    toObject() {
        return {
            message: this.message,
            status: this.status,
            code: this.code,
            details: this.details,
            timestamp: this.timestamp
        };
    }
}

export class NetworkError extends ApiError {
    constructor(message = 'Network connection failed') {
        super(message, 0, 'NETWORK_ERROR');
    }
}

export class AuthenticationError extends ApiError {
    constructor(message = 'Authentication required') {
        super(message, 401, 'AUTHENTICATION_ERROR');
    }
}

export class AuthorizationError extends ApiError {
    constructor(message = 'Access denied') {
        super(message, 403, 'AUTHORIZATION_ERROR');
    }
}

export class ValidationError extends ApiError {
    constructor(message = 'Validation failed', details = null) {
        super(message, 400, 'VALIDATION_ERROR', details);
    }
}

export class NotFoundError extends ApiError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 404, 'NOT_FOUND_ERROR');
    }
}

export class ConflictError extends ApiError {
    constructor(message = 'Resource already exists') {
        super(message, 409, 'CONFLICT_ERROR');
    }
}

export class RateLimitError extends ApiError {
    constructor(message = 'Rate limit exceeded') {
        super(message, 429, 'RATE_LIMIT_ERROR');
    }
}

export class ServerError extends ApiError {
    constructor(message = 'Internal server error') {
        super(message, 500, 'SERVER_ERROR');
    }
}

export class ServiceUnavailableError extends ApiError {
    constructor(message = 'Service temporarily unavailable') {
        super(message, 503, 'SERVICE_UNAVAILABLE');
    }
}

export class ErrorHandler {
    static handleError(error) {
        // If it's already an ApiError, just format it
        if (error instanceof ApiError) {
            console.error(`API Error [${error.code}]:`, error.message);
            return {
                success: false,
                error: error.toObject()
            };
        }

        // Handle axios/fetch response errors
        if (error.response) {
            const { status, data } = error.response;
            const message = data?.message || this.getDefaultMessage(status);
            const code = data?.code || this.getErrorCode(status);

            let apiError;
            switch (status) {
                case 400:
                    apiError = new ValidationError(message, data?.errors);
                    break;
                case 401:
                    apiError = new AuthenticationError(message);
                    break;
                case 403:
                    apiError = new AuthorizationError(message);
                    break;
                case 404:
                    apiError = new NotFoundError(message);
                    break;
                case 409:
                    apiError = new ConflictError(message);
                    break;
                case 429:
                    apiError = new RateLimitError(message);
                    break;
                case 500:
                    apiError = new ServerError(message);
                    break;
                case 503:
                    apiError = new ServiceUnavailableError(message);
                    break;
                default:
                    apiError = new ApiError(message, status, code);
            }

            console.error(`HTTP Error ${status} [${apiError.code}]:`, message);
            return {
                success: false,
                error: apiError.toObject()
            };
        }

        // Handle network errors (no response received)
        if (error.request) {
            const networkError = new NetworkError();
            console.error('Network Error:', error.message);
            return {
                success: false,
                error: networkError.toObject()
            };
        }

        // Handle other unexpected errors
        console.error('Unexpected Error:', error);
        const unexpectedError = new ApiError(
            'An unexpected error occurred',
            500,
            'UNEXPECTED_ERROR',
            process.env.NODE_ENV === 'development' ? error.message : undefined
        );

        return {
            success: false,
            error: unexpectedError.toObject()
        };
    }

    static getDefaultMessage(status) {
        const messages = {
            400: 'Bad request',
            401: 'Unauthorized access',
            403: 'Access forbidden',
            404: 'Resource not found',
            409: 'Resource conflict',
            429: 'Too many requests',
            500: 'Internal server error',
            503: 'Service unavailable'
        };
        return messages[status] || 'An error occurred';
    }

    static getErrorCode(status) {
        const codes = {
            400: 'BAD_REQUEST',
            401: 'UNAUTHORIZED',
            403: 'FORBIDDEN',
            404: 'NOT_FOUND',
            409: 'CONFLICT',
            429: 'RATE_LIMITED',
            500: 'SERVER_ERROR',
            503: 'SERVICE_UNAVAILABLE'
        };
        return codes[status] || 'UNKNOWN_ERROR';
    }

    static createValidationError(details) {
        return new ValidationError('Validation failed', details);
    }

    static createNotFoundError(resource) {
        return new NotFoundError(resource);
    }

    static createConflictError(message) {
        return new ConflictError(message);
    }

    static createAuthorizationError(message) {
        return new AuthorizationError(message);
    }
}

// Utility function for try-catch blocks
export const withErrorHandling = (asyncFn) => {
    return async (...args) => {
        try {
            return await asyncFn(...args);
        } catch (error) {
            return ErrorHandler.handleError(error);
        }
    };
};