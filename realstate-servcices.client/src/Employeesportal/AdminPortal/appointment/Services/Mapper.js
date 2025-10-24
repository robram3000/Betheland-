class SchedulingMapper {
   
    static createTimeSpan(hours, minutes, seconds = 0) {
        return { hours, minutes, seconds };
    }

    static timeSpanToString(timeSpan) {
        if (!timeSpan) return null;
        if (typeof timeSpan === 'string') return timeSpan;

        const { hours, minutes, seconds } = timeSpan;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    static stringToTimeSpan(timeString) {
        if (!timeString) return null;
        if (typeof timeString !== 'string') return timeString;

        const [hours, minutes, seconds] = timeString.split(':').map(Number);
        return { hours, minutes, seconds };
    }

    // AgentAvailability mappings
    static toAgentAvailabilityDto(entity) {
        if (!entity) return null;

        return {
            id: entity.id,
            agentId: entity.agentId,
            dayOfWeek: entity.dayOfWeek,
            startTime: this.timeSpanToString(entity.startTime),
            endTime: this.timeSpanToString(entity.endTime),
            isAvailable: entity.isAvailable !== false,
            createdAt: entity.createdAt ? new Date(entity.createdAt) : new Date(),
            updatedAt: entity.updatedAt ? new Date(entity.updatedAt) : null
        };
    }

    static toAgentAvailabilityEntity(dto) {
        if (!dto) return null;

        return {
            id: dto.id || 0,
            agentId: dto.agentId,
            dayOfWeek: dto.dayOfWeek,
            startTime: this.stringToTimeSpan(dto.startTime),
            endTime: this.stringToTimeSpan(dto.endTime),
            isAvailable: dto.isAvailable !== false,
            createdAt: dto.createdAt || new Date(),
            updatedAt: dto.updatedAt || null
        };
    }

    static toCreateAgentAvailabilityEntity(dto) {
        if (!dto) return null;

        return {
            agentId: dto.agentId,
            dayOfWeek: dto.dayOfWeek,
            startTime: this.stringToTimeSpan(dto.startTime),
            endTime: this.stringToTimeSpan(dto.endTime),
            isAvailable: dto.isAvailable !== false
        };
    }

    // AgentScheduleConfig mappings
    static toAgentScheduleConfigDto(entity) {
        if (!entity) return null;

        return {
            id: entity.id,
            agentId: entity.agentId,
            slotDurationMinutes: entity.slotDurationMinutes || 60,
            bufferTimeMinutes: entity.bufferTimeMinutes || 15,
            maxSchedulesPerDay: entity.maxSchedulesPerDay || 8,
            workDayStart: this.timeSpanToString(entity.workDayStart),
            workDayEnd: this.timeSpanToString(entity.workDayEnd),
            allowWeekendScheduling: entity.allowWeekendScheduling || false,
            createdAt: entity.createdAt ? new Date(entity.createdAt) : new Date(),
            updatedAt: entity.updatedAt ? new Date(entity.updatedAt) : null
        };
    }

    static toAgentScheduleConfigEntity(dto) {
        if (!dto) return null;

        return {
            id: dto.id || 0,
            agentId: dto.agentId,
            slotDurationMinutes: dto.slotDurationMinutes || 60,
            bufferTimeMinutes: dto.bufferTimeMinutes || 15,
            maxSchedulesPerDay: dto.maxSchedulesPerDay || 8,
            workDayStart: this.stringToTimeSpan(dto.workDayStart),
            workDayEnd: this.stringToTimeSpan(dto.workDayEnd),
            allowWeekendScheduling: dto.allowWeekendScheduling || false,
            createdAt: dto.createdAt || new Date(),
            updatedAt: dto.updatedAt || null
        };
    }

    static toUpdateAgentScheduleConfigEntity(dto, existingEntity) {
        if (!dto || !existingEntity) return null;

        return {
            ...existingEntity,
            slotDurationMinutes: dto.slotDurationMinutes ?? existingEntity.slotDurationMinutes,
            bufferTimeMinutes: dto.bufferTimeMinutes ?? existingEntity.bufferTimeMinutes,
            maxSchedulesPerDay: dto.maxSchedulesPerDay ?? existingEntity.maxSchedulesPerDay,
            workDayStart: dto.workDayStart ? this.stringToTimeSpan(dto.workDayStart) : existingEntity.workDayStart,
            workDayEnd: dto.workDayEnd ? this.stringToTimeSpan(dto.workDayEnd) : existingEntity.workDayEnd,
            allowWeekendScheduling: dto.allowWeekendScheduling ?? existingEntity.allowWeekendScheduling,
            updatedAt: new Date()
        };
    }

    // AgentTimeOff mappings
    static toAgentTimeOffDto(entity) {
        if (!entity) return null;

        return {
            id: entity.id,
            agentId: entity.agentId,
            startDate: new Date(entity.startDate),
            endDate: new Date(entity.endDate),
            reason: entity.reason || '',
            isAllDay: entity.isAllDay !== false,
            createdAt: entity.createdAt ? new Date(entity.createdAt) : new Date(),
            updatedAt: entity.updatedAt ? new Date(entity.updatedAt) : null
        };
    }

    static toAgentTimeOffEntity(dto) {
        if (!dto) return null;

        return {
            id: dto.id || 0,
            agentId: dto.agentId,
            startDate: new Date(dto.startDate),
            endDate: new Date(dto.endDate),
            reason: dto.reason || '',
            isAllDay: dto.isAllDay !== false,
            createdAt: dto.createdAt || new Date(),
            updatedAt: dto.updatedAt || null
        };
    }

    static toCreateAgentTimeOffEntity(dto) {
        if (!dto) return null;

        return {
            agentId: dto.agentId,
            startDate: new Date(dto.startDate),
            endDate: new Date(dto.endDate),
            reason: dto.reason || '',
            isAllDay: dto.isAllDay !== false
        };
    }

    // Schedule mappings
    static toScheduleResponseDto(entity, additionalData = {}) {
        if (!entity) return null;

        return {
            id: entity.id,
            scheduleNo: entity.scheduleNo || this.generateGuid(),
            propertyId: entity.propertyId,
            agentId: entity.agentId,
            clientId: entity.clientId,
            scheduleTime: new Date(entity.scheduleTime),
            scheduleEndTime: entity.scheduleEndTime ? new Date(entity.scheduleEndTime) : new Date(entity.scheduleTime),
            status: entity.status || 'Scheduled',
            notes: entity.notes || null,
            createdAt: entity.createdAt ? new Date(entity.createdAt) : new Date(),
            updatedAt: entity.updatedAt ? new Date(entity.updatedAt) : null,
            propertyTitle: additionalData.propertyTitle || '',
            agentName: additionalData.agentName || '',
            clientName: additionalData.clientName || '',
            propertyAddress: additionalData.propertyAddress || '',
            meetingType: entity.meetingType || 'InPerson',
            meetingLocation: entity.meetingLocation || null,
            virtualMeetingLink: entity.virtualMeetingLink || null,
            cancelledAt: entity.cancelledAt ? new Date(entity.cancelledAt) : null,
            completedAt: entity.completedAt ? new Date(entity.completedAt) : null,
            cancellationReason: entity.cancellationReason || null
        };
    }

    static toSchedulePropertiesEntity(dto) {
        if (!dto) return null;

        return {
            id: dto.id || 0,
            scheduleNo: dto.scheduleNo || this.generateGuid(),
            propertyId: dto.propertyId,
            agentId: dto.agentId,
            clientId: dto.clientId,
            scheduleTime: new Date(dto.scheduleTime),
            scheduleEndTime: dto.scheduleEndTime ? new Date(dto.scheduleEndTime) : new Date(dto.scheduleTime),
            status: dto.status || 'Scheduled',
            notes: dto.notes || null,
            meetingType: dto.meetingType || 'InPerson',
            meetingLocation: dto.meetingLocation || null,
            virtualMeetingLink: dto.virtualMeetingLink || null,
            cancelledAt: dto.cancelledAt ? new Date(dto.cancelledAt) : null,
            completedAt: dto.completedAt ? new Date(dto.completedAt) : null,
            cancellationReason: dto.cancellationReason || null,
            createdAt: dto.createdAt || new Date(),
            updatedAt: dto.updatedAt || null
        };
    }

    static toCreateScheduleEntity(dto) {
        if (!dto) return null;

        return {
            propertyId: dto.propertyId,
            agentId: dto.agentId,
            clientId: dto.clientId,
            scheduleTime: new Date(dto.scheduleTime),
            notes: dto.notes || null,
            status: dto.status || 'Scheduled',
            meetingType: dto.meetingType || 'InPerson',
            meetingLocation: dto.meetingLocation || null,
            virtualMeetingLink: dto.virtualMeetingLink || null
        };
    }

    static toUpdateScheduleEntity(dto, existingEntity) {
        if (!dto || !existingEntity) return null;

        return {
            ...existingEntity,
            scheduleTime: dto.scheduleTime ? new Date(dto.scheduleTime) : existingEntity.scheduleTime,
            status: dto.status || existingEntity.status,
            notes: dto.notes !== undefined ? dto.notes : existingEntity.notes,
            meetingType: dto.meetingType || existingEntity.meetingType,
            meetingLocation: dto.meetingLocation !== undefined ? dto.meetingLocation : existingEntity.meetingLocation,
            virtualMeetingLink: dto.virtualMeetingLink !== undefined ? dto.virtualMeetingLink : existingEntity.virtualMeetingLink,
            updatedAt: new Date()
        };
    }

    // Utility methods
    static generateGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    static mapArray(array, mapperFunction) {
        if (!Array.isArray(array)) return [];
        return array.map(mapperFunction).filter(item => item !== null);
    }
}

export default SchedulingMapper;