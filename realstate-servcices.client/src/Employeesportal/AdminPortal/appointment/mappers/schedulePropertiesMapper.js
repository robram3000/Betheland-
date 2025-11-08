export const schedulePropertiesMapper = {
    toFrontend: (backendData) => {
        try {
            if (!backendData) return null;

            // Extract client information with multiple fallbacks
            const clientName = backendData.clientName ||
                (backendData.client ?
                    `${backendData.client.firstName || ''} ${backendData.client.lastName || ''}`.trim() :
                    'Unknown Client');

            const clientPhone = backendData.clientPhone ||
                backendData.client?.phone ||
                'N/A';

            const clientEmail = backendData.clientEmail ||
                backendData.client?.email ||
                '';

            // Extract property information with multiple fallbacks
            const propertyTitle = backendData.propertyTitle ||
                backendData.property?.title ||
                'Unknown Property';

            const propertyAddress = backendData.propertyAddress ||
                backendData.property?.address ||
                'No address';

            // Extract agent information
            const agentName = backendData.agentName ||
                (backendData.agent ?
                    `${backendData.agent.firstName || ''} ${backendData.agent.lastName || ''}`.trim() :
                    'Unknown Agent');

            return {
                id: backendData.id || 0,
                scheduleNo: backendData.scheduleNo || '',
                agentId: backendData.agentId || 0,
                clientId: backendData.clientId || 0,
                propertyId: backendData.propertyId || 0,
                scheduleTime: backendData.scheduleTime ? new Date(backendData.scheduleTime) : null,
                scheduleEndTime: backendData.scheduleEndTime ? new Date(backendData.scheduleEndTime) : null,
                status: backendData.status || 'Scheduled',
                notes: backendData.notes || '',
                meetingType: backendData.meetingType || 'InPerson',
                meetingLocation: backendData.meetingLocation || '',
                virtualMeetingLink: backendData.virtualMeetingLink || '',
                createdAt: backendData.createdAt ? new Date(backendData.createdAt) : new Date(),
                updatedAt: backendData.updatedAt ? new Date(backendData.updatedAt) : null,

                client: {
                    name: clientName,
                    phone: clientPhone,
                    email: clientEmail,
                    ...backendData.client
                },

                // Enhanced property object
                property: {
                    title: propertyTitle,
                    address: propertyAddress,
                    ...backendData.property
                },

                // Enhanced agent object
                agent: {
                    name: agentName,
                    ...backendData.agent
                },

                // Direct fields for easy access
                clientName: clientName,
                clientPhone: clientPhone,
                propertyTitle: propertyTitle,
                propertyAddress: propertyAddress,
                agentName: agentName
            };
        } catch (error) {
            console.error('Error mapping schedule to frontend:', error);
            console.error('Backend data that caused error:', backendData);
            throw new Error('Failed to map schedule data');
        }
    },

    toBackend: (frontendData) => {
        try {
            // Ensure scheduleTime is properly converted
            const scheduleTime = frontendData.scheduleTime
                ? (frontendData.scheduleTime instanceof Date
                    ? frontendData.scheduleTime.toISOString()
                    : new Date(frontendData.scheduleTime).toISOString())
                : null;

            // Calculate or use provided end time
            let scheduleEndTime = frontendData.scheduleEndTime;
            if (!scheduleEndTime && frontendData.scheduleTime) {
                const baseTime = frontendData.scheduleTime instanceof Date
                    ? frontendData.scheduleTime
                    : new Date(frontendData.scheduleTime);
                scheduleEndTime = new Date(baseTime.getTime() + 60 * 60 * 1000);
            }

            scheduleEndTime = scheduleEndTime
                ? (scheduleEndTime instanceof Date
                    ? scheduleEndTime.toISOString()
                    : new Date(scheduleEndTime).toISOString())
                : null;

            return {
                id: frontendData.id || 0,
                scheduleNo: frontendData.scheduleNo || '',
                agentId: frontendData.agentId || 0,
                clientId: frontendData.clientId || 0,
                propertyId: frontendData.propertyId || 0,
                scheduleTime: scheduleTime,
                scheduleEndTime: scheduleEndTime,
                status: frontendData.status || 'Scheduled',
                notes: frontendData.notes || '',
                meetingType: frontendData.meetingType || 'InPerson',
                meetingLocation: frontendData.meetingLocation || '',
                virtualMeetingLink: frontendData.virtualMeetingLink || ''
            };
        } catch (error) {
            console.error('Error mapping schedule to backend:', error);
            throw new Error('Failed to map schedule data for backend');
        }
    },

    toFrontendList: (backendList) => {
        try {
            if (!Array.isArray(backendList)) {
                console.warn('Expected array but got:', typeof backendList, backendList);
                return [];
            }

            const mappedList = backendList
                .map(item => {
                    try {
                        return schedulePropertiesMapper.toFrontend(item);
                    } catch (itemError) {
                        console.error('Error mapping individual item:', itemError, item);
                        return null;
                    }
                })
                .filter(item => item !== null);

            console.log('Mapped frontend list:', mappedList);
            return mappedList;

        } catch (error) {
            console.error('Error mapping schedule list:', error);
            return [];
        }
    },

    toCreateRequest: (formData) => {
        try {
            console.log('toCreateRequest formData:', formData);

            // Handle scheduleTime - ensure it's properly formatted
            let scheduleTime;
            if (formData.scheduleTime) {
                if (formData.scheduleTime instanceof Date) {
                    scheduleTime = formData.scheduleTime.toISOString();
                } else if (typeof formData.scheduleTime === 'string') {
                    scheduleTime = new Date(formData.scheduleTime).toISOString();
                }
            }

            // Calculate end time (1 hour after schedule time)
            let scheduleEndTime;
            if (scheduleTime) {
                const baseTime = new Date(scheduleTime);
                scheduleEndTime = new Date(baseTime.getTime() + 60 * 60 * 1000).toISOString();
            }

            // Create complete request data with all required fields
            const requestData = {
                propertyId: parseInt(formData.propertyId) || 0,
                agentId: parseInt(formData.agentId) || 0,
                clientId: parseInt(formData.clientId) || 0,
                scheduleTime: scheduleTime,
                scheduleEndTime: scheduleEndTime,
                notes: formData.notes || '',
                status: formData.status || 'Scheduled',
                meetingType: formData.meetingType || 'InPerson',
                meetingLocation: formData.meetingLocation || '',
                virtualMeetingLink: formData.virtualMeetingLink || '',
                scheduleNo: formData.scheduleNo || '', // Will be generated by backend
                createdAt: new Date().toISOString() // Will be set by backend
            };

            // Validate required fields
            if (!requestData.propertyId || !requestData.agentId || !requestData.clientId || !requestData.scheduleTime) {
                throw new Error('Missing required fields: propertyId, agentId, clientId, or scheduleTime');
            }

            console.log('Mapped create request:', requestData);
            return requestData;

        } catch (error) {
            console.error('Error mapping schedule create request:', error);
            console.error('Error details:', {
                formData: formData,
                propertyId: formData?.propertyId,
                agentId: formData?.agentId,
                clientId: formData?.clientId,
                scheduleTime: formData?.scheduleTime
            });
            throw new Error('Failed to map schedule data for creation: ' + error.message);
        }
    },

    toUpdateRequest: (formData) => {
        try {
            // Handle scheduleTime conversion
            const scheduleTime = formData.scheduleTime
                ? (formData.scheduleTime instanceof Date
                    ? formData.scheduleTime.toISOString()
                    : new Date(formData.scheduleTime).toISOString())
                : null;

            // Handle scheduleEndTime conversion
            const scheduleEndTime = formData.scheduleEndTime
                ? (formData.scheduleEndTime instanceof Date
                    ? formData.scheduleEndTime.toISOString()
                    : new Date(formData.scheduleEndTime).toISOString())
                : null;

            return {
                id: parseInt(formData.id) || 0,
                propertyId: parseInt(formData.propertyId) || 0,
                agentId: parseInt(formData.agentId) || 0,
                clientId: parseInt(formData.clientId) || 0,
                scheduleTime: scheduleTime,
                scheduleEndTime: scheduleEndTime,
                status: formData.status || 'Scheduled',
                notes: formData.notes || '',
                meetingType: formData.meetingType || 'InPerson',
                meetingLocation: formData.meetingLocation || '',
                virtualMeetingLink: formData.virtualMeetingLink || ''
            };
        } catch (error) {
            console.error('Error mapping schedule update request:', error);
            throw new Error('Failed to map schedule data for update');
        }
    },

    createScheduleRequest: (agentId, clientId, propertyId, scheduleTime, notes = '', meetingLocation = '') => {
        // Ensure scheduleTime is a Date object
        const scheduleTimeDate = scheduleTime instanceof Date
            ? scheduleTime
            : new Date(scheduleTime);

        const scheduleEndTime = new Date(scheduleTimeDate.getTime() + 60 * 60 * 1000);

        return {
            propertyId: parseInt(propertyId),
            agentId: parseInt(agentId),
            clientId: parseInt(clientId),
            scheduleTime: scheduleTimeDate.toISOString(),
            scheduleEndTime: scheduleEndTime.toISOString(),
            notes: notes,
            status: "Scheduled",
            meetingType: "InPerson",
            meetingLocation: meetingLocation,
            virtualMeetingLink: ""
        };
    }
};

export default schedulePropertiesMapper;