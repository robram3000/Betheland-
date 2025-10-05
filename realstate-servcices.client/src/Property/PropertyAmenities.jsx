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
        <div style={{ padding: '40px 0', backgroundColor: '#ffffff' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
                <Title level={2}>Amenities & Features</Title>
                <Card>
                    <Row gutter={[32, 16]}>
                        {amenities.map((amenity, index) => (
                            <Col xs={24} sm={12} md={8} key={index}>
                                <List.Item>
                                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                                    {amenity}
                                </List.Item>
                            </Col>
                        ))}
                    </Row>
                    {amenities.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                            No amenities listed for this property.
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default PropertyAmenities;