// CreateAgent.jsx
import React from 'react';
import { Card, Button, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import InsertAgent from './InsertAgent';

const CreateAgent = ({ onSuccess, onBack }) => {
    const handleSuccess = () => {
        if (onSuccess) onSuccess();
    };

    return (
        <Card>
            <div style={{ marginBottom: 24 }}>
                {onBack && (
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={onBack}
                        style={{ marginBottom: 16 }}
                    >
                        Back to Agents
                    </Button>
                )}
                <h2 style={{ margin: 0, color: '#1a365d' }}>Create New Agent</h2>
                <p style={{ margin: '8px 0 0 0', color: '#666' }}>
                    Add a new real estate agent to the system
                </p>
            </div>

            <InsertAgent onSuccess={handleSuccess} />
        </Card>
    );
};

export default CreateAgent;