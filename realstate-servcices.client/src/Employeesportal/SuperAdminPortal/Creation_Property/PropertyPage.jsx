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
    Col,
    Divider
} from 'antd';
import {
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    CheckOutlined,
    CloseOutlined,
    UserSwitchOutlined,
    MoreOutlined,
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    PictureOutlined,
    PlayCircleOutlined,
    DownloadOutlined,
    PrinterOutlined,
    FilePdfOutlined,
    FileExcelOutlined
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

const PropertyPage = ({ onFilterUpdate, onPropertiesUpdate, onEditProperty }) => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [priceRangeFilter, setPriceRangeFilter] = useState('all');
    const [bedroomsFilter, setBedroomsFilter] = useState('all');
    const [bathroomsFilter, setBathroomsFilter] = useState('all');
    const [cityFilter, setCityFilter] = useState('all');
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [changeHandlerModalVisible, setChangeHandlerModalVisible] = useState(false);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [agentsCache, setAgentsCache] = useState({});
    const [agentLoading, setAgentLoading] = useState({});
    const [mediaModalVisible, setMediaModalVisible] = useState(false);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

    // Notify parent component when filters change
    useEffect(() => {
        if (onFilterUpdate) {
            onFilterUpdate(searchText, statusFilter, typeFilter);
        }
    }, [searchText, statusFilter, typeFilter, onFilterUpdate]);

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

    const handlePriceRangeFilter = (value) => {
        setPriceRangeFilter(value);
    };

    const handleBedroomsFilter = (value) => {
        setBedroomsFilter(value);
    };

    const handleBathroomsFilter = (value) => {
        setBathroomsFilter(value);
    };

    const handleCityFilter = (value) => {
        setCityFilter(value);
    };

    // Get unique cities for filter
    const getUniqueCities = () => {
        const cities = properties
            .map(property => property.city)
            .filter(city => city && city.trim() !== '');
        return [...new Set(cities)].sort();
    };

    const filteredProperties = properties.filter(property => {
        const matchesSearch = property.title?.toLowerCase().includes(searchText.toLowerCase()) ||
            property.address?.toLowerCase().includes(searchText.toLowerCase()) ||
            property.city?.toLowerCase().includes(searchText.toLowerCase()) ||
            property.agent?.firstName?.toLowerCase().includes(searchText.toLowerCase()) ||
            property.agent?.lastName?.toLowerCase().includes(searchText.toLowerCase());

        const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
        const matchesType = typeFilter === 'all' || property.type === typeFilter;
        const matchesCity = cityFilter === 'all' || property.city === cityFilter;

        // Price range filter
        let matchesPrice = true;
        if (priceRangeFilter !== 'all' && property.price) {
            switch (priceRangeFilter) {
                case '0-500k':
                    matchesPrice = property.price <= 500000;
                    break;
                case '500k-1M':
                    matchesPrice = property.price > 500000 && property.price <= 1000000;
                    break;
                case '1M-5M':
                    matchesPrice = property.price > 1000000 && property.price <= 5000000;
                    break;
                case '5M+':
                    matchesPrice = property.price > 5000000;
                    break;
                default:
                    matchesPrice = true;
            }
        }

        // Bedrooms filter
        let matchesBedrooms = true;
        if (bedroomsFilter !== 'all' && property.bedrooms !== undefined) {
            switch (bedroomsFilter) {
                case '1':
                    matchesBedrooms = property.bedrooms === 1;
                    break;
                case '2':
                    matchesBedrooms = property.bedrooms === 2;
                    break;
                case '3':
                    matchesBedrooms = property.bedrooms === 3;
                    break;
                case '4+':
                    matchesBedrooms = property.bedrooms >= 4;
                    break;
                default:
                    matchesBedrooms = true;
            }
        }

        // Bathrooms filter
        let matchesBathrooms = true;
        if (bathroomsFilter !== 'all' && property.bathrooms !== undefined) {
            switch (bathroomsFilter) {
                case '1':
                    matchesBathrooms = property.bathrooms === 1;
                    break;
                case '2':
                    matchesBathrooms = property.bathrooms === 2;
                    break;
                case '3+':
                    matchesBathrooms = property.bathrooms >= 3;
                    break;
                default:
                    matchesBathrooms = true;
            }
        }

        return matchesSearch && matchesStatus && matchesType && matchesPrice && matchesBedrooms && matchesBathrooms && matchesCity;
    });

    // Export functions
    const handlePrint = () => {
        const printContent = document.querySelector('.ant-card');
        const originalContents = document.body.innerHTML;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Properties Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f5f5f5; }
                        .header { text-align: center; margin-bottom: 20px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Properties Report</h1>
                        <p>Generated on: ${new Date().toLocaleDateString()}</p>
                    </div>
                    ${printContent.innerHTML}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const handleExportPDF = () => {
        message.info('PDF export functionality would be implemented here');
        // In a real implementation, you would use a library like jsPDF or html2pdf
        // This is a placeholder for the PDF export functionality
    };

    const handleExportExcel = () => {
        try {
            // Create CSV content
            const headers = ['Title', 'Type', 'Price', 'Bedrooms', 'Bathrooms', 'City', 'Status', 'Agent', 'Address'];
            const csvContent = [
                headers.join(','),
                ...filteredProperties.map(property => [
                    `"${property.title || ''}"`,
                    `"${property.type || ''}"`,
                    property.price || 0,
                    property.bedrooms || 0,
                    property.bathrooms || 0,
                    `"${property.city || ''}"`,
                    `"${property.status || ''}"`,
                    `"${getAgentDisplayName(property.agent)}"`,
                    `"${property.address || ''}"`
                ].join(','))
            ].join('\n');

            // Create and download file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `properties_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            message.success('Excel/CSV file exported successfully');
        } catch (error) {
            console.error('Export error:', error);
            message.error('Failed to export Excel file');
        }
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

                    // Notify parent of update
                    if (onPropertiesUpdate) {
                        onPropertiesUpdate();
                    }
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

            // Notify parent of update
            if (onPropertiesUpdate) {
                onPropertiesUpdate();
            }
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

            // Notify parent of update
            if (onPropertiesUpdate) {
                onPropertiesUpdate();
            }
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

    const handleSuccess = () => {
        loadProperties();
        if (onPropertiesUpdate) {
            onPropertiesUpdate();
        }
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
            return <Avatar size="small" src={processImageUrl(agent.profilePictureUrl)} />;
        }
        return <Avatar size="small" icon={<UserOutlined />} />;
    };

    const isAgentLoading = (agentId) => {
        return agentLoading[agentId] || false;
    };

    // Render amenities with dropdown for more than 3 items
    const renderAmenities = (amenities) => {
        // Parse amenities if it's a JSON string, otherwise ensure it's an array
        let amenitiesArray = [];

        try {
            if (typeof amenities === 'string') {
                // Try to parse as JSON
                amenitiesArray = JSON.parse(amenities);
            } else if (Array.isArray(amenities)) {
                // Already an array
                amenitiesArray = amenities;
            }
        } catch (error) {
            console.error('Error parsing amenities:', error);
            amenitiesArray = [];
        }

        // Final safety check
        if (!Array.isArray(amenitiesArray)) {
            amenitiesArray = [];
        }

        if (amenitiesArray.length === 0) {
            return <span style={{ color: '#999' }}>No amenities</span>;
        }

        const displayAmenities = amenitiesArray.slice(0, 3);
        const remainingAmenities = amenitiesArray.slice(3);

        const content = (
            <Space size={[4, 4]} wrap>
                {displayAmenities.map((amenity, index) => (
                    <Tag key={index} size="small" color="#1e3a8a" style={{ color: 'white', border: 'none' }}>
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
                        <Tag size="small" color="#1e3a8a" style={{ cursor: 'pointer', color: 'white', border: 'none' }}>
                            +{remainingAmenities.length} more
                        </Tag>
                    </Dropdown>
                )}
            </Space>
        );

        return content;
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

    // Open media gallery
    const handleOpenMedia = (property, index = 0) => {
        setSelectedProperty(property);
        setCurrentMediaIndex(index);
        setMediaModalVisible(true);
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
            render: (text, record) => {
                const imageUrl = getPropertyImage(record);

                return (
                    <Space direction="vertical" size={4}>
                        <Space>
                            <Badge dot={record.status === 'pending'} color="orange" offset={[-5, 5]}>
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
                        <div style={{ marginLeft: 40 }}>
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
                                {agent?.licenseNumber && agent.licenseNumber !== '' && (
                                    <div style={{ fontSize: '10px', color: '#666' }}>
                                        License: {agent.licenseNumber}
                                    </div>
                                )}
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
        }, {
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
                        <Select
                            defaultValue="all"
                            style={{ width: 150 }}
                            onChange={handlePriceRangeFilter}
                        >
                            <Option value="all">All Prices</Option>
                            <Option value="0-500k">₱0 - ₱500K</Option>
                            <Option value="500k-1M">₱500K - ₱1M</Option>
                            <Option value="1M-5M">₱1M - ₱5M</Option>
                            <Option value="5M+">₱5M+</Option>
                        </Select>
                        <Select
                            defaultValue="all"
                            style={{ width: 130 }}
                            onChange={handleBedroomsFilter}
                        >
                            <Option value="all">All Bedrooms</Option>
                            <Option value="1">1 Bedroom</Option>
                            <Option value="2">2 Bedrooms</Option>
                            <Option value="3">3 Bedrooms</Option>
                            <Option value="4+">4+ Bedrooms</Option>
                        </Select>
                        <Select
                            defaultValue="all"
                            style={{ width: 130 }}
                            onChange={handleBathroomsFilter}
                        >
                            <Option value="all">All Bathrooms</Option>
                            <Option value="1">1 Bathroom</Option>
                            <Option value="2">2 Bathrooms</Option>
                            <Option value="3+">3+ Bathrooms</Option>
                        </Select>
                        <Select
                            defaultValue="all"
                            style={{ width: 150 }}
                            onChange={handleCityFilter}
                        >
                            <Option value="all">All Cities</Option>
                            {getUniqueCities().map(city => (
                                <Option key={city} value={city}>{city}</Option>
                            ))}
                        </Select>
                    </Space>

                    <Space>
                        <Tooltip title="Print">
                            <Button icon={<PrinterOutlined />} onClick={handlePrint}>
                                Print
                            </Button>
                        </Tooltip>
                        <Tooltip title="Export PDF">
                            <Button icon={<FilePdfOutlined />} onClick={handleExportPDF}>
                                PDF
                            </Button>
                        </Tooltip>
                        <Tooltip title="Export Excel">
                            <Button icon={<FileExcelOutlined />} onClick={handleExportExcel}>
                                Excel
                            </Button>
                        </Tooltip>
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
                        position: ['bottomRight'] // Ensure pagination is always at bottom
                    }}
                    style={{ marginBottom: 0 }}
                />
            </Card>

            {/* View Property Modal */}
            <Modal
                title="Property Details"
                open={viewModalVisible}
                onCancel={() => setViewModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setViewModalVisible(false)}>
                        Close
                    </Button>,
                ]}
                width={800}
            >
                {selectedProperty && (
                    <div>
                        <Row gutter={16}>
                            <Col span={12}>
                                <h3>Basic Information</h3>
                                <p><strong>Title:</strong> {selectedProperty.title}</p>
                                <p><strong>Type:</strong> {selectedProperty.type}</p>
                                <p><strong>Price:</strong> ₱{selectedProperty.price?.toLocaleString()}</p>
                                <p><strong>Status:</strong> <Tag color={getStatusColor(selectedProperty.status)}>{getStatusText(selectedProperty.status)}</Tag></p>
                            </Col>
                            <Col span={12}>
                                <h3>Location</h3>
                                <p><strong>Address:</strong> {selectedProperty.address}</p>
                                <p><strong>City:</strong> {selectedProperty.city}</p>
                                <p><strong>Zip Code:</strong> {selectedProperty.zipCode}</p>
                            </Col>
                        </Row>
                        <Row gutter={16} style={{ marginTop: 16 }}>
                            <Col span={12}>
                                <h3>Specifications</h3>
                                <p><strong>Bedrooms:</strong> {selectedProperty.bedrooms}</p>
                                <p><strong>Bathrooms:</strong> {selectedProperty.bathrooms}</p>
                                <p><strong>Kitchens:</strong> {selectedProperty.kitchens}</p>
                                <p><strong>Garages:</strong> {selectedProperty.garages}</p>
                            </Col>
                            <Col span={12}>
                                <h3>Agent Information</h3>
                                <p><strong>Agent:</strong> {getAgentDisplayName(selectedProperty.agent)}</p>
                                <p><strong>Email:</strong> {selectedProperty.agent?.email || 'N/A'}</p>
                                <p><strong>Phone:</strong> {selectedProperty.agent?.cellPhoneNo || 'N/A'}</p>
                            </Col>
                        </Row>
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

            {/* Reject Modal */}
            <Modal
                title="Reject Property"
                open={rejectModalVisible}
                onCancel={() => {
                    setRejectModalVisible(false);
                    setRejectReason('');
                }}
                onOk={() => handleReject(selectedProperty?.id, rejectReason)}
                okText="Reject"
                okType="danger"
            >
                <p>Please provide a reason for rejecting this property:</p>
                <Input.TextArea
                    rows={4}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter rejection reason..."
                />
            </Modal>
        </div>
    );
};

export default PropertyPage;