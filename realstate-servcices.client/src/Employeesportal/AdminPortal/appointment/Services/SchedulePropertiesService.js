
import SchedulingMapper from './mapper.js';
import { ErrorHandler, ErrorFactory } from './errorHandler.js';

class SchedulingServices {
    constructor(apiClient, options = {}) {
        this.apiClient = apiClient;
        this.baseUrl = '/api';
        this.options = {
            maxRetries: options.maxRetries || 3,
            timeout: options.timeout || 30000,
            ...options
        };
    }

    // Enhanced request method with full error handling
    async makeRequest(method, url, data = null, options = {}) {
        const context = {
            method,
            url,
            operation: options.operation || `${method} ${url}`,
            timestamp: new Date().toISOString(),
            ...options.context
        };

        try {
            const response = await ErrorHandler.withRetry(
                async () => {
                    const config = {
                        timeout: this.options.timeout,
                        headers: {
                            'Content-Type': 'application/json',
                            ...options.headers
                        },
                        params: options.params,
                        ...options.config
                    };

                    let response;
                    switch (method.toLowerCase()) {
                        case 'get':
                            response = await this.apiClient.get(url, config);
                            break;
                        case 'post':
                            response = await this.apiClient.post(url, data, config);
                            break;
                        case 'put':
                            response = await this.apiClient.put(url, data, config);
                            break;
                        case 'patch':
                            response = await this.apiClient.patch(url, data, config);
                            break;
                        case 'delete':
                            response = await this.apiClient.delete(url, config);
                            break;
                        default:
                            throw ErrorFactory.internalServerError(`Unsupported method: ${method}`);
                    }

                    if (response.status >= 400) {
                        const errorMessage = response.data?.message ||
                            response.data?.error?.message ||
                            `HTTP ${response.status} Error`;
                        throw ErrorFactory.internalServerError(errorMessage);
                    }

                    return response;
                },
                this.options.maxRetries,
                1000
            );

            return {
                success: true,
                data: response.data,
                statusCode: response.status,
                headers: response.headers
            };
        } catch (error) {
            return ErrorHandler.handle(error, context);
        }
    }

    // ============ AGENT AVAILABILITY SERVICES ============
    async getAllAvailabilities() {
        const result = await this.makeRequest('get', `${this.baseUrl}/AgentAvailability`, null, {
            operation: 'get_all_availabilities'
        });

        if (result.success) {
            result.data = SchedulingMapper.mapArray(result.data, SchedulingMapper.toAgentAvailabilityDto);
        }
        return result;
    }

    async getAvailabilityById(id) {
        ErrorHandler.validateRequiredFields({ id }, ['id']);

        const result = await this.makeRequest('get', `${this.baseUrl}/AgentAvailability/${id}`, null, {
            operation: 'get_availability_by_id',
            context: { availabilityId: id }
        });

        if (result.success) {
            result.data = SchedulingMapper.toAgentAvailabilityDto(result.data);
        }
        return result;
    }

    async getAvailabilitiesByAgent(agentId) {
        ErrorHandler.validateRequiredFields({ agentId }, ['agentId']);

        const result = await this.makeRequest('get', `${this.baseUrl}/AgentAvailability/agent/${agentId}`, null, {
            operation: 'get_availabilities_by_agent',
            context: { agentId }
        });

        if (result.success) {
            result.data = SchedulingMapper.mapArray(result.data, SchedulingMapper.toAgentAvailabilityDto);
        }
        return result;
    }

    async getAvailabilitiesByAgentAndDay(agentId, dayOfWeek) {
        ErrorHandler.validateRequiredFields({ agentId, dayOfWeek }, ['agentId', 'dayOfWeek']);

        const result = await this.makeRequest(
            'get',
            `${this.baseUrl}/AgentAvailability/agent/${agentId}/day/${dayOfWeek}`,
            null,
            {
                operation: 'get_availabilities_by_agent_and_day',
                context: { agentId, dayOfWeek }
            }
        );

        if (result.success) {
            result.data = SchedulingMapper.mapArray(result.data, SchedulingMapper.toAgentAvailabilityDto);
        }
        return result;
    }

    async createAvailability(availabilityData) {
        try {
            ErrorHandler.validateRequiredFields(availabilityData, [
                'agentId', 'dayOfWeek', 'startTime', 'endTime'
            ]);

            const entity = SchedulingMapper.toCreateAgentAvailabilityEntity(availabilityData);
            const result = await this.makeRequest('post', `${this.baseUrl}/AgentAvailability`, entity, {
                operation: 'create_availability',
                context: { agentId: availabilityData.agentId }
            });

            if (result.success) {
                result.data = SchedulingMapper.toAgentAvailabilityDto(result.data);
            }
            return result;
        } catch (error) {
            return ErrorHandler.handle(error, { operation: 'create_availability' });
        }
    }

    async updateAvailability(id, availabilityData) {
        try {
            ErrorHandler.validateRequiredFields({ id }, ['id']);
            ErrorHandler.validateRequiredFields(availabilityData, [
                'agentId', 'dayOfWeek', 'startTime', 'endTime'
            ]);

            const entity = SchedulingMapper.toAgentAvailabilityEntity({ ...availabilityData, id });
            const result = await this.makeRequest('put', `${this.baseUrl}/AgentAvailability/${id}`, entity, {
                operation: 'update_availability',
                context: { availabilityId: id, agentId: availabilityData.agentId }
            });

            if (result.success) {
                result.data = SchedulingMapper.toAgentAvailabilityDto(result.data);
            }
            return result;
        } catch (error) {
            return ErrorHandler.handle(error, { operation: 'update_availability' });
        }
    }

    async deleteAvailability(id) {
        ErrorHandler.validateRequiredFields({ id }, ['id']);

        return await this.makeRequest('delete', `${this.baseUrl}/AgentAvailability/${id}`, null, {
            operation: 'delete_availability',
            context: { availabilityId: id }
        });
    }

    async setAgentAvailability(agentId, availabilities) {
        try {
            ErrorHandler.validateRequiredFields({ agentId }, ['agentId']);

            if (!Array.isArray(availabilities)) {
                throw ErrorFactory.validationError('Availabilities must be an array');
            }

            // Validate each availability
            for (const availability of availabilities) {
                ErrorHandler.validateRequiredFields(availability, [
                    'dayOfWeek', 'startTime', 'endTime'
                ]);
            }

            const entities = availabilities.map(avail =>
                SchedulingMapper.toCreateAgentAvailabilityEntity({ ...avail, agentId })
            );

            return await this.makeRequest(
                'post',
                `${this.baseUrl}/AgentAvailability/agent/${agentId}/set-availability`,
                entities,
                {
                    operation: 'set_agent_availability',
                    context: { agentId, availabilityCount: availabilities.length }
                }
            );
        } catch (error) {
            return ErrorHandler.handle(error, { operation: 'set_agent_availability' });
        }
    }

    async checkAgentAvailability(agentId, dateTime) {
        ErrorHandler.validateRequiredFields({ agentId, dateTime }, ['agentId', 'dateTime']);

        return await this.makeRequest(
            'get',
            `${this.baseUrl}/AgentAvailability/check-availability`,
            null,
            {
                operation: 'check_agent_availability',
                params: { agentId, dateTime: dateTime.toISOString() },
                context: { agentId, dateTime }
            }
        );
    }

    async getAvailableDays(agentId) {
        ErrorHandler.validateRequiredFields({ agentId }, ['agentId']);

        return await this.makeRequest('get', `${this.baseUrl}/AgentAvailability/agent/${agentId}/available-days`, null, {
            operation: 'get_available_days',
            context: { agentId }
        });
    }

    // ============ AGENT SCHEDULE CONFIG SERVICES ============
    async getAllConfigs() {
        const result = await this.makeRequest('get', `${this.baseUrl}/AgentScheduleConfig`, null, {
            operation: 'get_all_configs'
        });

        if (result.success) {
            result.data = SchedulingMapper.mapArray(result.data, SchedulingMapper.toAgentScheduleConfigDto);
        }
        return result;
    }

    async getConfigById(id) {
        ErrorHandler.validateRequiredFields({ id }, ['id']);

        const result = await this.makeRequest('get', `${this.baseUrl}/AgentScheduleConfig/${id}`, null, {
            operation: 'get_config_by_id',
            context: { configId: id }
        });

        if (result.success) {
            result.data = SchedulingMapper.toAgentScheduleConfigDto(result.data);
        }
        return result;
    }

    async getConfigByAgent(agentId) {
        ErrorHandler.validateRequiredFields({ agentId }, ['agentId']);

        const result = await this.makeRequest('get', `${this.baseUrl}/AgentScheduleConfig/agent/${agentId}`, null, {
            operation: 'get_config_by_agent',
            context: { agentId }
        });

        if (result.success) {
            result.data = SchedulingMapper.toAgentScheduleConfigDto(result.data);
        }
        return result;
    }

    async getOrCreateDefaultConfig(agentId) {
        ErrorHandler.validateRequiredFields({ agentId }, ['agentId']);

        const result = await this.makeRequest(
            'get',
            `${this.baseUrl}/AgentScheduleConfig/agent/${agentId}/default`,
            null,
            {
                operation: 'get_or_create_default_config',
                context: { agentId }
            }
        );

        if (result.success) {
            result.data = SchedulingMapper.toAgentScheduleConfigDto(result.data);
        }
        return result;
    }

    async createConfig(configData) {
        try {
            ErrorHandler.validateRequiredFields(configData, ['agentId']);

            const entity = SchedulingMapper.toAgentScheduleConfigEntity(configData);
            const result = await this.makeRequest('post', `${this.baseUrl}/AgentScheduleConfig`, entity, {
                operation: 'create_config',
                context: { agentId: configData.agentId }
            });

            if (result.success) {
                result.data = SchedulingMapper.toAgentScheduleConfigDto(result.data);
            }
            return result;
        } catch (error) {
            return ErrorHandler.handle(error, { operation: 'create_config' });
        }
    }

    async updateConfig(id, configData) {
        try {
            ErrorHandler.validateRequiredFields({ id }, ['id']);

            const entity = SchedulingMapper.toAgentScheduleConfigEntity({ ...configData, id });
            const result = await this.makeRequest('put', `${this.baseUrl}/AgentScheduleConfig/${id}`, entity, {
                operation: 'update_config',
                context: { configId: id, agentId: configData.agentId }
            });

            if (result.success) {
                result.data = SchedulingMapper.toAgentScheduleConfigDto(result.data);
            }
            return result;
        } catch (error) {
            return ErrorHandler.handle(error, { operation: 'update_config' });
        }
    }

    async deleteConfig(id) {
        ErrorHandler.validateRequiredFields({ id }, ['id']);

        return await this.makeRequest('delete', `${this.baseUrl}/AgentScheduleConfig/${id}`, null, {
            operation: 'delete_config',
            context: { configId: id }
        });
    }

    async validateScheduleTime(agentId, scheduleTime) {
        ErrorHandler.validateRequiredFields({ agentId, scheduleTime }, ['agentId', 'scheduleTime']);

        return await this.makeRequest(
            'get',
            `${this.baseUrl}/AgentScheduleConfig/validate-schedule-time`,
            null,
            {
                operation: 'validate_schedule_time',
                params: { agentId, scheduleTime: scheduleTime.toISOString() },
                context: { agentId, scheduleTime }
            }
        );
    }

    async getAvailableTimeSlots(agentId, date) {
        ErrorHandler.validateRequiredFields({ agentId, date }, ['agentId', 'date']);

        const result = await this.makeRequest(
            'get',
            `${this.baseUrl}/AgentScheduleConfig/agent/${agentId}/available-slots`,
            null,
            {
                operation: 'get_available_time_slots',
                params: { date: date.toISOString().split('T')[0] },
                context: { agentId, date }
            }
        );

        if (result.success && Array.isArray(result.data)) {
            result.data = result.data.map(slot => SchedulingMapper.timeSpanToString(slot));
        }
        return result;
    }

    // ============ AGENT TIME OFF SERVICES ============
    async getAllTimeOffs() {
        const result = await this.makeRequest('get', `${this.baseUrl}/AgentTimeOff`, null, {
            operation: 'get_all_time_offs'
        });

        if (result.success) {
            result.data = SchedulingMapper.mapArray(result.data, SchedulingMapper.toAgentTimeOffDto);
        }
        return result;
    }

    async getTimeOffById(id) {
        ErrorHandler.validateRequiredFields({ id }, ['id']);

        const result = await this.makeRequest('get', `${this.baseUrl}/AgentTimeOff/${id}`, null, {
            operation: 'get_time_off_by_id',
            context: { timeOffId: id }
        });

        if (result.success) {
            result.data = SchedulingMapper.toAgentTimeOffDto(result.data);
        }
        return result;
    }

    async getTimeOffsByAgent(agentId) {
        ErrorHandler.validateRequiredFields({ agentId }, ['agentId']);

        const result = await this.makeRequest('get', `${this.baseUrl}/AgentTimeOff/agent/${agentId}`, null, {
            operation: 'get_time_offs_by_agent',
            context: { agentId }
        });

        if (result.success) {
            result.data = SchedulingMapper.mapArray(result.data, SchedulingMapper.toAgentTimeOffDto);
        }
        return result;
    }

    async getUpcomingTimeOffs(daysAhead = 30) {
        const result = await this.makeRequest('get', `${this.baseUrl}/AgentTimeOff/upcoming`, null, {
            operation: 'get_upcoming_time_offs',
            params: { daysAhead },
            context: { daysAhead }
        });

        if (result.success) {
            result.data = SchedulingMapper.mapArray(result.data, SchedulingMapper.toAgentTimeOffDto);
        }
        return result;
    }

    async getTimeOffsByDateRange(agentId, startDate, endDate) {
        ErrorHandler.validateRequiredFields({ agentId, startDate, endDate }, ['agentId', 'startDate', 'endDate']);
        ErrorHandler.validateDateRange(startDate, endDate);

        const result = await this.makeRequest(
            'get',
            `${this.baseUrl}/AgentTimeOff/agent/${agentId}/date-range`,
            null,
            {
                operation: 'get_time_offs_by_date_range',
                params: {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString()
                },
                context: { agentId, startDate, endDate }
            }
        );

        if (result.success) {
            result.data = SchedulingMapper.mapArray(result.data, SchedulingMapper.toAgentTimeOffDto);
        }
        return result;
    }

    async requestTimeOff(timeOffData) {
        try {
            ErrorHandler.validateRequiredFields(timeOffData, [
                'agentId', 'startDate', 'endDate'
            ]);

            ErrorHandler.validateDateRange(timeOffData.startDate, timeOffData.endDate);

            // Check for conflicts before requesting
            const conflictCheck = await this.checkTimeOffConflict(
                timeOffData.agentId,
                timeOffData.startDate,
                timeOffData.endDate
            );

            if (conflictCheck.success && conflictCheck.data.hasConflict) {
                throw ErrorFactory.timeOffConflict(
                    timeOffData.agentId,
                    timeOffData.startDate,
                    timeOffData.endDate
                );
            }

            const entity = SchedulingMapper.toCreateAgentTimeOffEntity(timeOffData);
            const result = await this.makeRequest('post', `${this.baseUrl}/AgentTimeOff`, entity, {
                operation: 'request_time_off',
                context: { agentId: timeOffData.agentId }
            });

            if (result.success) {
                result.data = SchedulingMapper.toAgentTimeOffDto(result.data);
            }
            return result;
        } catch (error) {
            return ErrorHandler.handle(error, { operation: 'request_time_off' });
        }
    }

    async updateTimeOff(id, timeOffData) {
        try {
            ErrorHandler.validateRequiredFields({ id }, ['id']);
            ErrorHandler.validateRequiredFields(timeOffData, [
                'agentId', 'startDate', 'endDate'
            ]);

            ErrorHandler.validateDateRange(timeOffData.startDate, timeOffData.endDate);

            const entity = SchedulingMapper.toAgentTimeOffEntity({ ...timeOffData, id });
            const result = await this.makeRequest('put', `${this.baseUrl}/AgentTimeOff/${id}`, entity, {
                operation: 'update_time_off',
                context: { timeOffId: id, agentId: timeOffData.agentId }
            });

            if (result.success) {
                result.data = SchedulingMapper.toAgentTimeOffDto(result.data);
            }
            return result;
        } catch (error) {
            return ErrorHandler.handle(error, { operation: 'update_time_off' });
        }
    }

    async approveTimeOff(id) {
        ErrorHandler.validateRequiredFields({ id }, ['id']);

        return await this.makeRequest('patch', `${this.baseUrl}/AgentTimeOff/${id}/approve`, null, {
            operation: 'approve_time_off',
            context: { timeOffId: id }
        });
    }

    async rejectTimeOff(id) {
        ErrorHandler.validateRequiredFields({ id }, ['id']);

        return await this.makeRequest('patch', `${this.baseUrl}/AgentTimeOff/${id}/reject`, null, {
            operation: 'reject_time_off',
            context: { timeOffId: id }
        });
    }

    async deleteTimeOff(id) {
        ErrorHandler.validateRequiredFields({ id }, ['id']);

        return await this.makeRequest('delete', `${this.baseUrl}/AgentTimeOff/${id}`, null, {
            operation: 'delete_time_off',
            context: { timeOffId: id }
        });
    }

    async checkTimeOffAvailability(agentId, date) {
        ErrorHandler.validateRequiredFields({ agentId, date }, ['agentId', 'date']);

        return await this.makeRequest(
            'get',
            `${this.baseUrl}/AgentTimeOff/check-availability`,
            null,
            {
                operation: 'check_time_off_availability',
                params: { agentId, date: date.toISOString() },
                context: { agentId, date }
            }
        );
    }

    async checkTimeOffConflict(agentId, startDate, endDate) {
        ErrorHandler.validateRequiredFields({ agentId, startDate, endDate }, ['agentId', 'startDate', 'endDate']);
        ErrorHandler.validateDateRange(startDate, endDate);

        return await this.makeRequest(
            'get',
            `${this.baseUrl}/AgentTimeOff/check-conflict`,
            null,
            {
                operation: 'check_time_off_conflict',
                params: {
                    agentId,
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString()
                },
                context: { agentId, startDate, endDate }
            }
        );
    }

    // ============ SCHEDULE PROPERTIES SERVICES ============
    async getAllSchedules() {
        const result = await this.makeRequest('get', `${this.baseUrl}/ScheduleProperties`, null, {
            operation: 'get_all_schedules'
        });

        if (result.success) {
            result.data = SchedulingMapper.mapArray(result.data, SchedulingMapper.toScheduleResponseDto);
        }
        return result;
    }

    async getScheduleById(id) {
        ErrorHandler.validateRequiredFields({ id }, ['id']);

        const result = await this.makeRequest('get', `${this.baseUrl}/ScheduleProperties/${id}`, null, {
            operation: 'get_schedule_by_id',
            context: { scheduleId: id }
        });

        if (result.success) {
            result.data = SchedulingMapper.toScheduleResponseDto(result.data);
        }
        return result;
    }

    async getScheduleByNo(scheduleNo) {
        ErrorHandler.validateRequiredFields({ scheduleNo }, ['scheduleNo']);

        const result = await this.makeRequest('get', `${this.baseUrl}/ScheduleProperties/schedule-no/${scheduleNo}`, null, {
            operation: 'get_schedule_by_no',
            context: { scheduleNo }
        });

        if (result.success) {
            result.data = SchedulingMapper.toScheduleResponseDto(result.data);
        }
        return result;
    }

    async getSchedulesByAgent(agentId) {
        ErrorHandler.validateRequiredFields({ agentId }, ['agentId']);

        const result = await this.makeRequest('get', `${this.baseUrl}/ScheduleProperties/agent/${agentId}`, null, {
            operation: 'get_schedules_by_agent',
            context: { agentId }
        });

        if (result.success) {
            result.data = SchedulingMapper.mapArray(result.data, SchedulingMapper.toScheduleResponseDto);
        }
        return result;
    }

    async getSchedulesByClient(clientId) {
        ErrorHandler.validateRequiredFields({ clientId }, ['clientId']);

        const result = await this.makeRequest('get', `${this.baseUrl}/ScheduleProperties/client/${clientId}`, null, {
            operation: 'get_schedules_by_client',
            context: { clientId }
        });

        if (result.success) {
            result.data = SchedulingMapper.mapArray(result.data, SchedulingMapper.toScheduleResponseDto);
        }
        return result;
    }

    async getSchedulesByProperty(propertyId) {
        ErrorHandler.validateRequiredFields({ propertyId }, ['propertyId']);

        const result = await this.makeRequest('get', `${this.baseUrl}/ScheduleProperties/property/${propertyId}`, null, {
            operation: 'get_schedules_by_property',
            context: { propertyId }
        });

        if (result.success) {
            result.data = SchedulingMapper.mapArray(result.data, SchedulingMapper.toScheduleResponseDto);
        }
        return result;
    }

    async getSchedulesByStatus(status) {
        ErrorHandler.validateRequiredFields({ status }, ['status']);

        const result = await this.makeRequest('get', `${this.baseUrl}/ScheduleProperties/status/${status}`, null, {
            operation: 'get_schedules_by_status',
            context: { status }
        });

        if (result.success) {
            result.data = SchedulingMapper.mapArray(result.data, SchedulingMapper.toScheduleResponseDto);
        }
        return result;
    }

    async getSchedulesByDateRange(startDate, endDate) {
        ErrorHandler.validateRequiredFields({ startDate, endDate }, ['startDate', 'endDate']);
        ErrorHandler.validateDateRange(startDate, endDate);

        const result = await this.makeRequest(
            'get',
            `${this.baseUrl}/ScheduleProperties/date-range`,
            null,
            {
                operation: 'get_schedules_by_date_range',
                params: {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString()
                },
                context: { startDate, endDate }
            }
        );

        if (result.success) {
            result.data = SchedulingMapper.mapArray(result.data, SchedulingMapper.toScheduleResponseDto);
        }
        return result;
    }

    async createSchedule(scheduleData) {
        try {
            ErrorHandler.validateRequiredFields(scheduleData, [
                'propertyId', 'agentId', 'clientId', 'scheduleTime'
            ]);

            // Check agent availability before creating schedule
            const availabilityCheck = await this.checkTimeSlotAvailability(
                scheduleData.agentId,
                scheduleData.scheduleTime
            );

            if (availabilityCheck.success && !availabilityCheck.data.isAvailable) {
                throw ErrorFactory.agentUnavailable(
                    scheduleData.agentId,
                    scheduleData.scheduleTime
                );
            }

            const entity = SchedulingMapper.toCreateScheduleEntity(scheduleData);
            const result = await this.makeRequest('post', `${this.baseUrl}/ScheduleProperties`, entity, {
                operation: 'create_schedule',
                context: {
                    agentId: scheduleData.agentId,
                    propertyId: scheduleData.propertyId,
                    clientId: scheduleData.clientId
                }
            });

            if (result.success) {
                result.data = SchedulingMapper.toScheduleResponseDto(result.data);
            }
            return result;
        } catch (error) {
            return ErrorHandler.handle(error, { operation: 'create_schedule' });
        }
    }

    async updateSchedule(id, scheduleData) {
        try {
            ErrorHandler.validateRequiredFields({ id }, ['id']);

            // Get current schedule to preserve existing data
            const currentResult = await this.getScheduleById(id);
            if (!currentResult.success) {
                return currentResult;
            }

            const entity = SchedulingMapper.toUpdateScheduleEntity(scheduleData, currentResult.data);
            const result = await this.makeRequest('put', `${this.baseUrl}/ScheduleProperties/${id}`, entity, {
                operation: 'update_schedule',
                context: { scheduleId: id }
            });

            if (result.success) {
                result.data = SchedulingMapper.toScheduleResponseDto(result.data);
            }
            return result;
        } catch (error) {
            return ErrorHandler.handle(error, { operation: 'update_schedule' });
        }
    }

    async cancelSchedule(id) {
        ErrorHandler.validateRequiredFields({ id }, ['id']);

        return await this.makeRequest('patch', `${this.baseUrl}/ScheduleProperties/${id}/cancel`, null, {
            operation: 'cancel_schedule',
            context: { scheduleId: id }
        });
    }

    async reschedule(id, newScheduleTime) {
        try {
            ErrorHandler.validateRequiredFields({ id, newScheduleTime }, ['id', 'newScheduleTime']);

            // Get current schedule
            const currentSchedule = await this.getScheduleById(id);
            if (!currentSchedule.success) {
                return currentSchedule;
            }

            const agentId = currentSchedule.data.agentId;

            // Check new time slot availability
            const availabilityCheck = await this.checkTimeSlotAvailability(agentId, newScheduleTime);
            if (availabilityCheck.success && !availabilityCheck.data.isAvailable) {
                throw ErrorFactory.agentUnavailable(agentId, newScheduleTime);
            }

            return await this.makeRequest(
                'patch',
                `${this.baseUrl}/ScheduleProperties/${id}/reschedule`,
                { newScheduleTime },
                {
                    operation: 'reschedule',
                    context: { scheduleId: id, agentId, newScheduleTime }
                }
            );
        } catch (error) {
            return ErrorHandler.handle(error, { operation: 'reschedule' });
        }
    }

    async completeSchedule(id) {
        ErrorHandler.validateRequiredFields({ id }, ['id']);

        return await this.makeRequest('patch', `${this.baseUrl}/ScheduleProperties/${id}/complete`, null, {
            operation: 'complete_schedule',
            context: { scheduleId: id }
        });
    }

    async deleteSchedule(id) {
        ErrorHandler.validateRequiredFields({ id }, ['id']);

        return await this.makeRequest('delete', `${this.baseUrl}/ScheduleProperties/${id}`, null, {
            operation: 'delete_schedule',
            context: { scheduleId: id }
        });
    }

    async checkTimeSlotAvailability(agentId, scheduleTime) {
        ErrorHandler.validateRequiredFields({ agentId, scheduleTime }, ['agentId', 'scheduleTime']);

        return await this.makeRequest(
            'get',
            `${this.baseUrl}/ScheduleProperties/check-availability`,
            null,
            {
                operation: 'check_time_slot_availability',
                params: { agentId, scheduleTime: scheduleTime.toISOString() },
                context: { agentId, scheduleTime }
            }
        );
    }

    // ============ BATCH OPERATIONS ============
    async batchCreateAvailabilities(availabilities) {
        const results = {
            successful: [],
            failed: []
        };

        for (const [index, availability] of availabilities.entries()) {
            const result = await this.createAvailability(availability);
            if (result.success) {
                results.successful.push({
                    index,
                    data: result.data,
                    input: availability
                });
            } else {
                results.failed.push({
                    index,
                    input: availability,
                    error: result.error
                });
            }
        }

        return {
            success: results.failed.length === 0,
            data: results,
            summary: {
                total: availabilities.length,
                successful: results.successful.length,
                failed: results.failed.length
            }
        };
    }

    async batchRequestTimeOffs(timeOffRequests) {
        const results = {
            successful: [],
            failed: []
        };

        for (const [index, timeOff] of timeOffRequests.entries()) {
            const result = await this.requestTimeOff(timeOff);
            if (result.success) {
                results.successful.push({
                    index,
                    data: result.data,
                    input: timeOff
                });
            } else {
                results.failed.push({
                    index,
                    input: timeOff,
                    error: result.error
                });
            }
        }

        return {
            success: results.failed.length === 0,
            data: results,
            summary: {
                total: timeOffRequests.length,
                successful: results.successful.length,
                failed: results.failed.length
            }
        };
    }

    // ============ UTILITY METHODS ============
    async healthCheck() {
        return await this.makeRequest('get', `${this.baseUrl}/health`, null, {
            operation: 'health_check'
        });
    }

    async getServiceStatus() {
        const endpoints = [
            'AgentAvailability',
            'AgentScheduleConfig',
            'AgentTimeOff',
            'ScheduleProperties'
        ];

        const status = {};

        for (const endpoint of endpoints) {
            try {
                const result = await this.makeRequest('get', `${this.baseUrl}/${endpoint}`, null, {
                    operation: `status_check_${endpoint}`,
                    config: { timeout: 5000 }
                });
                status[endpoint] = result.success ? 'healthy' : 'unhealthy';
            } catch (error) {
                status[endpoint] = 'unreachable';
            }
        }

        return {
            success: true,
            data: status,
            timestamp: new Date().toISOString()
        };
    }
}

export default SchedulingServices;