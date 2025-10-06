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
                { label: 'Magdalena Laguna', href: '/cities/new-york' },

                { label: 'View All Cities', href: '/cities' }
            ]
        }
    ];

    const socialLinks = [
        { icon: <FacebookOutlined />, href: '#', color: '#1877F2' },
        { icon: <LinkedinOutlined />, href: '#', color: '#0A66C2' },
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
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start'
                                }}>
                                    <Title level={3} style={{
                                        color: 'white',
                                        margin: 0,
                                        fontSize: '24px',
                                        fontWeight: 'bold',
                                        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                                        lineHeight: '1.2'
                                    }}>
                                        BETHELAND
                                    </Title>
                                    <Paragraph style={{
                                        color: 'rgba(255, 255, 255, 0.8)',
                                        lineHeight: '1.6',
                                        margin: '4px 0 0 0',
                                        fontSize: '14px',
                                        fontWeight: 'normal'
                                    }}>
                                        Real Estate Services
                                    </Paragraph>
                                </div>

                                {/* Contact Info */}
                                <Space direction="vertical" size="small" style={{ marginTop: '16px' }}>
                                    <Space>
                                        <PhoneOutlined style={{ color: '#1890ff' }} />
                                        <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                            0977-849-1888 / 0917-791-1981
                                        </Text>
                                    </Space>
                                    <Space>
                                        <MailOutlined style={{ color: '#1890ff' }} />
                                        <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                            allanlao@betheland.com.ph
                                        </Text>
                                    </Space>
                                    <Space>
                                        <EnvironmentOutlined style={{ color: '#1890ff' }} />
                                        <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                            E. Jacinto St. Poblacion,<br />
                                            Magdalena, Philippines
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