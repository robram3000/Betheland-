import React, { useState } from 'react';
import { Button, Row, Col, Typography, Space, Select, Input, Slider, Card, Drawer } from 'antd';
import { EnvironmentOutlined, HomeOutlined, DollarOutlined, FilterOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const FirstSection = () => {
    const navigate = useNavigate();
    const [propertyType, setPropertyType] = useState('');
    const [location, setLocation] = useState('');
    const [priceRange, setPriceRange] = useState([1000000, 10000000]); // Updated for PHP prices
    const [bedrooms, setBedrooms] = useState('');
    const [bathrooms, setBathrooms] = useState('');
    const [filterVisible, setFilterVisible] = useState(false);
    const [searchText, setSearchText] = useState('');

    // Philippines-specific locations
    const philippineLocations = [
        'Metro Manila',
        'Quezon City',
        'Manila',
        'Makati',
        'Taguig',
        'Pasig',
        'Mandaluyong',
        'Pasay',
        'Parañaque',
        'Las Piñas',
        'Muntinlupa',
        'Marikina',
        'Caloocan',
        'Malabon',
        'Navotas',
        'Valenzuela',
        'San Juan',
        'Cebu City',
        'Davao City',
        'Baguio City',
        'Iloilo City',
        'Bacolod City',
        'Cagayan de Oro',
        'Zamboanga City',
        'General Santos',
        'Dagupan City',
        'Angeles City',
        'Olongapo City',
        'Batangas City',
        'Naga City'
    ];

    const handleSearch = () => {
        navigate('/properties', {
            state: {
                filters: {
                    propertyType,
                    location,
                    priceRange,
                    bedrooms,
                    bathrooms,
                    searchText
                }
            }
        });
    };

    const showFilterDrawer = () => {
        setFilterVisible(true);
    };

    const closeFilterDrawer = () => {
        setFilterVisible(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // Format price in Philippine Peso
    const formatPrice = (price) => {
        if (price >= 1000000) {
            return `₱${(price / 1000000).toFixed(1)}M`;
        } else if (price >= 1000) {
            return `₱${(price / 1000).toFixed(0)}K`;
        }
        return `₱${price}`;
    };

    return (
        <section style={{
            padding: '40px 24px',
            background: 'white',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Grid Background */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `
                    linear-gradient(rgba(192, 192, 192, 0.3) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(192, 192, 192, 0.3) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px',
                backgroundPosition: 'center center',
                zIndex: 0,
                opacity: 0.6
            }} />

            {/* Content Overlay */}
            <div style={{
                position: 'relative',
                zIndex: 1
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <Row gutter={[64, 32]} align="middle">
                        <Col xs={24} style={{ textAlign: 'center' }}>
                            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                <Title level={1} style={{
                                    fontSize: '3rem',
                                    fontWeight: '700',
                                    margin: 0,
                                    lineHeight: '1.2',
                                    color: '#001529'
                                }}>
                                    Find Your Dream Home in the Philippines
                                </Title>

                                <Paragraph style={{
                                    fontSize: '1.1rem',
                                    lineHeight: '1.6',
                                    maxWidth: '500px',
                                    margin: '0 auto',
                                    color: '#666'
                                }}>
                                    Discover the perfect property across the beautiful islands of the Philippines.
                                </Paragraph>

                                {/* Search Card */}
                                <Card className="search-card" style={{
                                    background: 'white',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                    width: '100%',
                                    maxWidth: '800px',
                                    margin: '0 auto',
                                    border: '1px solid #e8e8e8'
                                }}>
                                    <Row gutter={[12, 12]} align="middle">
                                        <Col xs={24} sm={16} md={18}>
                                            <Input
                                                placeholder="Search by city, municipality, or keyword"
                                                size="large"
                                                value={searchText}
                                                onChange={(e) => setSearchText(e.target.value)}
                                                onKeyPress={handleKeyPress}
                                                prefix={<SearchOutlined style={{ color: '#999' }} />}
                                                style={{
                                                    width: '100%',
                                                    borderRadius: '8px',
                                                    height: '50px'
                                                }}
                                            />
                                        </Col>
                                        <Col xs={24} sm={8} md={6}>
                                            <div className="action-buttons">
                                                <Button
                                                    icon={<FilterOutlined />}
                                                    size="large"
                                                    onClick={showFilterDrawer}
                                                    style={{
                                                        flex: 1,
                                                        borderRadius: '8px',
                                                        height: '50px'
                                                    }}
                                                >
                                                    Filters
                                                </Button>
                                                <Button
                                                    type="primary"
                                                    size="large"
                                                    onClick={handleSearch}
                                                    style={{
                                                        flex: 1,
                                                        borderRadius: '8px',
                                                        background: 'linear-gradient(135deg, #001529 0%, #003366 100%)',
                                                        border: 'none',
                                                        fontWeight: '600',
                                                        height: '50px'
                                                    }}
                                                >
                                                    Search
                                                </Button>
                                            </div>
                                        </Col>
                                    </Row>
                                </Card>

                                {/* Filter Drawer */}
                                <Drawer
                                    title="Filter Properties"
                                    placement="right"
                                    onClose={closeFilterDrawer}
                                    open={filterVisible}
                                    width={350}
                                    className="filter-drawer"
                                >
                                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                        <div className="filter-section">
                                            <span className="filter-title">
                                                <HomeOutlined /> Property Type
                                            </span>
                                            <Select
                                                placeholder="Any Type"
                                                size="middle"
                                                value={propertyType}
                                                onChange={setPropertyType}
                                                style={{ width: '100%' }}
                                                className="search-input"
                                            >
                                                <Option value="">Any Type</Option>
                                                <Option value="house">House</Option>
                                                <Option value="apartment">Apartment</Option>
                                                <Option value="condo">Condominium</Option>
                                                <Option value="villa">Villa</Option>
                                                <Option value="townhouse">Townhouse</Option>
                                                <Option value="land">Land</Option>
                                                <Option value="commercial">Commercial</Option>
                                            </Select>
                                        </div>

                                        <div className="filter-section">
                                            <span className="filter-title">
                                                <EnvironmentOutlined /> Location
                                            </span>
                                            <Select
                                                placeholder="Select City/Municipality"
                                                size="middle"
                                                value={location}
                                                onChange={setLocation}
                                                style={{ width: '100%' }}
                                                className="search-input"
                                                showSearch
                                                filterOption={(input, option) =>
                                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                }
                                            >
                                                <Option value="">Any Location</Option>
                                                {philippineLocations.map(location => (
                                                    <Option key={location} value={location.toLowerCase().replace(/\s+/g, '-')}>
                                                        {location}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </div>

                                        <div className="filter-section">
                                            <span className="filter-title">Bedrooms</span>
                                            <Select
                                                placeholder="Any"
                                                size="middle"
                                                value={bedrooms}
                                                onChange={setBedrooms}
                                                style={{ width: '100%' }}
                                                className="search-input"
                                            >
                                                <Option value="">Any</Option>
                                                <Option value="1">1+</Option>
                                                <Option value="2">2+</Option>
                                                <Option value="3">3+</Option>
                                                <Option value="4">4+</Option>
                                                <Option value="5">5+</Option>
                                            </Select>
                                        </div>

                                        <div className="filter-section">
                                            <span className="filter-title">Bathrooms</span>
                                            <Select
                                                placeholder="Any"
                                                size="middle"
                                                value={bathrooms}
                                                onChange={setBathrooms}
                                                style={{ width: '100%' }}
                                                className="search-input"
                                            >
                                                <Option value="">Any</Option>
                                                <Option value="1">1+</Option>
                                                <Option value="2">2+</Option>
                                                <Option value="3">3+</Option>
                                                <Option value="4">4+</Option>
                                            </Select>
                                        </div>

                                        <div className="filter-section">
                                            <span className="filter-title">
                                                <DollarOutlined /> Price Range
                                            </span>
                                            <Slider
                                                range
                                                min={500000}
                                                max={50000000}
                                                step={500000}
                                                value={priceRange}
                                                onChange={setPriceRange}
                                                className="price-slider"
                                                tooltip={{ formatter: formatPrice }}
                                            />
                                            <div className="price-display">
                                                {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                                            </div>
                                        </div>

                                        <div style={{ marginTop: '20px' }}>
                                            <Button
                                                type="primary"
                                                size="middle"
                                                onClick={closeFilterDrawer}
                                                style={{
                                                    width: '100%',
                                                    borderRadius: '8px',
                                                    background: 'linear-gradient(135deg, #001529 0%, #003366 100%)',
                                                    border: 'none',
                                                    fontWeight: '600',
                                                    height: '50px'
                                                }}
                                            >
                                                Apply Filters
                                            </Button>
                                        </div>
                                    </Space>
                                </Drawer>

                                {/* Minimal Stats */}
                                <Row gutter={32} style={{ marginTop: '2rem' }}>
                                    {[
                                        { number: '50K+', label: 'Properties' },
                                        { number: '25K+', label: 'Happy Clients' },
                                        { number: '100+', label: 'Cities Nationwide' }
                                    ].map((stat, index) => (
                                        <Col xs={8} key={index}>
                                            <div>
                                                <Title level={3} style={{
                                                    margin: 0,
                                                    fontSize: '1.8rem',
                                                    color: '#001529'
                                                }}>
                                                    {stat.number}
                                                </Title>
                                                <Paragraph style={{
                                                    margin: 0,
                                                    fontSize: '0.9rem',
                                                    color: '#666'
                                                }}>
                                                    {stat.label}
                                                </Paragraph>
                                            </div>
                                        </Col>
                                    ))}
                                </Row>
                            </Space>
                        </Col>
                    </Row>
                </div>
            </div>

            <style>
                {`                
                .search-tabs .ant-tabs-nav {
                    margin-bottom: 16px;
                }

                .search-tabs .ant-tabs-tab {
                    font-weight: 600;
                    padding: 8px 16px;
                }

                .action-buttons {
                    display: flex;
                    gap: 8px;
                    height: 50px;
                }

                .filter-drawer .ant-drawer-body {
                    padding: 20px;
                }

                .filter-section {
                    margin-bottom: 20px;
                }

                .filter-section .ant-select,
                .filter-section .ant-slider {
                    margin-top: 8px;
                }

                .filter-title {
                    font-weight: 600;
                    margin-bottom: 8px;
                    display: block;
                    color: #001529;
                }

                .price-slider {
                    margin: 10px 0;
                }
                
                .price-display {
                    color: #001529;
                    font-weight: 600;
                    margin-top: 10px;
                    font-size: 14px;
                    text-align: center;
                }

      
                .ant-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .ant-select-single:not(.ant-select-customize-input) .ant-select-selector {
                    height: 40px;
                    display: flex;
                    align-items: center;
                }
                `}
            </style>
        </section>
    );
};

export default FirstSection;