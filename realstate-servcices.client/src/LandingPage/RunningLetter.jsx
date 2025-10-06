// RunningLetter.jsx
import React from 'react';
import { Row, Col, Typography } from 'antd';

const { Text } = Typography;

const RunningLetter = () => {
    const announcements = [
        "🏠 New Properties Added Daily!",
        "⭐ Featured: Luxury Villa in Downtown - $1.2M",
        "🔥 Hot Deal: 20% Discount on First-Time Buyer Programs",
        "📈 Market Update: Property values increased 15% this quarter",
        "🎉 Special Offer: Free consultation for new clients",
        "🏆 Award: Best Real Estate Platform 2024",
        "📍 New Location: Now serving Miami and Orlando",
        "💼 Open House: Saturday 2-4PM at 123 Main Street"
    ];

    return (
        <section style={{
            background: '#001529',
            padding: '12px 0',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
            position: 'relative'
        }}>
            <div style={{
                display: 'flex',
                animation: 'marquee 30s linear infinite',
                whiteSpace: 'nowrap'
            }}>
                {announcements.map((announcement, index) => (
                    <React.Fragment key={index}>
                        <Text strong style={{
                            color: 'white',
                            fontSize: '14px',
                            margin: '0 40px',
                            display: 'inline-block'
                        }}>
                            {announcement}
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
                    <React.Fragment key={`dup-${index}`}>
                        <Text strong style={{
                            color: 'white',
                            fontSize: '14px',
                            margin: '0 40px',
                            display: 'inline-block'
                        }}>
                            {announcement}
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