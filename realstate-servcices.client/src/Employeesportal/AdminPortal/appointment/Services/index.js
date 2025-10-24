import AgentAvailabilityService from './AgentAvailabilityService.js';
import AgentTimeOffService from './AgentTimeOffService.js';
import SchedulePropertiesService from './SchedulePropertiesService.js';
import ScheduleConfigService from './ScheduleConfigService.js';

class SchedulingServices {
    constructor(apiClient, options = {}) {
        this.apiClient = apiClient;
        this.options = {
            maxRetries: options.maxRetries || 3,
            timeout: options.timeout || 30000,
            ...options
        };

        // Initialize individual services
        this.availability = new AgentAvailabilityService(apiClient);
        this.timeOff = new AgentTimeOffService(apiClient);
        this.schedules = new SchedulePropertiesService(apiClient);
        this.config = new ScheduleConfigService(apiClient);
    }

    async healthCheck() {
        try {
            const response = await this.apiClient.get('/api/health');
            return {
                success: true,
                data: response.data,
                statusCode: response.status
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                statusCode: error.response?.status || 500
            };
        }
    }
}

export default SchedulingServices;