// PropertyFilterSidebar.jsx (redesigned)
import React from 'react';
import {
    Card,
    Slider,
    Select,
    Checkbox,
    Button,
    Divider,
    Typography,
    Row,
    Col,
    InputNumber,
    Space,
    Tag
} from 'antd';
import { ClearOutlined, FilterOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { Group: CheckboxGroup } = Checkbox;

const PropertyFilterSidebar = ({ filters, onFilterChange, isCollapsed }) => {
    const propertyTypes = ['House', 'Apartment', 'Condo', 'Villa', 'Penthouse', 'Studio', 'Townhouse'];
    const amenities = ['Pool', 'Garden', 'Garage', 'Gym', 'Security', 'Parking', 'Balcony', 'Fireplace'];

    const updateFilter = (key, value) => {
        onFilterChange({
            ...filters,
            [key]: value
        });
    };

    const clearAllFilters = () => {
        onFilterChange({
            priceRange: [0, 10000000],
            bedrooms: null,
            bathrooms: null,
            propertyType: [],
            amenities: [],
            squareFeet: [0, 10000]
        });
    };

    const formatPeso = (value) => {
        if (value >= 1000000) {
            return `₱${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
            return `₱${(value / 1000).toFixed(0)}K`;
        }
        return `₱${value}`;
    };

    if (isCollapsed) {
        return null;
    }

    return (
        <div style={{ padding: '0' }}>
            <div style={{
                padding: '24px 24px 16px 24px',
                borderBottom: '1px solid #f1f5f9'
            }}>
                <Row justify="space-between" align="middle">
                    <Space>
                        <FilterOutlined style={{ color: '#1B3C53' }} />
                        <Title level={4} style={{ margin: 0, color: '#1B3C53' }}>Filters</Title>
                    </Space>
                    <Button
                        type="text"
                        icon={<ClearOutlined />}
                        onClick={clearAllFilters}
                        size="small"
                        style={{
                            color: '#64748b',
                            border: '1px solid #e2e8f0'
                        }}
                    >
                        Clear All
                    </Button>
                </Row>
            </div>

            <div style={{ padding: '24px', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>

                    {/* Price Range */}
                    <Card
                        size="small"
                        bordered={false}
                        style={{ background: 'transparent', boxShadow: 'none' }}
                        bodyStyle={{ padding: '0' }}
                    >
                        <Text strong style={{ color: '#1B3C53', marginBottom: '12px', display: 'block' }}>
                            Price Range (₱)
                        </Text>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Slider
                                range
                                min={0}
                                max={10000000}
                                step={50000}
                                value={filters.priceRange}
                                onChange={(value) => updateFilter('priceRange', value)}
                                tooltip={{ formatter: value => formatPeso(value) }}
                                trackStyle={{ background: '#1B3C53' }}
                                handleStyle={{ borderColor: '#1B3C53' }}
                            />
                            <Row gutter={8}>
                                <Col span={12}>
                                    <InputNumber
                                        style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                                        value={filters.priceRange[0]}
                                        formatter={value => `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={value => value.replace(/₱\s?|(,*)/g, '')}
                                        onChange={value => updateFilter('priceRange', [value, filters.priceRange[1]])}
                                        size="small"
                                    />
                                </Col>
                                <Col span={12}>
                                    <InputNumber
                                        style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                                        value={filters.priceRange[1]}
                                        formatter={value => `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={value => value.replace(/₱\s?|(,*)/g, '')}
                                        onChange={value => updateFilter('priceRange', [filters.priceRange[0], value])}
                                        size="small"
                                    />
                                </Col>
                            </Row>
                        </Space>
                    </Card>

                    <Divider style={{ margin: '8px 0', background: '#f1f5f9' }} />

                    {/* Bedrooms & Bathrooms */}
                    <Card size="small" bordered={false} style={{ background: 'transparent', boxShadow: 'none' }}>
                        <Text strong style={{ color: '#1B3C53', marginBottom: '12px', display: 'block' }}>
                            Rooms
                        </Text>
                        <Space direction="vertical" style={{ width: '100%' }} size="middle">
                            <div>
                                <Text style={{ display: 'block', marginBottom: '4px' }}>Bedrooms</Text>
                                <Select
                                    style={{ width: '100%' }}
                                    placeholder="Any"
                                    value={filters.bedrooms}
                                    onChange={value => updateFilter('bedrooms', value)}
                                    allowClear
                                    size="small"
                                    dropdownStyle={{ borderRadius: '8px' }}
                                >
                                    <Option value={1}>1+</Option>
                                    <Option value={2}>2+</Option>
                                    <Option value={3}>3+</Option>
                                    <Option value={4}>4+</Option>
                                    <Option value={5}>5+</Option>
                                </Select>
                            </div>
                            <div>
                                <Text style={{ display: 'block', marginBottom: '4px' }}>Bathrooms</Text>
                                <Select
                                    style={{ width: '100%' }}
                                    placeholder="Any"
                                    value={filters.bathrooms}
                                    onChange={value => updateFilter('bathrooms', value)}
                                    allowClear
                                    size="small"
                                >
                                    <Option value={1}>1+</Option>
                                    <Option value={2}>2+</Option>
                                    <Option value={3}>3+</Option>
                                    <Option value={4}>4+</Option>
                                </Select>
                            </div>
                        </Space>
                    </Card>

                    <Divider style={{ margin: '8px 0', background: '#f1f5f9' }} />

                    {/* Square Footage */}
                    <Card size="small" bordered={false} style={{ background: 'transparent', boxShadow: 'none' }}>
                        <Text strong style={{ color: '#1B3C53', marginBottom: '12px', display: 'block' }}>
                            Square Footage
                        </Text>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Slider
                                range
                                min={0}
                                max={10000}
                                step={100}
                                value={filters.squareFeet}
                                onChange={(value) => updateFilter('squareFeet', value)}
                                tooltip={{ formatter: value => `${value} sq ft` }}
                                trackStyle={{ background: '#1B3C53' }}
                                handleStyle={{ borderColor: '#1B3C53' }}
                            />
                            <Row gutter={8}>
                                <Col span={12}>
                                    <InputNumber
                                        style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                                        value={filters.squareFeet[0]}
                                        formatter={value => `${value} sq ft`}
                                        parser={value => value.replace(' sq ft', '')}
                                        onChange={value => updateFilter('squareFeet', [value, filters.squareFeet[1]])}
                                        size="small"
                                    />
                                </Col>
                                <Col span={12}>
                                    <InputNumber
                                        style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                                        value={filters.squareFeet[1]}
                                        formatter={value => `${value} sq ft`}
                                        parser={value => value.replace(' sq ft', '')}
                                        onChange={value => updateFilter('squareFeet', [filters.squareFeet[0], value])}
                                        size="small"
                                    />
                                </Col>
                            </Row>
                        </Space>
                    </Card>

                    <Divider style={{ margin: '8px 0', background: '#f1f5f9' }} />

                    {/* Property Type */}
                    <Card size="small" bordered={false} style={{ background: 'transparent', boxShadow: 'none' }}>
                        <Text strong style={{ color: '#1B3C53', marginBottom: '12px', display: 'block' }}>
                            Property Type
                        </Text>
                        <CheckboxGroup
                            value={filters.propertyType}
                            onChange={value => updateFilter('propertyType', value)}
                            style={{ display: 'flex', flexDirection: 'column' }}
                        >
                            {propertyTypes.map(type => (
                                <Checkbox
                                    key={type}
                                    value={type}
                                    style={{
                                        margin: '4px 0',
                                        padding: '8px 12px',
                                        borderRadius: '6px',
                                        border: '1px solid transparent',
                                        transition: 'all 0.2s'
                                    }}
                                    className="filter-checkbox"
                                >
                                    {type}
                                </Checkbox>
                            ))}
                        </CheckboxGroup>
                    </Card>

                    <Divider style={{ margin: '8px 0', background: '#f1f5f9' }} />

                    {/* Amenities */}
                    <Card size="small" bordered={false} style={{ background: 'transparent', boxShadow: 'none' }}>
                        <Text strong style={{ color: '#1B3C53', marginBottom: '12px', display: 'block' }}>
                            Amenities
                        </Text>
                        <CheckboxGroup
                            value={filters.amenities}
                            onChange={value => updateFilter('amenities', value)}
                            style={{ display: 'flex', flexDirection: 'column' }}
                        >
                            {amenities.map(amenity => (
                                <Checkbox
                                    key={amenity}
                                    value={amenity}
                                    style={{
                                        margin: '4px 0',
                                        padding: '8px 12px',
                                        borderRadius: '6px',
                                        border: '1px solid transparent',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {amenity}
                                </Checkbox>
                            ))}
                        </CheckboxGroup>
                    </Card>
                </Space>
            </div>

            <style jsx>{`
                :global(.filter-checkbox:hover) {
                    background: #f8fafc;
                    border-color: #e2e8f0 !important;
                }
                :global(.ant-checkbox-wrapper-checked) {
                    background: #f0f9ff;
                    border-color: #1B3C53 !important;
                }
            `}</style>
        </div>
    );
};

export default PropertyFilterSidebar;