export const agentScheduleConfigMapper = {
    toFrontend: (backendData) => {
        try {
            if (!backendData) return null;

            return {
                id: backendData.id || 0,
                agentId: backendData.agentId || 0,
                slotDurationMinutes: backendData.slotDurationMinutes || 60,
                maxSchedulesPerDay: backendData.maxSchedulesPerDay || 8,
                bufferTimeMinutes: backendData.bufferTimeMinutes || 15,
                allowWeekendScheduling: backendData.allowWeekendScheduling || false,
                workDayStart: backendData.workDayStart || '09:00:00',
                workDayEnd: backendData.workDayEnd || '17:00:00',
                advanceBookingDays: backendData.advanceBookingDays || 30,
                createdAt: backendData.createdAt ? new Date(backendData.createdAt) : new Date(),
                updatedAt: backendData.updatedAt ? new Date(backendData.updatedAt) : null
            };
        } catch (error) {
            console.error('Error mapping schedule config to frontend:', error);
            throw new Error('Failed to map schedule config data');
        }
    },

    // AgentScheduleConfigMapper.js - Update the toBackend method
    // AgentScheduleConfigMapper.js - Update the toBackend method
    toBackend: (frontendData) => {
        try {
            return {
                id: frontendData.id || 0,
                agentId: frontendData.agentId || 0,
                slotDurationMinutes: frontendData.slotDurationMinutes || 60,
                maxSchedulesPerDay: frontendData.maxSchedulesPerDay || 8, // ✅ camelCase
                bufferTimeMinutes: frontendData.bufferTimeMinutes || 15,
                allowWeekendScheduling: frontendData.allowWeekendScheduling || false, // ✅ camelCase
                workDayStart: frontendData.workDayStart || '09:00:00', // ✅ camelCase
                workDayEnd: frontendData.workDayEnd || '17:00:00', // ✅ camelCase
                advanceBookingDays: frontendData.advanceBookingDays || 30
            };
        } catch (error) {
            console.error('Error mapping schedule config to backend:', error);
            throw new Error('Failed to map schedule config data for backend');
        }
    },

    toFrontendList: (backendList) => {
        try {
            if (!Array.isArray(backendList)) return [];

            return backendList
                .map(item => agentScheduleConfigMapper.toFrontend(item))
                .filter(item => item !== null);
        } catch (error) {
            console.error('Error mapping schedule config list:', error);
            return [];
        }
    },

    createDefaultConfig: (agentId) => {
        return {
            agentId: agentId,
            slotDurationMinutes: 60,
            maxSchedulesPerDay: 8,
            bufferTimeMinutes: 15,
            allowWeekendScheduling: false,
            workDayStart: '09:00:00',
            workDayEnd: '17:00:00',
            advanceBookingDays: 30
        };
    }
};

export default agentScheduleConfigMapper;