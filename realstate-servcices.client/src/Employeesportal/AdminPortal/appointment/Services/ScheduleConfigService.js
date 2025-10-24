import SchedulingMapper from './Mapper.js';
import { ErrorHandler, ErrorFactory } from './errorHandler.js';

class ScheduleConfigService {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.baseUrl = '/api/AgentScheduleConfig';
    }

    async getAll() {
        const result = await this.makeRequest('get', this.baseUrl, null, {
            operation: 'get_all_configs'
        });

        if (result.success) {
            result.data = SchedulingMapper.mapArray(result.data, SchedulingMapper.toAgentScheduleConfigDto);
        }
        return result;
    }

    async getByAgent(agentId) {
        ErrorHandler.validateRequiredFields({ agentId }, ['agentId']);

        const result = await this.makeRequest('get', `${this.baseUrl}/agent/${agentId}`, null, {
            operation: 'get_config_by_agent',
            context: { agentId }
        });

        if (result.success) {
            result.data = SchedulingMapper.toAgentScheduleConfigDto(result.data);
        }
        return result;
    }

    async create(configData) {
        try {
            ErrorHandler.validateRequiredFields(configData, ['agentId']);

            const entity = SchedulingMapper.toAgentScheduleConfigEntity(configData);
            const result = await this.makeRequest('post', this.baseUrl, entity, {
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

    async update(id, configData) {
        try {
            ErrorHandler.validateRequiredFields({ id }, ['id']);

            const entity = SchedulingMapper.toAgentScheduleConfigEntity({ ...configData, id });
            const result = await this.makeRequest('put', `${this.baseUrl}/${id}`, entity, {
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

export default ScheduleConfigService;