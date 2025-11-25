import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Space, Spin, Empty, Image } from 'antd';
import PartnershipServices from '../Employeesportal/SuperAdminPortal/Content/Services/PartnershipServices';
import PartnershipMapper from '../Employeesportal/SuperAdminPortal/Content/Services/PartnershipMapper';

const { Title, Paragraph } = Typography;

const PartnershipSection = () => {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load active partners from backend
    useEffect(() => {
        loadActivePartners();
    }, []);

    const loadActivePartners = async () => {
        try {
            setLoading(true);
            console.log('Loading active partners for partnership section...');

            const response = await PartnershipServices.getActivePartners();
            console.log('Active partners response:', response);

            let activePartners = [];

            // Handle different response formats
            if (response && response.success && Array.isArray(response.data)) {
                activePartners = PartnershipMapper.mapToPartnersList(response);
            } else if (Array.isArray(response)) {
                activePartners = PartnershipMapper.mapToPartnersList(response);
            } else if (response && response.data && Array.isArray(response.data)) {
                activePartners = PartnershipMapper.mapToPartnersList(response.data);
            } else {
                console.warn('Unexpected response format:', response);
                activePartners = [];
            }

            // Remove duplicates by ID and filter active partners
            const uniqueActivePartners = activePartners.reduce((acc, current) => {
                const existingPartner = acc.find(partner => partner.id === current.id);
                if (!existingPartner && current.isActive) {
                    acc.push(current);
                }
                return acc;
            }, []);

            // Sort by display order - FIXED SORTING
            const sortedPartners = uniqueActivePartners.sort((a, b) => {
                // Handle null/undefined displayOrder values
                const orderA = a.displayOrder || 9999;
                const orderB = b.displayOrder || 9999;
                return orderA - orderB;
            });

            console.log('Final unique active partners:', sortedPartners);
            console.log('Partner count:', sortedPartners.length);
            console.log('Partner IDs:', sortedPartners.map(p => p.id));
            console.log('Display Orders:', sortedPartners.map(p => p.displayOrder));

            setPartners(sortedPartners);

        } catch (err) {
            console.error('Error loading active partners:', err);
            setError(err.message);
            setPartners([]);
        } finally {
            setLoading(false);
        }
    };

    // If no partners or loading, show fallback or loading state
    if (loading) {
        return (
            <section style={{
                padding: '60px 20px',
                backgroundColor: '#ffffff',
                textAlign: 'center'
            }}>
                <Spin size="large" />
                <Paragraph style={{ marginTop: 16 }}>Loading our partners...</Paragraph>
            </section>
        );
    }

    if (error || partners.length === 0) {
        return (
            <section style={{
                padding: '60px 20px',
                backgroundColor: '#ffffff',
                textAlign: 'center'
            }}>
                <Empty
                    description="No partners available at the moment"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                    <Paragraph style={{ color: '#666', maxWidth: '500px', margin: '0 auto' }}>
                        We're working on building partnerships with leading real estate developers and brokers.
                    </Paragraph>
                </Empty>
            </section>
        );
    }

    return (
        <section style={{
            padding: '60px 20px',
            backgroundColor: '#ffffff',
            overflow: 'hidden'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center', marginBottom: '3rem' }}>
                    <Title level={2} style={{ color: '#001529', fontSize: '2.5rem', margin: 0 }}>
                        Our Trusted Partners
                    </Title>
                    <Paragraph style={{
                        fontSize: '1.1rem',
                        color: '#666',
                        maxWidth: '600px',
                        margin: '0 auto',
                        lineHeight: '1.6'
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
                        animation: 'marqueeRight 40s linear infinite',
                        gap: '4rem'
                    }}>
                        {partners.map((partner, index) => (
                            <div key={`row1-${partner.id}-${index}`} style={{
                                flex: '0 0 auto',
                                textAlign: 'center',
                                minWidth: '150px'
                            }}>
                                <Image
                                    src={partner.logoUrl}
                                    alt={partner.name}
                                    style={{
                                        width: '100px',
                                        height: '60px',
                                        objectFit: 'contain',
                                        borderRadius: '8px',
                                        marginBottom: '8px',
                                        filter: 'grayscale(30%)',
                                        transition: 'all 0.3s ease',
                                        backgroundColor: '#f5f5f5',
                                        padding: '8px'
                                    }}
                                    preview={false}
                                    fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjYwIiB2aWV3Qm94PSIwIDAgMTAwIDYwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0zMCAyOEMzMi4yMDkxIDI4IDM0IDI2LjIwOTEgMzQgMjRDMzQgMjEuNzkwOSAzMi4yMDkxIDIwIDMwIDIwQzI3Ljc5MDkgMjAgMjYgMjEuNzkwOSAyNiAyNEMyNiAyNi4yMDkxIDI3Ljc5MDkgMjggMzAgMjhaIiBmaWxsPSIjQ0VDRUNFIi8+CjxwYXRoIGQ9Ik00MiAzNEw0MCAzMkwzOCAzNEw0MCAzNkw0MiAzNFoiIGZpbGw9IiNDRUNFQ0UiLz4KPC9zdmc+Cg=="
                                    onMouseEnter={(e) => {
                                        e.target.style.filter = 'grayscale(0%)';
                                        e.target.style.transform = 'scale(1.05)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.filter = 'grayscale(30%)';
                                        e.target.style.transform = 'scale(1)';
                                    }}
                                />
                                <div>
                                    <div style={{
                                        fontWeight: '600',
                                        color: '#001529',
                                        fontSize: '14px',
                                        lineHeight: '1.3',
                                        marginBottom: '4px'
                                    }}>
                                        {partner.name}
                                    </div>
                                    <div style={{
                                        color: '#666',
                                        fontSize: '12px',
                                        lineHeight: '1.2'
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
                        animation: 'marqueeLeft 35s linear infinite',
                        gap: '4rem'
                    }}>
                        {partners.map((partner, index) => (
                            <div key={`row2-${partner.id}-${index}`} style={{
                                flex: '0 0 auto',
                                textAlign: 'center',
                                minWidth: '150px'
                            }}>
                                <Image
                                    src={partner.logoUrl}
                                    alt={partner.name}
                                    style={{
                                        width: '100px',
                                        height: '60px',
                                        objectFit: 'contain',
                                        borderRadius: '8px',
                                        marginBottom: '8px',
                                        filter: 'grayscale(30%)',
                                        transition: 'all 0.3s ease',
                                        backgroundColor: '#f5f5f5',
                                        padding: '8px'
                                    }}
                                    preview={false}
                                    fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjYwIiB2aWV3Qm94PSIwIDAgMTAwIDYwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0zMCAyOEMzMi4yMDkxIDI4IDM0IDI2LjIwOTEgMzQgMjRDMzQgMjEuNzkwOSAzMi4yMDkxIDIwIDMwIDIwQzI3Ljc5MDkgMjAgMjYgMjEuNzkwOSAyNiAyNEMyNiAyNi4yMDkxIDI3Ljc5MDkgMjggMzAgMjhaIiBmaWxsPSIjQ0VDRUNFIi8+CjxwYXRoIGQ9Ik00MiAzNEw0MCAzMkwzOCAzNEw0MCAzNkw0MiAzNFoiIGZpbGw9IiNDRUNFQ0UiLz4KPC9zdmc+Cg=="
                                    onMouseEnter={(e) => {
                                        e.target.style.filter = 'grayscale(0%)';
                                        e.target.style.transform = 'scale(1.05)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.filter = 'grayscale(30%)';
                                        e.target.style.transform = 'scale(1)';
                                    }}
                                />
                                <div>
                                    <div style={{
                                        fontWeight: '600',
                                        color: '#001529',
                                        fontSize: '14px',
                                        lineHeight: '1.3',
                                        marginBottom: '4px'
                                    }}>
                                        {partner.name}
                                    </div>
                                    <div style={{
                                        color: '#666',
                                        fontSize: '12px',
                                        lineHeight: '1.2'
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
                        animation: 'marqueeRight 45s linear infinite',
                        gap: '4rem'
                    }}>
                        {partners.map((partner, index) => (
                            <div key={`row3-${partner.id}-${index}`} style={{
                                flex: '0 0 auto',
                                textAlign: 'center',
                                minWidth: '150px'
                            }}>
                                <Image
                                    src={partner.logoUrl}
                                    alt={partner.name}
                                    style={{
                                        width: '100px',
                                        height: '60px',
                                        objectFit: 'contain',
                                        borderRadius: '8px',
                                        marginBottom: '8px',
                                        filter: 'grayscale(30%)',
                                        transition: 'all 0.3s ease',
                                        backgroundColor: '#f5f5f5',
                                        padding: '8px'
                                    }}
                                    preview={false}
                                    fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjYwIiB2aWV3Qm94PSIwIDAgMTAwIDYwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0zMCAyOEMzMi4yMDkxIDI4IDM0IDI2LjIwOTEgMzQgMjRDMzQgMjEuNzkwOSAzMi4yMDkxIDIwIDMwIDIwQzI3Ljc5MDkgMjAgMjYgMjEuNzkwOSAyNiAyNEMyNiAyNi4yMDkxIDI3Ljc5MDkgMjggMzAgMjhaIiBmaWxsPSIjQ0VDRUNFIi8+CjxwYXRoIGQ9Ik00MiAzNEw0MCAzMkwzOCAzNEw0MCAzNkw0MiAzNFoiIGZpbGw9IiNDRUNFQ0UiLz4KPC9zdmc+Cg=="
                                    onMouseEnter={(e) => {
                                        e.target.style.filter = 'grayscale(0%)';
                                        e.target.style.transform = 'scale(1.05)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.filter = 'grayscale(30%)';
                                        e.target.style.transform = 'scale(1)';
                                    }}
                                />
                                <div>
                                    <div style={{
                                        fontWeight: '600',
                                        color: '#001529',
                                        fontSize: '14px',
                                        lineHeight: '1.3',
                                        marginBottom: '4px'
                                    }}>
                                        {partner.name}
                                    </div>
                                    <div style={{
                                        color: '#666',
                                        fontSize: '12px',
                                        lineHeight: '1.2'
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
                    div[style*="overflow: hidden"]:hover > div[style*="animation"] {
                        animation-play-state: paused;
                    }

                    /* Responsive design */
                    @media (max-width: 768px) {
                        div[style*="minWidth: 150px"] {
                            min-width: 120px !important;
                        }
                        
                        .ant-image {
                            width: 80px !important;
                            height: 50px !important;
                        }
                        
                        div[style*="gap: 4rem"] {
                            gap: 2rem !important;
                        }
                    }

                    @media (max-width: 480px) {
                        div[style*="minWidth: 120px"] {
                            min-width: 100px !important;
                        }
                        
                        .ant-image {
                            width: 70px !important;
                            height: 45px !important;
                        }
                    }
                    `}
                </style>
            </div>
        </section>
    );
};

export default PartnershipSection;