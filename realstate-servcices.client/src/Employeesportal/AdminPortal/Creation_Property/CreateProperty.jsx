// CreateProperty.jsx
import React from 'react';
import { Card, Button, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import InsertProperty from './InsertProperty';

const CreateProperty = ({ onSuccess, onBack }) => {
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
                        Back to Properties
                    </Button>
                )}
                <h2 style={{ margin: 0, color: '#1a365d' }}>Create New Property</h2>
                <p style={{ margin: '8px 0 0 0', color: '#666' }}>
                    Add a new property listing to the system
                </p>
            </div>

            <InsertProperty onSuccess={handleSuccess} />
        </Card>
    );
};

export default CreateProperty;