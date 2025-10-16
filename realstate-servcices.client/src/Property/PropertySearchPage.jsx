import React, { useState, useEffect, useCallback } from 'react';
import {
    Layout,
    Row,
    Col,
    Input,
    Button,
    Divider,
    Tag,
    Space,
    Typography,
    Modal,
    Form,
    InputNumber,
    message,
    Spin,
    Alert,
    DatePicker,
    TimePicker
} from 'antd';
import {
    SearchOutlined,
    FilterOutlined,
    CloseOutlined,
    PhoneOutlined,
    MailOutlined,
    EnvironmentOutlined,
    CalendarOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import PropertyFilterSidebar from './PropertyFilterSidebar';
import PropertyCard from './PropertyCard';
import { usePropertyData } from './Services/GetdataProperty';
import { useUser } from '../Authpage/Services/UserContextService';
import scheduleServices from './Services/ScheduleServices';
import moment from 'moment';

const { Content } = Layout;
const { Text: AntText, Text } = Typography;
const { Search } = Input;
const { RangePicker } = DatePicker;

// Debounce hook for performance
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

// Fixed image URL processing function
const processAgentImageUrl = (url) => {
    if (!url || typeof url !== 'string' || url.trim() === '') {
        return 'https://static.thenounproject.com/png/638636-200.png';
    }

    if (url.startsWith('http') || url.startsWith('//') || url.startsWith('blob:')) {
        return url;
    }

    if (url.startsWith('/uploads/')) {
        return `https://localhost:7075${url}`;
    }

    if (url.includes('.') && !url.startsWith('/')) {
        return `https://localhost:7075/uploads/agents/${url}`;
    }

    if (url.startsWith('uploads/')) {
        return `https://localhost:7075/${url}`;
    }

    return 'https://static.thenounproject.com/png/638636-200.png';
};

// Custom DatePicker component to fix the random date jumping issue
const StableDatePicker = ({ value, onChange, disabled }) => {
    const disabledDate = (current) => {
        // Cannot select days before today
        return current && current < moment().startOf('day');
    };

    return (
        <DatePicker
            value={value}
            onChange={onChange}
            disabled={disabled}
            disabledDate={disabledDate}
            style={{ width: '100%' }}
            placeholder="Select date"
            format="YYYY-MM-DD"
            getPopupContainer={trigger => trigger.parentNode}
            inputReadOnly={false}
            allowClear={true}
            // Key prop to force re-render and prevent state corruption
            key={value ? value.valueOf() : 'empty'}
        />
    );
};

// Custom TimePicker component
const StableTimePicker = ({ value, onChange, disabled }) => {
    const disabledTime = () => {
        const currentHour = moment().hour();
        const currentMinute = moment().minute();

        return {
            disabledHours: () => {
                const hours = [];
                // If selected date is today, disable past hours
                for (let i = 0; i < currentHour; i++) {
                    hours.push(i);
                }
                return hours;
            },
            disabledMinutes: (selectedHour) => {
                if (selectedHour === currentHour) {
                    const minutes = [];
                    for (let i = 0; i < currentMinute; i++) {
                        minutes.push(i);
                    }
                    return minutes;
                }
                return [];
            }
        };
    };

    return (
        <TimePicker
            value={value}
            onChange={onChange}
            disabled={disabled}
            disabledTime={disabledTime}
            style={{ width: '100%' }}
            placeholder="Select time"
            format="HH:mm"
            minuteStep={15}
            showNow={false}
            getPopupContainer={trigger => trigger.parentNode}
            inputReadOnly={false}
            allowClear={true}
            // Key prop to force re-render and prevent state corruption
            key={value ? value.valueOf() : 'empty'}
        />
    );
};

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
    const [scheduleLoading, setScheduleLoading] = useState(false);
    const [form] = Form.useForm();
    const { user } = useUser();

    // Use property data context
    const {
        properties,
        loading,
        searchProperties,
        loadProperties
    } = usePropertyData();

    const [filteredProperties, setFilteredProperties] = useState([]);

    // Phone formatting function
    const formatPhoneNumber = (phone) => {
        if (!phone) return 'Not available';

        // Remove any non-digit characters
        const cleaned = phone.replace(/\D/g, '');

        // Format as (XXX) XXX-XXXX
        if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }

        // Return as is if not standard length
        return phone;
    };

    // Load properties on component mount
    useEffect(() => {
        loadProperties();
    }, []);

    // Apply filters when properties or filters change
    useEffect(() => {
        applyFilters();
    }, [properties, filters, searchQuery]);

    const applyFilters = async () => {
        try {
            const searchFilters = {
                searchQuery,
                ...filters
            };
            const results = await searchProperties(searchFilters);
            setFilteredProperties(results);
        } catch (error) {
            console.error('Error applying filters:', error);
        }
    };

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

    // Schedule tour functionality
    const handleScheduleTour = (property) => {
        if (!user) {
            message.error('Please log in to schedule a property tour.');
            return;
        }

        setSelectedProperty(property);
        setScheduleModalVisible(true);

        // Pre-populate form with property and agent IDs
        // Set default schedule date to tomorrow and time to 10:00 AM
        const defaultScheduleDate = moment().add(1, 'days');
        const defaultScheduleTime = moment().hour(10).minute(0).second(0);

        form.setFieldsValue({
            propertyId: property.id,
            agentId: property.agentId,
            scheduleDate: defaultScheduleDate,
            scheduleTime: defaultScheduleTime
        });
    };

    // Updated schedule submission handler
    const handleScheduleSubmit = async (values) => {
        if (!user) {
            message.error('Please log in to schedule a tour.');
            return;
        }

        setScheduleLoading(true);
        try {
            // Combine date and time into a single datetime object
            const scheduleDateTime = moment(values.scheduleDate)
                .hour(values.scheduleTime.hour())
                .minute(values.scheduleTime.minute())
                .second(0);

            // Format data for API
            const scheduleData = {
                ...values,
                scheduleTime: scheduleDateTime,
                userId: user.id
            };

            // Remove individual date and time fields as they're combined now
            delete scheduleData.scheduleDate;
            delete scheduleData.scheduleTime;

            // Validate data
            const validationErrors = scheduleServices.validateScheduleData(scheduleData);
            if (validationErrors.length > 0) {
                message.error(validationErrors[0]);
                setScheduleLoading(false);
                return;
            }

            // Create the schedule
            const response = await scheduleServices.createSchedule(scheduleData);

            message.success('Tour scheduled successfully! The agent will contact you soon.');
            setScheduleModalVisible(false);
            form.resetFields();

            console.log('Schedule created:', response);

        } catch (error) {
            console.error('Error scheduling tour:', error);

            if (error.message?.includes('time slot is not available')) {
                message.error('The selected time slot is not available. Please choose a different time.');
            } else if (error.status === 401) {
                message.error('Please log in to schedule a tour.');
            } else if (error.status === 400) {
                message.error(error.message || 'Invalid schedule data. Please check your inputs.');
            } else if (error.status === 403) {
                message.error('You do not have permission to schedule a tour.');
            } else if (error.status === 404) {
                message.error('Property or agent not found.');
            } else {
                message.error('Failed to schedule tour. Please try again.');
            }
        } finally {
            setScheduleLoading(false);
        }
    };

    const activeFiltersCount = Object.values(filters).filter(filter =>
        Array.isArray(filter) ? filter.some(val => val > 0) : filter !== null && filter !== undefined && filter.length > 0
    ).length + (searchQuery ? 1 : 0);

    return (
        <Layout style={{
            minHeight: '100vh',
            background: 'transparent',
            width: '100%',
            maxWidth: '100%'
        }}>
            <Content style={{
                padding: '24px',
                width: '100%',
                maxWidth: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                {/* Search Header */}
                <div style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '16px',
                    marginBottom: '24px',
                    boxShadow: '0 4px 20px rgba(27, 60, 83, 0.08)',
                    border: '1px solid #e2e8f0',
                    width: '100%',
                    maxWidth: '1200px'
                }}>
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
                                    width: '100%',
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
                <div style={{
                    width: '100%',
                    maxWidth: '1200px',
                    display: 'flex',
                    justifyContent: 'center'
                }}>
                    <Row gutter={[24, 24]} style={{ margin: 0, width: '100%' }}>
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
                            <Row gutter={[24, 24]}>
                                {filteredProperties.map(property => (
                                    <Col xs={24} key={property.id}>
                                        <PropertyCard
                                            property={property}
                                            onScheduleTour={handleScheduleTour}
                                        />
                                    </Col>
                                ))}
                            </Row>

                            {/* No Results State */}
                            {filteredProperties.length === 0 && !loading && (
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

                            {/* Loading State */}
                            {loading && (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '80px 20px',
                                    color: '#64748b',
                                    background: 'white',
                                    borderRadius: '16px'
                                }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⏳</div>
                                    <h3 style={{ color: '#1B3C53', marginBottom: '8px' }}>
                                        Loading properties...
                                    </h3>
                                </div>
                            )}
                        </Col>
                    </Row>
                </div>

                {/* Schedule Tour Modal */}
                <Modal
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CalendarOutlined style={{ color: '#1B3C53' }} />
                            <div>
                                <div style={{ fontSize: '18px', fontWeight: '600', color: '#1B3C53' }}>Schedule a Property Tour</div>
                                <div style={{ fontSize: '12px', fontWeight: 'normal', color: '#666', marginTop: '2px' }}>
                                    Complete the form below to schedule your viewing
                                </div>
                            </div>
                        </div>
                    }
                    open={scheduleModalVisible}
                    onCancel={() => {
                        setScheduleModalVisible(false);
                        form.resetFields();
                    }}
                    footer={null}
                    width={600}
                    style={{ top: 20 }}
                    destroyOnClose
                    maskClosable={!scheduleLoading}
                    closable={!scheduleLoading}
                >
                    <Spin spinning={scheduleLoading} tip="Scheduling your tour...">
                        {/* Property Information */}
                        <div style={{
                            background: '#f8fafc',
                            padding: '16px',
                            borderRadius: '8px',
                            marginBottom: '16px',
                            border: '1px solid #e2e8f0'
                        }}>
                            <Text strong style={{
                                color: '#1B3C53',
                                fontSize: '14px',
                                display: 'block',
                                marginBottom: '4px'
                            }}>
                                PROPERTY
                            </Text>
                            <Text strong style={{
                                color: '#334155',
                                fontSize: '15px',
                                display: 'block',
                                marginBottom: '4px'
                            }}>
                                {selectedProperty?.title}
                            </Text>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <EnvironmentOutlined style={{
                                    marginRight: '6px',
                                    color: '#64748b',
                                    fontSize: '12px'
                                }} />
                                <Text type="secondary" style={{
                                    fontSize: '13px',
                                    color: '#64748b'
                                }}>
                                    {selectedProperty?.location || selectedProperty?.address || 'Location not specified'}
                                </Text>
                            </div>
                        </div>

                        {/* Agent Information */}
                        <div style={{
                            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                            padding: '16px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            border: '1px solid #e2e8f0'
                        }}>
                            <Text strong style={{
                                color: '#1B3C53',
                                fontSize: '14px',
                                display: 'block',
                                marginBottom: '12px'
                            }}>
                                ASSIGNED AGENT
                            </Text>

                            <Row gutter={12} align="middle">
                                <Col span={6}>
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        border: '2px solid #e2e8f0'
                                    }}>
                                        <img
                                            alt={selectedProperty?.agent ? `${selectedProperty.agent.firstName} ${selectedProperty.agent.lastName}` : 'Agent'}
                                            src={selectedProperty?.agent?.baseMember?.profilePictureUrl ?
                                                processAgentImageUrl(selectedProperty.agent.baseMember.profilePictureUrl) :
                                                'https://static.thenounproject.com/png/638636-200.png'}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                            onError={(e) => {
                                                e.target.src = 'https://static.thenounproject.com/png/638636-200.png';
                                            }}
                                        />
                                    </div>
                                </Col>

                                <Col span={18}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <Text strong style={{
                                            color: '#1B3C53',
                                            fontSize: '16px',
                                            display: 'block'
                                        }}>
                                            {selectedProperty?.agent ?
                                                `${selectedProperty.agent.firstName} ${selectedProperty.agent.lastName}` :
                                                'Agent not assigned'
                                            }
                                        </Text>

                                        {selectedProperty?.agent?.specialization && (
                                            <div>
                                                <Text style={{
                                                    color: '#64748b',
                                                    fontSize: '12px',
                                                    fontWeight: '500',
                                                    display: 'block'
                                                }}>
                                                    Specialization:
                                                </Text>
                                                <Text style={{
                                                    color: '#1B3C53',
                                                    fontSize: '12px',
                                                    display: 'block'
                                                }}>
                                                    {selectedProperty.agent.specialization}
                                                </Text>
                                            </div>
                                        )}

                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '4px',
                                            background: 'rgba(255, 255, 255, 0.7)',
                                            borderRadius: '6px',
                                            padding: '8px',
                                            marginTop: '4px'
                                        }}>
                                            {/* Phone Number */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <PhoneOutlined style={{ fontSize: '12px', color: '#1B3C53' }} />
                                                <Text style={{ fontSize: '12px', color: '#1B3C53', fontWeight: '500' }}>
                                                    Phone:
                                                </Text>
                                                <Text
                                                    style={{
                                                        fontSize: '12px',
                                                        color: '#1B3C53',
                                                        cursor: selectedProperty?.agent?.cellPhoneNo ? 'pointer' : 'default',
                                                        textDecoration: selectedProperty?.agent?.cellPhoneNo ? 'underline' : 'none',
                                                        fontWeight: '500'
                                                    }}
                                                    onClick={() => {
                                                        if (selectedProperty?.agent?.cellPhoneNo && selectedProperty.agent.cellPhoneNo !== 'Not available') {
                                                            window.open(`tel:${selectedProperty.agent.cellPhoneNo}`);
                                                        }
                                                    }}
                                                >
                                                    {selectedProperty?.agent?.cellPhoneNo ?
                                                        formatPhoneNumber(selectedProperty.agent.cellPhoneNo) :
                                                        'Not available'
                                                    }
                                                </Text>
                                            </div>

                                            {/* Email */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <MailOutlined style={{ fontSize: '12px', color: '#1B3C53' }} />
                                                <Text style={{ fontSize: '12px', color: '#1B3C53', fontWeight: '500' }}>
                                                    Email:
                                                </Text>
                                                <Text
                                                    style={{
                                                        fontSize: '12px',
                                                        color: '#1B3C53',
                                                        cursor: selectedProperty?.agent?.email ? 'pointer' : 'default',
                                                        textDecoration: selectedProperty?.agent?.email ? 'underline' : 'none',
                                                        fontWeight: '500'
                                                    }}
                                                    onClick={() => {
                                                        if (selectedProperty?.agent?.email && selectedProperty.agent.email !== 'Not available') {
                                                            window.open(`mailto:${selectedProperty.agent.email}`);
                                                        }
                                                    }}
                                                >
                                                    {selectedProperty?.agent?.email || 'Not available'}
                                                </Text>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </div>

                        {/* Schedule Tour Form */}
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleScheduleSubmit}
                            disabled={scheduleLoading}
                        >
                            {/* Schedule Date */}
                            <Form.Item
                                name="scheduleDate"
                                label="Preferred Date"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please select a date for the tour'
                                    },
                                    {
                                        validator: (_, value) => {
                                            if (value && value.isBefore(moment().startOf('day'))) {
                                                return Promise.reject(new Error('Please select a future date'));
                                            }
                                            return Promise.resolve();
                                        }
                                    }
                                ]}
                            >
                                <StableDatePicker disabled={scheduleLoading} />
                            </Form.Item>

                            {/* Schedule Time */}
                            <Form.Item
                                name="scheduleTime"
                                label="Preferred Time"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please select a time for the tour'
                                    },
                                    {
                                        validator: (_, value) => {
                                            const selectedDate = form.getFieldValue('scheduleDate');
                                            if (value && selectedDate && selectedDate.isSame(moment(), 'day')) {
                                                const currentTime = moment();
                                                const selectedDateTime = moment(selectedDate)
                                                    .hour(value.hour())
                                                    .minute(value.minute());

                                                if (selectedDateTime.isBefore(currentTime)) {
                                                    return Promise.reject(new Error('Please select a future time'));
                                                }
                                            }
                                            return Promise.resolve();
                                        }
                                    }
                                ]}
                            >
                                <StableTimePicker disabled={scheduleLoading} />
                            </Form.Item>

                            {/* Additional Notes */}
                            <Form.Item
                                name="notes"
                                label="Additional Notes (Optional)"
                            >
                                <Input.TextArea
                                    rows={3}
                                    placeholder="Any special requests, questions, or specific areas you'd like to see..."
                                    maxLength={500}
                                    showCount
                                    disabled={scheduleLoading}
                                />
                            </Form.Item>

                            {/* Hidden fields */}
                            <Form.Item name="propertyId" hidden>
                                <Input />
                            </Form.Item>
                            <Form.Item name="agentId" hidden>
                                <Input />
                            </Form.Item>

                            <Form.Item style={{ marginBottom: 0 }}>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    block
                                    loading={scheduleLoading}
                                    style={{
                                        borderRadius: '8px',
                                        height: '40px',
                                        fontWeight: '600',
                                        fontSize: '14px',
                                        background: '#1B3C53',
                                        borderColor: '#1B3C53'
                                    }}
                                >
                                    {scheduleLoading ? 'Scheduling...' : 'Schedule Tour'}
                                </Button>
                            </Form.Item>

                            <div style={{
                                textAlign: 'center',
                                marginTop: '12px',
                                fontSize: '11px',
                                color: '#64748b'
                            }}>
                                The agent will contact you to confirm your tour schedule.
                            </div>
                        </Form>
                    </Spin>
                </Modal>
            </Content>
        </Layout>
    );
};

export default PropertySearchPage;