import React from 'react';
import AgentLayout from '../Navigation/adminlayout';
import ScheduleTable from './ScheduleTable';

const ScheduleManagementPage = () => {
    return (
        <AgentLayout>
            <ScheduleTable />
        </AgentLayout>
    );
};

export default ScheduleManagementPage;