// RatingScheduleMapper.jsx
import moment from 'moment';

export const ratingScheduleMapper = {
    toCreateRequest: (formData) => {
        try {
            console.log('Raw formData for rating schedule creation:', formData);

            const createRequest = {
                scheduleId: parseInt(formData.scheduleId) || 0,
                rating: parseInt(formData.rating) || 1,
                comment: formData.comment || '',
                ratingType: formData.ratingType || 'agent'
            };

            console.log('Mapped rating schedule create request:', createRequest);
            return createRequest;
        } catch (error) {
            console.error('Error in toCreateRequest:', error, formData);
            throw new Error('Failed to map rating schedule data for creation');
        }
    },

    toUpdateRequest: (formData) => {
        try {
            console.log('Raw formData for rating schedule update:', formData);

            const updateRequest = {
                rating: formData.rating !== undefined ? parseInt(formData.rating) : undefined,
                comment: formData.comment !== undefined ? formData.comment : undefined,
                ratingType: formData.ratingType !== undefined ? formData.ratingType : undefined,
                isVisible: formData.isVisible !== undefined ? Boolean(formData.isVisible) : undefined
            };

            // Remove undefined values
            Object.keys(updateRequest).forEach(key =>
                updateRequest[key] === undefined && delete updateRequest[key]
            );

            console.log('Mapped rating schedule update request:', updateRequest);
            return updateRequest;
        } catch (error) {
            console.error('Error in toUpdateRequest:', error, formData);
            throw new Error('Failed to map rating schedule data for update');
        }
    },

    toFrontend: (backendData) => {
        try {
            if (!backendData) {
                console.warn('No backend data provided to toFrontend');
                return null;
            }

            console.log('Raw backend rating schedule data:', backendData);

            const ratingSchedule = {
                id: backendData.id || 0,
                scheduleId: backendData.scheduleId || 0,
                clientId: backendData.clientId || 0,
                agentId: backendData.agentId || 0,
                rating: parseInt(backendData.rating) || 1,
                comment: backendData.comment || '',
                ratingType: backendData.ratingType || 'agent',
                ratingDate: backendData.ratingDate ? moment(backendData.ratingDate) : null,
                isVisible: backendData.isVisible !== undefined ? backendData.isVisible : true,
                status: backendData.status || 'Active',
                createdAt: backendData.createdAt ? moment(backendData.createdAt) : null,
                updatedAt: backendData.updatedAt ? moment(backendData.updatedAt) : null,
                client: null,
                agent: null,
                schedule: null
            };

            // Map client data if available
            if (backendData.client) {
                ratingSchedule.client = {
                    id: backendData.client.id,
                    firstName: backendData.client.firstName || '',
                    lastName: backendData.client.lastName || '',
                    email: backendData.client.email || '',
                    profilePictureUrl: backendData.client.profilePictureUrl || '',
                    cellPhoneNo: backendData.client.cellPhoneNo || ''
                };
            }

            // Map agent data if available
            if (backendData.agent) {
                ratingSchedule.agent = {
                    id: backendData.agent.id,
                    firstName: backendData.agent.firstName || '',
                    lastName: backendData.agent.lastName || '',
                    email: backendData.agent.email || '',
                    profilePictureUrl: backendData.agent.profilePictureUrl || '',
                    cellPhoneNo: backendData.agent.cellPhoneNo || '',
                    licenseNumber: backendData.agent.licenseNumber || ''
                };
            }

            // Map schedule data if available
            if (backendData.schedule) {
                ratingSchedule.schedule = {
                    id: backendData.schedule.id,
                    scheduleNo: backendData.schedule.scheduleNo || '',
                    subject: backendData.schedule.subject || '',
                    description: backendData.schedule.description || '',
                    scheduleDate: backendData.schedule.scheduleDate ? moment(backendData.schedule.scheduleDate) : null,
                    status: backendData.schedule.status || '',
                    propertyId: backendData.schedule.propertyId || null
                };
            }

            console.log('Mapped frontend rating schedule:', ratingSchedule);
            return ratingSchedule;
        } catch (error) {
            console.error('Error in toFrontend:', error, backendData);
            throw new Error('Failed to map backend rating schedule data to frontend format');
        }
    },

    toFrontendList: (backendList) => {
        try {
            if (!Array.isArray(backendList)) {
                console.warn('Backend rating schedule list is not an array:', backendList);
                return [];
            }

            return backendList
                .map(ratingSchedule => {
                    try {
                        return ratingScheduleMapper.toFrontend(ratingSchedule);
                    } catch (error) {
                        console.error('Error mapping rating schedule in list:', error, ratingSchedule);
                        return null;
                    }
                })
                .filter(ratingSchedule => ratingSchedule !== null);
        } catch (error) {
            console.error('Error in toFrontendList:', error);
            return [];
        }
    },

    toSummaryResponse: (backendData) => {
        try {
            return {
                agentId: parseInt(backendData.agentId) || 0,
                averageRating: parseFloat(backendData.averageRating) || 0,
                totalRatings: parseInt(backendData.totalRatings) || 0,
                ratingDistribution: backendData.ratingDistribution || {
                    1: 0, 2: 0, 3: 0, 4: 0, 5: 0
                },
                recentRatings: ratingScheduleMapper.toFrontendList(backendData.recentRatings || [])
            };
        } catch (error) {
            console.error('Error in toSummaryResponse:', error);
            return {
                agentId: 0,
                averageRating: 0,
                totalRatings: 0,
                ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                recentRatings: []
            };
        }
    }
};

export default ratingScheduleMapper;