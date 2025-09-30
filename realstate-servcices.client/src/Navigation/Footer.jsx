import React from 'react';
import { Row, Col, Typography, Input, Button, Space, Divider } from 'antd';
import {
    FacebookOutlined,
    TwitterOutlined,
    InstagramOutlined,
    LinkedinOutlined,
    YoutubeOutlined,
    MailOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    ArrowRightOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerSections = [
        {
            title: 'Company',
            links: [
                { label: 'About Us', href: '/about' },
                { label: 'Our Team', href: '/team' },
                { label: 'Careers', href: '/careers' },
                { label: 'Press', href: '/press' },
                { label: 'Blog', href: '/blog' }
            ]
        },
        {
            title: 'Properties',
            links: [
                { label: 'Residential', href: '/properties/residential' },
                { label: 'Commercial', href: '/properties/commercial' },
                { label: 'Luxury Homes', href: '/properties/luxury' },
                { label: 'Apartments', href: '/properties/apartments' },
                { label: 'Vacation Rentals', href: '/properties/vacation' }
            ]
        },
        {
            title: 'Support',
            links: [
                { label: 'Help Center', href: '/help' },
                { label: 'Contact Us', href: '/contact' },
                { label: 'FAQ', href: '/faq' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' }
            ]
        },
        {
            title: 'Cities',
            links: [
                { label: 'New York', href: '/cities/new-york' },
                { label: 'Los Angeles', href: '/cities/los-angeles' },
                { label: 'Chicago', href: '/cities/chicago' },
                { label: 'Miami', href: '/cities/miami' },
                { label: 'View All Cities', href: '/cities' }
            ]
        }
    ];

    const socialLinks = [
        { icon: <FacebookOutlined />, href: '#', color: '#1877F2' },
        { icon: <TwitterOutlined />, href: '#', color: '#1DA1F2' },
        { icon: <InstagramOutlined />, href: '#', color: '#E4405F' },
        { icon: <LinkedinOutlined />, href: '#', color: '#0A66C2' },
        { icon: <YoutubeOutlined />, href: '#', color: '#FF0000' }
    ];

    return (
        <footer style={{ background: '#001529', color: 'white' }}>
            {/* Main Footer Content */}
            <div style={{ padding: '80px 24px 40px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <Row gutter={[48, 32]}>
                        {/* Company Info */}
                        <Col xs={24} lg={6}>
                            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                <Title level={3} style={{ color: 'white', margin: 0 }}>
                                    Betheland
                                </Title>
                                <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.6' }}>
                                    Your trusted partner in finding the perfect property.
                                    We connect dreams with addresses across the nation.
                                </Paragraph>

                                {/* Contact Info */}
                                <Space direction="vertical" size="small">
                                    <Space>
                                        <PhoneOutlined style={{ color: '#1890ff' }} />
                                        <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                            +1 (555) 123-4567
                                        </Text>
                                    </Space>
                                    <Space>
                                        <MailOutlined style={{ color: '#1890ff' }} />
                                        <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                            info@betheland.com
                                        </Text>
                                    </Space>
                                    <Space>
                                        <EnvironmentOutlined style={{ color: '#1890ff' }} />
                                        <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                            123 Business Ave, Suite 100<br />
                                            New York, NY 10001
                                        </Text>
                                    </Space>
                                </Space>
                            </Space>
                        </Col>

                        {/* Footer Links */}
                        {footerSections.map((section, index) => (
                            <Col xs={12} md={6} lg={4} key={index}>
                                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                    <Title level={4} style={{ color: 'white', margin: 0, fontSize: '16px' }}>
                                        {section.title}
                                    </Title>
                                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                        {section.links.map((link, linkIndex) => (
                                            <a
                                                key={linkIndex}
                                                href={link.href}
                                                style={{
                                                    color: 'rgba(255, 255, 255, 0.7)',
                                                    textDecoration: 'none',
                                                    transition: 'color 0.3s',
                                                    display: 'block'
                                                }}
                                                onMouseEnter={(e) => e.target.style.color = '#1890ff'}
                                                onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.7)'}
                                            >
                                                {link.label}
                                            </a>
                                        ))}
                                    </Space>
                                </Space>
                            </Col>
                        ))}

                        {/* Newsletter Subscription */}
                        <Col xs={24} md={12} lg={6}>
                            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                <Title level={4} style={{ color: 'white', margin: 0, fontSize: '16px' }}>
                                    Newsletter
                                </Title>
                                <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                    Subscribe to get updates on new properties and exclusive offers.
                                </Paragraph>

                                <Space.Compact style={{ width: '100%' }}>
                                    <Input
                                        placeholder="Enter your email"
                                        size="large"
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            color: 'white'
                                        }}
                                    />
                                    <Button
                                        type="primary"
                                        size="large"
                                        icon={<ArrowRightOutlined />}
                                        style={{
                                            background: '#1890ff',
                                            borderColor: '#1890ff'
                                        }}
                                    />
                                </Space.Compact>

                                {/* Social Media Links */}
                                <Space direction="vertical" size="middle" style={{ width: '100%', marginTop: '1rem' }}>
                                    <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Follow Us:</Text>
                                    <Space size="middle">
                                        {socialLinks.map((social, index) => (
                                            <a
                                                key={index}
                                                href={social.href}
                                                style={{
                                                    color: 'rgba(255, 255, 255, 0.7)',
                                                    fontSize: '20px',
                                                    transition: 'color 0.3s'
                                                }}
                                                onMouseEnter={(e) => e.target.style.color = social.color}
                                                onMouseLeave={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.7)'}
                                            >
                                                {social.icon}
                                            </a>
                                        ))}
                                    </Space>
                                </Space>
                            </Space>
                        </Col>
                    </Row>

                    <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.2)', margin: '40px 0' }} />

                    {/* Bottom Footer */}
                    <Row justify="space-between" align="middle">
                        <Col>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                © {currentYear} Betheland. All rights reserved.
                            </Text>
                        </Col>
                        <Col>
                            <Space size="middle">
                                <a
                                    href="/privacy"
                                    style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none' }}
                                >
                                    Privacy Policy
                                </a>
                                <a
                                    href="/terms"
                                    style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none' }}
                                >
                                    Terms of Service
                                </a>
                                <a
                                    href="/sitemap"
                                    style={{ color: 'rgba(255, 255, 255, 0.7)', textDecoration: 'none' }}
                                >
                                    Sitemap
                                </a>
                            </Space>
                        </Col>
                    </Row>
                </div>
            </div>
        </footer>
    );
};

export default Footer;