export const agentTimeOffMapper = {
    toFrontend: (backendData) => {
        try {
            if (!backendData) return null;

            // Determine status based on isApproved and other possible fields
            let status = 'Pending';
            if (backendData.isApproved === true) {
                status = 'Approved';
            } else if (backendData.isApproved === false && backendData.status === 'Rejected') {
                status = 'Rejected';
            } else if (backendData.status) {
                // Use status field if provided
                status = backendData.status;
            }

            return {
                id: backendData.id || 0,
                agentId: backendData.agentId || 0,
                startDate: backendData.startDate ? new Date(backendData.startDate) : null,
                endDate: backendData.endDate ? new Date(backendData.endDate) : null,
                type: backendData.type || 'Vacation',
                reason: backendData.reason || '',
                status: status, // Changed from isApproved to status string
                isApproved: backendData.isApproved || false, // Keep for backward compatibility
                isAllDay: backendData.isAllDay !== undefined ? backendData.isAllDay : true,
                createdAt: backendData.createdAt ? new Date(backendData.createdAt) : new Date(),
                updatedAt: backendData.updatedAt ? new Date(backendData.updatedAt) : null,
                // Include agent data if available
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
            // Convert status string back to isApproved boolean for backend
            let isApproved = false;
            if (frontendData.status === 'Approved') {
                isApproved = true;
            } else if (frontendData.status === 'Rejected') {
                isApproved = false;
            } else {
                // Fallback to existing isApproved field
                isApproved = frontendData.isApproved || false;
            }

            return {
                id: frontendData.id || 0,
                agentId: frontendData.agentId || 0,
                startDate: frontendData.startDate,
                endDate: frontendData.endDate,
                type: frontendData.type || 'Vacation',
                reason: frontendData.reason || '',
                isApproved: isApproved, // Convert status back to boolean
                isAllDay: frontendData.isAllDay !== undefined ? frontendData.isAllDay : true
            };
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
            status: 'Pending', // Add status field
            isAllDay: true
        };
    }
};

export default agentTimeOffMapper;