import AgentAvailabilityService from './AgentAvailabilityService';
import AgentScheduleConfigService from './ScheduleConfigService.js';
import AgentTimeOffService from './AgentTimeOffService';
import SchedulePropertiesService from './SchedulePropertiesService';

// Create instances
const agentAvailabilityService = new AgentAvailabilityService();
const agentScheduleConfigService = new AgentScheduleConfigService();
const agentTimeOffService = new AgentTimeOffService();
const schedulePropertiesService = new SchedulePropertiesService();

// Export instances
export {
    agentAvailabilityService,
    agentScheduleConfigService,
    agentTimeOffService,
    schedulePropertiesService
};

// Export classes for custom instances
export {
    AgentAvailabilityService,
    AgentScheduleConfigService,
    AgentTimeOffService,
    SchedulePropertiesService
};

export default {
    agentAvailabilityService,
    agentScheduleConfigService,
    agentTimeOffService,
    schedulePropertiesService
};