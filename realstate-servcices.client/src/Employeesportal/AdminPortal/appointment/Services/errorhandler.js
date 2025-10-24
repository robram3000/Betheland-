// ErrorHandler.js

class SchedulingError extends Error {
    constructor(message, code, details = null) {
        super(message);
        this.name = 'SchedulingError';
        this.code = code;
        this.details = details;
        this.timestamp = new Date().toISOString();
    }
}

class ErrorFactory {
    static validationError(message, details = null) {
        return new SchedulingError(message, 'VALIDATION_ERROR', details);
    }

    static notFoundError(message, details = null) {
        return new SchedulingError(message, 'RESOURCE_NOT_FOUND', details);
    }

    static conflictError(message, details = null) {
        return new SchedulingError(message, 'CONFLICT_ERROR', details);
    }

    static internalServerError(message, details = null) {
        return new SchedulingError(message, 'INTERNAL_SERVER_ERROR', details);
    }

    static unauthorizedError(message, details = null) {
        return new SchedulingError(message, 'UNAUTHORIZED', details);
    }

    static forbiddenError(message, details = null) {
        return new SchedulingError(message, 'FORBIDDEN', details);
    }

    static agentUnavailableError(message, details = null) {
        return new SchedulingError(message, 'AGENT_UNAVAILABLE', details);
    }

    static timeOffConflictError(message, details = null) {
        return new SchedulingError(message, 'TIME_OFF_CONFLICT', details);
    }
}

class ErrorHandler {
    constructor() {
        this.errorConfig = {
            // Validation Errors
            VALIDATION_ERROR: {
                status: 400,
                message: 'Validation failed'
            },
            INVALID_DATE_RANGE: {
                status: 400,
                message: 'Invalid date range provided'
            },
            CONFLICTING_SCHEDULE: {
                status: 409,
                message: 'Schedule conflict detected'
            },

            // Agent Availability Errors
            AGENT_UNAVAILABLE: {
                status: 400,
                message: 'Agent is not available at the requested time'
            },
            TIME_OFF_CONFLICT: {
                status: 409,
                message: 'Time off request conflicts with existing schedule'
            },
            MAX_SCHEDULES_EXCEEDED: {
                status: 400,
                message: 'Maximum daily schedules limit exceeded'
            },

            // Resource Errors
            AGENT_NOT_FOUND: {
                status: 404,
                message: 'Agent not found'
            },
            SCHEDULE_NOT_FOUND: {
                status: 404,
                message: 'Schedule not found'
            },
            TIME_OFF_NOT_FOUND: {
                status: 404,
                message: 'Time off record not found'
            },
            AVAILABILITY_NOT_FOUND: {
                status: 404,
                message: 'Availability configuration not found'
            },

            // Business Logic Errors
            SCHEDULE_IN_PAST: {
                status: 400,
                message: 'Cannot schedule appointments in the past'
            },
            INVALID_SCHEDULE_STATUS: {
                status: 400,
                message: 'Invalid schedule status transition'
            },
            CANCELLATION_TOO_LATE: {
                status: 400,
                message: 'Cancellation is not allowed at this time'
            },

            // System Errors
            EXTERNAL_SERVICE_ERROR: {
                status: 502,
                message: 'External service unavailable'
            },
            DATABASE_ERROR: {
                status: 500,
                message: 'Database operation failed'
            },
            INTERNAL_SERVER_ERROR: {
                status: 500,
                message: 'Internal server error'
            },
            UNKNOWN_ERROR: {
                status: 500,
                message: 'An unexpected error occurred'
            }
        };
    }

    // Create specific error instances
    createError(code, details = null) {
        const config = this.errorConfig[code] || this.errorConfig.UNKNOWN_ERROR;
        return new SchedulingError(config.message, code, details);
    }

    // Handle API errors
    handleApiError(error) {
        console.error('Scheduling API Error:', {
            name: error.name,
            message: error.message,
            code: error.code,
            details: error.details,
            timestamp: error.timestamp,
            stack: error.stack
        });

        // If it's already a SchedulingError, return as is
        if (error instanceof SchedulingError) {
            return this.formatErrorResponse(error);
        }

        // Handle HTTP errors
        if (error.response) {
            return this.handleHttpError(error);
        }

        // Handle network errors
        if (error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
            const networkError = this.createError('EXTERNAL_SERVICE_ERROR', {
                originalError: error.message,
                suggestion: 'Please check your internet connection and try again'
            });
            return this.formatErrorResponse(networkError);
        }

        // Default unknown error
        const unknownError = this.createError('UNKNOWN_ERROR', {
            originalError: error.message,
            traceId: this.generateTraceId()
        });
        return this.formatErrorResponse(unknownError);
    }

    // Handle HTTP response errors
    handleHttpError(error) {
        const status = error.response?.status;
        const data = error.response?.data;

        switch (status) {
            case 400:
                return this.formatErrorResponse(this.createError('VALIDATION_ERROR', data));
            case 404:
                return this.formatErrorResponse(this.createError('SCHEDULE_NOT_FOUND', data));
            case 409:
                return this.formatErrorResponse(this.createError('CONFLICTING_SCHEDULE', data));
            case 500:
                return this.formatErrorResponse(this.createError('DATABASE_ERROR', data));
            default:
                return this.formatErrorResponse(this.createError('UNKNOWN_ERROR', data));
        }
    }

    // Format error response for client
    formatErrorResponse(error) {
        return {
            success: false,
            error: {
                code: error.code,
                message: error.message,
                details: error.details,
                timestamp: error.timestamp,
                traceId: error.details?.traceId || this.generateTraceId()
            }
        };
    }

    // Generate unique trace ID for error tracking
    generateTraceId() {
        return `SCHED_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Validation helper methods
    validateScheduleTime(scheduleTime) {
        const now = new Date();
        const scheduleDate = new Date(scheduleTime);

        if (scheduleDate < now) {
            throw this.createError('SCHEDULE_IN_PAST', {
                scheduleTime,
                currentTime: now.toISOString()
            });
        }

        // Check if schedule is too far in the future (e.g., 1 year)
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

        if (scheduleDate > oneYearFromNow) {
            throw this.createError('VALIDATION_ERROR', {
                scheduleTime,
                maxAllowed: oneYearFromNow.toISOString(),
                reason: 'Schedule cannot be more than 1 year in advance'
            });
        }
    }

    validateDateRange(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start >= end) {
            throw this.createError('INVALID_DATE_RANGE', {
                startDate,
                endDate,
                reason: 'End date must be after start date'
            });
        }

        // Check if date range is too long (e.g., more than 30 days)
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 30) {
            throw this.createError('INVALID_DATE_RANGE', {
                startDate,
                endDate,
                days: diffDays,
                maxAllowed: 30,
                reason: 'Date range cannot exceed 30 days'
            });
        }
    }

    validateTimeOffDates(startDate, endDate, isAllDay = false) {
        this.validateDateRange(startDate, endDate);

        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Maximum time off duration (e.g., 14 days)
        if (diffDays > 14) {
            throw this.createError('VALIDATION_ERROR', {
                startDate,
                endDate,
                durationDays: diffDays,
                maxAllowed: 14,
                reason: 'Time off request cannot exceed 14 days'
            });
        }
    }

    // Business rule validation
    validateScheduleLimit(schedulesCount, maxSchedules) {
        if (schedulesCount >= maxSchedules) {
            throw this.createError('MAX_SCHEDULES_EXCEEDED', {
                currentCount: schedulesCount,
                maxAllowed: maxSchedules,
                suggestion: 'Please choose a different date or contact administrator'
            });
        }
    }

    validateScheduleStatusTransition(currentStatus, newStatus) {
        const allowedTransitions = {
            'Scheduled': ['Cancelled', 'Completed', 'Rescheduled'],
            'Rescheduled': ['Cancelled', 'Completed'],
            'Completed': [],
            'Cancelled': []
        };

        if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
            throw this.createError('INVALID_SCHEDULE_STATUS', {
                currentStatus,
                newStatus,
                allowedTransitions: allowedTransitions[currentStatus] || []
            });
        }
    }

    // Availability conflict detection
    checkAvailabilityConflicts(existingSchedules, newSchedule, bufferMinutes = 15) {
        const newStart = new Date(newSchedule.scheduleTime);
        const newEnd = new Date(newSchedule.scheduleEndTime || this.calculateEndTime(newSchedule.scheduleTime));
        const bufferMs = bufferMinutes * 60 * 1000;

        for (const existing of existingSchedules) {
            const existingStart = new Date(existing.scheduleTime);
            const existingEnd = new Date(existing.scheduleEndTime || this.calculateEndTime(existing.scheduleTime));

            // Check for overlap with buffer time
            if (
                (newStart < existingEnd + bufferMs && newEnd > existingStart - bufferMs) &&
                existing.status !== 'Cancelled'
            ) {
                throw this.createError('CONFLICTING_SCHEDULE', {
                    newSchedule: {
                        start: newStart.toISOString(),
                        end: newEnd.toISOString()
                    },
                    conflictingSchedule: {
                        id: existing.id,
                        start: existingStart.toISOString(),
                        end: existingEnd.toISOString(),
                        status: existing.status
                    },
                    bufferMinutes,
                    suggestion: 'Please choose a different time slot'
                });
            }
        }
    }

    // Utility method to calculate end time
    calculateEndTime(startTime, durationMinutes = 60) {
        const start = new Date(startTime);
        return new Date(start.getTime() + durationMinutes * 60 * 1000);
    }

    // Recovery strategies
    async withRetry(operation, maxRetries = 3, baseDelay = 1000) {
        let lastError;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;

                // Don't retry on certain errors
                if (this.isNonRetriableError(error)) {
                    throw error;
                }

                if (attempt < maxRetries) {
                    console.warn(`Operation failed, retrying in ${baseDelay}ms (attempt ${attempt}/${maxRetries})`);
                    await this.delay(baseDelay * attempt); // Exponential backoff
                }
            }
        }

        throw lastError;
    }

    isNonRetriableError(error) {
        const nonRetriableCodes = [
            'VALIDATION_ERROR',
            'AGENT_UNAVAILABLE',
            'SCHEDULE_IN_PAST',
            'MAX_SCHEDULES_EXCEEDED'
        ];

        return nonRetriableCodes.includes(error.code) ||
            (error.response && error.response.status >= 400 && error.response.status < 500);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Static methods for convenience
    static validateRequiredFields(data, requiredFields) {
        const missingFields = requiredFields.filter(field => {
            const value = data[field];
            return value === undefined || value === null || value === '';
        });

        if (missingFields.length > 0) {
            throw ErrorFactory.validationError(`Missing required fields: ${missingFields.join(', ')}`, {
                missingFields,
                providedData: data
            });
        }
    }

    static handle(error, context = {}) {
        const handler = new ErrorHandler();
        const errorResponse = handler.handleApiError(error);

        console.error('Error handled:', {
            context,
            error: errorResponse.error
        });

        return errorResponse;
    }

    static async withRetry(operation, maxRetries = 3, baseDelay = 1000) {
        const handler = new ErrorHandler();
        return await handler.withRetry(operation, maxRetries, baseDelay);
    }
}

// Export singleton instance and classes
const errorHandlerInstance = new ErrorHandler();
export default errorHandlerInstance;
export { SchedulingError, ErrorFactory, ErrorHandler };