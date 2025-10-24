
class SchedulingError extends Error {
    constructor(message, statusCode, code, details = null) {
        super(message);
        this.name = 'SchedulingError';
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.timestamp = new Date().toISOString();
        this.isOperational = true; 

        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends SchedulingError {
    constructor(message, details = null) {
        super(message, 400, 'VALIDATION_ERROR', details);
        this.name = 'ValidationError';
    }
}

class NotFoundError extends SchedulingError {
    constructor(resource, id = null) {
        const message = id ? `${resource} with ID ${id} not found` : `${resource} not found`;
        super(message, 404, 'RESOURCE_NOT_FOUND', { resource, id });
        this.name = 'NotFoundError';
    }
}

class ConflictError extends SchedulingError {
    constructor(message, details = null) {
        super(message, 409, 'CONFLICT', details);
        this.name = 'ConflictError';
    }
}

class AuthenticationError extends SchedulingError {
    constructor(message = 'Authentication required') {
        super(message, 401, 'AUTHENTICATION_ERROR');
        this.name = 'AuthenticationError';
    }
}

class AuthorizationError extends SchedulingError {
    constructor(message = 'Insufficient permissions') {
        super(message, 403, 'AUTHORIZATION_ERROR');
        this.name = 'AuthorizationError';
    }
}

class RateLimitError extends SchedulingError {
    constructor(message = 'Rate limit exceeded') {
        super(message, 429, 'RATE_LIMIT_EXCEEDED');
        this.name = 'RateLimitError';
    }
}

class ExternalServiceError extends SchedulingError {
    constructor(service, message = 'External service error') {
        super(message, 502, 'EXTERNAL_SERVICE_ERROR', { service });
        this.name = 'ExternalServiceError';
    }
}

class DatabaseError extends SchedulingError {
    constructor(operation, message = 'Database operation failed') {
        super(message, 500, 'DATABASE_ERROR', { operation });
        this.name = 'DatabaseError';
    }
}

// Error Codes Catalog
const ErrorCodes = {
    // Validation Errors
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INVALID_INPUT: 'INVALID_INPUT',
    MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
    INVALID_DATE_RANGE: 'INVALID_DATE_RANGE',
    INVALID_TIME_SLOT: 'INVALID_TIME_SLOT',

    // Business Logic Errors
    SCHEDULING_CONFLICT: 'SCHEDULING_CONFLICT',
    AGENT_UNAVAILABLE: 'AGENT_UNAVAILABLE',
    TIME_OFF_CONFLICT: 'TIME_OFF_CONFLICT',
    MAX_SCHEDULES_EXCEEDED: 'MAX_SCHEDULES_EXCEEDED',
    INVALID_SCHEDULE_STATUS: 'INVALID_SCHEDULE_STATUS',

    // Resource Errors
    RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
    RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',

    // Authentication & Authorization
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
    INVALID_TOKEN: 'INVALID_TOKEN',
    EXPIRED_TOKEN: 'EXPIRED_TOKEN',

    // System Errors
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
    DATABASE_ERROR: 'DATABASE_ERROR',
    EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

    // Network Errors
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT_ERROR: 'TIMEOUT_ERROR'
};

// Error Factory
class ErrorFactory {
    // Validation Errors
    static validationError(message, details = null) {
        return new ValidationError(message, details);
    }

    static invalidInput(field, value, reason) {
        return new ValidationError(`Invalid ${field}: ${value}`, {
            field,
            value,
            reason
        });
    }

    static missingRequiredField(field) {
        return new ValidationError(`Missing required field: ${field}`, { field });
    }

    static invalidDateRange(startDate, endDate) {
        return new ValidationError('End date must be after start date', {
            startDate,
            endDate
        });
    }

    static invalidTimeSlot(startTime, endTime) {
        return new ValidationError('End time must be after start time', {
            startTime,
            endTime
        });
    }

    // Business Logic Errors
    static schedulingConflict(agentId, scheduleTime) {
        return new ConflictError('Scheduling conflict detected', {
            agentId,
            scheduleTime,
            type: 'SCHEDULING_CONFLICT'
        });
    }

    static agentUnavailable(agentId, dateTime) {
        return new ConflictError('Agent is not available at the requested time', {
            agentId,
            dateTime,
            type: 'AGENT_UNAVAILABLE'
        });
    }

    static timeOffConflict(agentId, startDate, endDate) {
        return new ConflictError('Time off request conflicts with existing schedule', {
            agentId,
            startDate,
            endDate,
            type: 'TIME_OFF_CONFLICT'
        });
    }

    static maxSchedulesExceeded(agentId, date, maxAllowed) {
        return new ConflictError('Maximum schedules per day exceeded', {
            agentId,
            date,
            maxAllowed,
            current: maxAllowed + 1
        });
    }

    static invalidScheduleStatus(currentStatus, targetStatus) {
        return new ValidationError(`Cannot change status from ${currentStatus} to ${targetStatus}`, {
            currentStatus,
            targetStatus
        });
    }

    // Resource Errors
    static notFound(resource, id = null) {
        return new NotFoundError(resource, id);
    }

    static resourceAlreadyExists(resource, identifier) {
        return new ConflictError(`${resource} already exists`, {
            resource,
            identifier
        });
    }

    // Authentication & Authorization
    static authenticationError(message = 'Authentication required') {
        return new AuthenticationError(message);
    }

    static authorizationError(message = 'Insufficient permissions') {
        return new AuthorizationError(message);
    }

    static invalidToken() {
        return new AuthenticationError('Invalid or malformed token');
    }

    static expiredToken() {
        return new AuthenticationError('Token has expired');
    }

    // System Errors
    static internalServerError(message = 'Internal server error') {
        return new SchedulingError(message, 500, ErrorCodes.INTERNAL_SERVER_ERROR);
    }

    static databaseError(operation, error) {
        return new DatabaseError(operation, `Database operation failed: ${operation}`);
    }

    static externalServiceError(service, error) {
        return new ExternalServiceError(service, `External service error: ${service}`);
    }

    static rateLimitExceeded(retryAfter = null) {
        const error = new RateLimitError();
        if (retryAfter) {
            error.details = { retryAfter };
        }
        return error;
    }

    // Network Errors
    static networkError(message = 'Network error occurred') {
        return new SchedulingError(message, 503, ErrorCodes.NETWORK_ERROR);
    }

    static timeoutError(service, timeoutMs) {
        return new SchedulingError(`Request timeout after ${timeoutMs}ms`, 504, ErrorCodes.TIMEOUT_ERROR, {
            service,
            timeoutMs
        });
    }
}

// Error Handler Class
class ErrorHandler {
    static handle(error, context = {}) {
        // Log the error with context
        this.logError(error, context);

        // Handle known error types
        if (error instanceof SchedulingError) {
            return this.formatErrorResponse(error);
        }

        // Handle specific database errors
        if (error.name?.includes('Mongo') || error.code?.includes('SQL')) {
            return this.formatErrorResponse(
                ErrorFactory.databaseError(context.operation || 'unknown', error.message)
            );
        }

        // Handle network errors
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            return this.formatErrorResponse(
                ErrorFactory.networkError(error.message)
            );
        }

        // Handle timeout errors
        if (error.code === 'ETIMEDOUT') {
            return this.formatErrorResponse(
                ErrorFactory.timeoutError(context.service || 'unknown', context.timeoutMs)
            );
        }

        // Handle validation errors from libraries like Joi, Yup, etc.
        if (error.isJoi || error.name === 'ValidationError') {
            return this.formatErrorResponse(
                ErrorFactory.validationError('Validation failed', error.details)
            );
        }

        // Default to internal server error
        return this.formatErrorResponse(
            ErrorFactory.internalServerError(error.message)
        );
    }

    static formatErrorResponse(error) {
        const response = {
            success: false,
            error: {
                message: error.message,
                code: error.code,
                statusCode: error.statusCode,
                timestamp: error.timestamp
            }
        };

        // Add details if available
        if (error.details) {
            response.error.details = error.details;
        }

        // Add stack trace in development
        if (process.env.NODE_ENV === 'development') {
            response.error.stack = error.stack;
        }

        return response;
    }

    static logError(error, context = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            name: error.name,
            message: error.message,
            code: error.code,
            statusCode: error.statusCode,
            context,
            stack: error.stack
        };

        // Different logging levels based on error type
        if (error.statusCode >= 500) {
            console.error('?? Server Error:', logEntry);
        } else if (error.statusCode >= 400) {
            console.warn('?? Client Error:', logEntry);
        } else {
            console.info('?? Operational Error:', logEntry);
        }

        // You can integrate with logging services here (Sentry, LogRocket, etc.)
        this.sendToMonitoringService(logEntry);
    }

    static sendToMonitoringService(logEntry) {
        // Integrate with your preferred monitoring service
        // Example: Sentry.captureException(logEntry);
        // Example: LogRocket.captureException(logEntry);

        if (process.env.NODE_ENV === 'production') {
            // Production logging logic here
            console.log('?? Monitoring Service:', logEntry);
        }
    }

    // Error Recovery Strategies
    static async withRetry(operation, maxRetries = 3, delayMs = 1000) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                if (attempt === maxRetries) {
                    throw error;
                }

                // Only retry on certain errors
                if (this.isRetryableError(error)) {
                    console.warn(`Retry attempt ${attempt} after error:`, error.message);
                    await this.delay(delayMs * attempt); // Exponential backoff
                    continue;
                }

                throw error;
            }
        }
    }

    static isRetryableError(error) {
        const retryableCodes = [
            'NETWORK_ERROR',
            'TIMEOUT_ERROR',
            'RATE_LIMIT_EXCEEDED',
            'EXTERNAL_SERVICE_ERROR'
        ];

        return retryableCodes.includes(error.code) ||
            error.statusCode >= 500 ||
            error.code === 'ECONNREFUSED' ||
            error.code === 'ETIMEDOUT';
    }

    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Validation Helper
    static validateRequiredFields(data, requiredFields) {
        const missingFields = requiredFields.filter(field =>
            data[field] === undefined || data[field] === null || data[field] === ''
        );

        if (missingFields.length > 0) {
            throw ErrorFactory.missingRequiredField(missingFields.join(', '));
        }
    }

    static validateDateRange(startDate, endDate) {
        if (new Date(endDate) <= new Date(startDate)) {
            throw ErrorFactory.invalidDateRange(startDate, endDate);
        }
    }

    static validateTimeRange(startTime, endTime) {
        if (new Date(`1970-01-01T${endTime}`) <= new Date(`1970-01-01T${startTime}`)) {
            throw ErrorFactory.invalidTimeSlot(startTime, endTime);
        }
    }

    // Global Error Handler for Express/Node.js
    static globalErrorHandler(err, req, res, next) {
        const errorResponse = ErrorHandler.handle(err, {
            method: req.method,
            url: req.url,
            userAgent: req.get('User-Agent'),
            ip: req.ip
        });

        res.status(errorResponse.error.statusCode).json(errorResponse);
    }

    // Async Error Handler Wrapper (for Express async routes)
    static catchAsync(fn) {
        return (req, res, next) => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
    }
}

// Utility Functions
const ErrorUtils = {
    // Check if error is operational (trusted)
    isOperationalError(error) {
        return error instanceof SchedulingError && error.isOperational;
    },

    // Extract error details for client
    getClientError(error) {
        if (error instanceof SchedulingError) {
            return {
                message: error.message,
                code: error.code,
                details: error.details
            };
        }

        return {
            message: 'An unexpected error occurred',
            code: 'INTERNAL_SERVER_ERROR'
        };
    },

    // Create error from HTTP response
    fromHttpResponse(response) {
        if (response.status >= 400) {
            return new SchedulingError(
                response.data?.message || `HTTP ${response.status}`,
                response.status,
                response.data?.code || 'HTTP_ERROR',
                response.data?.details
            );
        }
        return null;
    }
};

export {
    SchedulingError,
    ValidationError,
    NotFoundError,
    ConflictError,
    AuthenticationError,
    AuthorizationError,
    RateLimitError,
    ExternalServiceError,
    DatabaseError,
    ErrorCodes,
    ErrorFactory,
    ErrorHandler,
    ErrorUtils
};

export default ErrorHandler;