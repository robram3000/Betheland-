import React from 'react';
import { Row, Col, Typography, Space } from 'antd';

const { Title, Paragraph } = Typography;

const PartnershipSection = () => {
    const partners = [
        {
            name: 'Ayala Land',
            logo: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=100&h=60&fit=crop',
            category: 'Premium Developer'
        },
        {
            name: 'SM Development',
            logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=60&fit=crop',
            category: 'Mixed-Use Specialist'
        },
        {
            name: 'Megaworld',
            logo: 'https://images.unsplash.com/photo-1503387769-00f4bba5f074?w=100&h=60&fit=crop',
            category: 'Township Developer'
        },
        {
            name: 'Robinsons Land',
            logo: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=100&h=60&fit=crop',
            category: 'Diversified Properties'
        },
        {
            name: 'Vista Land',
            logo: 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=100&h=60&fit=crop',
            category: 'Affordable Housing'
        },
        {
            name: 'Filinvest',
            logo: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=100&h=60&fit=crop',
            category: 'Sustainable Communities'
        },
        {
            name: 'Rockwell',
            logo: 'https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=100&h=60&fit=crop',
            category: 'Luxury Residential'
        },
        {
            name: 'Century Properties',
            logo: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=100&h=60&fit=crop',
            category: 'Innovative Design'
        }
    ];

    // Duplicate partners for seamless loop
    const duplicatedPartners = [...partners, ...partners];

    return (
        <section style={{
            padding: '20px 10px',
            backgroundColor: '#ffffff',
            overflow: 'hidden'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center', marginBottom: '3rem' }}>
                    <Title level={2} style={{ color: '#001529', fontSize: '2.5rem' }}>
                        Our Trusted Partners
                    </Title>
                    <Paragraph style={{
                        fontSize: '1.1rem',
                        color: '#666',
                        maxWidth: '600px',
                        margin: '0 auto'
                    }}>
                        Collaborating with the Philippines' leading real estate developers and brokers to bring you the best properties.
                    </Paragraph>
                </Space>

                {/* First Row - Moving Right */}
                <div style={{
                    marginBottom: '2rem',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    {/* Left blur gradient */}
                    <div style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '100px',
                        background: 'linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
                        zIndex: 2
                    }} />

                    {/* Right blur gradient */}
                    <div style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: '100px',
                        background: 'linear-gradient(270deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
                        zIndex: 2
                    }} />

                    <div style={{
                        display: 'flex',
                        animation: 'marqueeRight 30s linear infinite',
                        gap: '4rem'
                    }}>
                        {duplicatedPartners.map((partner, index) => (
                            <div key={`row1-${index}`} style={{
                                flex: '0 0 auto',
                                textAlign: 'center',
                                minWidth: '150px'
                            }}>
                                <img
                                    src={partner.logo}
                                    alt={partner.name}
                                    style={{
                                        width: '100px',
                                        height: '60px',
                                        objectFit: 'cover',
                                        borderRadius: '8px',
                                        marginBottom: '8px',
                                        filter: 'grayscale(30%)',
                                        transition: 'filter 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => e.target.style.filter = 'grayscale(0%)'}
                                    onMouseLeave={(e) => e.target.style.filter = 'grayscale(30%)'}
                                />
                                <div>
                                    <div style={{
                                        fontWeight: '600',
                                        color: '#001529',
                                        fontSize: '14px'
                                    }}>
                                        {partner.name}
                                    </div>
                                    <div style={{
                                        color: '#666',
                                        fontSize: '12px'
                                    }}>
                                        {partner.category}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Second Row - Moving Left */}
                <div style={{
                    marginBottom: '2rem',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    {/* Left blur gradient */}
                    <div style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '100px',
                        background: 'linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
                        zIndex: 2
                    }} />

                    {/* Right blur gradient */}
                    <div style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: '100px',
                        background: 'linear-gradient(270deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
                        zIndex: 2
                    }} />

                    <div style={{
                        display: 'flex',
                        animation: 'marqueeLeft 25s linear infinite',
                        gap: '4rem'
                    }}>
                        {duplicatedPartners.map((partner, index) => (
                            <div key={`row2-${index}`} style={{
                                flex: '0 0 auto',
                                textAlign: 'center',
                                minWidth: '150px'
                            }}>
                                <img
                                    src={partner.logo}
                                    alt={partner.name}
                                    style={{
                                        width: '100px',
                                        height: '60px',
                                        objectFit: 'cover',
                                        borderRadius: '8px',
                                        marginBottom: '8px',
                                        filter: 'grayscale(30%)',
                                        transition: 'filter 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => e.target.style.filter = 'grayscale(0%)'}
                                    onMouseLeave={(e) => e.target.style.filter = 'grayscale(30%)'}
                                />
                                <div>
                                    <div style={{
                                        fontWeight: '600',
                                        color: '#001529',
                                        fontSize: '14px'
                                    }}>
                                        {partner.name}
                                    </div>
                                    <div style={{
                                        color: '#666',
                                        fontSize: '12px'
                                    }}>
                                        {partner.category}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Third Row - Moving Right */}
                <div style={{
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    {/* Left blur gradient */}
                    <div style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '100px',
                        background: 'linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
                        zIndex: 2
                    }} />

                    {/* Right blur gradient */}
                    <div style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: '100px',
                        background: 'linear-gradient(270deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
                        zIndex: 2
                    }} />

                    <div style={{
                        display: 'flex',
                        animation: 'marqueeRight 35s linear infinite',
                        gap: '4rem'
                    }}>
                        {duplicatedPartners.map((partner, index) => (
                            <div key={`row3-${index}`} style={{
                                flex: '0 0 auto',
                                textAlign: 'center',
                                minWidth: '150px'
                            }}>
                                <img
                                    src={partner.logo}
                                    alt={partner.name}
                                    style={{
                                        width: '100px',
                                        height: '60px',
                                        objectFit: 'cover',
                                        borderRadius: '8px',
                                        marginBottom: '8px',
                                        filter: 'grayscale(30%)',
                                        transition: 'filter 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => e.target.style.filter = 'grayscale(0%)'}
                                    onMouseLeave={(e) => e.target.style.filter = 'grayscale(30%)'}
                                />
                                <div>
                                    <div style={{
                                        fontWeight: '600',
                                        color: '#001529',
                                        fontSize: '14px'
                                    }}>
                                        {partner.name}
                                    </div>
                                    <div style={{
                                        color: '#666',
                                        fontSize: '12px'
                                    }}>
                                        {partner.category}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <style>
                    {`
                    @keyframes marqueeRight {
                        0% {
                            transform: translateX(0);
                        }
                        100% {
                            transform: translateX(-50%);
                        }
                    }

                    @keyframes marqueeLeft {
                        0% {
                            transform: translateX(-50%);
                        }
                        100% {
                            transform: translateX(0);
                        }
                    }

                    /* Pause animation on hover */
                    div:hover > div {
                        animation-play-state: paused;
                    }
                    `}
                </style>
            </div>
        </section>
    );
};

export default PartnershipSection;