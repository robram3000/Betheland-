export const agentAvailabilityMapper = {
    toFrontend: (backendData) => {
        try {
            console.log('🔄 Mapping to frontend - Backend data:', backendData);
            
            if (!backendData) {
                console.warn('⚠️ No backend data provided for mapping');
                return null;
            }

            const mappedData = {
                id: backendData.id || 0,
                agentId: backendData.agentId || 0,
                dayOfWeek: backendData.dayOfWeek || 0,
                startTime: backendData.startTime || '09:00:00',
                endTime: backendData.endTime || '17:00:00',
                isAvailable: backendData.isAvailable ?? true,
                createdAt: backendData.createdAt ? new Date(backendData.createdAt) : new Date(),
                updatedAt: backendData.updatedAt ? new Date(backendData.updatedAt) : null,
                agent: backendData.agent || null
            };

            console.log('✅ Mapped to frontend:', mappedData);
            return mappedData;
        } catch (error) {
            console.error('❌ Error mapping agent availability to frontend:', error);
            console.error('Original backend data:', backendData);
            throw new Error('Failed to map agent availability data: ' + error.message);
        }
    },

    toBackend: (frontendData) => {
        try {
            console.log('🔄 Mapping to backend - Frontend data:', frontendData);
            
            if (!frontendData) {
                console.warn('⚠️ No frontend data provided for mapping');
                return null;
            }

            const mappedData = {
                id: frontendData.id || 0,
                agentId: parseInt(frontendData.agentId) || 0,
                dayOfWeek: parseInt(frontendData.dayOfWeek) || 0,
                startTime: frontendData.startTime || '09:00:00',
                endTime: frontendData.endTime || '17:00:00',
                isAvailable: frontendData.isAvailable ?? true
            };

            console.log('✅ Mapped to backend:', mappedData);
            return mappedData;
        } catch (error) {
            console.error('❌ Error mapping agent availability to backend:', error);
            console.error('Original frontend data:', frontendData);
            throw new Error('Failed to map agent availability data for backend: ' + error.message);
        }
    },

    toFrontendList: (backendList) => {
        try {
            console.log('🔄 Mapping list to frontend - Backend list:', backendList);
            
            if (!Array.isArray(backendList)) {
                console.warn('⚠️ Backend list is not an array:', backendList);
                return [];
            }

            const mappedList = backendList
                .map(item => {
                    try {
                        return agentAvailabilityMapper.toFrontend(item);
                    } catch (itemError) {
                        console.error('❌ Error mapping item in list:', item, itemError);
                        return null;
                    }
                })
                .filter(item => item !== null);

            console.log(`✅ Mapped list: ${mappedList.length} items`);
            return mappedList;
        } catch (error) {
            console.error('❌ Error mapping agent availability list:', error);
            return [];
        }
    },

    createDefaultAvailability: (agentId, dayOfWeek) => {
        const defaultAvail = {
            agentId: parseInt(agentId),
            dayOfWeek: parseInt(dayOfWeek),
            startTime: '09:00:00',
            endTime: '17:00:00',
            isAvailable: true
        };
        console.log('📝 Created default availability:', defaultAvail);
        return defaultAvail;
    }
};

export default agentAvailabilityMapper;