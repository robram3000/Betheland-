// scheduleService.js
import axios from 'axios';

const API_BASE_URL = '/api';

class ScheduleService {
    async getClientSchedules(clientId) {
        const response = await axios.get(`${API_BASE_URL}/scheduleproperties/client/${clientId}`);
        return response.data;
    }

    async getAgentSchedules(agentId) {
        const response = await axios.get(`${API_BASE_URL}/scheduleproperties/agent/${agentId}`);
        return response.data;
    }

    async createSchedule(scheduleData) {
        const response = await axios.post(`${API_BASE_URL}/scheduleproperties`, scheduleData);
        return response.data;
    }

    async updateSchedule(scheduleId, updateData) {
        const response = await axios.put(`${API_BASE_URL}/scheduleproperties/${scheduleId}`, updateData);
        return response.data;
    }

    async cancelSchedule(scheduleId) {
        await axios.patch(`${API_BASE_URL}/scheduleproperties/${scheduleId}/cancel`);
    }

    async deleteSchedule(scheduleId) {
        await axios.delete(`${API_BASE_URL}/scheduleproperties/${scheduleId}`);
    }

    async checkScheduleConflict(propertyId, agentId, scheduleTime) {
        const response = await axios.get(`${API_BASE_URL}/scheduleproperties/conflict-check`, {
            params: { propertyId, agentId, scheduleTime }
        });
        return response.data;
    }

    async getUpcomingSchedules(days = 7) {
        const response = await axios.get(`${API_BASE_URL}/scheduleproperties/upcoming?days=${days}`);
        return response.data;
    }
}

export default new ScheduleService();