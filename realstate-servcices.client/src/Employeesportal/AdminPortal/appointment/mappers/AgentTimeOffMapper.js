export const agentTimeOffMapper = {
    toFrontend: (backendData) => {
        try {
            if (!backendData) return null;

            // Enhanced status determination
            let status = 'Pending';
            if (backendData.status) {
                // Use status field if provided
                status = backendData.status;
            } else if (backendData.isApproved === true) {
                status = 'Approved';
            } else if (backendData.isApproved === false) {
                status = 'Rejected';
            }

            return {
                id: backendData.id || 0,
                agentId: backendData.agentId || 0,
                startDate: backendData.startDate ? new Date(backendData.startDate) : null,
                endDate: backendData.endDate ? new Date(backendData.endDate) : null,
                type: backendData.type || 'Vacation',
                reason: backendData.reason || '',
                status: status,
                isApproved: backendData.isApproved || false,
                isAllDay: backendData.isAllDay !== undefined ? backendData.isAllDay : true,
                createdAt: backendData.createdAt ? new Date(backendData.createdAt) : new Date(),
                updatedAt: backendData.updatedAt ? new Date(backendData.updatedAt) : null,
                agentName: backendData.agentName || '',
                agent: backendData.agent || null
            };
        } catch (error) {
            console.error('Error mapping time off to frontend:', error);
            throw new Error('Failed to map time off data');
        }
    },

    toBackend: (frontendData) => {
        try {
            // Convert status to isApproved for backend
            let isApproved = frontendData.isApproved || false;

            // If status is provided, use it to determine isApproved
            if (frontendData.status) {
                isApproved = frontendData.status === 'Approved';
            }

            const backendData = {
                id: frontendData.id || 0,
                agentId: frontendData.agentId || 0,
                startDate: frontendData.startDate,
                endDate: frontendData.endDate,
                type: frontendData.type || 'Vacation',
                reason: frontendData.reason || '',
                isApproved: isApproved,
                isAllDay: frontendData.isAllDay !== undefined ? frontendData.isAllDay : true
            };

            // Include status field if it exists
            if (frontendData.status) {
                backendData.status = frontendData.status;
            }

            return backendData;
        } catch (error) {
            console.error('Error mapping time off to backend:', error);
            throw new Error('Failed to map time off data for backend');
        }
    },

    toFrontendList: (backendList) => {
        try {
            if (!Array.isArray(backendList)) return [];

            return backendList
                .map(item => agentTimeOffMapper.toFrontend(item))
                .filter(item => item !== null);
        } catch (error) {
            console.error('Error mapping time off list:', error);
            return [];
        }
    },

    createTimeOffRequest: (agentId, startDate, endDate, type = 'Vacation', reason = '') => {
        return {
            agentId: agentId,
            startDate: startDate,
            endDate: endDate,
            type: type,
            reason: reason,
            isApproved: false,
            status: 'Pending',
            isAllDay: true
        };
    }
};

export default agentTimeOffMapper;