import axios from 'axios';
import { schedulePropertiesMapper } from '../mappers/schedulePropertiesMapper';

const API_BASE_URL = '/api';

class SchedulePropertiesService {
    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 30000,
        });

        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                return Promise.reject(this.handleError(error));
            }
        );
    }

    async getAllSchedules() {
        try {
            const response = await this.client.get('/ScheduleProperties');
            return schedulePropertiesMapper.toFrontendList(response.data);
        } catch (error) {
            console.error('Error fetching all schedules:', error);
            throw error;
        }
    }

    async getScheduleById(id) {
        try {
            const response = await this.client.get(`/ScheduleProperties/${id}`);
            return schedulePropertiesMapper.toFrontend(response.data);
        } catch (error) {
            console.error('Error fetching schedule by ID:', error);
            throw error;
        }
    }

    async getScheduleByNo(scheduleNo) {
        try {
            const response = await this.client.get(`/ScheduleProperties/schedule-no/${scheduleNo}`);
            return schedulePropertiesMapper.toFrontend(response.data);
        } catch (error) {
            console.error('Error fetching schedule by number:', error);
            throw error;
        }
    }

    async getSchedulesByAgent(agentId) {
        try {
            const response = await this.client.get(`/ScheduleProperties/agent/${agentId}`);
            return schedulePropertiesMapper.toFrontendList(response.data);
        } catch (error) {
            console.error('Error fetching schedules by agent:', error);
            throw error;
        }
    }

    async getSchedulesByClient(clientId) {
        try {
            const response = await this.client.get(`/ScheduleProperties/client/${clientId}`);
            return schedulePropertiesMapper.toFrontendList(response.data);
        } catch (error) {
            console.error('Error fetching schedules by client:', error);
            throw error;
        }
    }

    async getSchedulesByProperty(propertyId) {
        try {
            const response = await this.client.get(`/ScheduleProperties/property/${propertyId}`);
            return schedulePropertiesMapper.toFrontendList(response.data);
        } catch (error) {
            console.error('Error fetching schedules by property:', error);
            throw error;
        }
    }

    async getSchedulesByStatus(status) {
        try {
            const response = await this.client.get(`/ScheduleProperties/status/${status}`);
            return schedulePropertiesMapper.toFrontendList(response.data);
        } catch (error) {
            console.error('Error fetching schedules by status:', error);
            throw error;
        }
    }

    async getSchedulesByDateRange(startDate, endDate) {
        try {
            const response = await this.client.get('/ScheduleProperties/date-range', {
                params: { startDate, endDate }
            });
            return schedulePropertiesMapper.toFrontendList(response.data);
        } catch (error) {
            console.error('Error fetching schedules by date range:', error);
            throw error;
        }
    }

    async createSchedule(scheduleData) {
        try {
            console.log('🔄 createSchedule called with:', scheduleData);

            // Use the mapper but log the transformation
            const backendData = schedulePropertiesMapper.toCreateRequest(scheduleData);
            console.log('📝 Mapped backend data:', backendData);

            const requestPayload = {
                propertyId: backendData.propertyId,
                agentId: backendData.agentId,
                clientId: backendData.clientId,
                scheduleTime: backendData.scheduleTime,
                scheduleEndTime: backendData.scheduleEndTime,
                notes: backendData.notes,
                status: backendData.status,
                meetingType: backendData.meetingType,
                meetingLocation: backendData.meetingLocation,
                virtualMeetingLink: backendData.virtualMeetingLink
            };

            console.log('📤 Final API Payload:', JSON.stringify(requestPayload, null, 2));

            const response = await this.client.post('/ScheduleProperties', requestPayload);

            console.log('✅ Schedule created successfully:', response.data);
            return schedulePropertiesMapper.toFrontend(response.data);
        } catch (error) {
            console.error('❌ Error creating schedule:', error);

            // Enhanced error logging
            if (error.response) {
                console.error('🔍 Backend response error details:', {
                    status: error.response.status,
                    statusText: error.response.statusText,
                    data: error.response.data,
                    headers: error.response.headers
                });

                // Log the exact error message from backend
                if (error.response.data) {
                    console.error('📝 Backend error message:', error.response.data);

                    // Check for specific validation errors
                    if (error.response.data.errors) {
                        console.error('🔍 Validation errors breakdown:');
                        Object.keys(error.response.data.errors).forEach(key => {
                            console.error(`  - ${key}:`, error.response.data.errors[key]);
                        });
                    }
                }
            }

            if (error.request) {
                console.error('🌐 No response received:', error.request);
            }

            throw error;
        }
    }

    async updateSchedule(schedule) {
        try {
            console.log('🔄 updateSchedule called with:', schedule);

            // Extract the ID from the schedule object
            const id = schedule.id;
            console.log('📤 Using ID for URL:', id);

            // DEBUG: Log the exact data being sent
            console.log('🔍 Data being sent to backend:', JSON.stringify(schedule, null, 2));
            console.log('🔍 Data types:', {
                id: typeof schedule.id,
                scheduleNo: typeof schedule.scheduleNo,
                propertyId: typeof schedule.propertyId,
                agentId: typeof schedule.agentId,
                clientId: typeof schedule.clientId,
                scheduleTime: typeof schedule.scheduleTime,
                scheduleEndTime: typeof schedule.scheduleEndTime,
                status: typeof schedule.status,
                meetingType: typeof schedule.meetingType,
                meetingLocation: typeof schedule.meetingLocation,
                virtualMeetingLink: typeof schedule.virtualMeetingLink,
                notes: typeof schedule.notes
            });

            // Send the entire schedule object to the backend
            const response = await this.client.put(`/ScheduleProperties/${id}`, schedule);
            console.log('✅ Schedule updated successfully:', response.data);
            return schedulePropertiesMapper.toFrontend(response.data);
        } catch (error) {
            console.error('❌ Error updating schedule:', error);

            // Enhanced error logging for update
            if (error.response) {
                console.error('🔍 Update - Backend response error details:', {
                    status: error.response.status,
                    statusText: error.response.statusText,
                    data: error.response.data,
                    headers: error.response.headers
                });

                if (error.response.data) {
                    console.error('📝 Update - Backend error message:', error.response.data);

                    // Log validation errors if present
                    if (error.response.data.errors) {
                        console.error('🔍 Validation errors:');
                        Object.keys(error.response.data.errors).forEach(key => {
                            console.error(`  - ${key}:`, error.response.data.errors[key]);
                        });
                    }
                }
            }

            throw error;
        }
    }

    // FIXED: Added createScheduleWithoutMapper as a proper method
    async createScheduleWithoutMapper(scheduleData) {
        try {
            console.log('🔄 Creating schedule without mapper transformation...');

            const requestPayload = {
                propertyId: scheduleData.propertyId,
                agentId: scheduleData.agentId,
                clientId: scheduleData.clientId,
                scheduleTime: scheduleData.scheduleTime, // Keep local time
                scheduleEndTime: scheduleData.scheduleEndTime, // Keep local time
                notes: scheduleData.notes,
                status: scheduleData.status,
                meetingType: scheduleData.meetingType,
                meetingLocation: scheduleData.meetingLocation,
                virtualMeetingLink: scheduleData.virtualMeetingLink
            };

            console.log('📤 Final API Payload (No Mapper):', JSON.stringify(requestPayload, null, 2));

            const response = await this.client.post('/ScheduleProperties', requestPayload);

            console.log('✅ Schedule created successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Error creating schedule (No Mapper):', error);
            throw error;
        }
    }

    async acceptSchedule(id) {
        try {
            const response = await this.client.patch(`/ScheduleProperties/${id}/accept`);

            // Return success and fetch updated schedule
            if (response.status === 200) {
                // Fetch the updated schedule to get current status
                const updatedSchedule = await this.getScheduleById(id);
                return updatedSchedule;
            }
            return null;
        } catch (error) {
            console.error('Error accepting schedule:', error);
            throw error;
        }
    }

    async cancelSchedule(id, cancellationReason = '') {
        try {
            const requestData = {
                cancellationReason: cancellationReason
            };

            const response = await this.client.patch(`/ScheduleProperties/${id}/cancel`, requestData);

            if (response.status === 200) {
                // Fetch the updated schedule
                const updatedSchedule = await this.getScheduleById(id);
                return updatedSchedule;
            }
            return null;
        } catch (error) {
            console.error('Error cancelling schedule:', error);
            throw error;
        }
    }

    async reschedule(id, newScheduleTime, reason = '') {
        try {
            const requestData = {
                newScheduleTime: newScheduleTime
            };

            const response = await this.client.patch(`/ScheduleProperties/${id}/reschedule`, requestData);

            if (response.status === 200) {
                const updatedSchedule = await this.getScheduleById(id);
                return updatedSchedule;
            }
            return null;
        } catch (error) {
            console.error('Error rescheduling:', error);
            throw error;
        }
    }

    async completeSchedule(id) {
        try {
            const response = await this.client.patch(`/ScheduleProperties/${id}/complete`);

            if (response.status === 200) {
                const updatedSchedule = await this.getScheduleById(id);
                return updatedSchedule;
            }
            return null;
        } catch (error) {
            console.error('Error completing schedule:', error);
            throw error;
        }
    }

    async reopenSchedule(id) {
        try {
            const response = await this.client.patch(`/ScheduleProperties/${id}/reopen`);

            if (response.status === 200) {
                const updatedSchedule = await this.getScheduleById(id);
                return updatedSchedule;
            }
            return null;
        } catch (error) {
            console.error('Error reopening schedule:', error);
            throw error;
        }
    }

    async deleteSchedule(id) {
        try {
            const response = await this.client.delete(`/ScheduleProperties/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting schedule:', error);
            throw error;
        }
    }

    async getAvailableStatusTransitions(id) {
        try {
            const response = await this.client.get(`/ScheduleProperties/status-transitions/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching status transitions:', error);
            throw error;
        }
    }

    async canScheduleBeEdited(id) {
        try {
            const response = await this.client.get(`/ScheduleProperties/can-edit/${id}`);
            return response.data.canEdit;
        } catch (error) {
            console.error('Error checking if schedule can be edited:', error);
            return false;
        }
    }

    async canScheduleBeDeleted(id) {
        try {
            const response = await this.client.get(`/ScheduleProperties/can-delete/${id}`);
            return response.data.canDelete;
        } catch (error) {
            console.error('Error checking if schedule can be deleted:', error);
            return false;
        }
    }

    async checkTimeSlotAvailability(agentId, scheduleTime) {
        try {
            const response = await this.client.get('/ScheduleProperties/check-availability', {
                params: { agentId, scheduleTime }
            });
            return response.data.isAvailable;
        } catch (error) {
            console.error('Error checking time slot availability:', error);
            throw error;
        }
    }

    async updateNotes(id, notes) {
        try {
            const requestData = {
                notes: notes,
                updatedAt: new Date().toISOString()
            };

            const response = await this.client.patch(`/ScheduleProperties/${id}/notes`, requestData);
            return schedulePropertiesMapper.toFrontend(response.data);
        } catch (error) {
            console.error('Error updating notes:', error);
            throw error;
        }
    }

    async quickReschedule(id, date, time) {
        try {
            const scheduleTime = `${date}T${time}:00`;
            return await this.reschedule(id, scheduleTime);
        } catch (error) {
            console.error('Error in quick reschedule:', error);
            throw error;
        }
    }

    async bulkUpdateStatus(scheduleIds, status, reason = '') {
        try {
            const requestData = {
                scheduleIds: scheduleIds,
                status: status,
                reason: reason,
                updatedAt: new Date().toISOString()
            };

            const response = await this.client.patch('/ScheduleProperties/bulk/status', requestData);
            return schedulePropertiesMapper.toFrontendList(response.data);
        } catch (error) {
            console.error('Error in bulk status update:', error);
            throw error;
        }
    }

    async getScheduleHistory(id) {
        try {
            const response = await this.client.get(`/ScheduleProperties/${id}/history`);
            return response.data;
        } catch (error) {
            console.error('Error fetching schedule history:', error);
            throw error;
        }
    }

    async debugBackendValidation(testData) {
        try {
            const response = await this.client.post('/ScheduleProperties/debug/test-creation', testData);
            return response.data;
        } catch (error) {
            console.error('Error in debug validation:', error);
            throw this.handleError(error);
        }
    }

    // Helper method to get all available actions for a schedule
    async getAvailableActions(schedule) {
        const actions = [];
        const status = schedule.status;

        switch (status) {
            case 'Pending':
                actions.push('accept', 'cancel', 'edit', 'delete');
                break;
            case 'Scheduled':
                actions.push('complete', 'cancel', 'reschedule', 'edit');
                break;
            case 'Rescheduled':
                actions.push('complete', 'cancel', 'edit');
                break;
            case 'Completed':
                actions.push('view'); // Read-only
                break;
            case 'Cancelled':
                actions.push('reopen', 'view');
                break;
            default:
                actions.push('view');
        }

        return actions;
    }

    // Helper method to check if schedule can be edited
    async canEdit(schedule) {
        return schedule.status !== 'Completed' && schedule.status !== 'Cancelled';
    }

    // Helper method to check if schedule can be deleted
    async canDelete(schedule) {
        return schedule.status !== 'Completed' && schedule.status !== 'Cancelled';
    }

    handleError(error) {
        console.error('API Error:', error);

        if (error.response) {
            const serverError = error.response.data;
            const errorObj = {
                message: serverError.message || `Server error: ${error.response.status}`,
                details: serverError.errors || serverError.details || serverError,
                code: serverError.code || 'SERVER_ERROR',
                status: error.response.status,
                responseData: serverError
            };

            if (error.response.status === 400) {
                errorObj.message = serverError.message || 'Bad request - please check your data';
                if (serverError.errors) {
                    errorObj.validationErrors = serverError.errors;
                }
            } else if (error.response.status === 401) {
                errorObj.message = 'Authentication required';
            } else if (error.response.status === 403) {
                errorObj.message = 'Access forbidden';
            } else if (error.response.status === 404) {
                errorObj.message = 'Resource not found';
            } else if (error.response.status === 409) {
                errorObj.message = 'Conflict - resource already exists';
            } else if (error.response.status === 422) {
                errorObj.message = 'Validation failed';
                errorObj.validationErrors = serverError.errors;
            } else if (error.response.status === 500) {
                errorObj.message = 'Internal server error';
            }

            return errorObj;
        } else if (error.request) {
            return {
                message: 'Network error: Unable to connect to server. Please check your internet connection and try again.',
                code: 'NETWORK_ERROR',
                details: 'The server may be down or there may be network issues.'
            };
        } else {
            return {
                message: error.message || 'An unexpected error occurred',
                code: 'UNKNOWN_ERROR',
                details: error.stack
            };
        }
    }
}

export default SchedulePropertiesService;