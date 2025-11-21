// PropertySearchPage.jsx (FIXED VERSION - Optimized Drawer Width)
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

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const PropertySearchPage = () => {
    const { properties, loading, error, refreshProperties } = usePropertyData();

    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [viewMode, setViewMode] = useState('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(8);
    const [filterDrawerVisible, setFilterDrawerVisible] = useState(false);

    const [filters, setFilters] = useState({
        priceRange: [0, 10000000],
        bedrooms: null,
        bathrooms: null,
        propertyType: [],
        amenities: [],
        squareFeet: [0, 100000]
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
        }
    }, [properties, loading, error, searchTerm, filters, currentPage]);

    // Filter properties with all filters enabled
    const filteredProperties = useMemo(() => {
        if (!properties || !Array.isArray(properties)) {
            console.log('❌ No properties array found');
            return [];
        }

        console.log('🔄 Starting filter process with', properties.length, 'properties');

        let filtered = properties.filter(property => {
            if (!property || !property.id) {
                return false;
            }

            // Search term filter
            if (searchTerm) {
                const query = searchTerm.toLowerCase().trim();
                const searchFields = [
                    property.title,
                    property.description,
                    property.address,
                    property.city,
                    property.state,
                    property.propertyType
                ].filter(field => field && typeof field === 'string');

                const matchesSearch = searchFields.some(field =>
                    field.toLowerCase().includes(query)
                );
                if (!matchesSearch) return false;
            }

            // Price range filter
            const [minPrice, maxPrice] = filters.priceRange;
            if (property.price < minPrice || property.price > maxPrice) {
                return false;
            }

            // Bedrooms filter
            if (filters.bedrooms !== null && property.bedrooms !== filters.bedrooms) {
                return false;
            }

            // Bathrooms filter
            if (filters.bathrooms !== null && property.bathrooms !== filters.bathrooms) {
                return false;
            }

            // Property type filter
            if (filters.propertyType.length > 0 &&
                !filters.propertyType.includes(property.propertyType)) {
                return false;
            }

            // Square footage filter
            const [minSqFt, maxSqFt] = filters.squareFeet;
            const propertySqFt = property.areaSqm ? property.areaSqm * 10.764 : 0; // Convert sqm to sqft
            if (propertySqFt < minSqFt || propertySqFt > maxSqFt) {
                return false;
            }

            // Amenities filter
            if (filters.amenities.length > 0) {
                const propertyAmenities = property.amenities || [];
                const hasAllAmenities = filters.amenities.every(amenity =>
                    propertyAmenities.includes(amenity)
                );
                if (!hasAllAmenities) return false;
            }

            return true;
        });

        console.log('✅ After all filters:', filtered.length, 'properties');
        return filtered;
    }, [properties, searchTerm, filters]);

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

    // Paginate properties
    const paginatedProperties = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return sortedProperties.slice(startIndex, startIndex + pageSize);
    }, [sortedProperties, currentPage, pageSize]);

    // Handle filter changes
    const handleFilterChange = useCallback((newFilters) => {
        console.log('🔄 Filters changed:', newFilters);
        setFilters(newFilters);
        setCurrentPage(1);
    }, []);

    // Handle search
    const handleSearch = useCallback((value) => {
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

    // Show filter drawer
    const showFilterDrawer = useCallback(() => {
        setFilterDrawerVisible(true);
    }, []);

    // Close filter drawer
    const closeFilterDrawer = useCallback(() => {
        setFilterDrawerVisible(false);
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
        message.success('All filters have been reset');
    }, []);

    // Handle errors
    useEffect(() => {
        if (error) {
            message.error(`Failed to load properties: ${error}`);
        }
    }, [error]);

    // Show active filters count
    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (searchTerm) count++;
        if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000000) count++;
        if (filters.bedrooms !== null) count++;
        if (filters.bathrooms !== null) count++;
        if (filters.propertyType.length > 0) count++;
        if (filters.amenities.length > 0) count++;
        if (filters.squareFeet[0] > 0 || filters.squareFeet[1] < 100000) count++;
        return count;
    }, [filters, searchTerm]);

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
                                {activeFiltersCount > 0 && (
                                    <Tag color="blue" style={{ marginLeft: '8px' }}>
                                        {activeFiltersCount} active filter{activeFiltersCount !== 1 ? 's' : ''}
                                    </Tag>
                                )}
                            </Text>
                        </Col>

                        <Col xs={24} md={12}>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px',
                                alignItems: window.innerWidth < 768 ? 'stretch' : 'flex-end'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                                    gap: '12px',
                                    width: '100%',
                                    justifyContent: window.innerWidth < 768 ? 'stretch' : 'flex-end'
                                }}>
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

                                <div style={{
                                    display: 'flex',
                                    gap: '12px',
                                    justifyContent: window.innerWidth < 768 ? 'center' : 'flex-end',
                                    alignItems: 'center',
                                    flexWrap: 'wrap'
                                }}>
                                    {/* Filter Button - Shows Drawer */}
                                    <Button
                                        icon={<FilterOutlined />}
                                        onClick={showFilterDrawer}
                                        size="large"
                                        type={activeFiltersCount > 0 ? "primary" : "default"}
                                    >
                                        Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                                    </Button>

                                    <Button
                                        onClick={handleResetFilters}
                                        size="large"
                                        disabled={activeFiltersCount === 0}
                                        style={{
                                            borderColor: '#ff4d4f',
                                            color: activeFiltersCount === 0 ? '#ccc' : '#ff4d4f'
                                        }}
                                    >
                                        Reset Filters
                                    </Button>

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
                                        />
                                        <Button
                                            type={viewMode === 'landscape' ? 'primary' : 'default'}
                                            icon={<PicLeftOutlined />}
                                            onClick={() => setViewMode('landscape')}
                                        />
                                    </Button.Group>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>

            {/* Main Content - Full Width */}
            <Layout style={{
                background: 'transparent',
                maxWidth: '1600px',
                margin: '0 auto',
                padding: '24px 16px',
                minHeight: '600px'
            }}>
                <Content>
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
                            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                                <Spin size="large" />
                                <div style={{ marginTop: '16px' }}>
                                    <Text style={{ color: '#64748b' }}>
                                        Loading properties...
                                    </Text>
                                </div>
                            </div>
                        ) : error ? (
                            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
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
                                style={{ padding: '60px 20px' }}
                            />
                        ) : (
                            <>
                                {/* Active Filters Info */}
                                {activeFiltersCount > 0 && (
                                    <div style={{
                                        padding: '12px 16px',
                                        backgroundColor: '#f0f7ff',
                                        borderRadius: '6px',
                                        marginBottom: '16px',
                                        border: '1px solid #d0e3ff'
                                    }}>
                                        <Space wrap>
                                            <Text strong>Active Filters:</Text>
                                            {searchTerm && (
                                                <Tag closable onClose={() => setSearchTerm('')}>
                                                    Search: "{searchTerm}"
                                                </Tag>
                                            )}
                                            {(filters.priceRange[0] > 0 || filters.priceRange[1] < 10000000) && (
                                                <Tag closable onClose={() => handleFilterChange({
                                                    ...filters,
                                                    priceRange: [0, 10000000]
                                                })}>
                                                    Price: ${filters.priceRange[0].toLocaleString()} - ${filters.priceRange[1].toLocaleString()}
                                                </Tag>
                                            )}
                                            {filters.bedrooms !== null && (
                                                <Tag closable onClose={() => handleFilterChange({
                                                    ...filters,
                                                    bedrooms: null
                                                })}>
                                                    Bedrooms: {filters.bedrooms}
                                                </Tag>
                                            )}
                                            {filters.bathrooms !== null && (
                                                <Tag closable onClose={() => handleFilterChange({
                                                    ...filters,
                                                    bathrooms: null
                                                })}>
                                                    Bathrooms: {filters.bathrooms}
                                                </Tag>
                                            )}
                                            {filters.propertyType.length > 0 && (
                                                <Tag closable onClose={() => handleFilterChange({
                                                    ...filters,
                                                    propertyType: []
                                                })}>
                                                    Type: {filters.propertyType.join(', ')}
                                                </Tag>
                                            )}
                                        </Space>
                                    </div>
                                )}

                                {/* Property Grid */}
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns:
                                            viewMode === 'grid' || window.innerWidth < 768 ?
                                                'repeat(auto-fill, minmax(min(100%, 350px), 1fr))' :
                                                'repeat(auto-fill, minmax(min(100%, 550px), 1fr))',
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
                                                height: (viewMode === 'landscape' && window.innerWidth >= 768) ? '320px' : 'auto',
                                                minHeight: 'auto',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <PropertyCard
                                                property={property}
                                                showActions={false}
                                                viewMode={window.innerWidth < 768 ? 'grid' : viewMode}
                                                landscapeHeight="320px"
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
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </Card>
                </Content>
            </Layout>

            {/* Filter Drawer - Optimized Width */}
            <Drawer
                title={
                    <Space>
                        <FilterOutlined />
                        Filters
                        {activeFiltersCount > 0 && (
                            <Tag color="blue">{activeFiltersCount}</Tag>
                        )}
                    </Space>
                }
                placement="right"
                onClose={closeFilterDrawer}
                open={filterDrawerVisible}
                width={320} 
                style={{
                    zIndex: 1001
                }}
                bodyStyle={{
                    padding: '0',
                    display: 'flex',
                    flexDirection: 'column'
                }}
           
            >
                <div style={{
                    flex: 1,
                    overflow: 'auto'
                }}>
                    <PropertyFilterSidebar
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        isCollapsed={false}
                    />
                </div>
            </Drawer>
        </div>
    );
};

export default PropertySearchPage;