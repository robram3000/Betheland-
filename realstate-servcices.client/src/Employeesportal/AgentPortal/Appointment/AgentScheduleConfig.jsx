import React, { useState, useEffect } from 'react';
import {
    Card,
    Button,
    Space,
    Form,
    InputNumber,
    Switch,
    Select,
    TimePicker,
    message,
    Row,
    Col,
    Divider,
    Tag,
    Tooltip,
    Alert,
    Input
} from 'antd';
import {
    SaveOutlined,
    ReloadOutlined,
    InfoCircleOutlined,
    ClockCircleOutlined,
    CalendarOutlined,
    SettingOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;

const AgentScheduleConfig = () => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState(null);
    const [form] = Form.useForm();

    // Default configuration structure
    const defaultConfig = {
        appointmentDuration: 60,
        bufferTime: 15,
        maxAppointmentsPerDay: 8,
        allowSameDayBooking: true,
        advanceBookingDays: 30,
        minNoticeHours: 2,
        workingHoursStart: '09:00',
        workingHoursEnd: '17:00',
        enableReminders: true,
        reminderTime: 60,
        timeZone: 'America/New_York',
        autoConfirmAppointments: false,
        maxReschedules: 2,
        cancellationPolicy: '24 hours notice required for cancellations'
    };

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        setLoading(true);
        try {
            // Mock API call - replace with actual API from AgentScheduleConfigController
            const mockConfig = {
                id: 1,
                agentId: 123,
                ...defaultConfig,
                workingHoursStart: moment(defaultConfig.workingHoursStart, 'HH:mm'),
                workingHoursEnd: moment(defaultConfig.workingHoursEnd, 'HH:mm'),
                createdAt: '2024-01-01T00:00:00',
                updatedAt: '2024-01-01T00:00:00'
            };

            setConfig(mockConfig);
            form.setFieldsValue(mockConfig);
        } catch (error) {
            console.error('Error loading schedule config:', error);
            message.error('Failed to load schedule configuration');
            // Set default values if load fails
            form.setFieldsValue({
                ...defaultConfig,
                workingHoursStart: moment(defaultConfig.workingHoursStart, 'HH:mm'),
                workingHoursEnd: moment(defaultConfig.workingHoursEnd, 'HH:mm')
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (values) => {
        setSaving(true);
        try {
            // Prepare data for API - match AgentScheduleConfig entity
            const configData = {
                ...values,
                workingHoursStart: values.workingHoursStart.format('HH:mm'),
                workingHoursEnd: values.workingHoursEnd.format('HH:mm'),
                agentId: 123 // This should come from auth context
            };

            // Mock API call - replace with actual API call to AgentScheduleConfigController
            console.log('Saving config to API:', configData);

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Update local state
            setConfig({
                ...config,
                ...configData,
                workingHoursStart: values.workingHoursStart,
                workingHoursEnd: values.workingHoursEnd
            });

            message.success('Schedule configuration saved successfully');
        } catch (error) {
            console.error('Error saving schedule config:', error);
            message.error('Failed to save schedule configuration');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        form.setFieldsValue({
            ...defaultConfig,
            workingHoursStart: moment(defaultConfig.workingHoursStart, 'HH:mm'),
            workingHoursEnd: moment(defaultConfig.workingHoursEnd, 'HH:mm')
        });
        message.info('Configuration reset to defaults');
    };

    const timeZones = [
        'America/New_York',
        'America/Chicago',
        'America/Denver',
        'America/Los_Angeles',
        'America/Phoenix',
        'America/Anchorage',
        'America/Honolulu',
        'UTC'
    ];

    const calculateTotalWorkingHours = () => {
        const start = form.getFieldValue('workingHoursStart');
        const end = form.getFieldValue('workingHoursEnd');
        if (start && end) {
            const duration = moment.duration(end.diff(start));
            return duration.asHours();
        }
        return 0;
    };

    return (
        <div>
            <Alert
                message="Schedule Configuration"
                description="Configure your appointment preferences, working hours, and booking rules. These settings will affect how clients can book appointments with you."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
            />

            <Card
                loading={loading}
                title={
                    <Space>
                        <SettingOutlined />
                        Schedule Settings
                        {config && (
                            <Tag color="blue" style={{ marginLeft: 8 }}>
                                Active
                            </Tag>
                        )}
                    </Space>
                }
                extra={
                    <Space>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={handleReset}
                            disabled={saving || loading}
                        >
                            Reset to Defaults
                        </Button>
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            loading={saving}
                            onClick={() => form.submit()}
                            disabled={loading}
                        >
                            Save Changes
                        </Button>
                    </Space>
                }
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                    initialValues={{
                        ...defaultConfig,
                        workingHoursStart: moment(defaultConfig.workingHoursStart, 'HH:mm'),
                        workingHoursEnd: moment(defaultConfig.workingHoursEnd, 'HH:mm')
                    }}
                >
                    {/* Appointment Settings */}
                    <Divider orientation="left">
                        <Space>
                            <CalendarOutlined />
                            Appointment Settings
                        </Space>
                    </Divider>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="appointmentDuration"
                                label={
                                    <Space>
                                        Appointment Duration
                                        <Tooltip title="Default duration for each appointment">
                                            <InfoCircleOutlined />
                                        </Tooltip>
                                    </Space>
                                }
                                rules={[{ required: true, message: 'Please enter duration' }]}
                            >
                                <InputNumber
                                    min={15}
                                    max={240}
                                    step={15}
                                    addonAfter="minutes"
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="bufferTime"
                                label={
                                    <Space>
                                        Buffer Time
                                        <Tooltip title="Time between appointments for preparation">
                                            <InfoCircleOutlined />
                                        </Tooltip>
                                    </Space>
                                }
                                rules={[{ required: true, message: 'Please enter buffer time' }]}
                            >
                                <InputNumber
                                    min={0}
                                    max={60}
                                    step={5}
                                    addonAfter="minutes"
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="maxAppointmentsPerDay"
                                label={
                                    <Space>
                                        Max Appointments/Day
                                        <Tooltip title="Maximum number of appointments allowed per day">
                                            <InfoCircleOutlined />
                                        </Tooltip>
                                    </Space>
                                }
                                rules={[{ required: true, message: 'Please enter maximum appointments' }]}
                            >
                                <InputNumber
                                    min={1}
                                    max={20}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Working Hours */}
                    <Divider orientation="left">
                        <Space>
                            <ClockCircleOutlined />
                            Working Hours
                            <Tag color="blue">
                                {calculateTotalWorkingHours().toFixed(1)} hours/day
                            </Tag>
                        </Space>
                    </Divider>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="workingHoursStart"
                                label="Start Time"
                                rules={[{ required: true, message: 'Please select start time' }]}
                            >
                                <TimePicker
                                    format="HH:mm"
                                    style={{ width: '100%' }}
                                    placeholder="Start time"
                                    onChange={() => form.validateFields(['workingHoursEnd'])}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="workingHoursEnd"
                                label="End Time"
                                rules={[
                                    { required: true, message: 'Please select end time' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            const start = getFieldValue('workingHoursStart');
                                            if (!value || !start || value.isAfter(start)) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('End time must be after start time'));
                                        },
                                    }),
                                ]}
                            >
                                <TimePicker
                                    format="HH:mm"
                                    style={{ width: '100%' }}
                                    placeholder="End time"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="timeZone"
                                label="Time Zone"
                                rules={[{ required: true, message: 'Please select time zone' }]}
                            >
                                <Select placeholder="Select time zone" showSearch>
                                    {timeZones.map(zone => (
                                        <Option key={zone} value={zone}>
                                            {zone}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Booking Rules */}
                    <Divider orientation="left">Booking Rules</Divider>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="advanceBookingDays"
                                label={
                                    <Space>
                                        Advance Booking
                                        <Tooltip title="How far in advance clients can book">
                                            <InfoCircleOutlined />
                                        </Tooltip>
                                    </Space>
                                }
                                rules={[{ required: true, message: 'Please enter advance booking days' }]}
                            >
                                <InputNumber
                                    min={1}
                                    max={365}
                                    addonAfter="days"
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="minNoticeHours"
                                label={
                                    <Space>
                                        Minimum Notice
                                        <Tooltip title="Minimum hours notice required for bookings">
                                            <InfoCircleOutlined />
                                        </Tooltip>
                                    </Space>
                                }
                                rules={[{ required: true, message: 'Please enter minimum notice' }]}
                            >
                                <InputNumber
                                    min={1}
                                    max={24}
                                    addonAfter="hours"
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="maxReschedules"
                                label={
                                    <Space>
                                        Max Reschedules
                                        <Tooltip title="Maximum number of times an appointment can be rescheduled">
                                            <InfoCircleOutlined />
                                        </Tooltip>
                                    </Space>
                                }
                                rules={[{ required: true, message: 'Please enter maximum reschedules' }]}
                            >
                                <InputNumber
                                    min={0}
                                    max={5}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Features & Preferences */}
                    <Divider orientation="left">Features & Preferences</Divider>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="allowSameDayBooking"
                                label="Allow Same-Day Booking"
                                valuePropName="checked"
                            >
                                <Switch
                                    checkedChildren="Enabled"
                                    unCheckedChildren="Disabled"
                                />
                            </Form.Item>

                            <Form.Item
                                name="autoConfirmAppointments"
                                label="Auto-Confirm Appointments"
                                valuePropName="checked"
                            >
                                <Switch
                                    checkedChildren="Enabled"
                                    unCheckedChildren="Disabled"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="enableReminders"
                                label="Enable Reminders"
                                valuePropName="checked"
                            >
                                <Switch
                                    checkedChildren="Enabled"
                                    unCheckedChildren="Disabled"
                                />
                            </Form.Item>

                            <Form.Item
                                name="reminderTime"
                                label="Reminder Time"
                                rules={[{ required: form.getFieldValue('enableReminders'), message: 'Please enter reminder time' }]}
                            >
                                <InputNumber
                                    min={15}
                                    max={1440}
                                    step={15}
                                    addonAfter="minutes before"
                                    style={{ width: '100%' }}
                                    disabled={!form.getFieldValue('enableReminders')}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Additional Settings */}
                    <Divider orientation="left">Additional Settings</Divider>

                    <Form.Item
                        name="cancellationPolicy"
                        label="Cancellation Policy"
                        rules={[{ required: true, message: 'Please enter cancellation policy' }]}
                    >
                        <TextArea
                            rows={3}
                            placeholder="Enter your cancellation policy for clients..."
                            maxLength={500}
                            showCount
                        />
                    </Form.Item>

                    {/* Configuration Summary */}
                    <Divider orientation="left">Configuration Summary</Divider>

                    <Card size="small" style={{ background: '#fafafa' }}>
                        <Row gutter={[16, 8]}>
                            <Col span={6}>
                                <strong>Appointment Duration:</strong>
                                <div>{form.getFieldValue('appointmentDuration')} minutes</div>
                            </Col>
                            <Col span={6}>
                                <strong>Buffer Time:</strong>
                                <div>{form.getFieldValue('bufferTime')} minutes</div>
                            </Col>
                            <Col span={6}>
                                <strong>Max Appointments:</strong>
                                <div>{form.getFieldValue('maxAppointmentsPerDay')}/day</div>
                            </Col>
                            <Col span={6}>
                                <strong>Working Hours:</strong>
                                <div>
                                    {form.getFieldValue('workingHoursStart')?.format('HH:mm')} - {form.getFieldValue('workingHoursEnd')?.format('HH:mm')}
                                </div>
                            </Col>
                            <Col span={6}>
                                <strong>Same-Day Booking:</strong>
                                <div>
                                    <Tag color={form.getFieldValue('allowSameDayBooking') ? 'green' : 'red'}>
                                        {form.getFieldValue('allowSameDayBooking') ? 'Allowed' : 'Not Allowed'}
                                    </Tag>
                                </div>
                            </Col>
                            <Col span={6}>
                                <strong>Advance Booking:</strong>
                                <div>{form.getFieldValue('advanceBookingDays')} days</div>
                            </Col>
                            <Col span={6}>
                                <strong>Min Notice:</strong>
                                <div>{form.getFieldValue('minNoticeHours')} hours</div>
                            </Col>
                            <Col span={6}>
                                <strong>Auto-Confirm:</strong>
                                <div>
                                    <Tag color={form.getFieldValue('autoConfirmAppointments') ? 'green' : 'orange'}>
                                        {form.getFieldValue('autoConfirmAppointments') ? 'Yes' : 'No'}
                                    </Tag>
                                </div>
                            </Col>
                        </Row>
                    </Card>
                </Form>
            </Card>
        </div>
    );
};

export default AgentScheduleConfig;