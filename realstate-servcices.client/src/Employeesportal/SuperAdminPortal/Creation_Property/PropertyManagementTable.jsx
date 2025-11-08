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
    message,
    Badge,
    Image,
    Modal,
    Divider
} from 'antd';
import {
    SearchOutlined,
    EyeOutlined,
    ReloadOutlined,
    FilterOutlined,
    PictureOutlined,
    PlayCircleOutlined
} from '@ant-design/icons';
import BaseTable from './BaseTable';
import propertyService from '../../AdminPortal/Creation_Property/services/propertyService';
import { processImageUrl, getPropertyImage, getAllMedia, getMediaCounts } from './processImageUrl';

const { Option } = Select;
const { Search } = Input;

const PropertyManagementTable = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [priceRangeFilter, setPriceRangeFilter] = useState('all');
    const [mediaModalVisible, setMediaModalVisible] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

    useEffect(() => {
        loadProperties();
    }, []);

    const loadProperties = async () => {
        setLoading(true);
        try {
            const data = await propertyService.getAllProperties();
            console.log('Management - Loaded properties:', data);
            setProperties(data || []);
        } catch (error) {
            console.error('Error loading properties:', error);
            message.error('Failed to load properties');
            setProperties([]);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenMedia = (property, index = 0) => {
        setSelectedProperty(property);
        setCurrentMediaIndex(index);
        setMediaModalVisible(true);
    };

    const filteredProperties = properties.filter(property => {
        const matchesSearch = property.title?.toLowerCase().includes(searchText.toLowerCase()) ||
            property.address?.toLowerCase().includes(searchText.toLowerCase()) ||
            property.city?.toLowerCase().includes(searchText.toLowerCase());

        const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
        const matchesType = typeFilter === 'all' || property.type === typeFilter;

        const matchesPriceRange = priceRangeFilter === 'all' ||
            (priceRangeFilter === 'low' && (property.price || 0) < 500000) ||
            (priceRangeFilter === 'medium' && (property.price || 0) >= 500000 && (property.price || 0) < 2000000) ||
            (priceRangeFilter === 'high' && (property.price || 0) >= 2000000);

        return matchesSearch && matchesStatus && matchesType && matchesPriceRange;
    });

    const getStats = () => {
        const total = properties.length;
        const available = properties.filter(p => p.status === 'available' || p.status === 'approved').length;
        const pending = properties.filter(p => p.status === 'pending').length;
        const sold = properties.filter(p => p.status === 'sold' || p.status === 'rented').length;
        const withPhotos = properties.filter(p =>
            p.mainImage ||
            (p.propertyImages && p.propertyImages.length > 0) ||
            (p.imageUrls && p.imageUrls.length > 0)
        ).length;

        return { total, available, pending, sold, withPhotos };
    };

    const stats = getStats();

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

    const renderMediaPreview = (property) => {
        const allMedia = getAllMedia(property);
        const hasMedia = allMedia.length > 0;
        const { imageCount, videoCount } = getMediaCounts(property);

        return (
            <Space direction="vertical" size={8} align="center">
                <Button
                    type="primary"
                    icon={<PictureOutlined />}
                    size="small"
                    onClick={() => handleOpenMedia(property)}
                    style={{
                        backgroundColor: '#1e3a8a',
                        borderColor: '#1e3a8a',
                        fontWeight: 500
                    }}
                >
                    View Media
                </Button>
                {hasMedia && (
                    <div style={{ fontSize: '11px', color: '#666', textAlign: 'center' }}>
                        <div>
                            <PictureOutlined style={{ marginRight: 4, color: '#1e3a8a' }} />
                            {imageCount} image{imageCount !== 1 ? 's' : ''}
                        </div>
                        {videoCount > 0 && (
                            <div>
                                <PlayCircleOutlined style={{ marginRight: 4, color: '#1e3a8a' }} />
                                {videoCount} video{videoCount !== 1 ? 's' : ''}
                            </div>
                        )}
                    </div>
                )}
                {!hasMedia && (
                    <div style={{ fontSize: '11px', color: '#999', textAlign: 'center' }}>
                        No media
                    </div>
                )}
            </Space>
        );
    };

    const columns = [
        {
            title: 'Property',
            dataIndex: 'title',
            key: 'property',
            render: (text, record) => {
                const imageUrl = getPropertyImage(record);
                const hasMedia = getAllMedia(record).length > 0;

                return (
                    <Space>
                        <Badge dot={!hasMedia} color={hasMedia ? 'green' : 'red'} offset={[-5, 5]}>
                            <Avatar
                                src={imageUrl}
                                shape="square"
                                style={{
                                    backgroundColor: '#1a365d',
                                    width: 50,
                                    height: 50,
                                    objectFit: 'cover'
                                }}
                                onError={(e) => {
                                    e.target.src = '/default-property.jpg';
                                }}
                            >
                                {text?.[0]?.toUpperCase()}
                            </Avatar>
                        </Badge>
                        <div>
                            <div style={{ fontWeight: 500 }}>{text || 'Untitled Property'}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                                {record.address}, {record.city}
                            </div>
                            <div style={{ fontSize: '11px', color: '#888', marginTop: 4 }}>
                                <Tag color="blue" size="small">{record.type || 'N/A'}</Tag>
                            </div>
                        </div>
                    </Space>
                );
            },
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price) => (
                <div style={{ fontWeight: 600, color: '#1a365d' }}>
                    {price ? `₱${price.toLocaleString()}` : 'Not set'}
                </div>
            ),
            sorter: (a, b) => (a.price || 0) - (b.price || 0),
        },
        {
            title: 'Details',
            key: 'details',
            render: (_, record) => (
                <Space direction="vertical" size={2}>
                    <div style={{ fontWeight: 500 }}>
                        {record.bedrooms || 0} BD / {record.bathrooms || 0} BA
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                        {record.areaSqm ? `${record.areaSqm} sqm` : 'Area not set'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#888' }}>
                        {record.propertyAge ? `${record.propertyAge} years` : 'Age not set'}
                    </div>
                </Space>
            ),
        },
        {
            title: 'Media',
            key: 'media',
            render: (_, record) => renderMediaPreview(record),
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
                        onClick={() => console.log('View property:', record)}
                    >
                        View
                    </Button>
                </Tooltip>
            ),
        },
    ];

    return (
        <div>
            {/* Enhanced Stats Cards */}
            <div style={{ marginBottom: 24 }}>
                <Row gutter={16}>
                    <Col span={4}>
                        <Card>
                            <Statistic
                                title="Total Properties"
                                value={stats.total}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col span={4}>
                        <Card>
                            <Statistic
                                title="Available"
                                value={stats.available}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                    <Col span={4}>
                        <Card>
                            <Statistic
                                title="Pending"
                                value={stats.pending}
                                valueStyle={{ color: '#fa8c16' }}
                            />
                        </Card>
                    </Col>
                    <Col span={4}>
                        <Card>
                            <Statistic
                                title="Sold/Rented"
                                value={stats.sold}
                                valueStyle={{ color: '#f5222d' }}
                            />
                        </Card>
                    </Col>
                    <Col span={4}>
                        <Card>
                            <Statistic
                                title="With Photos"
                                value={stats.withPhotos}
                                valueStyle={{ color: '#722ed1' }}
                            />
                        </Card>
                    </Col>
                    <Col span={4}>
                        <Card>
                            <Statistic
                                title="Photo Rate"
                                value={((stats.withPhotos / stats.total) * 100).toFixed(1)}
                                suffix="%"
                                valueStyle={{ color: '#13c2c2' }}
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
                            suffixIcon={<FilterOutlined />}
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
                            suffixIcon={<FilterOutlined />}
                        >
                            <Option value="all">All Types</Option>
                            <Option value="House">House</Option>
                            <Option value="Apartment">Apartment</Option>
                            <Option value="Condo">Condo</Option>
                            <Option value="Townhouse">Townhouse</Option>
                            <Option value="Land">Land</Option>
                            <Option value="Commercial">Commercial</Option>
                        </Select>
                        <Select
                            value={priceRangeFilter}
                            style={{ width: 180 }}
                            onChange={setPriceRangeFilter}
                            placeholder="Filter by price range"
                            suffixIcon={<FilterOutlined />}
                        >
                            <Option value="all">All Price Ranges</Option>
                            <Option value="low">Low (&lt; ₱500K)</Option>
                            <Option value="medium">Medium (₱500K - ₱2M)</Option>
                            <Option value="high">High (&gt; ₱2M)</Option>
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

            {/* Media Gallery Modal */}
            <Modal
                title="Property Media Gallery"
                open={mediaModalVisible}
                onCancel={() => setMediaModalVisible(false)}
                footer={null}
                width={800}
                style={{ top: 20 }}
            >
                {selectedProperty && (() => {
                    const allMedia = getAllMedia(selectedProperty);
                    const currentMedia = allMedia[currentMediaIndex];

                    if (allMedia.length === 0) {
                        return (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <PictureOutlined style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }} />
                                <div style={{ color: '#999' }}>No media available for this property</div>
                            </div>
                        );
                    }

                    return (
                        <div>
                            <div style={{ textAlign: 'center', marginBottom: 16 }}>
                                {currentMedia.type === 'image' ? (
                                    <Image
                                        width="100%"
                                        style={{ maxHeight: '400px', objectFit: 'contain' }}
                                        src={currentMedia.url}
                                        alt={currentMedia.title}
                                        fallback="/fallback-image.png"
                                    />
                                ) : (
                                    <video
                                        controls
                                        style={{ width: '100%', maxHeight: '400px' }}
                                        src={currentMedia.url}
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                )}
                            </div>

                            <div style={{ textAlign: 'center', marginBottom: 16 }}>
                                <strong>{currentMedia.title}</strong> ({currentMediaIndex + 1} of {allMedia.length})
                            </div>

                            {allMedia.length > 1 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
                                    <Button
                                        onClick={() => setCurrentMediaIndex(prev => prev > 0 ? prev - 1 : allMedia.length - 1)}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        onClick={() => setCurrentMediaIndex(prev => prev < allMedia.length - 1 ? prev + 1 : 0)}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}

                            {/* Media Thumbnails */}
                            {allMedia.length > 1 && (
                                <div style={{ marginTop: 16 }}>
                                    <Divider>All Media ({allMedia.length})</Divider>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                                        {allMedia.map((media, index) => (
                                            <div
                                                key={index}
                                                style={{
                                                    width: 60,
                                                    height: 60,
                                                    border: index === currentMediaIndex ? '2px solid #1890ff' : '1px solid #d9d9d9',
                                                    borderRadius: 4,
                                                    overflow: 'hidden',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => setCurrentMediaIndex(index)}
                                            >
                                                {media.type === 'image' ? (
                                                    <img
                                                        src={media.url}
                                                        alt={media.title}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    />
                                                ) : (
                                                    <div style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        backgroundColor: '#f0f0f0',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <PlayCircleOutlined style={{ fontSize: 20, color: '#666' }} />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })()}
            </Modal>
        </div>
    );
};

export default PropertyManagementTable;