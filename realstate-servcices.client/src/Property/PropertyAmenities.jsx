// PropertyAmenities.jsx (updated with white background)
import React from 'react';
import { Row, Col, Typography, List, Card } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;

const PropertyAmenities = () => {
    const amenities = [
        'Swimming Pool',
        'Central Air Conditioning',
        'Smart Home System',
        'Security System',
        'Hardwood Floors',
        'Fireplace',
        'Walk-in Closets',
        'Gourmet Kitchen',
        'Home Office',
        'Wine Cellar',
        'Garden',
        'Garage'
    ];

    return (
        <div style={{ padding: '40px 0', backgroundColor: '#ffffff' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
                <Title level={2}>Amenities</Title>
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
                </Card>
            </div>
        </div>
    );
};

export default PropertyAmenities;