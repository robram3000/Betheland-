// CreateProperty.jsx - Update to handle auto-assignment
import React, { useEffect } from 'react';
import { Card, Button, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import InsertProperty from './InsertProperty';
import authService from '../../Services/LoginAuth';

const CreateProperty = ({ property, onSuccess, onBack, location }) => {
    const handleSuccess = () => {
        if (onSuccess) onSuccess();
    };

    // Check if we should auto-assign the current user as agent
    const shouldAutoAssignAgent = location?.state?.autoAssignAgent;
    const currentUser = authService.getCurrentUser();

    return (
        <Card>
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div>
                    <h2 style={{ margin: 0, color: '#1a365d' }}>
                        {property ? 'Edit Property' : 'Create New Property'}
                    </h2>
                    <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>
                        {property
                            ? 'Update property information, media, and agent assignments'
                            : shouldAutoAssignAgent
                                ? 'Add new property listing - you will be automatically assigned as the agent'
                                : 'Add new property listing with detailed information'
                        }
                    </p>
                </div>
            </div>

            <InsertProperty
                property={property}
                onSuccess={handleSuccess}
                onCancel={onBack}
                autoAssignAgent={shouldAutoAssignAgent}
                currentAgentId={currentUser?.userId}
            />
        </Card>
    );
};

export default CreateProperty;