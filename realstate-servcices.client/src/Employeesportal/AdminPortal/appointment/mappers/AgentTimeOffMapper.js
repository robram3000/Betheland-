// AgentTimeOffMapper.js - Updated
export const agentTimeOffMapper = {
    toFrontend: (backendData) => {
        try {
            if (!backendData) return null;

            // Enhanced status determination - handle both scenarios
            let status = 'Pending';
            let isApproved = false;

            if (backendData.status) {
                // Use status field if provided
                status = backendData.status;
                isApproved = status === 'Approved';
            } else if (backendData.isApproved !== undefined) {
                // Use isApproved boolean if provided
                isApproved = backendData.isApproved;
                status = isApproved ? 'Approved' :
                    backendData.isApproved === false ? 'Rejected' : 'Pending';
            }

            return {
                id: backendData.id || 0,
                agentId: backendData.agentId || 0,
                startDate: backendData.startDate ? new Date(backendData.startDate) : null,
                endDate: backendData.endDate ? new Date(backendData.endDate) : null,
                type: backendData.type || 'Vacation',
                reason: backendData.reason || '',
                status: status,
                isApproved: isApproved,
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
            // Convert status to isApproved for backend compatibility
            let isApproved = false;
            let status = 'Pending';

            if (frontendData.status) {
                status = frontendData.status;
                isApproved = status === 'Approved';
            } else if (frontendData.isApproved !== undefined) {
                isApproved = frontendData.isApproved;
                status = isApproved ? 'Approved' : 'Pending';
            }

            const backendData = {
                id: frontendData.id || 0,
                agentId: frontendData.agentId || 0,
                startDate: frontendData.startDate,
                endDate: frontendData.endDate,
                type: frontendData.type || 'Vacation',
                reason: frontendData.reason || '',
                isApproved: isApproved,
                status: status, // Include both fields for compatibility
                isAllDay: frontendData.isAllDay !== undefined ? frontendData.isAllDay : true
            };

            return backendData;
        } catch (error) {
            console.error('Error mapping time off to backend:', error);
            throw new Error('Failed to map time off data for backend');
        }
    },

    toFrontendList: (backendList) => {
        try {
            if (!Array.isArray(backendList)) return [];
            return backendList.map(item => agentTimeOffMapper.toFrontend(item)).filter(item => item !== null);
        } catch (error) {
            console.error('Error mapping time off list:', error);
            return [];
        }
    }
};
export default agentTimeOffMapper;