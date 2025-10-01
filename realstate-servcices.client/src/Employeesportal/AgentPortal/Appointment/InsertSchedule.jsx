// InsertSchedule.jsx
import React, { useState, useEffect } from 'react';
import {
    Form,
    Input,
    Select,
    Button,
    DatePicker,
    message,
    Card,
    Row,
    Col,
    Divider,
    Space,
} from 'antd';
import {
    PlusOutlined,
} from '@ant-design/icons';
import { useForm } from 'antd/es/form/Form';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const InsertSchedule = ({
    initialValues = {},
    onSubmit,
    onCancel,
    loading = false,
    isEdit = false,
    properties = [],
    agents = [],
    clients = []
}) => {
    const [form] = useForm();

    useEffect(() => {
        if (isEdit && initialValues) {
            form.setFieldsValue({
                ...initialValues,
                scheduleTime: initialValues.scheduleTime ? dayjs(initialValues.scheduleTime) : null,
                propertyId: initialValues.propertyId?.toString(),
                agentId: initialValues.agentId?.toString(),
                clientId: initialValues.clientId?.toString(),
            });
        }
    }, [initialValues, isEdit, form]);

    const handleSubmit = async (values) => {
        try {
            const submitData = {
                ...values,
                scheduleTime: values.scheduleTime?.toISOString(),
            };

            if (onSubmit) {
                await onSubmit(submitData);
                message.success(`Schedule ${isEdit ? 'updated' : 'created'} successfully!`);
                form.resetFields();
            }
        } catch (error) {
            message.error(`Failed to ${isEdit ? 'update' : 'create'} schedule: ${error.message}`);
        }
    };

    const statusOptions = [
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'rescheduled', label: 'Rescheduled' },
    ];

    return (
        <Card
            title={isEdit ? "Edit Schedule" : "Add New Schedule"}
            style={{ maxWidth: 800, margin: '0 auto' }}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    status: 'scheduled',
                    ...initialValues,
                }}
            >
                <Row gutter={[24, 16]}>
                    {/* Schedule Information */}
                    <Col span={24}>
                        <Divider orientation="left">Schedule Information</Divider>
                    </Col>

                    <Col xs={24} lg={12}>
                        <Form.Item
                            name="propertyId"
                            label="Property"
                            rules={[{ required: true, message: 'Please select a property' }]}
                        >
                            <Select placeholder="Select property" showSearch>
                                {properties.map(property => (
                                    <Option key={property.id} value={property.id.toString()}>
                                        {property.title} - {property.propertyNo}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24} lg={12}>
                        <Form.Item
                            name="agentId"
                            label="Agent"
                            rules={[{ required: true, message: 'Please select an agent' }]}
                        >
                            <Select placeholder="Select agent" showSearch>
                                {agents.map(agent => (
                                    <Option key={agent.id} value={agent.id.toString()}>
                                        {agent.name} - {agent.email}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24} lg={12}>
                        <Form.Item
                            name="clientId"
                            label="Client"
                            rules={[{ required: true, message: 'Please select a client' }]}
                        >
                            <Select placeholder="Select client" showSearch>
                                {clients.map(client => (
                                    <Option key={client.id} value={client.id.toString()}>
                                        {client.name} - {client.email}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24} lg={12}>
                        <Form.Item
                            name="scheduleTime"
                            label="Schedule Date & Time"
                            rules={[{ required: true, message: 'Please select schedule date and time' }]}
                        >
                            <DatePicker
                                showTime
                                format="YYYY-MM-DD HH:mm"
                                style={{ width: '100%' }}
                                placeholder="Select date and time"
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} lg={12}>
                        <Form.Item
                            name="status"
                            label="Status"
                            rules={[{ required: true, message: 'Please select status' }]}
                        >
                            <Select placeholder="Select status">
                                {statusOptions.map(status => (
                                    <Option key={status.value} value={status.value}>
                                        {status.label}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24}>
                        <Form.Item
                            name="notes"
                            label="Notes"
                        >
                            <TextArea
                                rows={3}
                                placeholder="Enter any additional notes..."
                                maxLength={500}
                                showCount
                            />
                        </Form.Item>
                    </Col>
                </Row>

                {/* Form Actions */}
                <Divider />
                <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                    <Space>
                        <Button onClick={onCancel} disabled={loading}>
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            icon={<PlusOutlined />}
                            style={{ backgroundColor: '#1a365d', borderColor: '#1a365d' }}
                        >
                            {isEdit ? 'Update Schedule' : 'Add Schedule'}
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Card>
    );
};

export default InsertSchedule;