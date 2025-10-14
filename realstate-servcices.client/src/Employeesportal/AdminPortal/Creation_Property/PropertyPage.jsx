import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Space,
    Tag,
    Card,
    Input,
    Select,
    Modal,
    message,
    Tooltip,
    Avatar,
    Image,
    Badge,
    Dropdown,
    Menu,
    Row,
    Col,
    DatePicker
} from 'antd';
import {
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    PlusOutlined,
    ReloadOutlined,
    CheckOutlined,
    CloseOutlined,
    UserSwitchOutlined,
    MoreOutlined
} from '@ant-design/icons';
import BaseTable from './BaseTable';
import InsertProperty from './InsertProperty';
import ChangeHandlerModal from './ChangeHandlerModal';
import propertyService from './services/propertyService';

const { Search } = Input;
const { Option } = Select;

const PropertyPage = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [changeHandlerModalVisible, setChangeHandlerModalVisible] = useState(false);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

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
            message.error('Failed to load properties');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const handleStatusFilter = (value) => {
        setStatusFilter(value);
    };

    const handleTypeFilter = (value) => {
        setTypeFilter(value);
    };

    const filteredProperties = properties.filter(property => {
        const matchesSearch = property.title?.toLowerCase().includes(searchText.toLowerCase()) ||
            property.address?.toLowerCase().includes(searchText.toLowerCase()) ||
            property.city?.toLowerCase().includes(searchText.toLowerCase());

        const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
        const matchesType = typeFilter === 'all' || property.type === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
    });

    const handleEdit = (property) => {
        setSelectedProperty(property);
        setIsModalVisible(true);
    };

    const handleView = (property) => {
        setSelectedProperty(property);
        setViewModalVisible(true);
    };

    const handleDelete = async (propertyId) => {
        Modal.confirm({
            title: 'Confirm Delete',
            content: 'Are you sure you want to delete this property?',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await propertyService.deleteProperty(propertyId);
                    message.success('Property deleted successfully');
                    loadProperties();
                } catch (error) {
                    message.error('Failed to delete property');
                }
            },
        });
    };

    const handleApprove = async (propertyId) => {
        try {
            await propertyService.approveProperty(propertyId);
            message.success('Property approved successfully');
            loadProperties();
        } catch (error) {
            message.error('Failed to approve property');
        }
    };

    const handleReject = async (propertyId, reason) => {
        try {
            await propertyService.rejectProperty(propertyId, reason);
            message.success('Property rejected successfully');
            setRejectModalVisible(false);
            setRejectReason('');
            loadProperties();
        } catch (error) {
            message.error('Failed to reject property');
        }
    };

    const handleChangeHandler = (property) => {
        setSelectedProperty(property);
        setChangeHandlerModalVisible(true);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
        setSelectedProperty(null);
    };

    const handleSuccess = () => {
        loadProperties();
        handleModalClose();
    };

    const handleHandlerChangeSuccess = () => {
        loadProperties();
        setChangeHandlerModalVisible(false);
        setSelectedProperty(null);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'green';
            case 'pending': return 'orange';
            case 'rejected': return 'red';
            case 'sold': return 'purple';
            case 'rented': return 'blue';
            case 'available': return 'green';
            default: return 'default';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'approved': return 'APPROVED';
            case 'pending': return 'PENDING APPROVAL';
            case 'rejected': return 'REJECTED';
            case 'sold': return 'SOLD';
            case 'rented': return 'RENTED';
            case 'available': return 'AVAILABLE';
            default: return status?.toUpperCase() || 'UNKNOWN';
        }
    };

    const actionMenu = (record) => (
        <Menu>
            <Menu.Item key="view" icon={<EyeOutlined />} onClick={() => handleView(record)}>
                View Details
            </Menu.Item>
            <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                Edit Property
            </Menu.Item>
            <Menu.Item key="changeHandler" icon={<UserSwitchOutlined />} onClick={() => handleChangeHandler(record)}>
                Change Handler
            </Menu.Item>
            {record.status === 'pending' && (
                <>
                    <Menu.Item key="approve" icon={<CheckOutlined />} onClick={() => handleApprove(record.id)}>
                        Approve Property
                    </Menu.Item>
                    <Menu.Item key="reject" icon={<CloseOutlined />} onClick={() => {
                        setSelectedProperty(record);
                        setRejectModalVisible(true);
                    }}>
                        Reject Property
                    </Menu.Item>
                </>
            )}
            <Menu.Divider />
            <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)}>
                Delete Property
            </Menu.Item>
        </Menu>
    );

    const columns = [
        {
            title: 'Property',
            dataIndex: 'title',
            key: 'property',
            render: (text, record) => (
                <Space>
                    <Badge dot={record.status === 'pending'} color="orange" offset={[-5, 5]}>
                        <Avatar
                            src={record.mainImage || record.propertyImages?.[0]?.imageUrl}
                            shape="square"
                            style={{ backgroundColor: '#1a365d' }}
                        >
                            {text?.[0]}
                        </Avatar>
                    </Badge>
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
            render: (type) => <Tag color="blue">{type}</Tag>,
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price) => price ? `$${price.toLocaleString()}` : 'Not set',
        },
        {
            title: 'Bed/Bath',
            key: 'bedBath',
            render: (_, record) => `${record.bedrooms || 0} BD / ${record.bathrooms || 0} BA`,
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
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="View Details">
                        <Button
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={() => handleView(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Edit">
                        <Button
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Change Handler">
                        <Button
                            icon={<UserSwitchOutlined />}
                            size="small"
                            onClick={() => handleChangeHandler(record)}
                        />
                    </Tooltip>
                    {record.status === 'pending' && (
                        <>
                            <Tooltip title="Approve">
                                <Button
                                    icon={<CheckOutlined />}
                                    size="small"
                                    type="primary"
                                    ghost
                                    onClick={() => handleApprove(record.id)}
                                />
                            </Tooltip>
                            <Tooltip title="Reject">
                                <Button
                                    icon={<CloseOutlined />}
                                    size="small"
                                    danger
                                    ghost
                                    onClick={() => {
                                        setSelectedProperty(record);
                                        setRejectModalVisible(true);
                                    }}
                                />
                            </Tooltip>
                        </>
                    )}
                    <Dropdown overlay={actionMenu(record)} trigger={['click']}>
                        <Button
                            icon={<MoreOutlined />}
                            size="small"
                        />
                    </Dropdown>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Card>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                    <Space>
                        <Search
                            placeholder="Search properties..."
                            allowClear
                            onSearch={handleSearch}
                            style={{ width: 300 }}
                        />
                        <Select
                            defaultValue="all"
                            style={{ width: 180 }}
                            onChange={handleStatusFilter}
                        >
                            <Option value="all">All Status</Option>
                            <Option value="pending">Pending Approval</Option>
                            <Option value="approved">Approved</Option>
                            <Option value="rejected">Rejected</Option>
                            <Option value="available">Available</Option>
                            <Option value="sold">Sold</Option>
                            <Option value="rented">Rented</Option>
                        </Select>
                        <Select
                            defaultValue="all"
                            style={{ width: 150 }}
                            onChange={handleTypeFilter}
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
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setIsModalVisible(true)}
                        >
                            Add Property
                        </Button>
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
                            `${range[0]}-${range[1]} of ${total} items`,
                    }}
                />
            </Card>

            {/* Edit/Create Property Modal */}
            <Modal
                title={selectedProperty ? 'Edit Property' : 'Add New Property'}
                open={isModalVisible}
                onCancel={handleModalClose}
                footer={null}
                width={1000}
                destroyOnClose
            >
                <InsertProperty
                    property={selectedProperty}
                    onSuccess={handleSuccess}
                    onCancel={handleModalClose}
                />
            </Modal>

            {/* View Property Modal */}
            <Modal
                title="Property Details"
                open={viewModalVisible}
                onCancel={() => setViewModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setViewModalVisible(false)}>
                        Close
                    </Button>
                ]}
                width={800}
            >
                {selectedProperty && (
                    <div>
                        <div style={{ marginBottom: 16, textAlign: 'center' }}>
                            {selectedProperty.mainImage && (
                                <Image
                                    width={200}
                                    src={selectedProperty.mainImage}
                                    alt={selectedProperty.title}
                                />
                            )}
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <strong>Title:</strong> {selectedProperty.title}
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <strong>Description:</strong> {selectedProperty.description}
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <strong>Address:</strong> {selectedProperty.address}, {selectedProperty.city}, {selectedProperty.state} {selectedProperty.zipCode}
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <strong>Price:</strong> ${selectedProperty.price?.toLocaleString()}
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <strong>Type:</strong> {selectedProperty.type}
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <strong>Bedrooms/Bathrooms:</strong> {selectedProperty.bedrooms || 0} BD / {selectedProperty.bathrooms || 0} BA
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <strong>Area:</strong> {selectedProperty.areaSqft?.toLocaleString()} sqft
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <strong>Status:</strong> <Tag color={getStatusColor(selectedProperty.status)}>
                                {getStatusText(selectedProperty.status)}
                            </Tag>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <strong>Agent:</strong> {selectedProperty.agent ? `${selectedProperty.agent.firstName} ${selectedProperty.agent.lastName}` : 'No Agent'}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Change Handler Modal */}
            <ChangeHandlerModal
                visible={changeHandlerModalVisible}
                property={selectedProperty}
                onSuccess={handleHandlerChangeSuccess}
                onCancel={() => {
                    setChangeHandlerModalVisible(false);
                    setSelectedProperty(null);
                }}
            />

            {/* Reject Property Modal */}
            <Modal
                title="Reject Property"
                open={rejectModalVisible}
                onCancel={() => {
                    setRejectModalVisible(false);
                    setRejectReason('');
                }}
                onOk={() => handleReject(selectedProperty?.id, rejectReason)}
                okText="Reject Property"
                okType="danger"
            >
                <p>Are you sure you want to reject this property?</p>
                <Input.TextArea
                    placeholder="Please provide a reason for rejection..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={4}
                />
            </Modal>
        </div>
    );
};

export default PropertyPage;