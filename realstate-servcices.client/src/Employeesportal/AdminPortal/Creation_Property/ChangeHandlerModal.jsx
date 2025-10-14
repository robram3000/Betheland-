// ChangeHandlerModal.jsx
import React, { useState, useEffect } from 'react';
import {
    Modal,
    Form,
    Select,
    Avatar,
    Space,
    message,
    Card,
    Descriptions
} from 'antd';
import { UserSwitchOutlined } from '@ant-design/icons';
import agentService from '../Creation_Agent/Services/agentService';
import propertyService from './services/propertyService';

const { Option } = Select;

const ChangeHandlerModal = ({ visible, property, onSuccess, onCancel }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [agents, setAgents] = useState([]);
    const [currentAgent, setCurrentAgent] = useState(null);

    useEffect(() => {
        if (visible) {
            loadAgents();
            if (property) {
                setCurrentAgent(property.agent);
                form.setFieldsValue({
                    agentId: property.agentId || null
                });
            }
        }
    }, [visible, property, form]);

    const loadAgents = async () => {
        try {
            const data = await agentService.getAgents();
            setAgents(data);
        } catch (error) {
            console.error('Error loading agents:', error);
            message.error('Failed to load agents');
        }
    };

    const handleSubmit = async (values) => {
        if (!property) return;

        setLoading(true);
        try {
            await propertyService.changePropertyHandler(property.id, values.agentId);
            message.success('Property handler changed successfully');
            onSuccess();
        } catch (error) {
            message.error('Failed to change property handler');
            console.error('Error changing handler:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title={
                <Space>
                    <UserSwitchOutlined />
                    Change Property Handler
                </Space>
            }
            open={visible}
            onCancel={handleCancel}
            onOk={() => form.submit()}
            confirmLoading={loading}
            okText="Change Handler"
            width={600}
        >
            {property && (
                <div>
                    <Card size="small" style={{ marginBottom: 16 }}>
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="Property">
                                <strong>{property.title}</strong>
                            </Descriptions.Item>
                            <Descriptions.Item label="Address">
                                {property.address}, {property.city}
                            </Descriptions.Item>
                            <Descriptions.Item label="Current Handler">
                                {currentAgent ? (
                                    <Space>
                                        <Avatar size="small" src={currentAgent.profilePictureUrl}>
                                            {currentAgent.firstName?.[0]}{currentAgent.lastName?.[0]}
                                        </Avatar>
                                        {currentAgent.firstName} {currentAgent.lastName}
                                    </Space>
                                ) : (
                                    'No Agent Assigned'
                                )}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                    >
                        <Form.Item
                            label="Select New Handler"
                            name="agentId"
                            rules={[{ required: true, message: 'Please select an agent' }]}
                        >
                            <Select
                                placeholder="Select agent"
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                <Option value={null}>No Agent (Unassign)</Option>
                                {agents.map(agent => (
                                    <Option key={agent.id} value={agent.id}>
                                        <Space>
                                            <Avatar size="small" src={agent.profilePictureUrl}>
                                                {agent.firstName?.[0]}{agent.lastName?.[0]}
                                            </Avatar>
                                            {agent.firstName} {agent.lastName}
                                            {agent.isVerified && (
                                                <span style={{ color: '#52c41a' }}>✓</span>
                                            )}
                                        </Space>
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Form>
                </div>
            )}
        </Modal>
    );
};

export default ChangeHandlerModal;