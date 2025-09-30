// PropertyLocation.jsx (simplified - location only)
import React from 'react';
import { Row, Col, Typography, Card, Button } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const { Title, Text } = Typography;

const PropertyLocation = () => {
    const position = [25.7617, -80.1918]; // Miami Beach coordinates

    return (
        <div style={{ padding: '40px 0', backgroundColor: '#ffffff' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
                <Title level={2} style={{ color: '#1B3C53' }}>Location</Title>
                <Row gutter={[32, 32]}>
                    <Col xs={24} lg={16}>
                        <Card
                            title="Location Map"
                            style={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                            extra={
                                <Button
                                    type="primary"
                                    size="small"
                                    style={{ background: '#1B3C53', borderColor: '#1B3C53' }}
                                >
                                    Full Screen
                                </Button>
                            }
                        >
                            <div style={{ height: '400px', borderRadius: '8px', overflow: 'hidden' }}>
                                <MapContainer
                                    center={position}
                                    zoom={13}
                                    style={{ height: '100%', width: '100%' }}
                                    scrollWheelZoom={false}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <Marker position={position}>
                                        <Popup>
                                            Luxury Villa with Ocean View <br /> Miami Beach, Florida
                                        </Popup>
                                    </Marker>
                                </MapContainer>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} lg={8}>
                        <Card
                            title="Location Info"
                            style={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                        >
                            <div style={{ marginBottom: '16px' }}>
                                <EnvironmentOutlined style={{ marginRight: '8px', color: '#1B3C53' }} />
                                <Text strong>Miami Beach, Florida</Text>
                            </div>
                            <Button
                                type="primary"
                                block
                                style={{
                                    borderRadius: '8px',
                                    background: '#1B3C53',
                                    borderColor: '#1B3C53'
                                }}
                            >
                                Explore Neighborhood
                            </Button>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default PropertyLocation;