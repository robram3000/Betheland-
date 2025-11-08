import {
    AgentAvailabilityService,
    AgentTimeOffService,
    AgentScheduleConfigService,
    SchedulePropertiesService
} from './index.js';

class SchedulingServices {
    constructor(apiClient = null) {
        this.availability = new AgentAvailabilityService();
        this.timeOff = new AgentTimeOffService();
        this.config = new AgentScheduleConfigService();
        this.schedules = new SchedulePropertiesService();

        // If API client is provided, you can pass it to services
        if (apiClient) {
            this.availability.client = apiClient;
            this.timeOff.client = apiClient;
            this.config.client = apiClient;
            this.schedules.client = apiClient;
        }
    }
}

export default SchedulingServices;