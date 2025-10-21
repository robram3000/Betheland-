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
    // Updated property types to include all possible types
    const propertyTypes = [
        'House', 'Apartment', 'Condo', 'Villa', 'Penthouse',
        'Studio', 'Townhouse', 'Commercial', 'Land', 'Farm',
        'Residential', 'Industrial', 'Office', 'Retail'
    ];
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
                            style={{ width: '100%' }}
                        >
                            <Space direction="vertical" size={4} style={{ width: '100%' }}>
                                {propertyTypes.map(type => (
                                    <Checkbox
                                        key={type}
                                        value={type}
                                        style={{
                                            fontSize: '12px',
                                            marginLeft: '0',
                                            width: '100%',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            transition: 'all 0.2s'
                                        }}
                                        className="hover-checkbox"
                                    >
                                        {type}
                                    </Checkbox>
                                ))}
                            </Space>
                        </CheckboxGroup>
                    </div>

                    <Divider style={{ margin: '12px 0', background: '#f1f5f9' }} />

                    {/* Bedrooms & Bathrooms */}
                    <Row gutter={12}>
                        <Col span={12}>
                            <Text strong style={{
                                color: '#1B3C53',
                                marginBottom: '8px',
                                display: 'block',
                                fontSize: '13px'
                            }}>
                                Bedrooms
                            </Text>
                            <Select
                                value={filters.bedrooms}
                                onChange={value => updateFilter('bedrooms', value)}
                                placeholder="Any"
                                style={{ width: '100%' }}
                                size="small"
                                allowClear
                            >
                                <Option value={1}>1+</Option>
                                <Option value={2}>2+</Option>
                                <Option value={3}>3+</Option>
                                <Option value={4}>4+</Option>
                                <Option value={5}>5+</Option>
                            </Select>
                        </Col>
                        <Col span={12}>
                            <Text strong style={{
                                color: '#1B3C53',
                                marginBottom: '8px',
                                display: 'block',
                                fontSize: '13px'
                            }}>
                                Bathrooms
                            </Text>
                            <Select
                                value={filters.bathrooms}
                                onChange={value => updateFilter('bathrooms', value)}
                                placeholder="Any"
                                style={{ width: '100%' }}
                                size="small"
                                allowClear
                            >
                                <Option value={1}>1+</Option>
                                <Option value={2}>2+</Option>
                                <Option value={3}>3+</Option>
                                <Option value={4}>4+</Option>
                            </Select>
                        </Col>
                    </Row>

                    <Divider style={{ margin: '12px 0', background: '#f1f5f9' }} />

                    {/* Square Feet */}
                    <div>
                        <Text strong style={{
                            color: '#1B3C53',
                            marginBottom: '8px',
                            display: 'block',
                            fontSize: '13px'
                        }}>
                            Area (sqm)
                        </Text>
                        <Slider
                            range
                            min={0}
                            max={10000}
                            step={100}
                            value={filters.squareFeet}
                            onChange={(value) => updateFilter('squareFeet', value)}
                            tooltip={{ formatter: value => `${value} sqm` }}
                            trackStyle={{ background: '#1B3C53', height: '4px' }}
                            handleStyle={{
                                borderColor: '#1B3C53',
                                height: '16px',
                                width: '16px',
                                marginTop: '-6px'
                            }}
                            railStyle={{ background: '#e2e8f0', height: '4px' }}
                        />
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
                            style={{ width: '100%' }}
                        >
                            <Space direction="vertical" size={4} style={{ width: '100%' }}>
                                {amenities.map(amenity => (
                                    <Checkbox
                                        key={amenity}
                                        value={amenity}
                                        style={{
                                            fontSize: '12px',
                                            marginLeft: '0',
                                            width: '100%',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            transition: 'all 0.2s'
                                        }}
                                        className="hover-checkbox"
                                    >
                                        {amenity}
                                    </Checkbox>
                                ))}
                            </Space>
                        </CheckboxGroup>
                    </div>
                </Space>
            </div>
        </div>
    );
};

export default PropertyFilterSidebar;