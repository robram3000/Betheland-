import SchedulingMapper from './Mapper.js';
import ErrorHandler from './errorhandler.js';
import { SchedulingError } from './errorhandler.js';
class AgentAvailabilityService {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.baseUrl = '/api/AgentAvailability';
    }

    async getAll() {
        const result = await this.makeRequest('get', this.baseUrl, null, {
            operation: 'get_all_availabilities'
        });

        if (result.success) {
            result.data = SchedulingMapper.mapArray(result.data, SchedulingMapper.toAgentAvailabilityDto);
        }
        return result;
    }

    async getById(id) {
        ErrorHandler.validateRequiredFields({ id }, ['id']);

        const result = await this.makeRequest('get', `${this.baseUrl}/${id}`, null, {
            operation: 'get_availability_by_id',
            context: { availabilityId: id }
        });

        if (result.success) {
            result.data = SchedulingMapper.toAgentAvailabilityDto(result.data);
        }
        return result;
    }

    async getByAgent(agentId) {
        ErrorHandler.validateRequiredFields({ agentId }, ['agentId']);

        const result = await this.makeRequest('get', `${this.baseUrl}/agent/${agentId}`, null, {
            operation: 'get_availabilities_by_agent',
            context: { agentId }
        });

        if (result.success) {
            result.data = SchedulingMapper.mapArray(result.data, SchedulingMapper.toAgentAvailabilityDto);
        }
        return result;
    }

    async create(availabilityData) {
        try {
            ErrorHandler.validateRequiredFields(availabilityData, [
                'agentId', 'dayOfWeek', 'startTime', 'endTime'
            ]);

            const entity = SchedulingMapper.toCreateAgentAvailabilityEntity(availabilityData);
            const result = await this.makeRequest('post', this.baseUrl, entity, {
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

    async update(id, availabilityData) {
        try {
            ErrorHandler.validateRequiredFields({ id }, ['id']);
            ErrorHandler.validateRequiredFields(availabilityData, [
                'agentId', 'dayOfWeek', 'startTime', 'endTime'
            ]);

            const entity = SchedulingMapper.toAgentAvailabilityEntity({ ...availabilityData, id });
            const result = await this.makeRequest('put', `${this.baseUrl}/${id}`, entity, {
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

    async delete(id) {
        ErrorHandler.validateRequiredFields({ id }, ['id']);

        return await this.makeRequest('delete', `${this.baseUrl}/${id}`, null, {
            operation: 'delete_availability',
            context: { availabilityId: id }
        });
    }

    // Enhanced request method
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
                3, // maxRetries
                1000 // baseDelay
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

export default AgentAvailabilityService;