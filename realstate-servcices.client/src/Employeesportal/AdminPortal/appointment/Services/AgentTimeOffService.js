import SchedulingMapper from './Mapper.js';
import { ErrorHandler, ErrorFactory } from './errorHandler.js';

class AgentTimeOffService {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.baseUrl = '/api/AgentTimeOff';
    }

    async getAll() {
        const result = await this.makeRequest('get', this.baseUrl, null, {
            operation: 'get_all_time_offs'
        });

        if (result.success) {
            result.data = SchedulingMapper.mapArray(result.data, SchedulingMapper.toAgentTimeOffDto);
        }
        return result;
    }

    async getByAgent(agentId) {
        ErrorHandler.validateRequiredFields({ agentId }, ['agentId']);

        const result = await this.makeRequest('get', `${this.baseUrl}/agent/${agentId}`, null, {
            operation: 'get_time_offs_by_agent',
            context: { agentId }
        });

        if (result.success) {
            result.data = SchedulingMapper.mapArray(result.data, SchedulingMapper.toAgentTimeOffDto);
        }
        return result;
    }

    async create(timeOffData) {
        try {
            ErrorHandler.validateRequiredFields(timeOffData, [
                'agentId', 'startDate', 'endDate'
            ]);

            ErrorHandler.validateDateRange(timeOffData.startDate, timeOffData.endDate);

            const entity = SchedulingMapper.toCreateAgentTimeOffEntity(timeOffData);
            const result = await this.makeRequest('post', this.baseUrl, entity, {
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

    async update(id, timeOffData) {
        try {
            ErrorHandler.validateRequiredFields({ id }, ['id']);
            ErrorHandler.validateRequiredFields(timeOffData, [
                'agentId', 'startDate', 'endDate'
            ]);

            ErrorHandler.validateDateRange(timeOffData.startDate, timeOffData.endDate);

            const entity = SchedulingMapper.toAgentTimeOffEntity({ ...timeOffData, id });
            const result = await this.makeRequest('put', `${this.baseUrl}/${id}`, entity, {
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

    async approve(id) {
        ErrorHandler.validateRequiredFields({ id }, ['id']);

        return await this.makeRequest('patch', `${this.baseUrl}/${id}/approve`, null, {
            operation: 'approve_time_off',
            context: { timeOffId: id }
        });
    }

    async reject(id) {
        ErrorHandler.validateRequiredFields({ id }, ['id']);

        return await this.makeRequest('patch', `${this.baseUrl}/${id}/reject`, null, {
            operation: 'reject_time_off',
            context: { timeOffId: id }
        });
    }

    async delete(id) {
        ErrorHandler.validateRequiredFields({ id }, ['id']);

        return await this.makeRequest('delete', `${this.baseUrl}/${id}`, null, {
            operation: 'delete_time_off',
            context: { timeOffId: id }
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

export default AgentTimeOffService;