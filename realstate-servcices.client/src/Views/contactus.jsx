import React from 'react';
import { Card, Row, Col, Typography, Divider, Space } from 'antd';
import { FacebookOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined } from '@ant-design/icons';
import BaseView from './BaseView';

const { Title, Paragraph, Text, Link } = Typography;

const ContactUs = () => {
    return (
        <BaseView>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                <Title level={1} style={{ marginBottom: 50 }}>
                    Contact Us
                </Title>

                <Row gutter={[32, 32]} justify="center">
                    <Col xs={24} md={12}>
                        <Card title="Get In Touch" bordered={false}>
                            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                <div>
                                    <Title level={4}>Betheland Real Estate Services</Title>
                                    <Paragraph>
                                        We're here to help you find your dream property. Reach out to us through any of the following channels:
                                    </Paragraph>
                                </div>

                                <Divider />

                                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                    <div>
                                        <PhoneOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                                        <Text strong>Phone: </Text>
                                        <Text>(Coming Soon)</Text>
                                    </div>

                                    <div>
                                        <MailOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                                        <Text strong>Email: </Text>
                                        <Text>(Coming Soon)</Text>
                                    </div>

                                    <div>
                                        <EnvironmentOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                                        <Text strong>Address: </Text>
                                        <Text>Location details coming soon</Text>
                                    </div>

                                    <div>
                                        <FacebookOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                                        <Text strong>Facebook: </Text>
                                        <Link
                                            href="https://www.facebook.com/bethelandrealestateservices"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            @bethelandrealestateservices
                                        </Link>
                                    </div>
                                </Space>
                            </Space>
                        </Card>
                    </Col>

                    <Col xs={24} md={12}>
                        <Card title="Follow Us" bordered={false}>
                            <Paragraph>
                                Stay connected with us on social media for the latest property listings,
                                real estate tips, and market updates.
                            </Paragraph>

                            <div style={{ textAlign: 'center', marginTop: 30 }}>
                                <Link
                                    href="https://www.facebook.com/bethelandrealestateservices"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ fontSize: '16px' }}
                                >
                                    <FacebookOutlined style={{ fontSize: '24px', marginRight: 8 }} />
                                    Visit our Facebook Page
                                </Link>
                            </div>

                            <div style={{ marginTop: 30, padding: 20, background: '#f5f5f5', borderRadius: 8 }}>
                                <Text type="secondary">
                                    <strong>Note:</strong> Our contact details are being updated. Please check our Facebook page
                                    for the most current information and to send us messages directly.
                                </Text>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>
        </BaseView>
    );
};

export default ContactUs;