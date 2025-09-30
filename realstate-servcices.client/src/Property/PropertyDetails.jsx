// PropertyDetails.jsx (updated with white background)
import React from 'react';
import { Row, Col, Typography, Descriptions, Card } from 'antd';

const { Title, Paragraph } = Typography;

const PropertyDetails = () => {
    const propertyInfo = {
        type: 'Villa',
        yearBuilt: 2018,
        sqft: 4800,
        lotSize: '0.5 acres',
        floors: 2,
        parking: '3 cars'
    };

    return (
        <div style={{ padding: '40px 0', backgroundColor: '#ffffff' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
                <Title level={2} style={{ color: '#1B3C53' }}>Property Details</Title>
                <Row gutter={[32, 32]}>
                    <Col xs={24} md={12}>
                        <Card
                            style={{
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0'
                            }}
                        >
                            <Descriptions
                                title="Basic Information"
                                column={1}
                                labelStyle={{ color: '#1B3C53', fontWeight: '500' }}
                            >
                                <Descriptions.Item label="Property Type">{propertyInfo.type}</Descriptions.Item>
                                <Descriptions.Item label="Year Built">{propertyInfo.yearBuilt}</Descriptions.Item>
                                <Descriptions.Item label="Square Feet">{propertyInfo.sqft} sq ft</Descriptions.Item>
                                <Descriptions.Item label="Lot Size">{propertyInfo.lotSize}</Descriptions.Item>
                                <Descriptions.Item label="Floors">{propertyInfo.floors}</Descriptions.Item>
                                <Descriptions.Item label="Parking">{propertyInfo.parking}</Descriptions.Item>
                            </Descriptions>
                        </Card>
                    </Col>
                    <Col xs={24} md={12}>
                        <Card
                            title="Description"
                            style={{
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0'
                            }}
                        >
                            <Paragraph>
                                This stunning luxury villa offers breathtaking ocean views from every room.
                                Recently renovated with high-end finishes, this property features an open-concept
                                living area, gourmet kitchen with premium appliances, and spacious bedrooms with
                                ensuite bathrooms.
                            </Paragraph>
                            <Paragraph>
                                The outdoor space includes a infinity pool, landscaped gardens, and multiple
                                entertainment areas perfect for hosting gatherings. Located in a prestigious
                                neighborhood with excellent schools and amenities nearby.
                            </Paragraph>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default PropertyDetails;