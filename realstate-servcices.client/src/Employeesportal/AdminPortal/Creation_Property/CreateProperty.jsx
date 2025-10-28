// CreateProperty.jsx
import React from 'react';
import { Card, Button, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import InsertProperty from './InsertProperty';

const CreateProperty = ({ property, onSuccess, onBack }) => {
    const handleSuccess = () => {
        if (onSuccess) onSuccess();
    };

    return (
        <Card>
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div>
                    <h2 style={{ margin: 0, color: '#1a365d' }}>
                        {property ? 'Edit Property' : ''}
                    </h2>
                    <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>
                        {property ? 'Update property information, media, and agent assignments' : ''}
                    </p>
                </div>
            </div>

            <InsertProperty
                property={property}
                onSuccess={handleSuccess}
                onCancel={onBack}
            />
        </Card>
    );
};

export default CreateProperty;