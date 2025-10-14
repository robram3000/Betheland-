// Components/AgentProfile/AgentProfile.jsx
import React, { useState, useEffect } from 'react';
import { Spin, Alert, Button, Space, Typography } from 'antd';
import { ExclamationCircleOutlined, EditOutlined } from '@ant-design/icons';
import { useUser } from '../../../Authpage/Services/UserContextService';
import useAgents from './Services/useAgents';
import AgentProfileDisplay from './AgentProfileDisplay';
import AgentProfileEdit from './AgentProfileEdit';

const { Title } = Typography;

const AgentProfile = () => {
    const [editMode, setEditMode] = useState(false);
    const { user: currentUser } = useUser();
    const {
        currentAgent,
        loading,
        updating,
        getAgentByBaseMemberId,
        clearCurrentAgent,
        error
    } = useAgents();

    const baseMemberId = currentUser?.userId;   

    useEffect(() => {
        if (baseMemberId) {
            console.log('🔄 AgentProfile - Fetching agent profile for base member ID:', baseMemberId);
            getAgentByBaseMemberId(baseMemberId);
        }

        return () => {
            clearCurrentAgent();
        };
    }, [baseMemberId, getAgentByBaseMemberId, clearCurrentAgent]);

    const handleEditToggle = () => {
        setEditMode(!editMode);
    };

    const handleSaveSuccess = () => {
        setEditMode(false);
        if (baseMemberId) {
            getAgentByBaseMemberId(baseMemberId);
        }
    };

    if (loading && !currentAgent) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>
                    <span>Loading your profile...</span>
                </div>
            </div>
        );
    }

    if (error && !currentAgent) {
        return (
            <div style={{ padding: '20px' }}>
                <Alert
                    message="Error Loading Profile"
                    description={error}
                    type="error"
                    showIcon
                    icon={<ExclamationCircleOutlined />}
                    action={
                        <Button size="small" onClick={() => getAgentByBaseMemberId(baseMemberId)}>
                            Retry
                        </Button>
                    }
                />
            </div>
        );
    }

    if (!currentAgent) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <ExclamationCircleOutlined style={{ fontSize: 48, color: '#faad14', marginBottom: 16 }} />
                <Title level={3}>Profile Not Found</Title>
                <span style={{ color: '#8c8c8c' }}>
                    We couldn't find an agent profile associated with your account.
                </span>
                <br />
                <span style={{ color: '#8c8c8c' }}>
                    Please contact support if you believe this is an error.
                </span>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            <div style={{
                marginBottom: 24,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Title level={2}>Agent Profile</Title>

                {!editMode && (
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={handleEditToggle}
                    >
                        Edit Profile
                    </Button>
                )}
            </div>

            {editMode ? (
                <AgentProfileEdit
                    currentAgent={currentAgent}
                    updating={updating}
                    onSave={handleSaveSuccess}
                    onCancel={handleEditToggle}
                    baseMemberId={baseMemberId}
                />
            ) : (
                <AgentProfileDisplay
                    currentAgent={currentAgent}
                    onEdit={handleEditToggle}
                />
            )}
        </div>
    );
};

export default AgentProfile;