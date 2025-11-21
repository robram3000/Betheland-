import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Spin, Alert } from 'antd';
import AnnouncementServices from '../Employeesportal/SuperAdminPortal/Content/Services/AnnouncementServices';
import AnnouncementMapper from '../Employeesportal/SuperAdminPortal/Content/Services/AnnouncementMapper';

const { Text } = Typography;

const RunningLetter = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load active announcements from API
    useEffect(() => {
        console.log('🚀 RunningLetter component mounted');
        loadActiveAnnouncements();
    }, []);

    const loadActiveAnnouncements = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('🔄 Loading active announcements for running letter...');
            const response = await AnnouncementServices.getActiveAnnouncements();
            console.log('📦 RAW API Response:', response);
            console.log('📦 Response type:', typeof response);
            console.log('📦 Is array:', Array.isArray(response));

            if (response) {
                console.log('📦 Response keys:', Object.keys(response));
                console.log('📦 Response length:', response.length);

                if (Array.isArray(response) && response.length > 0) {
                    console.log('📦 First item:', response[0]);
                    console.log('📦 First item keys:', Object.keys(response[0]));
                }
            }

            // Map the API response to frontend format
            const mappedAnnouncements = AnnouncementMapper.mapDirectArray(response);
            console.log('✅ Mapped active announcements:', mappedAnnouncements);
            console.log('✅ Mapped count:', mappedAnnouncements.length);

            if (mappedAnnouncements.length > 0) {
                console.log('✅ First mapped item:', mappedAnnouncements[0]);
            }

            // Sort by display order
            const sortedAnnouncements = AnnouncementMapper.sortAnnouncements(mappedAnnouncements);
            console.log('🔢 Sorted active announcements:', sortedAnnouncements);

            setAnnouncements(sortedAnnouncements);

        } catch (error) {
            console.error('💥 Error loading active announcements:', error);
            console.error('💥 Error details:', error.response);
            setError(error.message);
            // Fallback to empty array to prevent breaking the UI
            setAnnouncements([]);
        } finally {
            setLoading(false);
        }
    };

    // Debug current state
    console.log('📊 Current State - loading:', loading, 'error:', error, 'announcements:', announcements);
    console.log('📊 Announcements length:', announcements.length);

    // If loading and no announcements, show nothing or a minimal loader
    if (loading && announcements.length === 0) {
        console.log('🔄 Showing loading state');
        return (
            <section style={{
                background: '#001529',
                padding: '12px 0',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                textAlign: 'center'
            }}>
                <Spin size="small" style={{ color: 'white' }} />
                <Text style={{ color: 'white', marginLeft: '10px', fontSize: '12px' }}>
                    Loading announcements...
                </Text>
            </section>
        );
    }

    // If error and no announcements, show error or fallback
    if (error && announcements.length === 0) {
        console.log('❌ Showing error state:', error);
        return (
            <section style={{
                background: '#001529',
                padding: '12px 0',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                textAlign: 'center'
            }}>
                <Text style={{ color: '#ffa940', fontSize: '12px' }}>
                    Announcements temporarily unavailable
                </Text>
            </section>
        );
    }

    // If no active announcements, don't show the running letter at all
    if (announcements.length === 0) {
        console.log('📭 No announcements to display');
        return null;
    }

    console.log('🎬 Rendering running letter with', announcements.length, 'announcements');

    return (
        <section style={{
            background: '#001529',
            padding: '12px 0',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Debug info - remove in production */}
            <div style={{
                position: 'absolute',
                top: 2,
                right: 5,
                zIndex: 1000
            }}>
                <Text style={{
                    color: '#52c41a',
                    fontSize: '10px',
                    opacity: 0.7
                }}>
                    {announcements.length} active
                </Text>
            </div>

            <div style={{
                display: 'flex',
                animation: 'marquee 30s linear infinite',
                whiteSpace: 'nowrap'
            }}>
                {/* Original announcements */}
                {announcements.map((announcement, index) => (
                    <React.Fragment key={announcement.id || index}>
                        <Text strong style={{
                            color: 'white',
                            fontSize: '14px',
                            margin: '0 40px',
                            display: 'inline-block'
                        }}>
                            {announcement.content || 'No content'}
                            {announcement.category && (
                                <Text style={{
                                    color: '#69c0ff',
                                    fontSize: '12px',
                                    marginLeft: '8px',
                                    fontStyle: 'italic'
                                }}>
                                    [{announcement.category}]
                                </Text>
                            )}
                        </Text>
                        {index < announcements.length - 1 && (
                            <div style={{
                                width: '6px',
                                height: '6px',
                                backgroundColor: 'white',
                                borderRadius: '50%',
                                display: 'inline-block',
                                margin: '0 20px',
                                opacity: 0.6
                            }} />
                        )}
                    </React.Fragment>
                ))}

                {/* Duplicate for seamless loop */}
                {announcements.map((announcement, index) => (
                    <React.Fragment key={`dup-${announcement.id || index}`}>
                        <Text strong style={{
                            color: 'white',
                            fontSize: '14px',
                            margin: '0 40px',
                            display: 'inline-block'
                        }}>
                            {announcement.content || 'No content'}
                            {announcement.category && (
                                <Text style={{
                                    color: '#69c0ff',
                                    fontSize: '12px',
                                    marginLeft: '8px',
                                    fontStyle: 'italic'
                                }}>
                                    [{announcement.category}]
                                </Text>
                            )}
                        </Text>
                        {index < announcements.length - 1 && (
                            <div style={{
                                width: '6px',
                                height: '6px',
                                backgroundColor: 'white',
                                borderRadius: '50%',
                                display: 'inline-block',
                                margin: '0 20px',
                                opacity: 0.6
                            }} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            <style>
                {`
                @keyframes marquee {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }
                `}
            </style>
        </section>
    );
};

export default RunningLetter;