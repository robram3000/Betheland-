// CreateAgent.jsx
import React from 'react';
import { Card, Button, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import InsertAgent from './InsertAgent';

const CreateAgent = ({ agent, onSuccess, onBack }) => {
    const handleSuccess = () => {
        if (onSuccess) onSuccess();
    };

    return (
        <Card>
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: '12px' }}>
               
                <div>
                    <h2 style={{ margin: 0, color: '#1a365d' }}>
                        {agent ? 'Edit Agent' : ''}
                    </h2>
                    <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>
                        {agent ? 'Update agent information, contact details, and assignments' : ''}
                    </p>
                </div>
            </div>

            <InsertAgent
                agent={agent}
                onSuccess={handleSuccess}
                onCancel={onBack}
            />
        </Card>
    );
};

export default CreateAgent;