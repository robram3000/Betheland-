// PropertyFilterSidebar.jsx (compact version)
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
        <div style={{ width: '280px', padding: '0' }}>
            {/* Header */}
            <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid #f1f5f9',
                background: 'white'
            }}>
                <Row justify="space-between" align="middle">
                    <Space size="small">
                        <FilterOutlined style={{ color: '#1B3C53', fontSize: '16px' }} />
                        <Title level={5} style={{ margin: 0, color: '#1B3C53', fontSize: '16px' }}>
                            Filters
                        </Title>
                    </Space>
                    <Button
                        type="text"
                        icon={<ClearOutlined />}
                        onClick={clearAllFilters}
                        size="small"
                        style={{
                            color: '#64748b',
                            fontSize: '12px',
                            padding: '2px 8px',
                            height: 'auto'
                        }}
                    >
                        Clear
                    </Button>
                </Row>
            </div>

            {/* Filter Content */}
            <div style={{
                padding: '16px 20px',
                maxHeight: 'calc(100vh - 200px)',
                overflowY: 'auto',
                background: 'white'
            }}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>

                    {/* Price Range */}
                    <div>
                        <Text strong style={{
                            color: '#1B3C53',
                            marginBottom: '8px',
                            display: 'block',
                            fontSize: '13px'
                        }}>
                            Price Range
                        </Text>
                        <Space direction="vertical" style={{ width: '100%' }} size="small">
                            <Slider
                                range
                                min={0}
                                max={10000000}
                                step={50000}
                                value={filters.priceRange}
                                onChange={(value) => updateFilter('priceRange', value)}
                                tooltip={{ formatter: value => formatPeso(value) }}
                                trackStyle={{ background: '#1B3C53', height: '4px' }}
                                handleStyle={{
                                    borderColor: '#1B3C53',
                                    height: '16px',
                                    width: '16px',
                                    marginTop: '-6px'
                                }}
                                railStyle={{ background: '#e2e8f0', height: '4px' }}
                            />
                            <Row gutter={8}>
                                <Col span={12}>
                                    <InputNumber
                                        style={{
                                            width: '100%',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '6px',
                                            fontSize: '12px'
                                        }}
                                        value={filters.priceRange[0]}
                                        formatter={value => `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={value => value.replace(/₱\s?|(,*)/g, '')}
                                        onChange={value => updateFilter('priceRange', [value, filters.priceRange[1]])}
                                        size="small"
                                    />
                                </Col>
                                <Col span={12}>
                                    <InputNumber
                                        style={{
                                            width: '100%',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '6px',
                                            fontSize: '12px'
                                        }}
                                        value={filters.priceRange[1]}
                                        formatter={value => `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={value => value.replace(/₱\s?|(,*)/g, '')}
                                        onChange={value => updateFilter('priceRange', [filters.priceRange[0], value])}
                                        size="small"
                                    />
                                </Col>
                            </Row>
                        </Space>
                    </div>

                    <Divider style={{ margin: '12px 0', background: '#f1f5f9' }} />

                    {/* Bedrooms & Bathrooms */}
                    <div>
                        <Text strong style={{
                            color: '#1B3C53',
                            marginBottom: '8px',
                            display: 'block',
                            fontSize: '13px'
                        }}>
                            Rooms
                        </Text>
                        <Space direction="vertical" style={{ width: '100%' }} size="small">
                            <div>
                                <Text style={{
                                    display: 'block',
                                    marginBottom: '4px',
                                    fontSize: '12px'
                                }}>
                                    Bedrooms
                                </Text>
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
                                <Text style={{
                                    display: 'block',
                                    marginBottom: '4px',
                                    fontSize: '12px'
                                }}>
                                    Bathrooms
                                </Text>
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
                    </div>

                    <Divider style={{ margin: '12px 0', background: '#f1f5f9' }} />

                    {/* Square Footage */}
                    <div>
                        <Text strong style={{
                            color: '#1B3C53',
                            marginBottom: '8px',
                            display: 'block',
                            fontSize: '13px'
                        }}>
                            Square Footage
                        </Text>
                        <Space direction="vertical" style={{ width: '100%' }} size="small">
                            <Slider
                                range
                                min={0}
                                max={10000}
                                step={100}
                                value={filters.squareFeet}
                                onChange={(value) => updateFilter('squareFeet', value)}
                                tooltip={{ formatter: value => `${value} sq ft` }}
                                trackStyle={{ background: '#1B3C53', height: '4px' }}
                                handleStyle={{
                                    borderColor: '#1B3C53',
                                    height: '16px',
                                    width: '16px',
                                    marginTop: '-6px'
                                }}
                                railStyle={{ background: '#e2e8f0', height: '4px' }}
                            />
                            <Row gutter={8}>
                                <Col span={12}>
                                    <InputNumber
                                        style={{
                                            width: '100%',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '6px',
                                            fontSize: '12px'
                                        }}
                                        value={filters.squareFeet[0]}
                                        formatter={value => `${value} sq ft`}
                                        parser={value => value.replace(' sq ft', '')}
                                        onChange={value => updateFilter('squareFeet', [value, filters.squareFeet[1]])}
                                        size="small"
                                    />
                                </Col>
                                <Col span={12}>
                                    <InputNumber
                                        style={{
                                            width: '100%',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '6px',
                                            fontSize: '12px'
                                        }}
                                        value={filters.squareFeet[1]}
                                        formatter={value => `${value} sq ft`}
                                        parser={value => value.replace(' sq ft', '')}
                                        onChange={value => updateFilter('squareFeet', [filters.squareFeet[0], value])}
                                        size="small"
                                    />
                                </Col>
                            </Row>
                        </Space>
                    </div>

                    <Divider style={{ margin: '12px 0', background: '#f1f5f9' }} />

                    {/* Property Type */}
                    <div>
                        <Text strong style={{
                            color: '#1B3C53',
                            marginBottom: '8px',
                            display: 'block',
                            fontSize: '13px'
                        }}>
                            Property Type
                        </Text>
                        <CheckboxGroup
                            value={filters.propertyType}
                            onChange={value => updateFilter('propertyType', value)}
                            style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
                        >
                            {propertyTypes.map(type => (
                                <Checkbox
                                    key={type}
                                    value={type}
                                    style={{
                                        margin: 0,
                                        padding: '6px 8px',
                                        borderRadius: '4px',
                                        border: '1px solid transparent',
                                        transition: 'all 0.2s',
                                        fontSize: '12px'
                                    }}
                                    className="filter-checkbox"
                                >
                                    {type}
                                </Checkbox>
                            ))}
                        </CheckboxGroup>
                    </div>

                    <Divider style={{ margin: '12px 0', background: '#f1f5f9' }} />

                    {/* Amenities */}
                    <div>
                        <Text strong style={{
                            color: '#1B3C53',
                            marginBottom: '8px',
                            display: 'block',
                            fontSize: '13px'
                        }}>
                            Amenities
                        </Text>
                        <CheckboxGroup
                            value={filters.amenities}
                            onChange={value => updateFilter('amenities', value)}
                            style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
                        >
                            {amenities.map(amenity => (
                                <Checkbox
                                    key={amenity}
                                    value={amenity}
                                    style={{
                                        margin: 0,
                                        padding: '6px 8px',
                                        borderRadius: '4px',
                                        border: '1px solid transparent',
                                        transition: 'all 0.2s',
                                        fontSize: '12px'
                                    }}
                                >
                                    {amenity}
                                </Checkbox>
                            ))}
                        </CheckboxGroup>
                    </div>
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
                :global(.ant-checkbox-wrapper) {
                    font-size: 12px;
                }
                :global(.ant-slider-handle) {
                    width: 16px;
                    height: 16px;
                }
            `}</style>
        </div>
    );
};

export default PropertyFilterSidebar;