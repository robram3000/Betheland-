// AgentScheduleConfig.jsx
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
    Input,
    Spin,
    Result
} from 'antd';
import {
    SaveOutlined,
    ReloadOutlined,
    InfoCircleOutlined,
    ClockCircleOutlined,
    CalendarOutlined,
    SettingOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { agentScheduleConfigService } from '../../AdminPortal/appointment/Services/index.js';
import authService from '../../../Authpage/Services/LoginAuth';
import agentService from '../../AdminPortal/Creation_Agent/Services/AgentService';

const { Option } = Select;

const AgentScheduleConfig = () => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState(null);
    const [form] = Form.useForm();
    const [error, setError] = useState(null);
    const [currentAgentId, setCurrentAgentId] = useState(null);

    // Default config aligned with backend DTO
    const defaultConfig = {
        slotDurationMinutes: 60,
        bufferTimeMinutes: 15,
        maxSchedulesPerDay: 8,
        workDayStart: '09:00:00',
        workDayEnd: '17:00:00',
        allowWeekendScheduling: false,
        advanceBookingDays: 30
    };

    // Helper function to get the actual agent ID from base member ID
    const getCurrentAgentId = async () => {
        try {
            const currentUser = authService.getCurrentUser();
            const baseMemberId = currentUser?.userId;

            if (!baseMemberId) {
                throw new Error('Unable to determine user ID. Please log in again.');
            }

            // Get the agent by base member ID to get the actual agent ID
            const agent = await agentService.getAgentByBaseMemberId(baseMemberId);

            if (!agent || !agent.id) {
                throw new Error('Agent profile not found. Please complete your agent profile first.');
            }

            return agent.id;
        } catch (error) {
            console.error('Error getting current agent ID:', error);
            throw new Error('Failed to retrieve agent information: ' + error.message);
        }
    };

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        setLoading(true);
        setError(null);
        try {
            const agentId = await getCurrentAgentId();
            setCurrentAgentId(agentId);

            console.log('Loading config for agent ID:', agentId);

            // Using the service instance
            const configData = await agentScheduleConfigService.getConfigByAgent(agentId);

            console.log('Loaded config data:', configData);
            setConfig(configData);

            // Convert backend TimeSpan to moment objects for TimePicker
            form.setFieldsValue({
                ...configData,
                workDayStart: moment(configData.workDayStart, 'HH:mm:ss'),
                workDayEnd: moment(configData.workDayEnd, 'HH:mm:ss')
            });

        } catch (error) {
            console.error('Error loading schedule config:', error);

            if (error.message && error.message.includes('not found')) {
                // Config doesn't exist yet, use defaults
                console.log('No config found, using defaults');
                form.setFieldsValue({
                    ...defaultConfig,
                    workDayStart: moment(defaultConfig.workDayStart, 'HH:mm:ss'),
                    workDayEnd: moment(defaultConfig.workDayEnd, 'HH:mm:ss')
                });
            } else {
                const errorMessage = error.message || error.details || 'Failed to load schedule configuration';
                setError(errorMessage);
                message.error(errorMessage);

                // Set defaults on error
                form.setFieldsValue({
                    ...defaultConfig,
                    workDayStart: moment(defaultConfig.workDayStart, 'HH:mm:ss'),
                    workDayEnd: moment(defaultConfig.workDayEnd, 'HH:mm:ss')
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (values) => {
        setSaving(true);
        setError(null);
        try {
            // Get the actual agent ID for submission
            let agentId = currentAgentId;
            if (!agentId) {
                agentId = await getCurrentAgentId();
                setCurrentAgentId(agentId);
            }

            if (!agentId) {
                message.error('Unable to determine agent ID. Please log in again.');
                setSaving(false);
                return;
            }

            console.log('Saving config for agent ID:', agentId);

            // Prepare data according to backend DTO structure with proper TimeSpan format
            const configData = {
                agentId: parseInt(agentId), // Use the actual agent ID
                slotDurationMinutes: values.slotDurationMinutes || defaultConfig.slotDurationMinutes,
                bufferTimeMinutes: values.bufferTimeMinutes || defaultConfig.bufferTimeMinutes,
                maxSchedulesPerDay: values.maxSchedulesPerDay || defaultConfig.maxSchedulesPerDay,
                workDayStart: values.workDayStart ? values.workDayStart.format('HH:mm:ss') : defaultConfig.workDayStart,
                workDayEnd: values.workDayEnd ? values.workDayEnd.format('HH:mm:ss') : defaultConfig.workDayEnd,
                allowWeekendScheduling: values.allowWeekendScheduling !== undefined ? values.allowWeekendScheduling : defaultConfig.allowWeekendScheduling,
                advanceBookingDays: values.advanceBookingDays || defaultConfig.advanceBookingDays
            };

            console.log('Sending config data:', configData);

            let result;
            if (config && config.id) {
                console.log('Updating existing config with ID:', config.id);
                result = await agentScheduleConfigService.updateConfig(config.id, configData);
            } else {
                console.log('Creating new config');
                result = await agentScheduleConfigService.createConfig(configData);
            }

            setConfig(result);
            message.success('Schedule configuration saved successfully');

            // Reload the config to get the updated data from server
            await loadConfig();

        } catch (error) {
            console.error('Error saving schedule config:', error);
            const errorMessage = error.message || error.details || 'Failed to save schedule configuration';
            message.error(errorMessage);
            setError(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    const handleResetToDefaults = async () => {
        setSaving(true);
        try {
            // Get the actual agent ID for submission
            let agentId = currentAgentId;
            if (!agentId) {
                agentId = await getCurrentAgentId();
                setCurrentAgentId(agentId);
            }

            if (!agentId) {
                message.error('Unable to determine agent ID. Please log in again.');
                return;
            }

            console.log('Setting default working hours for agent:', agentId);

            // Use the service method to set default working hours
            const result = await agentScheduleConfigService.setDefaultWorkingHours(agentId);

            setConfig(result);

            // Update form with new values
            form.setFieldsValue({
                ...result,
                workDayStart: moment(result.workDayStart, 'HH:mm:ss'),
                workDayEnd: moment(result.workDayEnd, 'HH:mm:ss')
            });

            message.success('Default working hours applied successfully');

        } catch (error) {
            console.error('Error setting default working hours:', error);
            const errorMessage = error.message || error.details || 'Failed to set default working hours';
            message.error(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    const handleFormReset = () => {
        if (config) {
            // Reset to current config values
            form.setFieldsValue({
                ...config,
                workDayStart: moment(config.workDayStart, 'HH:mm:ss'),
                workDayEnd: moment(config.workDayEnd, 'HH:mm:ss')
            });
        } else {
            // Reset to defaults
            form.setFieldsValue({
                ...defaultConfig,
                workDayStart: moment(defaultConfig.workDayStart, 'HH:mm:ss'),
                workDayEnd: moment(defaultConfig.workDayEnd, 'HH:mm:ss')
            });
        }
        message.info('Form reset to current values');
    };

    const calculateTotalWorkingHours = () => {
        const start = form.getFieldValue('workDayStart');
        const end = form.getFieldValue('workDayEnd');
        if (start && end) {
            const duration = moment.duration(end.diff(start));
            return duration.asHours();
        }
        return 0;
    };

    const ErrorIndicator = ({ message, onRetry }) => (
        <Result
            status="error"
            title="Failed to Load Schedule Configuration"
            subTitle={message}
            extra={[
                <Button
                    type="primary"
                    key="retry"
                    icon={<ReloadOutlined />}
                    onClick={onRetry}
                >
                    Try Again
                </Button>
            ]}
        />
    );

    const LoadingIndicator = () => (
        <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>Loading schedule configuration...</div>
        </div>
    );

    return (
        <div>
            <Alert
                message="Schedule Configuration"
                description="Configure your appointment preferences, working hours, and booking rules. These settings will affect how clients can book appointments with you."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
            />

            {error && (
                <Alert
                    message="Configuration Error"
                    description={error}
                    type="error"
                    showIcon
                    action={
                        <Button
                            size="small"
                            type="primary"
                            ghost
                            onClick={loadConfig}
                            icon={<ReloadOutlined />}
                            loading={loading}
                        >
                            Retry
                        </Button>
                    }
                    style={{ marginBottom: 16 }}
                />
            )}

            {loading ? (
                <LoadingIndicator />
            ) : error ? (
                <ErrorIndicator message={error} onRetry={loadConfig} />
            ) : (
                <Card
                    title={
                        <Space>
                            <SettingOutlined />
                            Schedule Settings
                            {config && (
                                <Tag color="blue" style={{ marginLeft: 8 }}>
                                    {config.id ? 'Active' : 'New'}
                                </Tag>
                            )}
                        </Space>
                    }
                    extra={
                        <Space>
                        
                            <Button
                                icon={<ClockCircleOutlined />}
                                onClick={handleResetToDefaults}
                                disabled={saving || loading}
                            >
                                Set Default Hours
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
                            workDayStart: moment(defaultConfig.workDayStart, 'HH:mm:ss'),
                            workDayEnd: moment(defaultConfig.workDayEnd, 'HH:mm:ss')
                        }}
                        disabled={loading}
                    >
                        <Divider orientation="left">
                            <Space>
                                <CalendarOutlined />
                                Appointment Settings
                            </Space>
                        </Divider>

                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item
                                    name="slotDurationMinutes"
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
                                    name="bufferTimeMinutes"
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
                                    name="maxSchedulesPerDay"
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
                                    name="workDayStart"
                                    label="Start Time"
                                    rules={[{ required: true, message: 'Please select start time' }]}
                                >
                                    <TimePicker
                                        format="HH:mm"
                                        style={{ width: '100%' }}
                                        placeholder="Start time"
                                        onChange={() => form.validateFields(['workDayEnd'])}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="workDayEnd"
                                    label="End Time"
                                    rules={[
                                        { required: true, message: 'Please select end time' },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                const start = getFieldValue('workDayStart');
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
                        </Row>

                        <Divider orientation="left">Features & Preferences</Divider>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="allowWeekendScheduling"
                                    label="Allow Weekend Scheduling"
                                    valuePropName="checked"
                                >
                                    <Switch
                                        checkedChildren="Enabled"
                                        unCheckedChildren="Disabled"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Divider orientation="left">Configuration Summary</Divider>

                        <Card size="small" style={{ background: '#fafafa' }}>
                            <Row gutter={[16, 8]}>
                                <Col span={6}>
                                    <strong>Appointment Duration:</strong>
                                    <div>{form.getFieldValue('slotDurationMinutes')} minutes</div>
                                </Col>
                                <Col span={6}>
                                    <strong>Buffer Time:</strong>
                                    <div>{form.getFieldValue('bufferTimeMinutes')} minutes</div>
                                </Col>
                                <Col span={6}>
                                    <strong>Max Appointments:</strong>
                                    <div>{form.getFieldValue('maxSchedulesPerDay')}/day</div>
                                </Col>
                                <Col span={6}>
                                    <strong>Working Hours:</strong>
                                    <div>
                                        {form.getFieldValue('workDayStart')?.format('HH:mm')} - {form.getFieldValue('workDayEnd')?.format('HH:mm')}
                                    </div>
                                </Col>
                                <Col span={6}>
                                    <strong>Weekend Booking:</strong>
                                    <div>
                                        <Tag color={form.getFieldValue('allowWeekendScheduling') ? 'green' : 'red'}>
                                            {form.getFieldValue('allowWeekendScheduling') ? 'Allowed' : 'Not Allowed'}
                                        </Tag>
                                    </div>
                                </Col>
                                <Col span={6}>
                                    <strong>Advance Booking:</strong>
                                    <div>{form.getFieldValue('advanceBookingDays')} days</div>
                                </Col>
                            </Row>
                        </Card>

                        <Form.Item style={{ textAlign: 'center', marginTop: 24 }}>
                            <Space>
                                <Button
                                    size="large"
                                    onClick={handleFormReset}
                                    disabled={saving}
                                >
                                    Reset Form
                                </Button>
                                <Button
                                    size="large"
                                    onClick={handleResetToDefaults}
                                    disabled={saving}
                                    icon={<ClockCircleOutlined />}
                                >
                                    Set Default Hours
                                </Button>
                                <Button
                                    type="primary"
                                    size="large"
                                    htmlType="submit"
                                    loading={saving}
                                    icon={<SaveOutlined />}
                                >
                                    Save Configuration
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Card>
            )}
        </div>
    );
};

export default AgentScheduleConfig;