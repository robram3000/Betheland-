import React, { useState, useEffect } from 'react';
import {
    Table,
    Card,
    Select,
    Input,
    Space,
    Tag,
    Avatar,
    Tooltip,
    Button,
    Statistic,
    Row,
    Col,
    message
} from 'antd';
import { SearchOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import BaseTable from './BaseTable';
import propertyService from './services/propertyService';

const { Option } = Select;
const { Search } = Input;

const PropertyManagementTable = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    useEffect(() => {
        loadProperties();
    }, []);

    const loadProperties = async () => {
        setLoading(true);
        try {
            // Use the correct service method
            const data = await propertyService.getAllProperties();
            console.log('Management - Loaded properties:', data); // Debug log
            setProperties(data || []);
        } catch (error) {
            console.error('Error loading properties:', error);
            message.error('Failed to load properties');
            setProperties([]); // Ensure it's always an array
        } finally {
            setLoading(false);
        }
    };

    const filteredProperties = properties.filter(property => {
        const matchesSearch = property.title?.toLowerCase().includes(searchText.toLowerCase()) ||
            property.address?.toLowerCase().includes(searchText.toLowerCase()) ||
            property.city?.toLowerCase().includes(searchText.toLowerCase());

        const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
        const matchesType = typeFilter === 'all' || property.type === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
    });

    const getStats = () => {
        const total = properties.length;
        const available = properties.filter(p => p.status === 'available' || p.status === 'approved').length;
        const pending = properties.filter(p => p.status === 'pending').length;
        const sold = properties.filter(p => p.status === 'sold' || p.status === 'rented').length;

        return { total, available, pending, sold };
    };

    const stats = getStats();

    const handleViewProperty = (property) => {
        console.log('View property:', property);
        // You can implement a modal or navigation to property details here
        message.info(`Viewing property: ${property.title}`);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'available':
            case 'approved': return 'green';
            case 'pending': return 'orange';
            case 'sold':
            case 'rented': return 'red';
            case 'rejected': return 'red';
            default: return 'default';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'approved': return 'APPROVED';
            case 'pending': return 'PENDING';
            case 'rejected': return 'REJECTED';
            case 'sold': return 'SOLD';
            case 'rented': return 'RENTED';
            case 'available': return 'AVAILABLE';
            default: return status?.toUpperCase() || 'UNKNOWN';
        }
    };

    const columns = [
        {
            title: 'Property',
            dataIndex: 'title',
            key: 'property',
            render: (text, record) => (
                <Space>
                    <Avatar
                        src={record.mainImage || record.propertyImages?.[0]?.imageUrl}
                        shape="square"
                        style={{ backgroundColor: '#1a365d' }}
                    >
                        {text?.[0]}
                    </Avatar>
                    <div>
                        <div style={{ fontWeight: 500 }}>{text}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            {record.address}, {record.city}
                        </div>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type) => <Tag color="blue">{type || 'Not specified'}</Tag>,
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price) => price ? `$${price.toLocaleString()}` : 'Not set',
            sorter: (a, b) => (a.price || 0) - (b.price || 0),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {getStatusText(status)}
                </Tag>
            ),
            filters: [
                { text: 'Available', value: 'available' },
                { text: 'Pending', value: 'pending' },
                { text: 'Approved', value: 'approved' },
                { text: 'Sold', value: 'sold' },
                { text: 'Rented', value: 'rented' },
                { text: 'Rejected', value: 'rejected' },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Bed/Bath',
            key: 'bedBath',
            render: (_, record) => `${record.bedrooms || 0} BD / ${record.bathrooms || 0} BA`,
        },
        {
            title: 'Area',
            dataIndex: 'areaSqm',
            key: 'area',
            render: (area) => area ? `${area} sqm` : 'Not set',
        },
        {
            title: 'Agent',
            dataIndex: 'agent',
            key: 'agent',
            render: (agent) => agent ? (
                <Space>
                    <Avatar size="small" src={agent.profilePictureUrl}>
                        {agent.firstName?.[0]}{agent.lastName?.[0]}
                    </Avatar>
                    {agent.firstName} {agent.lastName}
                </Space>
            ) : 'No Agent',
        },
        {
            title: 'Listed Date',
            dataIndex: 'listedDate',
            key: 'listedDate',
            render: (date) => date ? new Date(date).toLocaleDateString() : 'Not set',
            sorter: (a, b) => new Date(a.listedDate) - new Date(b.listedDate),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Tooltip title="View Property Details">
                    <Button
                        icon={<EyeOutlined />}
                        size="small"
                        onClick={() => handleViewProperty(record)}
                    >
                        View
                    </Button>
                </Tooltip>
            ),
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <Row gutter={16}>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Total Properties"
                                value={stats.total}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Available"
                                value={stats.available}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Pending"
                                value={stats.pending}
                                valueStyle={{ color: '#fa8c16' }}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Sold/Rented"
                                value={stats.sold}
                                valueStyle={{ color: '#f5222d' }}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>

            <Card>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    <Space wrap>
                        <Search
                            placeholder="Search properties by title, address, or city..."
                            allowClear
                            onSearch={setSearchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{ width: 300 }}
                        />
                        <Select
                            value={statusFilter}
                            style={{ width: 150 }}
                            onChange={setStatusFilter}
                            placeholder="Filter by status"
                        >
                            <Option value="all">All Status</Option>
                            <Option value="available">Available</Option>
                            <Option value="pending">Pending</Option>
                            <Option value="approved">Approved</Option>
                            <Option value="sold">Sold</Option>
                            <Option value="rented">Rented</Option>
                            <Option value="rejected">Rejected</Option>
                        </Select>
                        <Select
                            value={typeFilter}
                            style={{ width: 150 }}
                            onChange={setTypeFilter}
                            placeholder="Filter by type"
                        >
                            <Option value="all">All Types</Option>
                            <Option value="House">House</Option>
                            <Option value="Apartment">Apartment</Option>
                            <Option value="Condo">Condo</Option>
                            <Option value="Townhouse">Townhouse</Option>
                            <Option value="Land">Land</Option>
                            <Option value="Commercial">Commercial</Option>
                        </Select>
                    </Space>
                    <Space>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={loadProperties}
                            loading={loading}
                        >
                            Refresh
                        </Button>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            Showing {filteredProperties.length} of {properties.length} properties
                        </div>
                    </Space>
                </div>

                <BaseTable
                    data={filteredProperties}
                    columns={columns}
                    loading={loading}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} of ${total} properties`,
                    }}
                    scroll={{ x: 1200 }}
                />
            </Card>
        </div>
    );
};

export default PropertyManagementTable;