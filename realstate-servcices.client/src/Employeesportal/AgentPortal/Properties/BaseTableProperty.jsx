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

    // Enhanced image URL processor - matches getUserProfileImage pattern
    const processImageUrl = (url) => {
        if (!url || url === 'string') {
            console.log('No URL or invalid URL provided:', url);
            return '/default-property.jpg';
        }

        // If it's already a full URL, return as is
        if (url.startsWith('http') || url.startsWith('//') || url.startsWith('blob:')) {
            return url;
        }

        // If it starts with /uploads, prepend the base URL like in getUserProfileImage
        if (url.startsWith('/uploads/')) {
            return `https://localhost:7075${url}`;
        }

        // If it's just a filename or relative path, construct the full URL
        if (url.includes('.') && !url.startsWith('/')) {
            const fullUrl = `https://localhost:7075/uploads/properties/${url}`;
            console.log('Converted filename to full URL:', url, '->', fullUrl);
            return fullUrl;
        }

        // If it's a relative path without leading slash, add base URL
        if (url.startsWith('uploads/')) {
            const fullUrl = `https://localhost:7075/${url}`;
            console.log('Added base URL to relative path:', url, '->', fullUrl);
            return fullUrl;
        }

        console.log('Using default image for URL:', url);
        return '/default-property.jpg';
    };

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
            render: (url, record) => {
                const imageUrl = processImageUrl(url);
                console.log(`Rendering image for ${record.title}:`, imageUrl);

                return (
                    <Image
                        width={50}
                        height={40}
                        src={imageUrl}
                        alt="Property"
                        style={{
                            objectFit: 'cover',
                            borderRadius: '4px',
                            backgroundColor: '#f5f5f5'
                        }}
                        placeholder={
                            <div style={{
                                width: 50,
                                height: 40,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#f5f5f5',
                                borderRadius: '4px'
                            }}>
                                <span style={{ fontSize: '10px', color: '#999' }}>Loading...</span>
                            </div>
                        }
                        fallback="/default-property.jpg"
                        preview={{
                            mask: <EyeOutlined />,
                            src: imageUrl,
                        }}
                        onError={(e) => {
                            console.error(`Failed to load image: ${imageUrl}`);
                            e.target.src = '/default-property.jpg';
                        }}
                    />
                );
            },
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
            render: (type) => <Tag color="#1a365d">{type?.charAt(0).toUpperCase() + type?.slice(1)}</Tag>,
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
            render: (city) => city || 'N/A',
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
                <span>{record.bedrooms || 0} bed / {record.bathrooms || 0} bath</span>
            ),
        },
        {
            title: 'Area',
            dataIndex: 'areaSqft',
            key: 'areaSqft',
            width: 100,
            render: (area) => area ? `${area?.toLocaleString()} sqft` : 'N/A',
            sorter: (a, b) => (a.areaSqft || 0) - (b.areaSqft || 0),
        },
        {
            title: 'Listed Date',
            dataIndex: 'listedDate',
            key: 'listedDate',
            width: 120,
            render: (date) => date ? dayjs(date).format('MMM DD, YYYY') : 'N/A',
            sorter: (a, b) => dayjs(a.listedDate || 0).unix() - dayjs(b.listedDate || 0).unix(),
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
                    <Option value="townhouse">Townhouse</Option>
                    <Option value="commercial">Commercial</Option>
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
                            style={{ backgroundColor: '#1a365d', borderColor: '#1a365d' }}
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