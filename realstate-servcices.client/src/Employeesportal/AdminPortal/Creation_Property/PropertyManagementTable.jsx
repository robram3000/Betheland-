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
    Col
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
            const data = await propertyService.getProperties();
            setProperties(data);
        } catch (error) {
            console.error('Error loading properties:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProperties = properties.filter(property => {
        const matchesSearch = property.title?.toLowerCase().includes(searchText.toLowerCase()) ||
            property.address?.toLowerCase().includes(searchText.toLowerCase());

        const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
        const matchesType = typeFilter === 'all' || property.type === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
    });

    const getStats = () => {
        const total = properties.length;
        const available = properties.filter(p => p.status === 'available').length;
        const pending = properties.filter(p => p.status === 'pending').length;
        const sold = properties.filter(p => p.status === 'sold').length;

        return { total, available, pending, sold };
    };

    const stats = getStats();

    const handleViewProperty = (propertyId) => {
        console.log('View property:', propertyId);
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
                            {record.address}
                        </div>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type) => <Tag color="blue">{type}</Tag>,
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price) => price ? `$${price.toLocaleString()}` : 'Not set',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const color = status === 'available' ? 'green' :
                    status === 'pending' ? 'orange' : 'red';
                return <Tag color={color}>{status?.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Agent',
            dataIndex: 'agent',
            key: 'agent',
            render: (agent) => agent ? `${agent.firstName} ${agent.lastName}` : 'No Agent',
        },
        {
            title: 'Listed Date',
            dataIndex: 'listedDate',
            key: 'listedDate',
            render: (date) => date ? new Date(date).toLocaleDateString() : 'Not set',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Tooltip title="View Property">
                    <Button
                        icon={<EyeOutlined />}
                        size="small"
                        onClick={() => handleViewProperty(record.id)}
                    />
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
                            <Statistic title="Total Properties" value={stats.total} />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic title="Available" value={stats.available} valueStyle={{ color: '#3f8600' }} />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic title="Pending" value={stats.pending} valueStyle={{ color: '#cf1322' }} />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic title="Sold/Rented" value={stats.sold} />
                        </Card>
                    </Col>
                </Row>
            </div>

            <Card>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                    <Space>
                        <Search
                            placeholder="Search properties..."
                            allowClear
                            onSearch={setSearchText}
                            style={{ width: 300 }}
                        />
                        <Select
                            defaultValue="all"
                            style={{ width: 150 }}
                            onChange={setStatusFilter}
                        >
                            <Option value="all">All Status</Option>
                            <Option value="available">Available</Option>
                            <Option value="pending">Pending</Option>
                            <Option value="sold">Sold</Option>
                            <Option value="rented">Rented</Option>
                        </Select>
                        <Select
                            defaultValue="all"
                            style={{ width: 150 }}
                            onChange={setTypeFilter}
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
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={loadProperties}
                        loading={loading}
                    >
                        Refresh
                    </Button>
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
                    }}
                />
            </Card>
        </div>
    );
};

export default PropertyManagementTable;