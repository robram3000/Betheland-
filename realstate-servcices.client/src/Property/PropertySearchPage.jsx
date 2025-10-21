// PropertySearchPage.jsx (FIXED VERSION - Corrected Filtering)
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
        squareFeet: [0, 10000]
    });

    // DEBUG: Log properties and filtering
    useEffect(() => {
        console.log('🔍 DEBUG - Total properties:', properties?.length);
        console.log('🔍 DEBUG - Current filters:', filters);
        console.log('🔍 DEBUG - Search term:', searchTerm);
    }, [properties, filters, searchTerm]);

    // Filter properties based on search term and filters - FIXED VERSION
    const filteredProperties = useMemo(() => {
        if (!properties || !Array.isArray(properties)) {
            console.log('❌ No properties array found');
            return [];
        }

        console.log('🔄 Starting filter process with', properties.length, 'properties');

        const filtered = properties.filter(property => {
            if (!property || !property.id) {
                console.log('Skipping invalid property:', property);
                return false;
            }

            // Search term filter
            const matchesSearch = !searchTerm ||
                (property.title && property.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (property.description && property.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (property.address && property.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (property.city && property.city.toLowerCase().includes(searchTerm.toLowerCase()));

            if (!matchesSearch) {
                console.log('❌ Property failed search filter:', property.title);
                return false;
            }

            // Price range filter
            const price = Number(property.price) || 0;
            const matchesPrice = price >= filters.priceRange[0] && price <= filters.priceRange[1];

            if (!matchesPrice) {
                console.log('❌ Property failed price filter:', property.title, 'Price:', price, 'Range:', filters.priceRange);
                return false;
            }

            // Bedrooms filter - FIXED: Check if filter is set
            const bedrooms = Number(property.bedrooms) || 0;
            const matchesBedrooms = filters.bedrooms === null ||
                filters.bedrooms === undefined ||
                bedrooms >= Number(filters.bedrooms);

            if (!matchesBedrooms) {
                console.log('❌ Property failed bedrooms filter:', property.title, 'Bedrooms:', bedrooms, 'Filter:', filters.bedrooms);
                return false;
            }

            // Bathrooms filter - FIXED: Correct variable name
            const bathrooms = Number(property.bathrooms) || 0;
            const matchesBathrooms = filters.bathrooms === null ||
                filters.bathrooms === undefined ||
                bathrooms >= Number(filters.bathrooms);

            if (!matchesBathrooms) {
                console.log('❌ Property failed bathrooms filter:', property.title, 'Bathrooms:', bathrooms, 'Filter:', filters.bathrooms);
                return false;
            }

            // Property type filter
            const propertyType = property.propertyType || property.type || '';
            const matchesPropertyType = filters.propertyType.length === 0 ||
                filters.propertyType.includes(propertyType);

            if (!matchesPropertyType) {
                console.log('❌ Property failed type filter:', property.title, 'Type:', propertyType, 'Filter:', filters.propertyType);
                return false;
            }

            // Square feet filter (using areaSqm)
            const areaSqm = Number(property.areaSqm) || 0;
            const matchesSquareFeet = areaSqm >= filters.squareFeet[0] && areaSqm <= filters.squareFeet[1];

            if (!matchesSquareFeet) {
                console.log('❌ Property failed area filter:', property.title, 'Area:', areaSqm, 'Range:', filters.squareFeet);
                return false;
            }

            // Amenities filter - FIXED: Implement amenities filtering
            let matchesAmenities = true;
            if (filters.amenities && filters.amenities.length > 0) {
                if (!property.amenities) {
                    matchesAmenities = false;
                } else {
                    // Handle both stringified array and actual array
                    let propertyAmenities = [];
                    try {
                        if (typeof property.amenities === 'string') {
                            propertyAmenities = JSON.parse(property.amenities);
                        } else if (Array.isArray(property.amenities)) {
                            propertyAmenities = property.amenities;
                        }
                    } catch (e) {
                        console.warn('Failed to parse amenities:', property.amenities);
                    }

                    matchesAmenities = filters.amenities.every(amenity =>
                        propertyAmenities.includes(amenity)
                    );
                }
            }

            if (!matchesAmenities) {
                console.log('❌ Property failed amenities filter:', property.title, 'Amenities:', property.amenities, 'Filter:', filters.amenities);
                return false;
            }

            console.log('✅ Property passed all filters:', property.title);
            return true;
        });

        console.log('🎯 Filtering complete. Found:', filtered.length, 'properties out of', properties.length);
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

    // Paginate properties - 8 cards per page
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
            squareFeet: [0, 10000]
        });
        setSearchTerm('');
        setCurrentPage(1);
    }, []);

    // Handle errors
    useEffect(() => {
        if (error) {
            message.error('Failed to load properties');
        }
    }, [error]);

    // Reset to first page when search term changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters]);

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
                                {filteredProperties.length} properties available
                                {filteredProperties.length !== properties?.length &&
                                    ` (of ${properties?.length} total)`
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
                            ) : paginatedProperties.length === 0 ? (
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description={
                                        <div>
                                            <Text style={{ color: '#64748b', display: 'block', marginBottom: '8px' }}>
                                                No properties found matching your criteria
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
                                            Showing {paginatedProperties.length} of {filteredProperties.length} filtered properties (from {properties?.length} total)
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
                                                        'repeat(auto-fill, minmax(min(100%, 500px), 1fr))' : 'none',
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
                                                    height: (viewMode === 'landscape' && window.innerWidth >= 768) ? '280px' : 'auto',
                                                    minHeight: 'auto',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <PropertyCard
                                                    property={property}
                                                    showActions={false}
                                                    viewMode={window.innerWidth < 768 ? 'grid' : viewMode}
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