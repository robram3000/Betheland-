// mapper.js

class SchedulingMappers {
    constructor() {
        this.defaultValues = {
            scheduleStatus: 'Scheduled',
            meetingType: 'InPerson',
            slotDuration: 60,
            bufferTime: 15,
            maxSchedulesPerDay: 8,
            workDayStart: '09:00:00',
            workDayEnd: '17:00:00'
        };
    }

    // Array mapping utility methods
    mapArray(array, mapperFunction) {
        if (!Array.isArray(array)) return [];
        return array.map(item => mapperFunction(item));
    }

    // AgentScheduleConfig Mappers
    agentScheduleConfig = {
        toDto: (entity) => {
            if (!entity) return null;

            return {
                id: entity.id || 0,
                agentId: entity.agentId,
                slotDurationMinutes: entity.slotDurationMinutes || this.defaultValues.slotDuration,
                bufferTimeMinutes: entity.bufferTimeMinutes || this.defaultValues.bufferTime,
                maxSchedulesPerDay: entity.maxSchedulesPerDay || this.defaultValues.maxSchedulesPerDay,
                workDayStart: this.mapTimeSpan(entity.workDayStart) || this.defaultValues.workDayStart,
                workDayEnd: this.mapTimeSpan(entity.workDayEnd) || this.defaultValues.workDayEnd,
                allowWeekendScheduling: entity.allowWeekendScheduling || false,
                createdAt: this.mapDateTime(entity.createdAt),
                updatedAt: this.mapDateTime(entity.updatedAt)
            };
        },

        toEntity: (dto) => {
            if (!dto) return null;

            return {
                id: dto.id || 0,
                agentId: dto.agentId,
                slotDurationMinutes: dto.slotDurationMinutes || this.defaultValues.slotDuration,
                bufferTimeMinutes: dto.bufferTimeMinutes || this.defaultValues.bufferTime,
                maxSchedulesPerDay: dto.maxSchedulesPerDay || this.defaultValues.maxSchedulesPerDay,
                workDayStart: this.mapTimeSpanToEntity(dto.workDayStart) || this.defaultValues.workDayStart,
                workDayEnd: this.mapTimeSpanToEntity(dto.workDayEnd) || this.defaultValues.workDayEnd,
                allowWeekendScheduling: dto.allowWeekendScheduling || false,
                createdAt: dto.createdAt || new Date().toISOString(),
                updatedAt: dto.updatedAt || null
            };
        },

        toUpdateDto: (entity, updateDto) => {
            if (!entity || !updateDto) return null;

            return {
                id: entity.id,
                agentId: entity.agentId,
                slotDurationMinutes: updateDto.slotDurationMinutes !== undefined
                    ? updateDto.slotDurationMinutes
                    : entity.slotDurationMinutes,
                bufferTimeMinutes: updateDto.bufferTimeMinutes !== undefined
                    ? updateDto.bufferTimeMinutes
                    : entity.bufferTimeMinutes,
                maxSchedulesPerDay: updateDto.maxSchedulesPerDay !== undefined
                    ? updateDto.maxSchedulesPerDay
                    : entity.maxSchedulesPerDay,
                workDayStart: updateDto.workDayStart !== undefined
                    ? this.mapTimeSpanToEntity(updateDto.workDayStart)
                    : entity.workDayStart,
                workDayEnd: updateDto.workDayEnd !== undefined
                    ? this.mapTimeSpanToEntity(updateDto.workDayEnd)
                    : entity.workDayEnd,
                allowWeekendScheduling: updateDto.allowWeekendScheduling !== undefined
                    ? updateDto.allowWeekendScheduling
                    : entity.allowWeekendScheduling,
                createdAt: entity.createdAt,
                updatedAt: new Date().toISOString()
            };
        }
    };

    // ScheduleProperties Mappers
    scheduleProperties = {
        toDto: (entity, additionalData = {}) => {
            if (!entity) return null;

            return {
                id: entity.id || 0,
                scheduleNo: entity.scheduleNo || this.generateScheduleNo(),
                propertyId: entity.propertyId,
                agentId: entity.agentId,
                clientId: entity.clientId,
                scheduleTime: this.mapDateTime(entity.scheduleTime),
                scheduleEndTime: this.mapDateTime(entity.scheduleEndTime) ||
                    this.calculateEndTime(entity.scheduleTime, entity.durationMinutes),
                status: entity.status || this.defaultValues.scheduleStatus,
                notes: entity.notes || '',
                createdAt: this.mapDateTime(entity.createdAt),
                updatedAt: this.mapDateTime(entity.updatedAt),

                // Additional data from related entities
                propertyTitle: additionalData.propertyTitle || '',
                agentName: additionalData.agentName || '',
                clientName: additionalData.clientName || '',
                propertyAddress: additionalData.propertyAddress || '',

                // Enhanced scheduling fields
                meetingType: entity.meetingType || this.defaultValues.meetingType,
                meetingLocation: entity.meetingLocation || '',
                virtualMeetingLink: entity.virtualMeetingLink || '',
                cancelledAt: this.mapDateTime(entity.cancelledAt),
                completedAt: this.mapDateTime(entity.completedAt),
                cancellationReason: entity.cancellationReason || ''
            };
        },

        toEntity: (dto) => {
            if (!dto) return null;

            const scheduleTime = new Date(dto.scheduleTime);
            const durationMinutes = dto.durationMinutes || this.defaultValues.slotDuration;

            return {
                id: dto.id || 0,
                scheduleNo: dto.scheduleNo || this.generateScheduleNo(),
                propertyId: dto.propertyId,
                agentId: dto.agentId,
                clientId: dto.clientId,
                scheduleTime: scheduleTime.toISOString(),
                scheduleEndTime: dto.scheduleEndTime
                    ? new Date(dto.scheduleEndTime).toISOString()
                    : this.calculateEndTime(scheduleTime, durationMinutes).toISOString(),
                status: dto.status || this.defaultValues.scheduleStatus,
                notes: dto.notes || '',
                createdAt: dto.createdAt || new Date().toISOString(),
                updatedAt: dto.updatedAt || null,

                // Enhanced scheduling fields
                meetingType: dto.meetingType || this.defaultValues.meetingType,
                meetingLocation: dto.meetingLocation || '',
                virtualMeetingLink: dto.virtualMeetingLink || '',
                cancelledAt: dto.cancelledAt ? new Date(dto.cancelledAt).toISOString() : null,
                completedAt: dto.completedAt ? new Date(dto.completedAt).toISOString() : null,
                cancellationReason: dto.cancellationReason || ''
            };
        },

        toCreateDto: (dto) => {
            if (!dto) return null;

            return {
                propertyId: dto.propertyId,
                agentId: dto.agentId,
                clientId: dto.clientId,
                scheduleTime: dto.scheduleTime,
                notes: dto.notes || '',
                status: dto.status || this.defaultValues.scheduleStatus,

                // Enhanced scheduling fields
                meetingType: dto.meetingType || this.defaultValues.meetingType,
                meetingLocation: dto.meetingLocation || '',
                virtualMeetingLink: dto.virtualMeetingLink || ''
            };
        },

        toUpdateDto: (entity, updateDto) => {
            if (!entity || !updateDto) return null;

            return {
                id: entity.id,
                scheduleNo: entity.scheduleNo,
                propertyId: entity.propertyId,
                agentId: entity.agentId,
                clientId: entity.clientId,
                scheduleTime: updateDto.scheduleTime
                    ? new Date(updateDto.scheduleTime).toISOString()
                    : entity.scheduleTime,
                scheduleEndTime: updateDto.scheduleTime
                    ? this.calculateEndTime(updateDto.scheduleTime, entity.durationMinutes).toISOString()
                    : entity.scheduleEndTime,
                status: updateDto.status || entity.status,
                notes: updateDto.notes !== undefined ? updateDto.notes : entity.notes,
                updatedAt: new Date().toISOString(),

                // Enhanced scheduling fields
                meetingType: updateDto.meetingType || entity.meetingType,
                meetingLocation: updateDto.meetingLocation !== undefined
                    ? updateDto.meetingLocation
                    : entity.meetingLocation,
                virtualMeetingLink: updateDto.virtualMeetingLink !== undefined
                    ? updateDto.virtualMeetingLink
                    : entity.virtualMeetingLink
            };
        },

        toRescheduleDto: (entity, newScheduleTime) => {
            if (!entity || !newScheduleTime) return null;

            return {
                ...entity,
                scheduleTime: new Date(newScheduleTime).toISOString(),
                scheduleEndTime: this.calculateEndTime(newScheduleTime, entity.durationMinutes).toISOString(),
                status: 'Rescheduled',
                updatedAt: new Date().toISOString()
            };
        }
    };

    // AgentTimeOff Mappers
    agentTimeOff = {
        toDto: (entity) => {
            if (!entity) return null;

            return {
                id: entity.id || 0,
                agentId: entity.agentId,
                startDate: this.mapDateTime(entity.startDate),
                endDate: this.mapDateTime(entity.endDate),
                reason: entity.reason || '',
                isAllDay: entity.isAllDay !== undefined ? entity.isAllDay : true,
                createdAt: this.mapDateTime(entity.createdAt),
                updatedAt: this.mapDateTime(entity.updatedAt),
                status: entity.status || 'Pending',
                approvedBy: entity.approvedBy || null,
                approvedAt: this.mapDateTime(entity.approvedAt)
            };
        },

        toEntity: (dto) => {
            if (!dto) return null;

            return {
                id: dto.id || 0,
                agentId: dto.agentId,
                startDate: new Date(dto.startDate).toISOString(),
                endDate: new Date(dto.endDate).toISOString(),
                reason: dto.reason || '',
                isAllDay: dto.isAllDay !== undefined ? dto.isAllDay : true,
                createdAt: dto.createdAt || new Date().toISOString(),
                updatedAt: dto.updatedAt || null,
                status: dto.status || 'Pending',
                approvedBy: dto.approvedBy || null,
                approvedAt: dto.approvedAt ? new Date(dto.approvedAt).toISOString() : null
            };
        },

        toCreateDto: (dto) => {
            if (!dto) return null;

            return {
                agentId: dto.agentId,
                startDate: dto.startDate,
                endDate: dto.endDate,
                reason: dto.reason,
                isAllDay: dto.isAllDay !== undefined ? dto.isAllDay : true
            };
        },

        toUpdateDto: (entity, updateDto) => {
            if (!entity || !updateDto) return null;

            return {
                id: entity.id,
                agentId: entity.agentId,
                startDate: updateDto.startDate
                    ? new Date(updateDto.startDate).toISOString()
                    : entity.startDate,
                endDate: updateDto.endDate
                    ? new Date(updateDto.endDate).toISOString()
                    : entity.endDate,
                reason: updateDto.reason !== undefined ? updateDto.reason : entity.reason,
                isAllDay: updateDto.isAllDay !== undefined ? updateDto.isAllDay : entity.isAllDay,
                status: entity.status, // Status should be updated via approve/reject endpoints
                updatedAt: new Date().toISOString()
            };
        }
    };

    // AgentAvailability Mappers
    agentAvailability = {
        toDto: (entity) => {
            if (!entity) return null;

            return {
                id: entity.id || 0,
                agentId: entity.agentId,
                dayOfWeek: entity.dayOfWeek,
                startTime: this.mapTimeSpan(entity.startTime),
                endTime: this.mapTimeSpan(entity.endTime),
                isAvailable: entity.isAvailable !== undefined ? entity.isAvailable : true,
                createdAt: this.mapDateTime(entity.createdAt),
                updatedAt: this.mapDateTime(entity.updatedAt)
            };
        },

        toEntity: (dto) => {
            if (!dto) return null;

            return {
                id: dto.id || 0,
                agentId: dto.agentId,
                dayOfWeek: dto.dayOfWeek,
                startTime: this.mapTimeSpanToEntity(dto.startTime),
                endTime: this.mapTimeSpanToEntity(dto.endTime),
                isAvailable: dto.isAvailable !== undefined ? dto.isAvailable : true,
                createdAt: dto.createdAt || new Date().toISOString(),
                updatedAt: dto.updatedAt || null
            };
        },

        toCreateDto: (dto) => {
            if (!dto) return null;

            return {
                agentId: dto.agentId,
                dayOfWeek: dto.dayOfWeek,
                startTime: dto.startTime,
                endTime: dto.endTime,
                isAvailable: dto.isAvailable !== undefined ? dto.isAvailable : true
            };
        },

        toBulkDto: (agentId, availabilities) => {
            if (!agentId || !Array.isArray(availabilities)) return [];

            return availabilities.map(avail => ({
                agentId: agentId,
                dayOfWeek: avail.dayOfWeek,
                startTime: avail.startTime,
                endTime: avail.endTime,
                isAvailable: avail.isAvailable !== undefined ? avail.isAvailable : true
            }));
        }
    };

    // Batch Mappers for collections
    batch = {
        toAgentScheduleConfigDtoList: (entities) => {
            if (!Array.isArray(entities)) return [];
            return entities.map(entity => this.agentScheduleConfig.toDto(entity));
        },

        toSchedulePropertiesDtoList: (entities, additionalDataMap = {}) => {
            if (!Array.isArray(entities)) return [];
            return entities.map(entity => {
                const additionalData = additionalDataMap[entity.id] || {};
                return this.scheduleProperties.toDto(entity, additionalData);
            });
        },

        toAgentTimeOffDtoList: (entities) => {
            if (!Array.isArray(entities)) return [];
            return entities.map(entity => this.agentTimeOff.toDto(entity));
        },

        toAgentAvailabilityDtoList: (entities) => {
            if (!Array.isArray(entities)) return [];
            return entities.map(entity => this.agentAvailability.toDto(entity));
        }
    };

    // Utility Methods
    mapDateTime(dateTime) {
        if (!dateTime) return null;

        try {
            const date = new Date(dateTime);
            return isNaN(date.getTime()) ? null : date.toISOString();
        } catch {
            return null;
        }
    }

    mapTimeSpan(timeSpan) {
        if (!timeSpan) return null;

        if (typeof timeSpan === 'string') {
            return timeSpan; // Already in "HH:mm:ss" format
        }

        if (typeof timeSpan === 'object' && timeSpan.hours !== undefined) {
            // Convert TimeSpan object to string
            const hours = timeSpan.hours.toString().padStart(2, '0');
            const minutes = timeSpan.minutes.toString().padStart(2, '0');
            const seconds = timeSpan.seconds.toString().padStart(2, '0');
            return `${hours}:${minutes}:${seconds}`;
        }

        return null;
    }

    mapTimeSpanToEntity(timeSpanString) {
        if (!timeSpanString) return null;

        if (typeof timeSpanString === 'string') {
            const [hours, minutes, seconds] = timeSpanString.split(':').map(Number);
            return {
                hours: hours || 0,
                minutes: minutes || 0,
                seconds: seconds || 0
            };
        }

        return timeSpanString;
    }

    calculateEndTime(startTime, durationMinutes = 60) {
        if (!startTime) return null;

        const start = new Date(startTime);
        const end = new Date(start.getTime() + (durationMinutes * 60 * 1000));
        return end.toISOString();
    }

    generateScheduleNo() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 9);
        return `SCH-${timestamp}-${random}`.toUpperCase();
    }

    // Validation Mappers
    validate = {
        scheduleData: (dto) => {
            const errors = [];

            if (!dto.agentId || dto.agentId <= 0) {
                errors.push('Valid agentId is required');
            }

            if (!dto.propertyId || dto.propertyId <= 0) {
                errors.push('Valid propertyId is required');
            }

            if (!dto.clientId || dto.clientId <= 0) {
                errors.push('Valid clientId is required');
            }

            if (!dto.scheduleTime) {
                errors.push('Schedule time is required');
            } else {
                const scheduleTime = new Date(dto.scheduleTime);
                if (isNaN(scheduleTime.getTime())) {
                    errors.push('Invalid schedule time format');
                }
            }

            return {
                isValid: errors.length === 0,
                errors: errors
            };
        },

        timeOffData: (dto) => {
            const errors = [];

            if (!dto.agentId || dto.agentId <= 0) {
                errors.push('Valid agentId is required');
            }

            if (!dto.startDate) {
                errors.push('Start date is required');
            }

            if (!dto.endDate) {
                errors.push('End date is required');
            }

            if (dto.startDate && dto.endDate) {
                const start = new Date(dto.startDate);
                const end = new Date(dto.endDate);

                if (start >= end) {
                    errors.push('End date must be after start date');
                }
            }

            if (!dto.reason || dto.reason.trim().length === 0) {
                errors.push('Reason is required');
            }

            return {
                isValid: errors.length === 0,
                errors: errors
            };
        },

        availabilityData: (dto) => {
            const errors = [];

            if (!dto.agentId || dto.agentId <= 0) {
                errors.push('Valid agentId is required');
            }

            if (!dto.dayOfWeek && dto.dayOfWeek !== 0) {
                errors.push('Day of week is required');
            }

            if (!dto.startTime) {
                errors.push('Start time is required');
            }

            if (!dto.endTime) {
                errors.push('End time is required');
            }

            if (dto.startTime && dto.endTime) {
                const start = this.parseTimeString(dto.startTime);
                const end = this.parseTimeString(dto.endTime);

                if (start >= end) {
                    errors.push('End time must be after start time');
                }
            }

            return {
                isValid: errors.length === 0,
                errors: errors
            };
        }
    };

    parseTimeString(timeString) {
        if (!timeString) return 0;

        if (typeof timeString === 'string') {
            const [hours, minutes, seconds] = timeString.split(':').map(Number);
            return (hours * 3600) + (minutes * 60) + (seconds || 0);
        }

        return timeString;
    }

    // Response Formatting
    formatResponse = {
        success: (data, message = 'Operation completed successfully') => {
            return {
                success: true,
                data: data,
                message: message,
                timestamp: new Date().toISOString()
            };
        },

        error: (error, message = 'An error occurred') => {
            return {
                success: false,
                error: {
                    message: message,
                    details: error.details || error.message,
                    code: error.code || 'UNKNOWN_ERROR',
                    timestamp: new Date().toISOString()
                },
                data: null
            };
        },

        paginated: (data, page, pageSize, totalCount) => {
            return {
                success: true,
                data: data,
                pagination: {
                    page: page,
                    pageSize: pageSize,
                    totalCount: totalCount,
                    totalPages: Math.ceil(totalCount / pageSize),
                    hasNext: page * pageSize < totalCount,
                    hasPrevious: page > 1
                },
                timestamp: new Date().toISOString()
            };
        }
    };

    // Service-specific mapper methods
    toAgentTimeOffDto(entity) {
        return this.agentTimeOff.toDto(entity);
    }

    toCreateAgentTimeOffEntity(dto) {
        return this.agentTimeOff.toEntity(dto);
    }

    toAgentTimeOffEntity(dto) {
        return this.agentTimeOff.toEntity(dto);
    }

    toScheduleResponseDto(entity) {
        return this.scheduleProperties.toDto(entity);
    }

    toCreateScheduleEntity(dto) {
        return this.scheduleProperties.toEntity(dto);
    }

    toUpdateScheduleEntity(dto, options) {
        return this.scheduleProperties.toUpdateDto({ ...dto, ...options }, dto);
    }

    toAgentAvailabilityDto(entity) {
        return this.agentAvailability.toDto(entity);
    }

    toCreateAgentAvailabilityEntity(dto) {
        return this.agentAvailability.toEntity(dto);
    }

    toAgentScheduleConfigDto(entity) {
        return this.agentScheduleConfig.toDto(entity);
    }

    toAgentScheduleConfigEntity(dto) {
        return this.agentScheduleConfig.toEntity(dto);
    }
}

// Export singleton instance
const SchedulingMapper = new SchedulingMappers();
export default SchedulingMapper;