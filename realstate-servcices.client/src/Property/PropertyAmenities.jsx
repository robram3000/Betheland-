// PropertyAmenities.jsx (updated with landing page colors)
import React from 'react';
import { Row, Col, Typography, List, Card } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;

const PropertyAmenities = ({ property }) => {
    // Get amenities from property data or use defaults
    const getAmenities = () => {
        if (property?.amenities) {
            try {
                if (typeof property.amenities === 'string') {
                    return JSON.parse(property.amenities);
                }
                return property.amenities;
            } catch (error) {
                console.error('Error parsing amenities:', error);
            }
        }

        if (property?.features) {
            return property.features.split(',').map(feature => feature.trim());
        }

        // Default amenities if none provided
        return [
            'Swimming Pool',
            'Central Air Conditioning',
            'Smart Home System',
            'Security System',
            'Hardwood Floors',
            'Fireplace',
            'Walk-in Closets',
            'Gourmet Kitchen'
        ];
    };

    const amenities = getAmenities();

    return (
        <div style={{ padding: '40px 0', backgroundColor: '#f8f9fa' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
                <Title level={2} style={{ color: '#001529' }}>Amenities & Features</Title>
                <Card
                    style={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    <Row gutter={[32, 16]}>
                        {amenities.map((amenity, index) => (
                            <Col xs={24} sm={12} md={8} key={index}>
                                <List.Item style={{ border: 'none', padding: '8px 0' }}>
                                    <CheckCircleOutlined style={{ color: '#001529', marginRight: '8px' }} />
                                    <span style={{ color: '#001529' }}>{amenity}</span>
                                </List.Item>
                            </Col>
                        ))}
                    </Row>
                    {amenities.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#001529' }}>
                            No amenities listed for this property.
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default PropertyAmenities;