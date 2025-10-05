import React from 'react';
import { Row, Col, Typography, Descriptions, Card } from 'antd';

const { Title, Paragraph } = Typography;

const PropertyDetails = ({ property }) => {
    if (!property) {
        return <div>Loading property details...</div>;
    }

    // Property information from actual property data
    const propertyInfo = {
        type: property.propertyType || 'Property',
        yearBuilt: property.yearBuilt || 'N/A',
        sqft: property.areaSqft || property.squareFeet || 0,
        lotSize: property.lotSize || 'N/A',
        floors: property.floors || property.totalFloors || 1,
        parking: property.parkingSpaces ? `${property.parkingSpaces} cars` : 'N/A',
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0
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
                                <Descriptions.Item label="Square Feet">{propertyInfo.sqft.toLocaleString()} sq ft</Descriptions.Item>
                                <Descriptions.Item label="Lot Size">{propertyInfo.lotSize}</Descriptions.Item>
                                <Descriptions.Item label="Floors">{propertyInfo.floors}</Descriptions.Item>
                                <Descriptions.Item label="Parking">{propertyInfo.parking}</Descriptions.Item>
                                <Descriptions.Item label="Bedrooms">{propertyInfo.bedrooms}</Descriptions.Item>
                                <Descriptions.Item label="Bathrooms">{propertyInfo.bathrooms}</Descriptions.Item>
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
                                {property.description || 'No description available for this property.'}
                            </Paragraph>
                            {property.features && (
                                <Paragraph>
                                    <strong>Features:</strong> {property.features}
                                </Paragraph>
                            )}
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default PropertyDetails;