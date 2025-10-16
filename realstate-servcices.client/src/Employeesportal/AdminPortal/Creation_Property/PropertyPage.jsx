import React, { useState, useEffect, useCallback } from 'react';
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
    Col
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
    MoreOutlined,
    UserOutlined
} from '@ant-design/icons';
import {
    FaBed,
    FaBath,
    FaUtensils,
    FaCar
} from 'react-icons/fa';
import BaseTable from './BaseTable';
import InsertProperty from './InsertProperty';
import ChangeHandlerModal from './ChangeHandlerModal';
import propertyService from './services/propertyService';
import agentService from '../Creation_Agent/Services/AgentService';

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
    const [agentsCache, setAgentsCache] = useState({});
    const [agentLoading, setAgentLoading] = useState({});

    // Improved agent data loader with proper state updates
    const loadAgentData = useCallback(async (agentId) => {
        if (!agentId) {
            return null;
        }

        // Check cache first
        if (agentsCache[agentId]) {
            console.log(`Using cached agent data for ID: ${agentId}`, agentsCache[agentId]);
            return agentsCache[agentId];
        }

        // Set loading state for this agent
        setAgentLoading(prev => ({ ...prev, [agentId]: true }));

        try {
            console.log(`Fetching agent data for ID: ${agentId}`);
            const agentData = await agentService.getAgent(agentId);
            console.log(`Raw agent data received:`, agentData);

            const processedAgent = {
                id: agentData.id,
                firstName: agentData.firstName || 'Unknown',
                lastName: agentData.lastName || 'Agent',
                email: agentData.email || '',
                cellPhoneNo: agentData.cellPhoneNo || '',
                profilePictureUrl: agentData.profilePictureUrl || '',
                licenseNumber: agentData.licenseNumber || ''
            };

            console.log(`Processed agent data:`, processedAgent);

            // Update cache
            setAgentsCache(prev => ({
                ...prev,
                [agentId]: processedAgent
            }));

            return processedAgent;
        } catch (error) {
            console.error(`Error loading agent ${agentId}:`, error);

            // Create fallback agent data
            const fallbackAgent = {
                id: agentId,
                firstName: 'Unknown',
                lastName: 'Agent',
                email: '',
                cellPhoneNo: '',
                profilePictureUrl: '',
                licenseNumber: ''
            };

            // Cache the fallback to prevent repeated failed requests
            setAgentsCache(prev => ({
                ...prev,
                [agentId]: fallbackAgent
            }));

            return fallbackAgent;
        } finally {
            // Clear loading state
            setAgentLoading(prev => ({ ...prev, [agentId]: false }));
        }
    }, [agentsCache]);

    // Enhanced property loader with agent data
    const loadProperties = useCallback(async () => {
        setLoading(true);
        try {
            console.log('Loading properties...');
            const data = await propertyService.getAllProperties();
            console.log('Raw properties data:', data);

            if (data && data.length > 0) {
                // First, set properties with basic data
                const initialProperties = data.map(property => ({
                    ...property,
                    agent: property.agent || null // Keep existing agent data if any
                }));

                setProperties(initialProperties);

                // Then load agent data for properties that need it
                const propertiesWithAgents = await Promise.all(
                    initialProperties.map(async (property) => {
                        let agentData = property.agent;

                        // If no agent data but we have agentId, load it
                        if (!agentData && property.agentId) {
                            console.log(`Loading agent for property ${property.id}, agentId: ${property.agentId}`);
                            agentData = await loadAgentData(property.agentId);
                        }

                        // If we have embedded agent data but it's incomplete, enhance it
                        if (agentData && agentData.id && (!agentData.firstName || agentData.firstName === 'Unknown')) {
                            console.log(`Enhancing incomplete agent data for property ${property.id}`);
                            const enhancedAgent = await loadAgentData(agentData.id);
                            agentData = enhancedAgent || agentData;
                        }

                        return {
                            ...property,
                            agent: agentData
                        };
                    })
                );

                console.log('Final processed properties with agent data:', propertiesWithAgents);
                setProperties(propertiesWithAgents);
            } else {
                console.log('No properties found');
                setProperties([]);
            }
        } catch (error) {
            console.error('Error loading properties:', error);
            message.error('Failed to load properties: ' + (error.message || 'Unknown error'));
            setProperties([]);
        } finally {
            setLoading(false);
        }
    }, [loadAgentData]);

    // Refresh agent data for a specific property
    const refreshAgentData = useCallback(async (propertyId) => {
        const property = properties.find(p => p.id === propertyId);
        if (property && property.agentId) {
            try {
                console.log(`Refreshing agent data for property ${propertyId}, agentId: ${property.agentId}`);
                const updatedAgent = await loadAgentData(property.agentId);

                setProperties(prev => prev.map(p =>
                    p.id === propertyId ? { ...p, agent: updatedAgent } : p
                ));

                message.success('Agent data refreshed successfully');
            } catch (error) {
                console.error(`Error refreshing agent data for property ${propertyId}:`, error);
                message.error('Failed to refresh agent data');
            }
        }
    }, [properties, loadAgentData]);

    // Refresh all agent data
    const refreshAllAgentData = useCallback(async () => {
        try {
            const propertiesWithAgentIds = properties.filter(p => p.agentId);
            if (propertiesWithAgentIds.length === 0) return;

            message.info('Refreshing all agent data...');

            const updatedProperties = await Promise.all(
                properties.map(async (property) => {
                    if (property.agentId) {
                        const updatedAgent = await loadAgentData(property.agentId);
                        return { ...property, agent: updatedAgent };
                    }
                    return property;
                })
            );

            setProperties(updatedProperties);
            message.success('All agent data refreshed successfully');
        } catch (error) {
            console.error('Error refreshing all agent data:', error);
            message.error('Failed to refresh agent data');
        }
    }, [properties, loadAgentData]);

    useEffect(() => {
        loadProperties();
    }, []);

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
            property.city?.toLowerCase().includes(searchText.toLowerCase()) ||
            property.agent?.firstName?.toLowerCase().includes(searchText.toLowerCase()) ||
            property.agent?.lastName?.toLowerCase().includes(searchText.toLowerCase());

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
            content: 'Are you sure you want to delete this property? This action cannot be undone.',
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await propertyService.deleteProperty(propertyId);
                    message.success('Property deleted successfully');

                    // Remove from state immediately
                    setProperties(prev => prev.filter(prop => prop.id !== propertyId));
                } catch (error) {
                    console.error('Delete error:', error);
                    message.error(error.message || 'Failed to delete property');
                }
            },
        });
    };

    const handleApprove = async (propertyId) => {
        try {
            await propertyService.approveProperty(propertyId);
            message.success('Property approved successfully');

            // Update status in state
            setProperties(prev => prev.map(prop =>
                prop.id === propertyId ? { ...prop, status: 'approved' } : prop
            ));
        } catch (error) {
            console.error('Approve error:', error);
            message.error(error.message || 'Failed to approve property');
        }
    };

    const handleReject = async (propertyId, reason) => {
        try {
            await propertyService.rejectProperty(propertyId, reason);
            message.success('Property rejected successfully');
            setRejectModalVisible(false);
            setRejectReason('');

            // Update status in state
            setProperties(prev => prev.map(prop =>
                prop.id === propertyId ? { ...prop, status: 'rejected' } : prop
            ));
        } catch (error) {
            console.error('Reject error:', error);
            message.error(error.message || 'Failed to reject property');
        }
    };

    const handleChangeHandler = (property) => {
        setSelectedProperty(property);
        setChangeHandlerModalVisible(true);
    };

    const handleStatusChange = async (propertyId, newStatus) => {
        try {
            await propertyService.changePropertyStatus(propertyId, newStatus);
            message.success(`Property status changed to ${newStatus}`);

            // Update status in state
            setProperties(prev => prev.map(prop =>
                prop.id === propertyId ? { ...prop, status: newStatus } : prop
            ));
        } catch (error) {
            console.error('Status change error:', error);
            message.error(error.message || 'Failed to change property status');
        }
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
        setSelectedProperty(null);
    };

    const handleSuccess = () => {
        loadProperties();
        handleModalClose();
    };

    const handleHandlerChangeSuccess = async (property, newAgentId) => {
        try {
            await propertyService.changePropertyHandler(property.id, newAgentId);

            // Load the new agent data
            const newAgentData = await loadAgentData(newAgentId);

            // Update the property with new agent
            setProperties(prev => prev.map(prop =>
                prop.id === property.id
                    ? { ...prop, agentId: newAgentId, agent: newAgentData }
                    : prop
            ));

            message.success('Property handler changed successfully');
            setChangeHandlerModalVisible(false);
            setSelectedProperty(null);
        } catch (error) {
            console.error('Handler change error:', error);
            message.error(error.message || 'Failed to change property handler');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'green';
            case 'pending': return 'orange';
            case 'rejected': return 'red';
            case 'sold': return 'purple';
            case 'rented': return 'blue';
            case 'available': return 'green';
            case 'draft': return 'gray';
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
            case 'draft': return 'DRAFT';
            default: return status?.toUpperCase() || 'UNKNOWN';
        }
    };

    const getAgentDisplayName = (agent) => {
        if (!agent) return 'No Agent Assigned';
        if (agent.firstName && agent.lastName && agent.firstName !== 'Unknown' && agent.lastName !== 'Agent') {
            return `${agent.firstName} ${agent.lastName}`;
        }
        if (agent.firstName && agent.firstName !== 'Unknown') return agent.firstName;
        if (agent.lastName && agent.lastName !== 'Agent') return agent.lastName;
        return 'Unknown Agent';
    };

    const getAgentContactInfo = (agent) => {
        if (!agent) return '';
        const contactInfo = [];
        if (agent.email) contactInfo.push(agent.email);
        if (agent.cellPhoneNo) contactInfo.push(agent.cellPhoneNo);
        return contactInfo.join(' • ');
    };

    const getAgentAvatar = (agent) => {
        if (agent?.profilePictureUrl) {
            return <Avatar size="small" src={agent.profilePictureUrl} />;
        }
        return <Avatar size="small" icon={<UserOutlined />} />;
    };

    const isAgentLoading = (agentId) => {
        return agentLoading[agentId] || false;
    };

    // Render amenities with dropdown for more than 3 items
    const renderAmenities = (amenities) => {
        if (!amenities || amenities.length === 0) {
            return <span style={{ color: '#999' }}>No amenities</span>;
        }

        const displayAmenities = amenities.slice(0, 3);
        const remainingAmenities = amenities.slice(3);

        const content = (
            <Space size={[4, 4]} wrap>
                {displayAmenities.map((amenity, index) => (
                    <Tag key={index} size="small" color="blue">
                        {amenity}
                    </Tag>
                ))}
                {remainingAmenities.length > 0 && (
                    <Dropdown
                        overlay={
                            <Menu>
                                {remainingAmenities.map((amenity, index) => (
                                    <Menu.Item key={index}>
                                        {amenity}
                                    </Menu.Item>
                                ))}
                            </Menu>
                        }
                        trigger={['click']}
                    >
                        <Tag size="small" color="blue" style={{ cursor: 'pointer' }}>
                            +{remainingAmenities.length} more
                        </Tag>
                    </Dropdown>
                )}
            </Space>
        );

        return content;
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
            {record.agentId && (
                <Menu.Item
                    key="refreshAgent"
                    icon={<ReloadOutlined />}
                    onClick={() => refreshAgentData(record.id)}
                    disabled={isAgentLoading(record.agentId)}
                >
                    {isAgentLoading(record.agentId) ? 'Refreshing...' : 'Refresh Agent Data'}
                </Menu.Item>
            )}
            <Menu.SubMenu key="status" title="Change Status" icon={<CheckOutlined />}>
                <Menu.Item key="available" onClick={() => handleStatusChange(record.id, 'available')}>
                    Mark as Available
                </Menu.Item>
                <Menu.Item key="sold" onClick={() => handleStatusChange(record.id, 'sold')}>
                    Mark as Sold
                </Menu.Item>
                <Menu.Item key="rented" onClick={() => handleStatusChange(record.id, 'rented')}>
                    Mark as Rented
                </Menu.Item>
                <Menu.Item key="pending" onClick={() => handleStatusChange(record.id, 'pending')}>
                    Mark as Pending
                </Menu.Item>
                <Menu.Item key="draft" onClick={() => handleStatusChange(record.id, 'draft')}>
                    Mark as Draft
                </Menu.Item>
            </Menu.SubMenu>
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
                <Space direction="vertical" size={4}>
                    <Space>
                        <Badge dot={record.status === 'pending'} color="orange" offset={[-5, 5]}>
                            <Avatar
                                src={record.mainImage || record.propertyImages?.[0]?.imageUrl}
                                shape="square"
                                style={{ backgroundColor: '#1a365d' }}
                            >
                                {text?.[0]?.toUpperCase()}
                            </Avatar>
                        </Badge>
                        <div>
                            <div style={{ fontWeight: 500 }}>{text || 'Untitled Property'}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                                {record.address ? `${record.address}, ${record.city}, ${record.zipCode}` : 'No address'}
                            </div>
                            <div style={{ fontSize: '11px', color: '#888' }}>
                                <Tag color="cyan" size="small">{record.type || 'N/A'}</Tag>
                            </div>
                        </div>
                    </Space>
                    {/* Amenities row */}
                    <div style={{ marginLeft: 40 }}>
                        {renderAmenities(record.amenities)}
                    </div>
                </Space>
            ),
        },
        {
            title: 'Details',
            key: 'details',
            render: (_, record) => (
                <Space direction="vertical" size={8}>
                    <div style={{ fontWeight: 500, color: '#1890ff' }}>
                        {record.price ? `$${record.price.toLocaleString()}` : 'Not set'}
                    </div>
                    <Space size={12}>
                        <Tooltip title="Bedrooms">
                            <Space size={4}>
                                <FaBed style={{ color: '#666' }} />
                                <span>{record.bedrooms || 0}</span>
                            </Space>
                        </Tooltip>
                        <Tooltip title="Bathrooms">
                            <Space size={4}>
                                <FaBath style={{ color: '#666' }} />
                                <span>{record.bathrooms || 0}</span>
                            </Space>
                        </Tooltip>
                        <Tooltip title="Kitchens">
                            <Space size={4}>
                                <FaUtensils style={{ color: '#666' }} />
                                <span>{record.kitchens || 0}</span>
                            </Space>
                        </Tooltip>
                        <Tooltip title="Garages">
                            <Space size={4}>
                                <FaCar style={{ color: '#666' }} />
                                <span>{record.garages || 0}</span>
                            </Space>
                        </Tooltip>
                    </Space>
                </Space>
            ),
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
            render: (agent, record) => {
                const isLoading = record.agentId && isAgentLoading(record.agentId);

                return (
                    <Space direction="vertical" size={2}>
                        <Space>
                            {getAgentAvatar(agent)}
                            <div>
                                <div style={{ fontWeight: 500 }}>
                                    {isLoading ? 'Loading...' : getAgentDisplayName(agent)}
                                </div>
                                {agent?.licenseNumber && agent.licenseNumber !== '' && (
                                    <div style={{ fontSize: '10px', color: '#666' }}>
                                        License: {agent.licenseNumber}
                                    </div>
                                )}
                            </div>
                        </Space>
                        {getAgentContactInfo(agent) && (
                            <div style={{ fontSize: '11px', color: '#888' }}>
                                {getAgentContactInfo(agent)}
                            </div>
                        )}
                        {record.agentId && !agent && (
                            <Tooltip title={`Agent ID: ${record.agentId}`}>
                                <Tag color="orange" size="small">ID: {record.agentId}</Tag>
                            </Tooltip>
                        )}
                        {isLoading && (
                            <Tag color="blue" size="small">Loading...</Tag>
                        )}
                    </Space>
                );
            },
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
                    {record.agentId && (
                        <Tooltip title="Refresh Agent Data">
                            <Button
                                icon={<ReloadOutlined />}
                                size="small"
                                loading={isAgentLoading(record.agentId)}
                                onClick={() => refreshAgentData(record.id)}
                            />
                        </Tooltip>
                    )}
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
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                    <Space wrap>
                        <Search
                            placeholder="Search properties, agents, addresses..."
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
                            <Option value="draft">Draft</Option>
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
                    <Space wrap>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={loadProperties}
                            loading={loading}
                        >
                            Refresh All
                        </Button>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={refreshAllAgentData}
                            disabled={loading}
                        >
                            Refresh Agents
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
                            `${range[0]}-${range[1]} of ${total} properties`,
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
                                    fallback="/fallback-image.png"
                                />
                            )}
                        </div>
                        <Row gutter={16}>
                            <Col span={12}>
                                <div style={{ marginBottom: 16 }}>
                                    <strong>Title:</strong> {selectedProperty.title || 'No title'}
                                </div>
                                <div style={{ marginBottom: 16 }}>
                                    <strong>Description:</strong> {selectedProperty.description || 'No description'}
                                </div>
                                <div style={{ marginBottom: 16 }}>
                                    <strong>Address:</strong> {selectedProperty.address ? `${selectedProperty.address}, ${selectedProperty.city}, ${selectedProperty.state} ${selectedProperty.zipCode}` : 'No address'}
                                </div>
                                <div style={{ marginBottom: 16 }}>
                                    <strong>Price:</strong> {selectedProperty.price ? `$${selectedProperty.price.toLocaleString()}` : 'Not set'}
                                </div>
                                <div style={{ marginBottom: 16 }}>
                                    <strong>Type:</strong> {selectedProperty.type || 'N/A'}
                                </div>
                            </Col>
                            <Col span={12}>
                                <div style={{ marginBottom: 16 }}>
                                    <strong>Details:</strong>
                                    <Space size={16} style={{ marginTop: 8 }}>
                                        <Tooltip title="Bedrooms">
                                            <Space size={4}>
                                                <FaBed style={{ color: '#666' }} />
                                                <span>{selectedProperty.bedrooms || 0}</span>
                                            </Space>
                                        </Tooltip>
                                        <Tooltip title="Bathrooms">
                                            <Space size={4}>
                                                <FaBath style={{ color: '#666' }} />
                                                <span>{selectedProperty.bathrooms || 0}</span>
                                            </Space>
                                        </Tooltip>
                                        <Tooltip title="Kitchens">
                                            <Space size={4}>
                                                <FaUtensils style={{ color: '#666' }} />
                                                <span>{selectedProperty.kitchens || 0}</span>
                                            </Space>
                                        </Tooltip>
                                        <Tooltip title="Garages">
                                            <Space size={4}>
                                                <FaCar style={{ color: '#666' }} />
                                                <span>{selectedProperty.garages || 0}</span>
                                            </Space>
                                        </Tooltip>
                                    </Space>
                                </div>
                                <div style={{ marginBottom: 16 }}>
                                    <strong>Area:</strong> {selectedProperty.areaSqm ? `${selectedProperty.areaSqm.toLocaleString()} sqm` : 'Not set'}
                                </div>
                                <div style={{ marginBottom: 16 }}>
                                    <strong>Status:</strong> <Tag color={getStatusColor(selectedProperty.status)}>
                                        {getStatusText(selectedProperty.status)}
                                    </Tag>
                                </div>
                                <div style={{ marginBottom: 16 }}>
                                    <strong>Amenities:</strong>
                                    <div style={{ marginTop: 8 }}>
                                        {renderAmenities(selectedProperty.amenities)}
                                    </div>
                                </div>
                                <div style={{ marginBottom: 16 }}>
                                    <strong>Agent:</strong>
                                    <Space style={{ marginLeft: 8 }} direction="vertical">
                                        <Space>
                                            {getAgentAvatar(selectedProperty.agent)}
                                            <span>{getAgentDisplayName(selectedProperty.agent)}</span>
                                        </Space>
                                        {getAgentContactInfo(selectedProperty.agent) && (
                                            <div style={{ fontSize: '12px', color: '#666' }}>
                                                {getAgentContactInfo(selectedProperty.agent)}
                                            </div>
                                        )}
                                        {selectedProperty.agentId && !selectedProperty.agent && (
                                            <Tag color="orange" size="small">ID: {selectedProperty.agentId}</Tag>
                                        )}
                                    </Space>
                                </div>
                            </Col>
                        </Row>
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
                confirmLoading={loading}
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