export const ratingMapper = {
    toFrontend: (backendData) => {
        try {
            if (!backendData) return null;

            return {
                id: backendData.id || 0,
                scheduleId: backendData.scheduleId || 0,
                clientId: backendData.clientId || 0,
                agentId: backendData.agentId || 0,
                rating: backendData.rating || 0,
                comment: backendData.comment || '',
                ratingType: backendData.ratingType || 'Service',
                ratingDate: backendData.ratingDate ? new Date(backendData.ratingDate) : new Date(),
                isVisible: backendData.isVisible !== undefined ? backendData.isVisible : true,
                status: backendData.status || 'Active',
                clientName: backendData.clientName || '',
                agentName: backendData.agentName || '',
                scheduleDetails: backendData.scheduleDetails || null
            };
        } catch (error) {
            console.error('Error mapping rating to frontend:', error);
            throw new Error('Failed to map rating data');
        }
    },

    toBackend: (frontendData) => {
        try {
            const backendData = {
                id: frontendData.id || 0,
                scheduleId: frontendData.scheduleId || 0,
                clientId: frontendData.clientId || 0,
                agentId: frontendData.agentId || 0,
                rating: frontendData.rating || 0,
                comment: frontendData.comment || '',
                ratingType: frontendData.ratingType || 'Service',
                isVisible: frontendData.isVisible !== undefined ? frontendData.isVisible : true,
                status: frontendData.status || 'Active'
            };

            // Include ratingDate if provided
            if (frontendData.ratingDate) {
                backendData.ratingDate = frontendData.ratingDate;
            }

            return backendData;
        } catch (error) {
            console.error('Error mapping rating to backend:', error);
            throw new Error('Failed to map rating data for backend');
        }
    },

    toFrontendList: (backendList) => {
        try {
            if (!Array.isArray(backendList)) return [];

            return backendList
                .map(item => ratingMapper.toFrontend(item))
                .filter(item => item !== null);
        } catch (error) {
            console.error('Error mapping rating list:', error);
            return [];
        }
    },

    createRatingRequest: (scheduleId, rating, comment = '', ratingType = 'Service') => {
        return {
            scheduleId: scheduleId,
            rating: rating,
            comment: comment,
            ratingType: ratingType,
            isVisible: true,
            status: 'Active'
        };
    },

    toSummaryFrontend: (backendData) => {
        try {
            if (!backendData) return null;

            return {
                agentId: backendData.agentId || 0,
                averageRating: backendData.averageRating || 0,
                totalRatings: backendData.totalRatings || 0,
                fiveStar: backendData.fiveStar || 0,
                fourStar: backendData.fourStar || 0,
                threeStar: backendData.threeStar || 0,
                twoStar: backendData.twoStar || 0,
                oneStar: backendData.oneStar || 0,
                distribution: backendData.distribution || {}
            };
        } catch (error) {
            console.error('Error mapping rating summary to frontend:', error);
            throw new Error('Failed to map rating summary data');
        }
    }
};

export default ratingMapper;