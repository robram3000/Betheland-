import React, { useState, useEffect } from 'react';
import { Modal, Select, Form, Button, message, Spin } from 'antd';
import agentService from '../Creation_Agent/Services/AgentService';

const { Option } = Select;

const ChangeHandlerModal = ({ visible, property, onSuccess, onCancel }) => {
    const [form] = Form.useForm();
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [agentsLoading, setAgentsLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            loadAgents();
            if (property) {
                form.setFieldsValue({
                    agentId: property.agentId || null
                });
            } else {
                form.resetFields();
            }
        }
    }, [visible, property, form]);

    const loadAgents = async () => {
        setAgentsLoading(true);
        try {
            const agentsData = await agentService.getAgents();
            console.log('Loaded agents:', agentsData);
            setAgents(agentsData || []);
        } catch (error) {
            console.error('Error loading agents:', error);
            message.error('Failed to load agents');
            setAgents([]);
        } finally {
            setAgentsLoading(false);
        }
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            await onSuccess(property, values.agentId);
            message.success('Agent changed successfully');
        } catch (error) {
            console.error('Error changing handler:', error);
            message.error('Failed to change agent');
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
            title={`Change Property Handler - ${property?.title || 'Property'}`}
            open={visible}
            onCancel={handleCancel}
            footer={null}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <Form.Item
                    name="agentId"
                    label="Select Agent"
                    rules={[{ required: false, message: 'Please select an agent' }]}
                >
                    <Select
                        placeholder="Select an agent (optional)"
                        loading={agentsLoading}
                        showSearch
                        allowClear
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        notFoundContent={agentsLoading ? <Spin size="small" /> : 'No agents found'}
                    >
                        <Option value={null}>
                            <span style={{ color: '#999' }}>No Agent</span>
                        </Option>
                        {agents.map(agent => (
                            <Option key={agent.id} value={agent.id}>
                                <div>
                                    <strong>{agent.firstName} {agent.lastName}</strong>
                                    <div style={{ fontSize: '12px', color: '#666' }}>
                                        {agent.email} • {agent.cellPhoneNo}
                                    </div>
                                    {agent.licenseNumber && (
                                        <div style={{ fontSize: '12px', color: '#888' }}>
                                            License: {agent.licenseNumber}
                                        </div>
                                    )}
                                </div>
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <Button onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Change Handler
                        </Button>
                    </div>
                </Form.Item>
            </Form>

            {/* Current Agent Info */}
            {property?.agent && (
                <div style={{
                    marginTop: 16,
                    padding: 12,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 6,
                    border: '1px solid #d9d9d9'
                }}>
                    <div style={{ fontWeight: 500, marginBottom: 8 }}>Current Agent:</div>
                    <div>
                        <strong>{property.agent.firstName} {property.agent.lastName}</strong>
                        {property.agent.email && <div>Email: {property.agent.email}</div>}
                        {property.agent.cellPhoneNo && <div>Phone: {property.agent.cellPhoneNo}</div>}
                        {property.agent.licenseNumber && <div>License: {property.agent.licenseNumber}</div>}
                    </div>
                </div>
            )}

            {property?.agentId && !property?.agent && (
                <div style={{
                    marginTop: 16,
                    padding: 12,
                    backgroundColor: '#fff3cd',
                    borderRadius: 6,
                    border: '1px solid #ffeaa7'
                }}>
                    <div style={{ fontWeight: 500, marginBottom: 8 }}>Current Agent (ID Only):</div>
                    <div>Agent ID: {property.agentId}</div>
                    <div style={{ fontSize: '12px', color: '#856404' }}>
                        Agent details not available. You can assign a new agent below.
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default ChangeHandlerModal;