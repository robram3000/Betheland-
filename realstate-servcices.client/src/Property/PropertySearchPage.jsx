// PropertySearchPage.jsx (FIXED VERSION - Debugging Enabled)
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Layout,
    Row,
    Col,
    Space,
    Typography,
    Button,
    Input,
    Select,
    Card,
    Empty,
    Spin,
    Pagination,
    Drawer,
    message,
    Tag
} from 'antd';
import {
    SearchOutlined,
    FilterOutlined,
    AppstoreOutlined,
    PicLeftOutlined
} from '@ant-design/icons';
import PropertyCard from './PropertyCard';
import PropertyFilterSidebar from './PropertyFilterSidebar';
import { usePropertyData } from './Services/GetdataProperty';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const PropertySearchPage = () => {
    const { properties, loading, error, refreshProperties } = usePropertyData();

    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [viewMode, setViewMode] = useState('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(8);
    const [mobileFilterVisible, setMobileFilterVisible] = useState(false);
    const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);

    const [filters, setFilters] = useState({
        priceRange: [0, 10000000],
        bedrooms: null,
        bathrooms: null,
        propertyType: [],
        amenities: [],
        squareFeet: [0, 100000] // Increased max area to accommodate larger properties
    });

    // DEBUG: Comprehensive logging
    useEffect(() => {
        console.log('🔍 DEBUG - PropertySearchPage State:', {
            totalProperties: properties?.length,
            loading: loading,
            error: error,
            searchTerm: searchTerm,
            filters: filters,
            currentPage: currentPage
        });

        if (properties && properties.length > 0) {
            console.log('📋 Sample Property Data:', properties[0]);
            console.log('🏠 All Property IDs:', properties.map(p => p.id));
        }
    }, [properties, loading, error, searchTerm, filters, currentPage]);

    // SIMPLIFIED: Filter properties - Only basic search for now
    const filteredProperties = useMemo(() => {
        if (!properties || !Array.isArray(properties)) {
            console.log('❌ No properties array found');
            return [];
        }

        console.log('🔄 Starting SIMPLIFIED filter process with', properties.length, 'properties');

        // TEMPORARY: Return all properties without complex filtering
        const allProperties = properties.filter(property => {
            if (!property || !property.id) {
                console.log('Skipping invalid property:', property);
                return false;
            }
            return true;
        });

        console.log('✅ After basic validation:', allProperties.length, 'properties');

        // Only apply search term filter for now
        if (searchTerm) {
            const query = searchTerm.toLowerCase().trim();
            const searched = allProperties.filter(property => {
                const searchFields = [
                    property.title,
                    property.description,
                    property.address,
                    property.city,
                    property.state,
                    property.propertyType
                ].filter(field => field && typeof field === 'string');

                return searchFields.some(field =>
                    field.toLowerCase().includes(query)
                );
            });
            console.log('🔍 After search filter:', searched.length, 'properties');
            return searched;
        }

        console.log('🎯 Returning all properties:', allProperties.length);
        return allProperties;
    }, [properties, searchTerm]); // Removed filters dependency for now

    // Sort properties
    const sortedProperties = useMemo(() => {
        const sorted = [...filteredProperties];

        switch (sortBy) {
            case 'price-low-high':
                return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
            case 'price-high-low':
                return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
            case 'newest':
                return sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            case 'oldest':
                return sorted.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
            case 'size-large-small':
                return sorted.sort((a, b) => (b.areaSqm || 0) - (a.areaSqm || 0));
            case 'size-small-large':
                return sorted.sort((a, b) => (a.areaSqm || 0) - (b.areaSqm || 0));
            default:
                return sorted;
        }
    }, [filteredProperties, sortBy]);

    // Paginate properties - 8 cards per page
    const paginatedProperties = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        const paginated = sortedProperties.slice(startIndex, startIndex + pageSize);
        console.log('📄 Pagination:', {
            currentPage,
            pageSize,
            startIndex,
            total: sortedProperties.length,
            showing: paginated.length
        });
        return paginated;
    }, [sortedProperties, currentPage, pageSize]);

    // Handle filter changes
    const handleFilterChange = useCallback((newFilters) => {
        console.log('🔄 Filters changed:', newFilters);
        setFilters(newFilters);
        setCurrentPage(1);
    }, []);

    // Handle search
    const handleSearch = useCallback((value) => {
        console.log('🔍 Search term changed:', value);
        setSearchTerm(value);
        setCurrentPage(1);
    }, []);

    // Handle sort change
    const handleSortChange = useCallback((value) => {
        setSortBy(value);
    }, []);

    // Handle page change
    const handlePageChange = useCallback((page, size) => {
        setCurrentPage(page);
        setPageSize(size || 8);
    }, []);

    // Toggle filter sidebar
    const toggleFilterSidebar = useCallback(() => {
        setIsFilterCollapsed(!isFilterCollapsed);
    }, [isFilterCollapsed]);

    // Show mobile filter drawer
    const showMobileFilter = useCallback(() => {
        setMobileFilterVisible(true);
    }, []);

    // Close mobile filter drawer
    const closeMobileFilter = useCallback(() => {
        setMobileFilterVisible(false);
    }, []);

    // Reset all filters
    const handleResetFilters = useCallback(() => {
        console.log('🔄 Resetting all filters');
        setFilters({
            priceRange: [0, 10000000],
            bedrooms: null,
            bathrooms: null,
            propertyType: [],
            amenities: [],
            squareFeet: [0, 100000]
        });
        setSearchTerm('');
        setCurrentPage(1);
    }, []);

    // Handle errors
    useEffect(() => {
        if (error) {
            message.error(`Failed to load properties: ${error}`);
            console.error('❌ Property loading error:', error);
        }
    }, [error]);

    // Reset to first page when search term changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters]);

    // Force refresh if no properties after loading
    useEffect(() => {
        if (!loading && properties && properties.length === 0) {
            console.log('🔄 No properties found, attempting refresh...');
            refreshProperties().catch(err => {
                console.error('❌ Refresh failed:', err);
            });
        }
    }, [loading, properties, refreshProperties]);

    return (
        <div style={{
            width: '100%',
            maxWidth: '100%',
            padding: '0',
            background: 'transparent'
        }}>
            {/* Header Section */}
            <div style={{
                background: 'white',
                padding: '24px 0',
                borderBottom: '1px solid #f1f5f9',
                marginBottom: '0'
            }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '0 16px'
                }}>
                    <Row gutter={[16, 16]} align="middle">
                        {/* Title Section */}
                        <Col xs={24} md={12}>
                            <Title level={2} style={{
                                margin: 0,
                                color: '#1B3C53',
                                fontSize: 'clamp(24px, 5vw, 28px)',
                                textAlign: window.innerWidth < 768 ? 'center' : 'left'
                            }}>
                                Find Your Perfect Property
                            </Title>
                            <Text style={{
                                color: '#64748b',
                                fontSize: '16px',
                                display: 'block',
                                textAlign: window.innerWidth < 768 ? 'center' : 'left'
                            }}>
                                {properties?.length || 0} properties available
                                {filteredProperties.length !== properties?.length &&
                                    ` (${filteredProperties.length} filtered)`
                                }
                            </Text>
                        </Col>

                        {/* Controls Section */}
                        <Col xs={24} md={12}>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px',
                                alignItems: window.innerWidth < 768 ? 'stretch' : 'flex-end'
                            }}>
                                {/* Search and Sort Row */}
                                <div style={{
                                    display: 'flex',
                                    flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                                    gap: '12px',
                                    width: '100%',
                                    justifyContent: window.innerWidth < 768 ? 'stretch' : 'flex-end'
                                }}>
                                    {/* Search Input */}
                                    <Input
                                        placeholder="Search properties..."
                                        prefix={<SearchOutlined />}
                                        value={searchTerm}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        style={{
                                            width: window.innerWidth < 768 ? '100%' :
                                                window.innerWidth < 992 ? '250px' : '300px',
                                            minWidth: '200px'
                                        }}
                                        size="large"
                                        allowClear
                                    />

                                    {/* Sort Select */}
                                    <Select
                                        value={sortBy}
                                        onChange={handleSortChange}
                                        style={{
                                            width: window.innerWidth < 768 ? '100%' : '180px',
                                            minWidth: '160px'
                                        }}
                                        size="large"
                                    >
                                        <Option value="newest">Newest First</Option>
                                        <Option value="oldest">Oldest First</Option>
                                        <Option value="price-low-high">Price: Low to High</Option>
                                        <Option value="price-high-low">Price: High to Low</Option>
                                        <Option value="size-large-small">Size: Large to Small</Option>
                                        <Option value="size-small-large">Size: Small to Large</Option>
                                    </Select>
                                </div>

                                {/* View Toggles and Filter Row */}
                                <div style={{
                                    display: 'flex',
                                    gap: '12px',
                                    justifyContent: window.innerWidth < 768 ? 'center' : 'flex-end',
                                    alignItems: 'center',
                                    flexWrap: 'wrap'
                                }}>
                                    {/* Reset Filters Button */}
                                    <Button
                                        onClick={handleResetFilters}
                                        size="large"
                                        style={{
                                            borderColor: '#ff4d4f',
                                            color: '#ff4d4f'
                                        }}
                                    >
                                        Reset Filters
                                    </Button>

                                    {/* View Mode Toggle - Hidden on mobile */}
                                    <Button.Group
                                        size="large"
                                        style={{
                                            display: window.innerWidth < 768 ? 'none' : 'inline-block'
                                        }}
                                    >
                                        <Button
                                            type={viewMode === 'grid' ? 'primary' : 'default'}
                                            icon={<AppstoreOutlined />}
                                            onClick={() => setViewMode('grid')}
                                            title="Grid View"
                                        />
                                        <Button
                                            type={viewMode === 'landscape' ? 'primary' : 'default'}
                                            icon={<PicLeftOutlined />}
                                            onClick={() => setViewMode('landscape')}
                                            title="Landscape View"
                                        />
                                    </Button.Group>

                                    {/* Mobile Filter Button */}
                                    <Button
                                        icon={<FilterOutlined />}
                                        onClick={showMobileFilter}
                                        size="large"
                                        style={{
                                            display: window.innerWidth < 768 ? 'inline-block' : 'none'
                                        }}
                                    >
                                        Filters
                                    </Button>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>

            {/* Main Content */}
            <Layout style={{
                background: 'transparent',
                maxWidth: '1600px',
                margin: '0 auto',
                padding: '24px 16px'
            }}>
                <Row gutter={[24, 24]}>
                    {/* Property Results */}
                    <Col xs={24}>
                        <Card
                            style={{
                                background: 'white',
                                borderRadius: '12px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                border: '1px solid #f1f5f9'
                            }}
                            bodyStyle={{ padding: '16px' }}
                        >
                            {loading ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '60px 20px'
                                }}>
                                    <Spin size="large" />
                                    <div style={{ marginTop: '16px' }}>
                                        <Text style={{ color: '#64748b' }}>
                                            Loading properties...
                                        </Text>
                                    </div>
                                </div>
                            ) : error ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '60px 20px'
                                }}>
                                    <Text type="danger" style={{ display: 'block', marginBottom: '16px' }}>
                                        Error loading properties: {error}
                                    </Text>
                                    <Button onClick={refreshProperties} type="primary">
                                        Retry
                                    </Button>
                                </div>
                            ) : paginatedProperties.length === 0 ? (
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description={
                                        <div>
                                            <Text style={{ color: '#64748b', display: 'block', marginBottom: '8px' }}>
                                                {properties?.length === 0
                                                    ? 'No properties found'
                                                    : 'No properties match your search criteria'
                                                }
                                            </Text>
                                            <Button onClick={handleResetFilters}>
                                                Reset All Filters
                                            </Button>
                                        </div>
                                    }
                                    style={{
                                        padding: '60px 20px'
                                    }}
                                />
                            ) : (
                                <>
                                    {/* Debug Info */}
                                    <div style={{
                                        padding: '8px 12px',
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: '6px',
                                        marginBottom: '16px',
                                        border: '1px solid #e9ecef'
                                    }}>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            Showing {paginatedProperties.length} of {filteredProperties.length} properties
                                            {searchTerm && ` (filtered by: "${searchTerm}")`}
                                        </Text>
                                    </div>

                                    {/* Property Grid/Landscape */}
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns:
                                                viewMode === 'grid' || window.innerWidth < 768 ?
                                                    'repeat(auto-fill, minmax(min(100%, 350px), 1fr))' :
                                                    viewMode === 'landscape' ?
                                                        'repeat(auto-fill, minmax(min(100%, 550px), 1fr))' : 'none', // Increased min width for landscape
                                            gap: '24px',
                                            width: '100%',
                                            alignItems: 'stretch',
                                            justifyItems: 'center'
                                        }}
                                    >
                                        {paginatedProperties.map((property) => (
                                            <div
                                                key={property.id}
                                                style={{
                                                    display: 'flex',
                                                    width: '100%',
                                                    height: (viewMode === 'landscape' && window.innerWidth >= 768) ? '320px' : 'auto', // Increased height
                                                    minHeight: 'auto',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <PropertyCard
                                                    property={property}
                                                    showActions={false}
                                                    viewMode={window.innerWidth < 768 ? 'grid' : viewMode}
                                                    landscapeHeight="320px" // Increased height for landscape
                                                    style={{
                                                        width: '100%',
                                                        height: '100%'
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {sortedProperties.length > pageSize && (
                                        <div style={{
                                            marginTop: '32px',
                                            display: 'flex',
                                            justifyContent: 'center'
                                        }}>
                                            <Pagination
                                                current={currentPage}
                                                pageSize={pageSize}
                                                total={sortedProperties.length}
                                                onChange={handlePageChange}
                                                showSizeChanger
                                                showQuickJumper
                                                showTotal={(total, range) =>
                                                    `${range[0]}-${range[1]} of ${total} properties`
                                                }
                                                pageSizeOptions={['8', '16', '24', '48']}
                                                responsive={true}
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </Card>
                    </Col>
                </Row>
            </Layout>

            {/* Mobile Filter Drawer */}
            <Drawer
                title="Filters"
                placement="right"
                onClose={closeMobileFilter}
                open={mobileFilterVisible}
                width={320}
                bodyStyle={{ padding: '0' }}
            >
                <PropertyFilterSidebar
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    isCollapsed={false}
                />
            </Drawer>
        </div>
    );
};

export default PropertySearchPage;