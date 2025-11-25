import {
    AgentAvailabilityService,
    AgentTimeOffService,
    AgentScheduleConfigService,
    SchedulePropertiesService
} from './index.js';

class SchedulingServices {
    constructor(apiClient = null) {
        this.availability = new AgentAvailabilityService();
        this.timeOff = new AgentTimeOffService();
        this.config = new AgentScheduleConfigService();
        this.schedules = new SchedulePropertiesService();

        // If API client is provided, you can pass it to services
        if (apiClient) {
            this.availability.client = apiClient;
            this.timeOff.client = apiClient;
            this.config.client = apiClient;
            this.schedules.client = apiClient;
        }
    }

    // Helper method to get all scheduling actions in one place
    async performScheduleAction(scheduleId, action, data = {}) {
        switch (action) {
            case 'accept':
                return await this.schedules.acceptSchedule(scheduleId);
            case 'cancel':
                return await this.schedules.cancelSchedule(scheduleId, data.reason);
            case 'reschedule':
                return await this.schedules.reschedule(scheduleId, data.newScheduleTime, data.reason);
            case 'complete':
                return await this.schedules.completeSchedule(scheduleId);
            case 'reopen':
                return await this.schedules.reopenSchedule(scheduleId);
            case 'edit':
                return await this.schedules.updateSchedule(scheduleId, data.scheduleData);
            case 'delete':
                return await this.schedules.deleteSchedule(scheduleId);
            default:
                throw new Error(`Unknown action: ${action}`);
        }
    }

    // Get available actions for a schedule
    async getAvailableActions(schedule) {
        return await this.schedules.getAvailableActions(schedule);
    }

    // Check if schedule can be edited
    async canEditSchedule(schedule) {
        return await this.schedules.canEdit(schedule);
    }

    // Check if schedule can be deleted
    async canDeleteSchedule(schedule) {
        return await this.schedules.canDelete(schedule);
    }

    // Get status transitions
    async getStatusTransitions(scheduleId) {
        return await this.schedules.getAvailableStatusTransitions(scheduleId);
    }

    // Comprehensive schedule creation with validation
    async createScheduleWithValidation(scheduleData) {
        // Check availability first
        const isAvailable = await this.schedules.checkTimeSlotAvailability(
            scheduleData.agentId,
            scheduleData.scheduleTime
        );

        if (!isAvailable) {
            throw new Error('The selected time slot is not available');
        }

        // Create the schedule
        return await this.schedules.createSchedule(scheduleData);
    }
}

export default SchedulingServices;