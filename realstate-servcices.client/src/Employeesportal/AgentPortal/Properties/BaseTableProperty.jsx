// BaseTableProperty.jsx
import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Space,
    Tag,
    Image,
    Modal,
    message,
    Popconfirm,
    Tooltip,
    Card,
    Input,
    Select,
    DatePicker,
} from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    PlusOutlined,
    SearchOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;

const BaseTableProperty = ({
    dataSource = [],
    loading = false,
    onEdit,
    onDelete,
    onView,
    onCreate,
    onRefresh,
    pagination = {},
    rowSelection
}) => {
    const [filteredData, setFilteredData] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    useEffect(() => {
        setFilteredData(dataSource);
    }, [dataSource]);

    const handleSearch = (value) => {
        setSearchText(value);
        const filtered = dataSource.filter(item =>
            item.title?.toLowerCase().includes(value.toLowerCase()) ||
            item.propertyNo?.toLowerCase().includes(value.toLowerCase()) ||
            item.city?.toLowerCase().includes(value.toLowerCase()) ||
            item.address?.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredData(filtered);
    };

    const handleStatusFilter = (value) => {
        setStatusFilter(value);
        if (value === 'all') {
            setFilteredData(dataSource);
        } else {
            const filtered = dataSource.filter(item => item.status === value);
            setFilteredData(filtered);
        }
    };

    const handleTypeFilter = (value) => {
        setTypeFilter(value);
        if (value === 'all') {
            setFilteredData(dataSource);
        } else {
            const filtered = dataSource.filter(item => item.type === value);
            setFilteredData(filtered);
        }
    };

    const handleResetFilters = () => {
        setSearchText('');
        setStatusFilter('all');
        setTypeFilter('all');
        setFilteredData(dataSource);
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'available':
                return 'green';
            case 'sold':
                return 'red';
            case 'pending':
                return 'orange';
            case 'rented':
                return 'blue';
            default:
                return 'default';
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const columns = [
        {
            title: 'Property No',
            dataIndex: 'propertyNo',
            key: 'propertyNo',
            width: 120,
            render: (text) => (
                <Tooltip title={text}>
                    <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                        {text?.substring(0, 8)}...
                    </span>
                </Tooltip>
            ),
        },
        {
            title: 'Image',
            dataIndex: 'mainImage',
            key: 'mainImage',
            width: 80,
            render: (url) => (
                <Image
                    width={50}
                    height={40}
                    src={url || '/default-property.jpg'}
                    alt="Property"
                    style={{ objectFit: 'cover', borderRadius: '4px' }}
                    fallback="/default-property.jpg"
                />
            ),
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            width: 200,
            ellipsis: true,
            render: (text) => (
                <Tooltip title={text}>
                    <span>{text}</span>
                </Tooltip>
            ),
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            width: 100,
            render: (type) => <Tag color="#1a365d">{type}</Tag>, // Dark blue color
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            width: 120,
            render: (price) => formatCurrency(price),
            sorter: (a, b) => a.price - b.price,
        },
        {
            title: 'City',
            dataIndex: 'city',
            key: 'city',
            width: 120,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {status?.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Bed/Bath',
            key: 'bedBath',
            width: 100,
            render: (_, record) => (
                <span>{record.bedrooms} bed / {record.bathrooms} bath</span>
            ),
        },
        {
            title: 'Area',
            dataIndex: 'areaSqft',
            key: 'areaSqft',
            width: 100,
            render: (area) => `${area?.toLocaleString()} sqft`,
            sorter: (a, b) => a.areaSqft - b.areaSqft,
        },
        {
            title: 'Listed Date',
            dataIndex: 'listedDate',
            key: 'listedDate',
            width: 120,
            render: (date) => dayjs(date).format('MMM DD, YYYY'),
            sorter: (a, b) => dayjs(a.listedDate).unix() - dayjs(b.listedDate).unix(),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="View Details">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => onView && onView(record)}
                            size="small"
                        />
                    </Tooltip>
                    <Tooltip title="Edit">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => onEdit && onEdit(record)}
                            size="small"
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Delete Property"
                        description="Are you sure you want to delete this property?"
                        onConfirm={() => onDelete && onDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                        okType="danger"
                    >
                        <Tooltip title="Delete">
                            <Button
                                type="text"
                                icon={<DeleteOutlined />}
                                danger
                                size="small"
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Card>
            {/* Filters Section */}
            <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Search
                    placeholder="Search properties..."
                    allowClear
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onSearch={handleSearch}
                    style={{ width: 250 }}
                />

                <Select
                    value={statusFilter}
                    onChange={handleStatusFilter}
                    style={{ width: 150 }}
                    placeholder="Filter by status"
                >
                    <Option value="all">All Status</Option>
                    <Option value="available">Available</Option>
                    <Option value="sold">Sold</Option>
                    <Option value="pending">Pending</Option>
                    <Option value="rented">Rented</Option>
                </Select>

                <Select
                    value={typeFilter}
                    onChange={handleTypeFilter}
                    style={{ width: 150 }}
                    placeholder="Filter by type"
                >
                    <Option value="all">All Types</Option>
                    <Option value="house">House</Option>
                    <Option value="apartment">Apartment</Option>
                    <Option value="condo">Condo</Option>
                    <Option value="villa">Villa</Option>
                </Select>

                <Button
                    icon={<ReloadOutlined />}
                    onClick={handleResetFilters}
                >
                    Reset
                </Button>

                <div style={{ flex: 1 }} />

                <Space>
                    {onRefresh && (
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={onRefresh}
                            loading={loading}
                        >
                            Refresh
                        </Button>
                    )}
                    {onCreate && (
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={onCreate}
                            style={{ backgroundColor: '#1a365d', borderColor: '#1a365d' }} // Dark blue color
                        >
                            Add Property
                        </Button>
                    )}
                </Space>
            </div>

            {/* Table */}
            <Table
                columns={columns}
                dataSource={filteredData}
                loading={loading}
                rowKey="id"
                scroll={{ x: 1200 }}
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                        `Showing ${range[0]}-${range[1]} of ${total} properties`,
                }}
                rowSelection={rowSelection}
            />
        </Card>
    );
};

export default BaseTableProperty;