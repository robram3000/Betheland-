import React from 'react';
import { Card, Form, Input, Button, Switch, Select, Divider } from 'antd';
import { UserOutlined, BellOutlined, SecurityScanOutlined } from '@ant-design/icons';

const { Option } = Select;

const SettingsPage = () => {
    const [form] = Form.useForm();

    const onFinish = (values) => {
        console.log('Settings values:', values);
        // Handle settings submission
    };

    return (
        <div style={{
            padding: '24px',
            maxWidth: '800px',
            margin: '0 auto'
        }}>
            <Card
                title={
                    <span style={{ color: '#1B3C53' }}>
                        <UserOutlined style={{ marginRight: '8px' }} />
                        Account Settings
                    </span>
                }
                bordered={false}
                style={{
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    borderRadius: '12px'
                }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{
                        notifications: true,
                        language: 'en',
                        theme: 'light'
                    }}
                >
                    <Divider orientation="left">Profile Information</Divider>

                    <Form.Item
                        label="Display Name"
                        name="displayName"
                        rules={[{ required: true, message: 'Please input your display name!' }]}
                    >
                        <Input placeholder="Enter your display name" />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[{ required: true, type: 'email', message: 'Please input a valid email!' }]}
                    >
                        <Input placeholder="Enter your email" />
                    </Form.Item>

                    <Divider orientation="left">
                        <BellOutlined style={{ marginRight: '8px' }} />
                        Notification Preferences
                    </Divider>

                    <Form.Item
                        label="Enable Notifications"
                        name="notifications"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>

                    <Form.Item
                        label="Language"
                        name="language"
                    >
                        <Select>
                            <Option value="en">English</Option>
                            <Option value="es">Español</Option>
                            <Option value="fr">Français</Option>
                        </Select>
                    </Form.Item>

                    <Divider orientation="left">
                        <SecurityScanOutlined style={{ marginRight: '8px' }} />
                        Security
                    </Divider>

                    <Form.Item
                        label="Theme"
                        name="theme"
                    >
                        <Select>
                            <Option value="light">Light</Option>
                            <Option value="dark">Dark</Option>
                            <Option value="auto">Auto</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            style={{
                                backgroundColor: '#1B3C53',
                                borderColor: '#1B3C53'
                            }}
                        >
                            Save Settings
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default SettingsPage;