export const agentAvailabilityMapper = {
    toFrontend: (backendData) => {
        try {
            if (!backendData) return null;

            return {
                id: backendData.id || 0,
                agentId: backendData.agentId || 0,
                dayOfWeek: backendData.dayOfWeek || 0,
                startTime: backendData.startTime || '09:00:00',
                endTime: backendData.endTime || '17:00:00',
                isAvailable: backendData.isAvailable ?? true,
                createdAt: backendData.createdAt ? new Date(backendData.createdAt) : new Date(),
                updatedAt: backendData.updatedAt ? new Date(backendData.updatedAt) : null
            };
        } catch (error) {
            console.error('Error mapping agent availability to frontend:', error);
            throw new Error('Failed to map agent availability data');
        }
    },

    toBackend: (frontendData) => {
        try {
            return {
                id: frontendData.id || 0,                    // camelCase
                agentId: frontendData.agentId || 0,          // camelCase
                dayOfWeek: frontendData.dayOfWeek || 0,      // camelCase
                startTime: frontendData.startTime || '09:00:00', // camelCase
                endTime: frontendData.endTime || '17:00:00', // camelCase
                isAvailable: frontendData.isAvailable ?? true // camelCase
            };
        } catch (error) {
            console.error('Error mapping agent availability to backend:', error);
            throw new Error('Failed to map agent availability data for backend');
        }
    },
    toFrontendList: (backendList) => {
        try {
            if (!Array.isArray(backendList)) return [];

            return backendList
                .map(item => agentAvailabilityMapper.toFrontend(item))
                .filter(item => item !== null);
        } catch (error) {
            console.error('Error mapping agent availability list:', error);
            return [];
        }
    },

    createDefaultAvailability: (agentId, dayOfWeek) => {
        return {
            agentId: agentId,
            dayOfWeek: dayOfWeek,
            startTime: '09:00:00',
            endTime: '17:00:00',
            isAvailable: true
        };
    }
};

export default agentAvailabilityMapper;