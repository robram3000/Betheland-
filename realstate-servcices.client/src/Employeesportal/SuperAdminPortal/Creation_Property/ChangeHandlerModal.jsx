// ChangeHandlerModal.jsx (Updated with progress bar and success notification)
import React, { useState, useEffect } from 'react';
import { Modal, Select, Button, Space, message, notification, Progress } from 'antd';
import { UserSwitchOutlined, CheckCircleOutlined } from '@ant-design/icons';
import agentService from '../../AdminPortal/Creation_Agent/services/AgentService';

const { Option } = Select;

const ChangeHandlerModal = ({ visible, onCancel, property, onSuccess }) => {
    const [agents, setAgents] = useState([]);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [progressVisible, setProgressVisible] = useState(false);
    const [progress, setProgress] = useState(0);

    const startProgress = () => {
        setProgressVisible(true);
        setProgress(0);

        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return prev;
                }
                return prev + 10;
            });
        }, 100);

        return interval;
    };

    const completeProgress = (interval) => {
        setProgress(100);
        setTimeout(() => {
            if (interval) clearInterval(interval);
            setProgressVisible(false);
            setProgress(0);
        }, 500);
    };

    useEffect(() => {
        if (visible) {
            loadAgents();
            setSelectedAgent(property?.agentId || null);
        } else {
            setSelectedAgent(null);
        }
    }, [visible, property]);

    const loadAgents = async () => {
        try {
            const agentsData = await agentService.getAgents();
            setAgents(agentsData || []);
        } catch (error) {
            console.error('Error loading agents:', error);
            message.error('Failed to load agents');
        }
    };

    const handleSubmit = async () => {
        if (!selectedAgent) {
            message.error('Please select an agent');
            return;
        }

        const progressInterval = startProgress();

        try {
            await onSuccess(property, selectedAgent);

            completeProgress(progressInterval);

            notification.success({
                message: (
                    <Space>
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        <span>Handler Changed Successfully!</span>
                    </Space>
                ),
                description: `Property "${property.title}" has been assigned to the new agent.`,
                placement: 'topRight',
                duration: 4,
            });
        } catch (error) {
            console.error('Error changing handler:', error);
            completeProgress(progressInterval);
            message.error(error.message || 'Failed to change property handler');
        }
    };

    return (
        <Modal
            title={
                <Space>
                    <UserSwitchOutlined />
                    <span>Change Property Handler</span>
                </Space>
            }
            open={visible}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Cancel
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    onClick={handleSubmit}
                    loading={loading}
                    disabled={!selectedAgent}
                >
                    Change Handler
                </Button>,
            ]}
        >
            {/* Progress Bar */}
            {progressVisible && (
                <div style={{ marginBottom: 16 }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 8
                        }}>
                            <span style={{ fontWeight: 500, color: '#1890ff' }}>
                                Changing property handler...
                            </span>
                            <span style={{ fontSize: '12px', color: '#666' }}>
                                {progress}%
                            </span>
                        </div>
                        <Progress
                            percent={progress}
                            status="active"
                            strokeColor={{
                                '0%': '#108ee9',
                                '100%': '#87d068',
                            }}
                            showInfo={false}
                        />
                    </Space>
                </div>
            )}

            <div style={{ marginBottom: 16 }}>
                <p><strong>Property:</strong> {property?.title}</p>
                <p><strong>Current Handler:</strong> {property?.agent ? `${property.agent.firstName} ${property.agent.lastName}` : 'No agent assigned'}</p>
            </div>

            <Select
                style={{ width: '100%' }}
                placeholder="Select new agent"
                value={selectedAgent}
                onChange={setSelectedAgent}
                showSearch
                filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
            >
                {agents.map(agent => (
                    <Option key={agent.id} value={agent.id}>
                        {agent.firstName} {agent.lastName} ({agent.email})
                    </Option>
                ))}
            </Select>
        </Modal>
    );
};

export default ChangeHandlerModal;