// PropertySearchPage.jsx (updated with wishlist and scheduling functionality)
import React, { useState } from 'react';
import { Layout, Row, Col, Input, Button, Divider, Tag, Space, Typography, Modal, Form, DatePicker, TimePicker, InputNumber, message } from 'antd';
import { SearchOutlined, FilterOutlined, CloseOutlined, HeartOutlined } from '@ant-design/icons';
import PropertyFilterSidebar from './PropertyFilterSidebar';
import PropertyCard from './PropertyCard';

const { Content } = Layout;
const { Text: AntText } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;

const PropertySearchPage = () => {
    const [filters, setFilters] = useState({
        priceRange: [0, 10000000],
        bedrooms: null,
        bathrooms: null,
        propertyType: [],
        amenities: [],
        squareFeet: [0, 10000]
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [wishlist, setWishlist] = useState(new Set());
    const [form] = Form.useForm();

    // Enhanced mock property data with wishlist status
    const [properties, setProperties] = useState([
        {
            id: 1,
            title: "Luxury Ocean View Villa",
            price: 12000000,
            pricePerSqft: 25000,
            location: "Miami Beach, Florida",
            bedrooms: 5,
            bathrooms: 3,
            squareFeet: 4800,
            propertyType: "Villa",
            image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=300&fit=crop",
            rating: 4.5,
            tags: ["Ocean View", "Pool", "Garden", "Luxury"],
            featured: true,
            isFavorite: false
        },
        {
            id: 2,
            title: "Modern Downtown Apartment",
            price: 3500000,
            pricePerSqft: 18000,
            location: "Manila, Philippines",
            bedrooms: 2,
            bathrooms: 2,
            squareFeet: 1200,
            propertyType: "Apartment",
            image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop",
            rating: 4.2,
            tags: ["City View", "Modern", "Convenient"],
            featured: false,
            isFavorite: false
        },
        {
            id: 3,
            title: "Cozy Family House",
            price: 2800000,
            pricePerSqft: 15000,
            location: "Quezon City, Philippines",
            bedrooms: 3,
            bathrooms: 2,
            squareFeet: 1800,
            propertyType: "House",
            image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop",
            rating: 4.7,
            tags: ["Family", "Garden", "Quiet"],
            featured: true,
            isFavorite: false
        }
    ]);

    const handleSearch = (value) => {
        setSearchQuery(value);
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    const clearAllFilters = () => {
        setFilters({
            priceRange: [0, 10000000],
            bedrooms: null,
            bathrooms: null,
            propertyType: [],
            amenities: [],
            squareFeet: [0, 10000]
        });
        setSearchQuery('');
    };

    // Wishlist functionality
    const handleAddToWishlist = (propertyId, isFavorite) => {
        setProperties(prevProperties =>
            prevProperties.map(property =>
                property.id === propertyId
                    ? { ...property, isFavorite }
                    : property
            )
        );

        setWishlist(prev => {
            const newWishlist = new Set(prev);
            if (isFavorite) {
                newWishlist.add(propertyId);
            } else {
                newWishlist.delete(propertyId);
            }
            return newWishlist;
        });

        message.success(isFavorite ? 'Added to wishlist!' : 'Removed from wishlist!');
    };

    // Schedule tour functionality
    const handleScheduleTour = (property) => {
        setSelectedProperty(property);
        setScheduleModalVisible(true);
    };

    const handleScheduleSubmit = async (values) => {
        try {
            // Here you would typically send the data to your backend
            console.log('Scheduling tour:', {
                property: selectedProperty,
                schedule: values
            });

            message.success('Tour scheduled successfully! We will contact you soon.');
            setScheduleModalVisible(false);
            form.resetFields();
        } catch (error) {
            message.error('Failed to schedule tour. Please try again.');
        }
    };

    const filteredProperties = properties.filter(property => {
        if (searchQuery && !property.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !property.location.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }
        if (property.price < filters.priceRange[0] || property.price > filters.priceRange[1]) {
            return false;
        }
        if (filters.bedrooms && property.bedrooms < filters.bedrooms) {
            return false;
        }
        if (filters.bathrooms && property.bathrooms < filters.bathrooms) {
            return false;
        }
        if (filters.propertyType.length > 0 && !filters.propertyType.includes(property.propertyType)) {
            return false;
        }
        if (property.squareFeet < filters.squareFeet[0] || property.squareFeet > filters.squareFeet[1]) {
            return false;
        }
        return true;
    });

    const activeFiltersCount = Object.values(filters).filter(filter =>
        Array.isArray(filter) ? filter.some(val => val > 0) : filter !== null && filter !== undefined && filter.length > 0
    ).length + (searchQuery ? 1 : 0);

    return (
        <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
            <Content style={{ padding: '24px' }}>
                {/* Enhanced Search Header */}
                <div style={{
                    background: 'white',
                    padding: '32px',
                    borderRadius: '16px',
                    marginBottom: '24px',
                    boxShadow: '0 4px 20px rgba(27, 60, 83, 0.08)',
                    border: '1px solid #e2e8f0'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                        <h1 style={{
                            margin: 0,
                            color: '#1B3C53',
                            fontSize: '2.5rem',
                            fontWeight: '300',
                            marginBottom: '8px'
                        }}>
                            Find Your Dream Property
                        </h1>
                        <p style={{
                            color: '#64748b',
                            fontSize: '1.1rem',
                            margin: 0
                        }}>
                            Discover {properties.length}+ premium properties across the Philippines
                        </p>
                    </div>

                    <Row gutter={[16, 16]} align="middle" justify="center">
                        <Col xs={24} lg={18}>
                            <Search
                                placeholder="Search by property name, location, or keyword..."
                                enterButton={<SearchOutlined />}
                                size="large"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onSearch={handleSearch}
                                style={{
                                    maxWidth: '100%',
                                    borderRadius: '12px'
                                }}
                            />
                        </Col>
                        <Col>
                            <Button
                                icon={<FilterOutlined />}
                                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                                size="large"
                                style={{
                                    borderRadius: '12px',
                                    border: '1px solid #1B3C53',
                                    color: '#1B3C53',
                                    background: 'white'
                                }}
                            >
                                {isSidebarCollapsed ? 'Show Filters' : 'Hide Filters'}
                                {activeFiltersCount > 0 && (
                                    <Tag color="#1B3C53" style={{ marginLeft: '8px', borderRadius: '10px' }}>
                                        {activeFiltersCount}
                                    </Tag>
                                )}
                            </Button>
                        </Col>
                        <Col>
                            <Button
                                icon={<HeartOutlined />}
                                size="large"
                                style={{
                                    borderRadius: '12px',
                                    border: '1px solid #ff4d4f',
                                    color: wishlist.size > 0 ? '#ff4d4f' : '#64748b',
                                    background: 'white'
                                }}
                                onClick={() => message.info(`You have ${wishlist.size} properties in your wishlist`)}
                            >
                                Wishlist ({wishlist.size})
                            </Button>
                        </Col>
                    </Row>

                    {/* Active Filters Display */}
                    {activeFiltersCount > 0 && (
                        <div style={{ marginTop: '16px' }}>
                            <Space wrap>
                                <AntText strong style={{ color: '#1B3C53' }}>Active filters:</AntText>
                                {searchQuery && (
                                    <Tag
                                        closable
                                        onClose={() => setSearchQuery('')}
                                        style={{ borderRadius: '6px', background: '#f0f9ff', borderColor: '#1B3C53' }}
                                    >
                                        Search: "{searchQuery}"
                                    </Tag>
                                )}
                                {filters.propertyType.map(type => (
                                    <Tag
                                        key={type}
                                        closable
                                        onClose={() => handleFilterChange({
                                            ...filters,
                                            propertyType: filters.propertyType.filter(t => t !== type)
                                        })}
                                        style={{ borderRadius: '6px' }}
                                    >
                                        Type: {type}
                                    </Tag>
                                ))}
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<CloseOutlined />}
                                    onClick={clearAllFilters}
                                    style={{ color: '#64748b' }}
                                >
                                    Clear all
                                </Button>
                            </Space>
                        </div>
                    )}
                </div>

                {/* Main Content Area */}
                <Row gutter={[24, 24]}>
                    {/* Filters Sidebar */}
                    {!isSidebarCollapsed && (
                        <Col xs={24} md={8} lg={6}>
                            <div style={{
                                background: 'white',
                                borderRadius: '16px',
                                boxShadow: '0 4px 20px rgba(27, 60, 83, 0.08)',
                                border: '1px solid #e2e8f0',
                                height: 'fit-content',
                                position: 'sticky',
                                top: '24px'
                            }}>
                                <PropertyFilterSidebar
                                    filters={filters}
                                    onFilterChange={handleFilterChange}
                                    isCollapsed={isSidebarCollapsed}
                                />
                            </div>
                        </Col>
                    )}

                    {/* Properties Grid */}
                    <Col xs={24} md={isSidebarCollapsed ? 24 : 16} lg={isSidebarCollapsed ? 24 : 18}>
                        {/* Enhanced Results Header */}
                        <div style={{
                            background: 'white',
                            padding: '20px 24px',
                            borderRadius: '16px',
                            marginBottom: '24px',
                            boxShadow: '0 4px 20px rgba(27, 60, 83, 0.08)',
                            border: '1px solid #e2e8f0'
                        }}>
                            <Row justify="space-between" align="middle">
                                <Col>
                                    <h3 style={{
                                        margin: 0,
                                        color: '#1B3C53',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        {filteredProperties.length} Properties Found
                                        {filteredProperties.length !== properties.length && (
                                            <Tag color="blue" style={{ borderRadius: '6px' }}>
                                                Filtered
                                            </Tag>
                                        )}
                                    </h3>
                                </Col>
                                <Col>
                                    <AntText style={{ color: '#64748b' }}>
                                        Wishlist: <AntText strong>{wishlist.size} properties</AntText>
                                    </AntText>
                                </Col>
                            </Row>
                        </div>

                        {/* Property Cards Grid */}
                        <Row gutter={[24, 24]}>
                            {filteredProperties.map(property => (
                                <Col xs={24} sm={12} xl={8} key={property.id}>
                                    <PropertyCard
                                        property={property}
                                        onAddToWishlist={handleAddToWishlist}
                                        onScheduleTour={handleScheduleTour}
                                    />
                                </Col>
                            ))}
                        </Row>

                        {/* No Results State */}
                        {filteredProperties.length === 0 && (
                            <div style={{
                                textAlign: 'center',
                                padding: '80px 20px',
                                color: '#64748b',
                                background: 'white',
                                borderRadius: '16px',
                                boxShadow: '0 4px 20px rgba(27, 60, 83, 0.08)',
                                border: '1px solid #e2e8f0'
                            }}>
                                <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🏠</div>
                                <h3 style={{ color: '#1B3C53', marginBottom: '8px' }}>
                                    No properties found
                                </h3>
                                <p style={{ marginBottom: '24px' }}>
                                    Try adjusting your filters or search terms to see more results
                                </p>
                                <Button
                                    type="primary"
                                    onClick={clearAllFilters}
                                    style={{ borderRadius: '8px' }}
                                >
                                    Clear all filters
                                </Button>
                            </div>
                        )}
                    </Col>
                </Row>

                {/* Schedule Tour Modal */}
                <Modal
                    title={`Schedule a Tour - ${selectedProperty?.title}`}
                    open={scheduleModalVisible}
                    onCancel={() => {
                        setScheduleModalVisible(false);
                        form.resetFields();
                    }}
                    footer={null}
                    width={500}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleScheduleSubmit}
                    >
                        <Form.Item
                            name="name"
                            label="Full Name"
                            rules={[{ required: true, message: 'Please enter your name' }]}
                        >
                            <Input placeholder="Enter your full name" />
                        </Form.Item>

                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                { required: true, message: 'Please enter your email' },
                                { type: 'email', message: 'Please enter a valid email' }
                            ]}
                        >
                            <Input placeholder="Enter your email" />
                        </Form.Item>

                        <Form.Item
                            name="phone"
                            label="Phone Number"
                            rules={[{ required: true, message: 'Please enter your phone number' }]}
                        >
                            <Input placeholder="Enter your phone number" />
                        </Form.Item>

                        <Form.Item
                            name="date"
                            label="Preferred Date"
                            rules={[{ required: true, message: 'Please select a date' }]}
                        >
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item
                            name="time"
                            label="Preferred Time"
                            rules={[{ required: true, message: 'Please select a time' }]}
                        >
                            <TimePicker format="HH:mm" style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item
                            name="guests"
                            label="Number of Guests"
                        >
                            <InputNumber min={1} max={10} placeholder="Number of guests" style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item
                            name="message"
                            label="Additional Notes"
                        >
                            <Input.TextArea rows={3} placeholder="Any special requests or questions..." />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" block style={{ borderRadius: '8px' }}>
                                Schedule Tour
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            </Content>
        </Layout>
    );
};

export default PropertySearchPage;