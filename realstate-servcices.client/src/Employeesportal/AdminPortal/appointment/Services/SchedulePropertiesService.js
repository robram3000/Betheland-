import SchedulingMapper from './Mapper.js';
import { ErrorHandler, ErrorFactory } from './ErrorHandler.js';

class SchedulePropertiesService {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.baseUrl = '/api/ScheduleProperties';
    }

    async getAll() {
        const result = await this.makeRequest('get', this.baseUrl, null, {
            operation: 'get_all_schedules'
        });

        if (result.success) {
            result.data = SchedulingMapper.mapArray(result.data, SchedulingMapper.toScheduleResponseDto);
        }
        return result;
    }

    async getById(id) {
        ErrorHandler.validateRequiredFields({ id }, ['id']);

        const result = await this.makeRequest('get', `${this.baseUrl}/${id}`, null, {
            operation: 'get_schedule_by_id',
            context: { scheduleId: id }
        });

        if (result.success) {
            result.data = SchedulingMapper.toScheduleResponseDto(result.data);
        }
        return result;
    }

    async getByAgent(agentId) {
        ErrorHandler.validateRequiredFields({ agentId }, ['agentId']);

        const result = await this.makeRequest('get', `${this.baseUrl}/agent/${agentId}`, null, {
            operation: 'get_schedules_by_agent',
            context: { agentId }
        });

        if (result.success) {
            result.data = SchedulingMapper.mapArray(result.data, SchedulingMapper.toScheduleResponseDto);
        }
        return result;
    }

    async create(scheduleData) {
        try {
            ErrorHandler.validateRequiredFields(scheduleData, [
                'propertyId', 'agentId', 'clientId', 'scheduleTime'
            ]);

            const entity = SchedulingMapper.toCreateScheduleEntity(scheduleData);
            const result = await this.makeRequest('post', this.baseUrl, entity, {
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

    async update(id, scheduleData) {
        try {
            ErrorHandler.validateRequiredFields({ id }, ['id']);

            const entity = SchedulingMapper.toUpdateScheduleEntity(scheduleData, { id });
            const result = await this.makeRequest('put', `${this.baseUrl}/${id}`, entity, {
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

    async cancel(id) {
        ErrorHandler.validateRequiredFields({ id }, ['id']);

        return await this.makeRequest('patch', `${this.baseUrl}/${id}/cancel`, null, {
            operation: 'cancel_schedule',
            context: { scheduleId: id }
        });
    }

    async complete(id) {
        ErrorHandler.validateRequiredFields({ id }, ['id']);

        return await this.makeRequest('patch', `${this.baseUrl}/${id}/complete`, null, {
            operation: 'complete_schedule',
            context: { scheduleId: id }
        });
    }

    async delete(id) {
        ErrorHandler.validateRequiredFields({ id }, ['id']);

        return await this.makeRequest('delete', `${this.baseUrl}/${id}`, null, {
            operation: 'delete_schedule',
            context: { scheduleId: id }
        });
    }

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
                3,
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
}

export default SchedulePropertiesService;