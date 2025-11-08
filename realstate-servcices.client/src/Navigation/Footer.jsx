import React from 'react';
import { Row, Col, Typography, Space } from 'antd';
import {
    FacebookOutlined,
    TwitterOutlined,
    InstagramOutlined,
    LinkedinOutlined,
    YoutubeOutlined,
    MailOutlined,
    PhoneOutlined,
    EnvironmentOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

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
        { icon: <TwitterOutlined />, href: '#', color: '#1DA1F2' },
        { icon: <InstagramOutlined />, href: '#', color: '#E4405F' },
        { icon: <LinkedinOutlined />, href: '#', color: '#0A66C2' },
        { icon: <YoutubeOutlined />, href: '#', color: '#FF0000' }
    ];

    return (
        <footer style={{ background: 'white', color: '#333' }}>
            {/* Top Row - Social Media & Navigation */}
            <div style={{
                background: '#F5F5F5',
                padding: '16px 24px',
                borderBottom: '1px solid #e8e8e8'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <Row justify="space-between" align="middle">
                        {/* Social Media Icons & Copyright */}
                        <Col>
                            <Space size="middle">
                                {/* Social Media Icons */}
                                {socialLinks.map((social, index) => (
                                    <a
                                        key={index}
                                        href={social.href}
                                        style={{
                                            color: '#666666',
                                            fontSize: '18px',
                                            transition: 'color 0.3s'
                                        }}
                                        onMouseEnter={(e) => e.target.style.color = social.color}
                                        onMouseLeave={(e) => e.target.style.color = '#666666'}
                                    >
                                        {social.icon}
                                    </a>
                                ))}
                                {/* Copyright Text */}
                                <Text style={{
                                    color: '#666666',
                                    marginLeft: '16px',
                                    fontSize: '14px'
                                }}>
                                    © {currentYear} Betheland. All rights reserved.
                                </Text>
                            </Space>
                        </Col>

                        {/* Navigation Links */}
                        <Col>
                            <Space size="middle">
                                <a
                                    href="/contact"
                                    style={{
                                        color: '#666666',
                                        textDecoration: 'none',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        transition: 'color 0.3s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.color = '#1890ff'}
                                    onMouseLeave={(e) => e.target.style.color = '#666666'}
                                >
                                    Contact Us
                                </a>
                                <a
                                    href="/about"
                                    style={{
                                        color: '#666666',
                                        textDecoration: 'none',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        transition: 'color 0.3s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.color = '#1890ff'}
                                    onMouseLeave={(e) => e.target.style.color = '#666666'}
                                >
                                    About Us
                                </a>
                                <a
                                    href="/privacy"
                                    style={{
                                        color: '#666666',
                                        textDecoration: 'none',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        transition: 'color 0.3s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.color = '#1890ff'}
                                    onMouseLeave={(e) => e.target.style.color = '#666666'}
                                >
                                    Privacy Policy
                                </a>
                                <a
                                    href="/terms"
                                    style={{
                                        color: '#666666',
                                        textDecoration: 'none',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        transition: 'color 0.3s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.color = '#1890ff'}
                                    onMouseLeave={(e) => e.target.style.color = '#666666'}
                                >
                                    Terms of Service
                                </a>
                                <a
                                    href="/sitemap"
                                    style={{
                                        color: '#666666',
                                        textDecoration: 'none',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        transition: 'color 0.3s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.color = '#1890ff'}
                                    onMouseLeave={(e) => e.target.style.color = '#666666'}
                                >
                                    Sitemap
                                </a>
                            </Space>
                        </Col>
                    </Row>
                </div>
            </div>

            {/* Main Footer Content */}
            <div style={{ padding: '20px 25px 15px' }}>
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
                                        color: '#001529',
                                        margin: 0,
                                        fontSize: '24px',
                                        fontWeight: 'bold',
                                        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                                        lineHeight: '1.2'
                                    }}>
                                        Real Estate Services
                                    </Title>
                                    <Paragraph style={{
                                        color: 'rgba(0, 0, 0, 0.8)',
                                        lineHeight: '1.6',
                                        margin: '4px 0 0 0',
                                        fontSize: '14px',
                                        fontWeight: 'normal'
                                    }}>
                                        Your trusted partner in property solutions
                                    </Paragraph>
                                </div>

                                {/* Contact Info */}
                                <Space direction="vertical" size="small" style={{ marginTop: '16px' }}>
                                    <Space>
                                        <PhoneOutlined style={{ color: '#1890ff' }} />
                                        <Text style={{ color: 'rgba(0, 0, 0, 0.8)' }}>
                                            0977-849-1888 / 0917-791-1981
                                        </Text>
                                    </Space>
                                    <Space>
                                        <MailOutlined style={{ color: '#1890ff' }} />
                                        <Text style={{ color: 'rgba(0, 0, 0, 0.8)' }}>
                                            allanlao@betheland.com.ph
                                        </Text>
                                    </Space>
                                    <Space>
                                        <EnvironmentOutlined style={{ color: '#1890ff' }} />
                                        <Text style={{ color: 'rgba(0, 0, 0, 0.8)' }}>
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
                                    <Title level={4} style={{ color: '#001529', margin: 0, fontSize: '16px' }}>
                                        {section.title}
                                    </Title>
                                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                        {section.links.map((link, linkIndex) => (
                                            <a
                                                key={linkIndex}
                                                href={link.href}
                                                style={{
                                                    color: 'rgba(0, 0, 0, 0.7)',
                                                    textDecoration: 'none',
                                                    transition: 'color 0.3s',
                                                    display: 'block'
                                                }}
                                                onMouseEnter={(e) => e.target.style.color = '#1890ff'}
                                                onMouseLeave={(e) => e.target.style.color = 'rgba(0, 0, 0, 0.7)'}
                                            >
                                                {link.label}
                                            </a>
                                        ))}
                                    </Space>
                                </Space>
                            </Col>
                        ))}

                        {/* Empty column for layout balance */}
                        <Col xs={24} md={12} lg={6}>
                            {/* This column is now empty but maintains layout structure */}
                        </Col>
                    </Row>
                </div>
            </div>
        </footer>
    );
};

export default Footer;