// ArchiveProperty.jsx
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
    Badge,
    Dropdown,
    Menu,
    Row,
    Col,
    Divider,
    Grid
} from 'antd';
import {
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    CheckOutlined,
    UserSwitchOutlined,
    MoreOutlined,
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    PictureOutlined,
    PlayCircleOutlined,
    FilterOutlined,
    InboxOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import {
    FaBed,
    FaBath,
    FaUtensils,
    FaCar
} from 'react-icons/fa';
import BaseTable from './BaseTable';
import ChangeHandlerModal from './ChangeHandlerModal';
import propertyService from '../../AdminPortal/Creation_Property/services/propertyService';
import agentService from '../../AdminPortal/Creation_Agent/Services/AgentService';
import { processImageUrl, getPropertyImage, getAllMedia, getMediaCounts } from './processImageUrl';

const { Search } = Input;
const { Option } = Select;
const { useBreakpoint } = Grid;

const ArchiveProperty = ({ onUpdate, onEditProperty }) => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [changeHandlerModalVisible, setChangeHandlerModalVisible] = useState(false);
    const [mediaModalVisible, setMediaModalVisible] = useState(false);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [filtersVisible, setFiltersVisible] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [agentsCache, setAgentsCache] = useState({});
    const [agentLoading, setAgentLoading] = useState({});

    const screens = useBreakpoint();
    const isMobile = !screens.md;

    // Agent data loader with proper state updates
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
    const loadArchivedProperties = useCallback(async () => {
        setLoading(true);
        try {
            console.log('Loading archived properties...');
            const data = await propertyService.getPropertiesByStatus('draft');
            console.log('Raw archived properties data:', data);

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

                console.log('Final processed archived properties with agent data:', propertiesWithAgents);
                setProperties(propertiesWithAgents);
            } else {
                console.log('No archived properties found');
                setProperties([]);
            }
        } catch (error) {
            console.error('Error loading archived properties:', error);
            message.error('Failed to load archived properties: ' + (error.message || 'Unknown error'));
            setProperties([]);
        } finally {
            setLoading(false);
        }
    }, [loadAgentData]);

    useEffect(() => {
        loadArchivedProperties();
    }, [loadArchivedProperties]);

    const handleSearch = (value) => {
        setSearchText(value);
    };

    // Handle restore property (change status from draft to available)
    const handleRestore = async (propertyId) => {
        setActionLoading(true);
        try {
            await propertyService.changePropertyStatus(propertyId, 'available');
            message.success('Property restored successfully');
            setProperties(prev => prev.filter(prop => prop.id !== propertyId));
            if (onUpdate) {
                onUpdate();
            }
        } catch (error) {
            console.error('Restore error:', error);
            message.error(error.message || 'Failed to restore property');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (propertyId) => {
        Modal.confirm({
            title: 'Confirm Delete',
            content: 'Are you sure you want to permanently delete this archived property? This action cannot be undone.',
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await propertyService.deleteProperty(propertyId);
                    message.success('Property deleted permanently');
                    setProperties(prev => prev.filter(prop => prop.id !== propertyId));
                    if (onUpdate) {
                        onUpdate();
                    }
                } catch (error) {
                    console.error('Delete error:', error);
                    message.error(error.message || 'Failed to delete property');
                }
            },
        });
    };

    const handleEdit = (property) => {
        if (onEditProperty) {
            onEditProperty(property);
        }
    };

    const handleView = (property) => {
        setSelectedProperty(property);
        setViewModalVisible(true);
    };

    const handleChangeHandler = (property) => {
        setSelectedProperty(property);
        setChangeHandlerModalVisible(true);
    };

    const handleOpenMedia = (property, index = 0) => {
        setSelectedProperty(property);
        setCurrentMediaIndex(index);
        setMediaModalVisible(true);
    };

    const handleStatusChange = async (propertyId, newStatus) => {
        setActionLoading(true);
        try {
            await propertyService.changePropertyStatus(propertyId, newStatus);
            message.success(`Property status changed to ${newStatus}`);
            setProperties(prev => prev.filter(prop => prop.id !== propertyId));
            if (onUpdate) {
                onUpdate();
            }
        } catch (error) {
            console.error('Status change error:', error);
            message.error(error.message || 'Failed to change property status');
        } finally {
            setActionLoading(false);
        }
    };

    const handleHandlerChangeSuccess = async (property, newAgentId) => {
        setActionLoading(true);
        try {
            await propertyService.changePropertyHandler(property.id, newAgentId);
            const newAgentData = await loadAgentData(newAgentId);
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
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'draft': return 'gray';
            default: return 'default';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'draft': return 'ARCHIVED';
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
            return <Avatar size="small" src={processImageUrl(agent.profilePictureUrl)} />;
        }
        return <Avatar size="small" icon={<UserOutlined />} />;
    };

    const isAgentLoading = (agentId) => {
        return agentLoading[agentId] || false;
    };

    // Render media preview
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

    // Fixed amenities rendering function
    const renderAmenities = (amenities) => {
        let amenitiesArray = [];

        try {
            if (Array.isArray(amenities)) {
                amenitiesArray = amenities;
            } else if (typeof amenities === 'string') {
                try {
                    const parsed = JSON.parse(amenities);
                    if (Array.isArray(parsed)) {
                        amenitiesArray = parsed;
                    } else if (typeof parsed === 'string') {
                        amenitiesArray = parsed.split(',').map(item => item.trim()).filter(item => item);
                    } else {
                        amenitiesArray = [];
                    }
                } catch (e) {
                    amenitiesArray = amenities.split(',').map(item => item.trim()).filter(item => item);
                }
            }
        } catch (error) {
            console.error('Error parsing amenities:', error);
            amenitiesArray = [];
        }

        if (!Array.isArray(amenitiesArray) || amenitiesArray.length === 0) {
            return <span style={{ color: '#999', fontSize: '12px' }}>No amenities listed</span>;
        }

        const displayAmenities = amenitiesArray.slice(0, 3);
        const remainingAmenities = amenitiesArray.slice(3);

        const content = (
            <Space size={[4, 4]} wrap>
                {displayAmenities.map((amenity, index) => (
                    <Tag key={index} size="small" color="#1e3a8a" style={{ color: 'white', border: 'none', fontSize: '10px' }}>
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
                        <Tag size="small" color="#1e3a8a" style={{ cursor: 'pointer', color: 'white', border: 'none', fontSize: '10px' }}>
                            +{remainingAmenities.length} more
                        </Tag>
                    </Dropdown>
                )}
            </Space>
        );

        return content;
    };

    const filteredProperties = properties.filter(property => {
        return property.title?.toLowerCase().includes(searchText.toLowerCase()) ||
            property.address?.toLowerCase().includes(searchText.toLowerCase()) ||
            property.city?.toLowerCase().includes(searchText.toLowerCase()) ||
            property.agent?.firstName?.toLowerCase().includes(searchText.toLowerCase()) ||
            property.agent?.lastName?.toLowerCase().includes(searchText.toLowerCase());
    });

    // Action menu for archived properties
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
            <Menu.SubMenu key="status" title="Change Status" icon={<CheckOutlined />}>
                <Menu.Item key="available" onClick={() => handleStatusChange(record.id, 'available')}>
                    Restore to Available
                </Menu.Item>
                <Menu.Item key="pending" onClick={() => handleStatusChange(record.id, 'pending')}>
                    Mark as Pending
                </Menu.Item>
                <Menu.Item key="sold" onClick={() => handleStatusChange(record.id, 'sold')}>
                    Mark as Sold
                </Menu.Item>
                <Menu.Item key="rented" onClick={() => handleStatusChange(record.id, 'rented')}>
                    Mark as Rented
                </Menu.Item>
            </Menu.SubMenu>
            <Menu.Divider />
            <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)}>
                Delete Permanently
            </Menu.Item>
        </Menu>
    );

    // Mobile Card View for archived properties
    const renderMobileCard = (property) => {
        const imageUrl = getPropertyImage(property);
        const allMedia = getAllMedia(property);
        const hasMedia = allMedia.length > 0;
        const { imageCount, videoCount } = getMediaCounts(property);
        const isLoading = property.agentId && isAgentLoading(property.agentId);

        return (
            <Card
                key={property.id}
                style={{ marginBottom: 16, borderLeft: '4px solid #fa8c16' }}
                bodyStyle={{ padding: '16px' }}
            >
                <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                    <Badge dot color="orange" offset={[-5, 5]}>
                        <Avatar
                            src={imageUrl}
                            shape="square"
                            style={{
                                backgroundColor: '#1a365d',
                                width: 80,
                                height: 80,
                                objectFit: 'cover'
                            }}
                            onError={(e) => {
                                e.target.src = processImageUrl('/default-property.jpg');
                            }}
                        >
                            {property.title?.[0]?.toUpperCase()}
                        </Avatar>
                    </Badge>

                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>
                            {property.title || 'Untitled Property'}
                        </div>
                        <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                            {property.address}, {property.city}
                        </div>
                        <Tag color="#1e3a8a" style={{ color: 'white', border: 'none' }} size="small">
                            {property.type || 'N/A'}
                        </Tag>
                        <div style={{ marginTop: '8px' }}>
                            <Tag color={getStatusColor(property.status)}>
                                {getStatusText(property.status)}
                            </Tag>
                        </div>
                    </div>
                </div>

                {/* Amenities */}
                <div style={{ marginBottom: '12px' }}>
                    {renderAmenities(property.amenities)}
                </div>

                <Divider style={{ margin: '12px 0' }} />

                {/* Property Details */}
                <Row gutter={[8, 8]} style={{ marginBottom: '12px' }}>
                    <Col span={12}>
                        <div style={{ fontSize: '16px', fontWeight: 600, color: '#1a365d' }}>
                            ₱{property.price ? property.price.toLocaleString() : 'Not set'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Price</div>
                    </Col>
                    <Col span={12}>
                        <div style={{ fontSize: '14px', fontWeight: 500 }}>
                            <Space size={12}>
                                <Space size={4}>
                                    <FaBed style={{ color: '#666' }} />
                                    <span>{property.bedrooms || 0}</span>
                                </Space>
                                <Space size={4}>
                                    <FaBath style={{ color: '#666' }} />
                                    <span>{property.bathrooms || 0}</span>
                                </Space>
                            </Space>
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Rooms</div>
                    </Col>
                </Row>

                <Row gutter={[8, 8]} style={{ marginBottom: '12px' }}>
                    <Col span={12}>
                        <div style={{ fontSize: '14px' }}>
                            {property.areaSqm ? `${property.areaSqm} sqm` : 'Not set'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Area</div>
                    </Col>
                    <Col span={12}>
                        <div style={{ fontSize: '14px' }}>
                            {imageCount} img, {videoCount} vid
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Media</div>
                    </Col>
                </Row>

                {/* Agent Info */}
                {property.agent && (
                    <>
                        <Divider style={{ margin: '12px 0' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            {getAgentAvatar(property.agent)}
                            <div>
                                <div style={{ fontWeight: 500, fontSize: '14px' }}>
                                    {isLoading ? 'Loading...' : getAgentDisplayName(property.agent)}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>
                                    {getAgentContactInfo(property.agent)}
                                </div>
                                {isLoading && (
                                    <Tag color="blue" size="small" style={{ marginTop: '4px' }}>Loading agent...</Tag>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <Button
                        icon={<EyeOutlined />}
                        size="small"
                        onClick={() => handleView(property)}
                        style={{ flex: 1 }}
                    >
                        View
                    </Button>
                    <Button
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => handleEdit(property)}
                        style={{ flex: 1 }}
                    >
                        Edit
                    </Button>
                    <Button
                        type="primary"
                        icon={<CheckOutlined />}
                        size="small"
                        loading={actionLoading}
                        onClick={() => handleRestore(property.id)}
                        style={{ flex: 1, backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                    >
                        Restore
                    </Button>
                    <Dropdown overlay={actionMenu(property)} trigger={['click']}>
                        <Button
                            icon={<MoreOutlined />}
                            size="small"
                        >
                            More
                        </Button>
                    </Dropdown>
                </div>
            </Card>
        );
    };

    // Render filters
    const renderFilters = () => {
        if (isMobile) {
            return (
                <div style={{ width: '100%' }}>
                    {/* Search Bar - Full width on mobile */}
                    <div style={{ marginBottom: '16px' }}>
                        <Search
                            placeholder="Search archived properties..."
                            allowClear
                            onSearch={handleSearch}
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{ width: '100%' }}
                            size="large"
                        />
                    </div>
                </div>
            );
        }

        // Desktop filters
        return (
            <Space wrap>
                <Search
                    placeholder="Search archived properties..."
                    allowClear
                    onSearch={handleSearch}
                    style={{ width: 300 }}
                />
            </Space>
        );
    };

    // Table columns for desktop view
    const columns = [
        {
            title: 'Property',
            dataIndex: 'title',
            key: 'property',
            render: (text, record) => {
                const imageUrl = getPropertyImage(record);

                return (
                    <Space direction="vertical" size={4}>
                        <Space>
                            <Badge dot color="orange" offset={[-5, 5]}>
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
                                        e.target.src = processImageUrl('/default-property.jpg');
                                    }}
                                >
                                    {text?.[0]?.toUpperCase()}
                                </Avatar>
                            </Badge>
                            <div>
                                <div style={{ fontWeight: 500 }}>{text || 'Untitled Property'}</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>
                                    {record.address ? `${record.address}, ${record.city}, ${record.zipCode}` : 'No address'}
                                </div>
                                <Divider style={{ margin: '8px 0' }} />
                                <div style={{ fontSize: '11px', color: '#888' }}>
                                    <Tag color="#1e3a8a" style={{ color: 'white', border: 'none' }} size="small">
                                        {record.type || 'N/A'}
                                    </Tag>
                                </div>
                            </div>
                        </Space>
                        {/* Amenities row */}
                        <div style={{ marginLeft: 40, marginTop: 8 }}>
                            {renderAmenities(record.amenities)}
                        </div>
                    </Space>
                );
            },
        },
        {
            title: 'Details',
            key: 'details',
            render: (_, record) => (
                <Space direction="vertical" size={8}>
                    <div style={{
                        fontWeight: 500,
                        color: 'black',
                        backgroundColor: 'primary',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid #e6f7ff'
                    }}>
                        {record.price ? `₱${record.price.toLocaleString()}` : 'Not set'}
                    </div>
                    <Divider style={{ margin: '8px 0' }} />
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
                                <span>{record.kitchen || 0}</span>
                            </Space>
                        </Tooltip>
                        <Tooltip title="Garages">
                            <Space size={4}>
                                <FaCar style={{ color: '#666' }} />
                                <span>{record.garage || 0}</span>
                            </Space>
                        </Tooltip>
                    </Space>
                </Space>
            ),
        },
        {
            title: 'Media',
            key: 'media',
            render: (_, record) => renderMediaPreview(record),
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
                            </div>
                        </Space>
                        {getAgentContactInfo(agent) && (
                            <div style={{ fontSize: '11px', color: '#888' }}>
                                <Space direction="vertical" size={2}>
                                    {agent.email && (
                                        <Space size={4}>
                                            <MailOutlined style={{ fontSize: '10px', color: '#1e3a8a' }} />
                                            <span>{agent.email}</span>
                                        </Space>
                                    )}
                                    {agent.cellPhoneNo && (
                                        <Space size={4}>
                                            <PhoneOutlined style={{ fontSize: '10px', color: '#1e3a8a' }} />
                                            <span>{agent.cellPhoneNo}</span>
                                        </Space>
                                    )}
                                </Space>
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
                    <Tooltip title="Restore">
                        <Button
                            icon={<CheckOutlined />}
                            size="small"
                            type="primary"
                            loading={actionLoading}
                            onClick={() => handleRestore(record.id)}
                            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                        />
                    </Tooltip>
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
            <Card
                title={
                    <Space>
                        <InboxOutlined />
                        Archived Properties ({properties.length})
                    </Space>
                }
                extra={
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={loadArchivedProperties}
                        loading={loading}
                    >
                        Refresh
                    </Button>
                }
            >
                {/* Filters Section */}
                <div style={{
                    marginBottom: 16,
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                    flexDirection: isMobile ? 'column' : 'row'
                }}>
                    {renderFilters()}
                </div>

                {/* Results Count */}
                <div style={{ marginBottom: 16, textAlign: isMobile ? 'center' : 'left' }}>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                        Showing {filteredProperties.length} of {properties.length} archived properties
                    </div>
                </div>

                {/* Conditional Rendering: Table for Desktop, Cards for Mobile */}
                {!isMobile ? (
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
                                `${range[0]}-${range[1]} of ${total} archived properties`,
                            position: ['bottomRight']
                        }}
                        style={{ marginBottom: 0 }}
                    />
                ) : (
                    <div>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                Loading archived properties...
                            </div>
                        ) : filteredProperties.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <InboxOutlined style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }} />
                                <h3 style={{ color: '#666' }}>No Archived Properties</h3>
                                <p style={{ color: '#999' }}>There are no properties in the archive.</p>
                            </div>
                        ) : (
                            <div>
                                {filteredProperties.map(property => renderMobileCard(property))}
                            </div>
                        )}
                    </div>
                )}
            </Card>

            {/* View Property Modal */}
            <Modal
                title="Archived Property Details"
                open={viewModalVisible}
                onCancel={() => setViewModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setViewModalVisible(false)}>
                        Close
                    </Button>,
                ]}
                width={isMobile ? '100%' : 800}
                style={isMobile ? { top: 0, padding: 0 } : { top: 20 }}
            >
                {selectedProperty && (
                    <div>
                        <Row gutter={16}>
                            <Col span={isMobile ? 24 : 12}>
                                <h3>Basic Information</h3>
                                <p><strong>Title:</strong> {selectedProperty.title}</p>
                                <p><strong>Type:</strong> {selectedProperty.type}</p>
                                <p><strong>Price:</strong> ₱{selectedProperty.price?.toLocaleString()}</p>
                                <p><strong>Status:</strong> <Tag color={getStatusColor(selectedProperty.status)}>{getStatusText(selectedProperty.status)}</Tag></p>
                            </Col>
                            <Col span={isMobile ? 24 : 12}>
                                <h3>Location</h3>
                                <p><strong>Address:</strong> {selectedProperty.address}</p>
                                <p><strong>City:</strong> {selectedProperty.city}</p>
                                <p><strong>Barangay:</strong> {selectedProperty.barangay || 'Not specified'}</p>
                                <p><strong>Zip Code:</strong> {selectedProperty.zipCode}</p>
                            </Col>
                        </Row>
                        <Row gutter={16} style={{ marginTop: 16 }}>
                            <Col span={isMobile ? 24 : 12}>
                                <h3>Specifications</h3>
                                <p><strong>Bedrooms:</strong> {selectedProperty.bedrooms}</p>
                                <p><strong>Bathrooms:</strong> {selectedProperty.bathrooms}</p>
                                <p><strong>Kitchens:</strong> {selectedProperty.kitchen}</p>
                                <p><strong>Garages:</strong> {selectedProperty.garage}</p>
                                <p><strong>Area:</strong> {selectedProperty.areaSqm} sqm</p>
                            </Col>
                            <Col span={isMobile ? 24 : 12}>
                                <h3>Agent Information</h3>
                                <p><strong>Agent:</strong> {getAgentDisplayName(selectedProperty.agent)}</p>
                                <p><strong>Email:</strong> {selectedProperty.agent?.email || 'N/A'}</p>
                                <p><strong>Phone:</strong> {selectedProperty.agent?.cellPhoneNo || 'N/A'}</p>
                            </Col>
                        </Row>
                        {selectedProperty.amenities && (
                            <div style={{ marginTop: 16 }}>
                                <h3>Amenities</h3>
                                {renderAmenities(selectedProperty.amenities)}
                            </div>
                        )}
                        {selectedProperty.description && (
                            <div style={{ marginTop: 16 }}>
                                <h3>Description</h3>
                                <p>{selectedProperty.description}</p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Change Handler Modal */}
            <ChangeHandlerModal
                visible={changeHandlerModalVisible}
                onCancel={() => {
                    setChangeHandlerModalVisible(false);
                    setSelectedProperty(null);
                }}
                property={selectedProperty}
                onSuccess={handleHandlerChangeSuccess}
            />

            {/* Media Gallery Modal */}
            <Modal
                title="Property Media Gallery"
                open={mediaModalVisible}
                onCancel={() => setMediaModalVisible(false)}
                footer={null}
                width={isMobile ? '100%' : 800}
                style={isMobile ? { top: 0, padding: 0 } : { top: 20 }}
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
                                    <img
                                        src={currentMedia.url}
                                        alt={currentMedia.title}
                                        style={{
                                            maxWidth: '100%',
                                            maxHeight: isMobile ? '300px' : '400px',
                                            objectFit: 'contain'
                                        }}
                                        onError={(e) => {
                                            e.target.src = '/fallback-image.png';
                                        }}
                                    />
                                ) : (
                                    <video
                                        controls
                                        style={{ width: '100%', maxHeight: isMobile ? '300px' : '400px' }}
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

export default ArchiveProperty;