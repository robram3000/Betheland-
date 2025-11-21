import moment from 'moment';

export const ratingMapper = {
    toCreateRequest: (formData) => {
        try {
            console.log('Raw formData for rating creation:', formData);

            const createRequest = {
                raterId: parseInt(formData.raterId) || 0,
                ratedId: parseInt(formData.ratedId) || 0,
                stars: parseInt(formData.stars) || 1,
                comment: formData.comment || '',
                ratingType: formData.ratingType || 'agent',
                propertyId: formData.propertyId || null,
                chatId: formData.chatId ? parseInt(formData.chatId) : null,
                agentId: formData.agentId ? parseInt(formData.agentId) : null,
                clientId: formData.clientId ? parseInt(formData.clientId) : null
            };

            console.log('Mapped rating create request:', createRequest);
            return createRequest;
        } catch (error) {
            console.error('Error in toCreateRequest:', error, formData);
            throw new Error('Failed to map rating data for creation');
        }
    },

    toUpdateRequest: (formData) => {
        try {
            console.log('Raw formData for rating update:', formData);

            const updateRequest = {
                stars: parseInt(formData.stars) || 1,
                comment: formData.comment || ''
            };

            console.log('Mapped rating update request:', updateRequest);
            return updateRequest;
        } catch (error) {
            console.error('Error in toUpdateRequest:', error, formData);
            throw new Error('Failed to map rating data for update');
        }
    },

    toFrontend: (backendData) => {
        try {
            if (!backendData) {
                console.warn('No backend data provided to toFrontend');
                return null;
            }

            console.log('Raw backend rating data:', backendData);

            const rating = {
                id: backendData.id || 0,
                ratingNo: backendData.ratingNo || '',
                raterId: backendData.raterId || 0,
                ratedId: backendData.ratedId || 0,
                stars: parseInt(backendData.stars) || 1,
                comment: backendData.comment || '',
                ratingType: backendData.ratingType || 'agent',
                propertyId: backendData.propertyId || null,
                chatId: backendData.chatId || null,
                agentId: backendData.agentId || null,
                clientId: backendData.clientId || null,
                isVisible: backendData.isVisible !== undefined ? backendData.isVisible : true,
                createdAt: backendData.createdAt ? moment(backendData.createdAt) : null,
                updatedAt: backendData.updatedAt ? moment(backendData.updatedAt) : null,
                rater: null,
                rated: null,
                agent: null,
                client: null,
                chat: null
            };

            // Map rater data if available
            if (backendData.rater) {
                rating.rater = {
                    id: backendData.rater.id,
                    firstName: backendData.rater.firstName || '',
                    lastName: backendData.rater.lastName || '',
                    email: backendData.rater.email || '',
                    profilePictureUrl: backendData.rater.profilePictureUrl || '',
                    cellPhoneNo: backendData.rater.cellPhoneNo || ''
                };
            }

            // Map rated data if available
            if (backendData.rated) {
                rating.rated = {
                    id: backendData.rated.id,
                    firstName: backendData.rated.firstName || '',
                    lastName: backendData.rated.lastName || '',
                    email: backendData.rated.email || '',
                    profilePictureUrl: backendData.rated.profilePictureUrl || '',
                    cellPhoneNo: backendData.rated.cellPhoneNo || ''
                };
            }

            // Map agent data if available
            if (backendData.agent) {
                rating.agent = {
                    id: backendData.agent.id,
                    firstName: backendData.agent.firstName || '',
                    lastName: backendData.agent.lastName || '',
                    email: backendData.agent.email || '',
                    profilePictureUrl: backendData.agent.profilePictureUrl || '',
                    cellPhoneNo: backendData.agent.cellPhoneNo || '',
                    licenseNumber: backendData.agent.licenseNumber || ''
                };
            }

            // Map client data if available
            if (backendData.client) {
                rating.client = {
                    id: backendData.client.id,
                    firstName: backendData.client.firstName || '',
                    lastName: backendData.client.lastName || '',
                    email: backendData.client.email || '',
                    profilePictureUrl: backendData.client.profilePictureUrl || '',
                    cellPhoneNo: backendData.client.cellPhoneNo || ''
                };
            }

            // Map chat data if available
            if (backendData.chat) {
                rating.chat = {
                    id: backendData.chat.id,
                    chatNo: backendData.chat.chatNo || '',
                    subject: backendData.chat.subject || '',
                    createdAt: backendData.chat.createdAt ? moment(backendData.chat.createdAt) : null
                };
            }

            console.log('Mapped frontend rating:', rating);
            return rating;
        } catch (error) {
            console.error('Error in toFrontend:', error, backendData);
            throw new Error('Failed to map backend rating data to frontend format');
        }
    },

    toFrontendList: (backendList) => {
        try {
            if (!Array.isArray(backendList)) {
                console.warn('Backend rating list is not an array:', backendList);
                return [];
            }

            return backendList
                .map(rating => {
                    try {
                        return ratingMapper.toFrontend(rating);
                    } catch (error) {
                        console.error('Error mapping rating in list:', error, rating);
                        return null;
                    }
                })
                .filter(rating => rating !== null);
        } catch (error) {
            console.error('Error in toFrontendList:', error);
            return [];
        }
    },

    toFormData: (ratingData) => {
        try {
            const formData = new FormData();

            const createRequest = {
                raterId: parseInt(ratingData.raterId) || 0,
                ratedId: parseInt(ratingData.ratedId) || 0,
                stars: parseInt(ratingData.stars) || 1,
                comment: ratingData.comment || '',
                ratingType: ratingData.ratingType || 'agent',
                propertyId: ratingData.propertyId || null,
                chatId: ratingData.chatId ? parseInt(ratingData.chatId) : null,
                agentId: ratingData.agentId ? parseInt(ratingData.agentId) : null,
                clientId: ratingData.clientId ? parseInt(ratingData.clientId) : null
            };

            formData.append('ratingData', JSON.stringify(createRequest));
            console.log('FormData created for rating:', createRequest);
            return formData;
        } catch (error) {
            console.error('Error in toFormData:', error);
            throw new Error('Failed to create form data for rating');
        }
    },

    toUpdateFormData: (ratingData) => {
        try {
            const formData = new FormData();

            const updateRequest = {
                stars: parseInt(ratingData.stars) || 1,
                comment: ratingData.comment || ''
            };

            formData.append('ratingData', JSON.stringify(updateRequest));
            console.log('Update FormData created for rating:', updateRequest);
            return formData;
        } catch (error) {
            console.error('Error in toUpdateFormData:', error);
            throw new Error('Failed to create update form data for rating');
        }
    },

    toSearchRequest: (searchCriteria) => {
        try {
            console.log('Mapping rating search criteria:', searchCriteria);

            if (typeof searchCriteria === 'string') {
                return { q: searchCriteria };
            }

            if (typeof searchCriteria === 'object') {
                return searchCriteria;
            }

            return { q: searchCriteria || '' };
        } catch (error) {
            console.error('Error in toSearchRequest:', error);
            return { q: '' };
        }
    },

    toAverageRatingResponse: (backendData) => {
        try {
            return {
                averageRating: parseFloat(backendData.averageRating) || 0,
                totalRatings: parseInt(backendData.totalRatings) || 0,
                ratingCounts: backendData.ratingCounts || {
                    1: 0, 2: 0, 3: 0, 4: 0, 5: 0
                },
                ratedId: parseInt(backendData.ratedId) || 0
            };
        } catch (error) {
            console.error('Error in toAverageRatingResponse:', error);
            return {
                averageRating: 0,
                totalRatings: 0,
                ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                ratedId: 0
            };
        }
    }
};

export default ratingMapper;