// Services/ScheduleServices.jsx
import api from '../../Authpage/Services/Api'

class ScheduleServices {
    // Create a new schedule
    async createSchedule(scheduleData) {
        try {
            const response = await api.post('/Scheduling', scheduleData);
            return response;
        } catch (error) {
            console.error('Error creating schedule:', error);
            throw error;
        }
    }

    // Get schedule by ID
    async getScheduleById(id) {
        try {
            const response = await api.get(`/Scheduling/${id}`);
            return response;
        } catch (error) {
            console.error('Error fetching schedule:', error);
            throw error;
        }
    }

    // Get schedules by agent
    async getSchedulesByAgent(agentId) {
        try {
            const response = await api.get(`/Scheduling/agent/${agentId}`);
            return response;
        } catch (error) {
            console.error('Error fetching agent schedules:', error);
            throw error;
        }
    }

    // Get schedules by client
    async getSchedulesByClient(clientId) {
        try {
            const response = await api.get(`/Scheduling/client/${clientId}`);
            return response;
        } catch (error) {
            console.error('Error fetching client schedules:', error);
            throw error;
        }
    }

    // Get schedules by property
    async getSchedulesByProperty(propertyId) {
        try {
            const response = await api.get(`/Scheduling/property/${propertyId}`);
            return response;
        } catch (error) {
            console.error('Error fetching property schedules:', error);
            throw error;
        }
    }

    // Get upcoming schedules
    async getUpcomingSchedules(days = 7) {
        try {
            const response = await api.get(`/Scheduling/upcoming?days=${days}`);
            return response;
        } catch (error) {
            console.error('Error fetching upcoming schedules:', error);
            throw error;
        }
    }

    // Update schedule
    async updateSchedule(id, updateData) {
        try {
            const response = await api.put(`/Scheduling/${id}`, updateData);
            return response;
        } catch (error) {
            console.error('Error updating schedule:', error);
            throw error;
        }
    }

    // Cancel schedule
    async cancelSchedule(id) {
        try {
            const response = await api.patch(`/Scheduling/${id}/cancel`);
            return response;
        } catch (error) {
            console.error('Error canceling schedule:', error);
            throw error;
        }
    }

    // Complete schedule
    async completeSchedule(id) {
        try {
            const response = await api.patch(`/Scheduling/${id}/complete`);
            return response;
        } catch (error) {
            console.error('Error completing schedule:', error);
            throw error;
        }
    }

    // Delete schedule
    async deleteSchedule(id) {
        try {
            const response = await api.delete(`/Scheduling/${id}`);
            return response;
        } catch (error) {
            console.error('Error deleting schedule:', error);
            throw error;
        }
    }

    // Check time slot availability
    async checkTimeSlotAvailability(agentId, scheduleTime) {
        try {
            const response = await api.get('/Scheduling/availability', {
                params: {
                    agentId,
                    scheduleTime: scheduleTime.toISOString()
                }
            });
            return response;
        } catch (error) {
            console.error('Error checking time slot availability:', error);
            throw error;
        }
    }

    // Format schedule data for API
    formatScheduleData(formData, clientId) {
        return {
            propertyId: formData.propertyId,
            agentId: formData.agentId,
            clientId: clientId,
            scheduleTime: formData.scheduleTime.format('YYYY-MM-DDTHH:mm:ss'),
            notes: formData.notes || '',
            status: "Scheduled"
        };
    }

    // Validate schedule data
    validateScheduleData(scheduleData) {
        const errors = [];

        if (!scheduleData.propertyId) {
            errors.push('Property ID is required');
        }

        if (!scheduleData.agentId) {
            errors.push('Agent ID is required');
        }

        if (!scheduleData.clientId) {
            errors.push('Client ID is required');
        }

        if (!scheduleData.scheduleTime) {
            errors.push('Schedule time is required');
        }

        // Check if schedule time is in the future
        if (scheduleData.scheduleTime && new Date(scheduleData.scheduleTime) <= new Date()) {
            errors.push('Schedule time must be in the future');
        }

        return errors;
    }
}

// Create and export a singleton instance
const scheduleServices = new ScheduleServices();
export default scheduleServices;