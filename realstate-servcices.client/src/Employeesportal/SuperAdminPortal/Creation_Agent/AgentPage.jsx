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
    Row,
    Col,
    DatePicker,
    Statistic,
    Dropdown,
    Menu,
    Grid,
    Divider
} from 'antd';
import {
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    PlusOutlined,
    ReloadOutlined,
    CheckOutlined,
    FilterOutlined,
    MoreOutlined,
    FileExcelOutlined,
    FilePdfOutlined,
    MailOutlined,
    PhoneOutlined,
    StarOutlined,
    UserOutlined,
    CalendarOutlined,
    EnvironmentOutlined,
    IdcardOutlined
} from '@ant-design/icons';
import BaseTable from './BaseTable';
import agentService from '../../AdminPortal/Creation_Agent/Services/AgentService';
import TagsWithMore from './TagsWithMore';
import moment from 'moment';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { useBreakpoint } = Grid;

const AgentPage = ({ onAgentsUpdate, onEditAgent, onCreateAgent, onViewAgent }) => {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [experienceFilter, setExperienceFilter] = useState('all');
    const [specializationFilter, setSpecializationFilter] = useState('all');
    const [languageFilter, setLanguageFilter] = useState('all');
    const [brokerageFilter, setBrokerageFilter] = useState('all');
    const [dateRangeFilter, setDateRangeFilter] = useState([]);
    const [actionLoading, setActionLoading] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        verified: 0,
        unverified: 0,
        active: 0
    });

    const screens = useBreakpoint();
    const isMobile = !screens.md;

    // Auto-detect view mode based on screen size
    const viewMode = isMobile ? 'card' : 'table';

    // Unique values for filters
    const [filterOptions, setFilterOptions] = useState({
        specializations: [],
        languages: [],
        brokerages: []
    });

    useEffect(() => {
        loadAgents();
    }, []);

    useEffect(() => {
        updateStats();
        updateFilterOptions();
    }, [agents]);

    const loadAgents = async () => {
        setLoading(true);
        try {
            console.log('Loading agents...');
            const response = await agentService.getAgents();
            console.log('Agents loaded:', response);

            if (Array.isArray(response)) {
                setAgents(response);
                message.success(`Loaded ${response.length} agents`);
            } else {
                console.error('Invalid agents data format:', response);
                setAgents([]);
                message.warning('No agents data found');
            }
        } catch (error) {
            console.error('Error loading agents:', error);
            message.error('Failed to load agents: ' + (error.message || 'Unknown error'));
            setAgents([]);
        } finally {
            setLoading(false);
        }
    };

    const updateStats = () => {
        const total = agents.length;
        const verified = agents.filter(agent => agent.isVerified).length;
        const unverified = agents.filter(agent => !agent.isVerified).length;
        const active = agents.filter(agent => agent.status === 'Active').length;

        setStats({
            total,
            verified,
            unverified,
            active
        });
    };

    const updateFilterOptions = () => {
        const specializations = [...new Set(agents.flatMap(agent => agent.specialization || []))];
        const languages = [...new Set(agents.flatMap(agent => agent.languages || []))];
        const brokerages = [...new Set(agents.map(agent => agent.brokerageName).filter(Boolean))];

        setFilterOptions({
            specializations,
            languages,
            brokerages
        });
    };

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const handleStatusFilter = (value) => {
        setStatusFilter(value);
    };

    const handleExperienceFilter = (value) => {
        setExperienceFilter(value);
    };

    const handleSpecializationFilter = (value) => {
        setSpecializationFilter(value);
    };

    const handleLanguageFilter = (value) => {
        setLanguageFilter(value);
    };

    const handleBrokerageFilter = (value) => {
        setBrokerageFilter(value);
    };

    const handleDateRangeFilter = (dates) => {
        setDateRangeFilter(dates || []);
    };

    const clearAllFilters = () => {
        setSearchText('');
        setStatusFilter('all');
        setExperienceFilter('all');
        setSpecializationFilter('all');
        setLanguageFilter('all');
        setBrokerageFilter('all');
        setDateRangeFilter([]);
    };

    const filteredAgents = agents.filter(agent => {
        const matchesSearch = searchText === '' ||
            agent.firstName?.toLowerCase().includes(searchText.toLowerCase()) ||
            agent.lastName?.toLowerCase().includes(searchText.toLowerCase()) ||
            agent.email?.toLowerCase().includes(searchText.toLowerCase()) ||
            agent.licenseNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
            agent.brokerageName?.toLowerCase().includes(searchText.toLowerCase());

        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'verified' && agent.isVerified) ||
            (statusFilter === 'unverified' && !agent.isVerified);

        const matchesExperience = experienceFilter === 'all' ||
            (experienceFilter === '0-2' && agent.yearsOfExperience >= 0 && agent.yearsOfExperience <= 2) ||
            (experienceFilter === '3-5' && agent.yearsOfExperience >= 3 && agent.yearsOfExperience <= 5) ||
            (experienceFilter === '6-10' && agent.yearsOfExperience >= 6 && agent.yearsOfExperience <= 10) ||
            (experienceFilter === '10+' && agent.yearsOfExperience > 10);

        const matchesSpecialization = specializationFilter === 'all' ||
            (agent.specialization && agent.specialization.includes(specializationFilter));

        const matchesLanguage = languageFilter === 'all' ||
            (agent.languages && agent.languages.includes(languageFilter));

        const matchesBrokerage = brokerageFilter === 'all' ||
            agent.brokerageName === brokerageFilter;

        const matchesDateRange = dateRangeFilter.length === 0 || (
            agent.dateRegistered &&
            moment(agent.dateRegistered).isBetween(
                moment(dateRangeFilter[0]),
                moment(dateRangeFilter[1]),
                'day',
                '[]'
            )
        );

        return matchesSearch && matchesStatus && matchesExperience &&
            matchesSpecialization && matchesLanguage && matchesBrokerage &&
            matchesDateRange;
    });

    const handleEdit = (agent) => {
        onEditAgent(agent);
    };

    const handleView = (agent) => {
        onViewAgent(agent);
    };

    const handleDelete = async (agentId) => {
        Modal.confirm({
            title: 'Confirm Delete',
            content: 'Are you sure you want to delete this agent? This action cannot be undone.',
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                setActionLoading(agentId);
                try {
                    await agentService.deleteAgent(agentId);
                    message.success('Agent deleted successfully');
                    loadAgents();
                    onAgentsUpdate();
                } catch (error) {
                    console.error('Error deleting agent:', error);
                    message.error('Failed to delete agent: ' + (error.message || 'Unknown error'));
                } finally {
                    setActionLoading(null);
                }
            },
        });
    };

    const handleVerify = async (agentId) => {
        setActionLoading(agentId);
        try {
            await agentService.verifyAgent(agentId);
            message.success('Agent verified successfully');
            loadAgents();
            onAgentsUpdate();
        } catch (error) {
            console.error('Error verifying agent:', error);
            message.error('Failed to verify agent: ' + (error.message || 'Unknown error'));
        } finally {
            setActionLoading(null);
        }
    };

    const handleContact = (agent, method) => {
        if (method === 'email' && agent.email) {
            window.open(`mailto:${agent.email}`, '_blank');
        } else if (method === 'phone' && agent.cellPhoneNo) {
            window.open(`tel:${agent.cellPhoneNo}`, '_blank');
        } else {
            message.warning(`No ${method} available for this agent`);
        }
    };

    const getExperienceLevel = (years) => {
        if (years <= 2) return { level: 'Beginner', color: 'blue' };
        if (years <= 5) return { level: 'Intermediate', color: 'green' };
        if (years <= 10) return { level: 'Experienced', color: 'orange' };
        return { level: 'Expert', color: 'red' };
    };

    const handleExportExcel = () => {
        message.info('Excel export functionality will be implemented soon');
    };

    const handleExportPDF = () => {
        message.info('PDF export functionality will be implemented soon');
    };

    // Card View Component
    const AgentCard = ({ agent }) => {
        const experienceInfo = getExperienceLevel(agent.yearsOfExperience || 0);

        const menuItems = [
            {
                key: 'view',
                icon: <EyeOutlined />,
                label: 'View Details',
                onClick: () => handleView(agent)
            },
            {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Edit Agent',
                onClick: () => handleEdit(agent)
            },
            ...(!agent.isVerified ? [{
                key: 'verify',
                icon: <CheckOutlined />,
                label: 'Verify Agent',
                onClick: () => handleVerify(agent.id),
                disabled: actionLoading === agent.id
            }] : []),
            {
                type: 'divider',
            },
            {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: 'Delete Agent',
                danger: true,
                onClick: () => handleDelete(agent.id),
                disabled: actionLoading === agent.id
            }
        ];

        return (
            <Card
                style={{
                    marginBottom: 16,
                    borderRadius: 12,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    border: '1px solid #f0f0f0'
                }}
                bodyStyle={{ padding: isMobile ? '16px' : '20px' }}
            >
                {/* Header Section */}
                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 16 }}>
                    <Avatar
                        src={agent.profilePictureUrl}
                        size={isMobile ? 60 : 80}
                        style={{
                            backgroundColor: '#1a365d',
                            marginRight: 12,
                            border: '3px solid #f0f0f0'
                        }}
                        icon={<UserOutlined />}
                        onError={() => true}
                    >
                        {agent.firstName?.[0]}{agent.lastName?.[0]}
                    </Avatar>

                    <div style={{ flex: 1 }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 4
                        }}>
                            <h3 style={{
                                margin: 0,
                                fontSize: isMobile ? '16px' : '18px',
                                fontWeight: 600,
                                color: '#1a365d'
                            }}>
                                {agent.firstName} {agent.lastName}
                            </h3>
                            <Tag
                                color={agent.isVerified ? 'green' : 'orange'}
                                icon={agent.isVerified ? <CheckOutlined /> : null}
                                style={{
                                    fontWeight: 500,
                                    fontSize: isMobile ? '10px' : '12px',
                                    padding: isMobile ? '2px 6px' : '4px 8px'
                                }}
                            >
                                {agent.isVerified ? 'Verified' : 'Unverified'}
                            </Tag>
                        </div>

                        <div style={{
                            fontSize: isMobile ? '12px' : '14px',
                            color: '#666',
                            marginBottom: 4
                        }}>
                            <MailOutlined style={{ marginRight: 6 }} />
                            {agent.email}
                        </div>

                        {agent.brokerageName && (
                            <div style={{
                                fontSize: isMobile ? '11px' : '13px',
                                color: '#999',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <EnvironmentOutlined style={{ marginRight: 6 }} />
                                {agent.brokerageName}
                            </div>
                        )}
                    </div>
                </div>

                <Divider style={{ margin: '12px 0' }} />

                {/* Contact & Experience Section */}
                <Row gutter={[16, 12]} style={{ marginBottom: 16 }}>
                    <Col span={12}>
                        <div style={{ textAlign: 'center' }}>
                            <PhoneOutlined style={{
                                fontSize: isMobile ? '16px' : '18px',
                                color: '#52c41a',
                                marginBottom: 4
                            }} />
                            <div style={{
                                fontSize: isMobile ? '11px' : '12px',
                                fontWeight: 500
                            }}>
                                {agent.cellPhoneNo || 'N/A'}
                            </div>
                            <div style={{
                                fontSize: isMobile ? '10px' : '11px',
                                color: '#666'
                            }}>
                                Phone
                            </div>
                        </div>
                    </Col>
                    <Col span={12}>
                        <div style={{ textAlign: 'center' }}>
                            <IdcardOutlined style={{
                                fontSize: isMobile ? '16px' : '18px',
                                color: '#1890ff',
                                marginBottom: 4
                            }} />
                            <div style={{
                                fontSize: isMobile ? '11px' : '12px',
                                fontWeight: 500
                            }}>
                                {agent.yearsOfExperience || 0} yrs
                            </div>
                            <div style={{
                                fontSize: isMobile ? '10px' : '11px',
                                color: experienceInfo.color
                            }}>
                                {experienceInfo.level}
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* Specializations & Languages */}
                {(agent.specialization?.length > 0 || agent.languages?.length > 0) && (
                    <>
                        <Row gutter={[8, 8]} style={{ marginBottom: 12 }}>
                            {agent.specialization?.length > 0 && (
                                <Col span={24}>
                                    <div style={{
                                        fontSize: isMobile ? '11px' : '12px',
                                        fontWeight: 500,
                                        marginBottom: 4,
                                        color: '#666'
                                    }}>
                                        Specializations:
                                    </div>
                                    <TagsWithMore
                                        items={agent.specialization}
                                        maxDisplay={2}
                                        color="purple"
                                    />
                                </Col>
                            )}
                            {agent.languages?.length > 0 && (
                                <Col span={24}>
                                    <div style={{
                                        fontSize: isMobile ? '11px' : '12px',
                                        fontWeight: 500,
                                        marginBottom: 4,
                                        color: '#666'
                                    }}>
                                        Languages:
                                    </div>
                                    <TagsWithMore
                                        items={agent.languages}
                                        maxDisplay={2}
                                        color="green"
                                    />
                                </Col>
                            )}
                        </Row>
                        <Divider style={{ margin: '8px 0' }} />
                    </>
                )}

                {/* Registration Date */}
                {agent.dateRegistered && (
                    <div style={{
                        fontSize: isMobile ? '10px' : '11px',
                        color: '#999',
                        textAlign: 'center',
                        marginBottom: 12
                    }}>
                        <CalendarOutlined style={{ marginRight: 4 }} />
                        Joined {moment(agent.dateRegistered).fromNow()}
                    </div>
                )}

                {/* Actions Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space size="small">
                        <Tooltip title="Send Email">
                            <Button
                                type="text"
                                icon={<MailOutlined />}
                                size="small"
                                onClick={() => handleContact(agent, 'email')}
                                disabled={!agent.email}
                                style={{ color: '#1890ff' }}
                            />
                        </Tooltip>
                        <Tooltip title="Call">
                            <Button
                                type="text"
                                icon={<PhoneOutlined />}
                                size="small"
                                onClick={() => handleContact(agent, 'phone')}
                                disabled={!agent.cellPhoneNo}
                                style={{ color: '#52c41a' }}
                            />
                        </Tooltip>
                        <Tooltip title="View Details">
                            <Button
                                type="text"
                                icon={<EyeOutlined />}
                                size="small"
                                onClick={() => handleView(agent)}
                                style={{ color: '#722ed1' }}
                            />
                        </Tooltip>
                    </Space>

                    <Dropdown
                        menu={{ items: menuItems }}
                        trigger={['click']}
                        placement="bottomRight"
                    >
                        <Button
                            icon={<MoreOutlined />}
                            size="small"
                            type="text"
                        />
                    </Dropdown>
                </div>
            </Card>
        );
    };

    // Card List View
    const CardListView = () => (
        <div>
            {filteredAgents.length === 0 ? (
                <Card style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ fontSize: '16px', color: '#999', marginBottom: 16 }}>
                        No agents found
                    </div>
                    <Button type="primary" onClick={clearAllFilters}>
                        Clear Filters
                    </Button>
                </Card>
            ) : (
                <div>
                    {filteredAgents.map(agent => (
                        <AgentCard key={agent.id} agent={agent} />
                    ))}
                </div>
            )}
        </div>
    );

    // Table columns (for desktop view)
    const columns = [
        {
            title: 'Agent',
            dataIndex: 'firstName',
            key: 'agent',
            width: 220,
            fixed: 'left',
            render: (text, record) => (
                <Space size={8}>
                    <Avatar
                        src={record.profilePictureUrl}
                        size="large"
                        style={{ backgroundColor: '#1a365d' }}
                        icon={<UserOutlined />}
                        onError={() => true}
                    >
                        {record.firstName?.[0]}{record.lastName?.[0]}
                    </Avatar>
                    <div>
                        <div style={{
                            fontWeight: 600,
                            fontSize: '14px',
                            lineHeight: '1.4'
                        }}>
                            {record.firstName} {record.lastName}
                        </div>
                        <div style={{
                            fontSize: '12px',
                            color: '#666',
                            lineHeight: '1.4'
                        }}>
                            {record.email}
                        </div>
                        <div style={{
                            fontSize: '11px',
                            color: '#999',
                            lineHeight: '1.4'
                        }}>
                            {record.brokerageName || 'No Brokerage'}
                        </div>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Specialization',
            dataIndex: 'specialization',
            key: 'specialization',
            width: 150,
            render: (specialization) => (
                <TagsWithMore
                    items={specialization}
                    maxDisplay={2}
                    color="purple"
                />
            ),
        },
        {
            title: 'Languages',
            dataIndex: 'languages',
            key: 'languages',
            width: 130,
            render: (languages) => (
                <TagsWithMore
                    items={languages}
                    maxDisplay={2}
                    color="green"
                />
            ),
        },
        {
            title: 'Contact',
            dataIndex: 'cellPhoneNo',
            key: 'contact',
            width: 140,
            render: (phone, record) => (
                <Space direction="vertical" size={2}>
                    <div style={{
                        fontSize: '12px',
                        fontWeight: 500
                    }}>
                        {phone || 'N/A'}
                    </div>
                    <Space size="small">
                        <Tooltip title="Send Email">
                            <Button
                                type="text"
                                icon={<MailOutlined />}
                                size="small"
                                onClick={() => handleContact(record, 'email')}
                                disabled={!record.email}
                            />
                        </Tooltip>
                        <Tooltip title="Call">
                            <Button
                                type="text"
                                icon={<PhoneOutlined />}
                                size="small"
                                onClick={() => handleContact(record, 'phone')}
                                disabled={!phone}
                            />
                        </Tooltip>
                    </Space>
                </Space>
            ),
        },
        {
            title: 'Experience',
            dataIndex: 'yearsOfExperience',
            key: 'experience',
            width: 140,
            render: (years, record) => {
                const { level, color } = getExperienceLevel(years || 0);
                return (
                    <Space direction="vertical" size={2}>
                        <div style={{
                            fontSize: '12px',
                            fontWeight: 500
                        }}>
                            {years ? `${years} years` : 'Not specified'}
                        </div>
                        <Tag color={color} style={{
                            fontSize: '10px',
                            margin: 0,
                            padding: '2px 6px'
                        }}>
                            {level}
                        </Tag>
                    </Space>
                );
            },
            sorter: (a, b) => (a.yearsOfExperience || 0) - (b.yearsOfExperience || 0),
        },
        {
            title: 'Status',
            dataIndex: 'isVerified',
            key: 'isVerified',
            width: 100,
            render: (verified, record) => (
                <Tag
                    color={verified ? 'green' : 'orange'}
                    icon={verified ? <CheckOutlined /> : null}
                    style={{
                        fontWeight: 500,
                        fontSize: '12px',
                        padding: '4px 8px'
                    }}
                >
                    {verified ? 'Verified' : 'Unverified'}
                </Tag>
            ),
        },
        {
            title: 'Registration Date',
            dataIndex: 'dateRegistered',
            key: 'dateRegistered',
            width: 130,
            render: (date) => date ? (
                <Space direction="vertical" size={2}>
                    <div style={{ fontSize: '12px', fontWeight: 500 }}>
                        {new Date(date).toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: '10px', color: '#999' }}>
                        {moment(date).fromNow()}
                    </div>
                </Space>
            ) : 'Not set',
            sorter: (a, b) => new Date(a.dateRegistered || 0) - new Date(b.dateRegistered || 0),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 120,
            fixed: 'right',
            render: (_, record) => {
                const menuItems = [
                    {
                        key: 'view',
                        icon: <EyeOutlined />,
                        label: 'View Details',
                        onClick: () => handleView(record)
                    },
                    {
                        key: 'edit',
                        icon: <EditOutlined />,
                        label: 'Edit Agent',
                        onClick: () => handleEdit(record)
                    },
                    ...(!record.isVerified ? [{
                        key: 'verify',
                        icon: <CheckOutlined />,
                        label: 'Verify Agent',
                        onClick: () => handleVerify(record.id),
                        disabled: actionLoading === record.id
                    }] : []),
                    {
                        type: 'divider',
                    },
                    {
                        key: 'delete',
                        icon: <DeleteOutlined />,
                        label: 'Delete Agent',
                        danger: true,
                        onClick: () => handleDelete(record.id),
                        disabled: actionLoading === record.id
                    }
                ];

                return (
                    <Space size="small">
                        <Tooltip title="Quick Actions">
                            <Dropdown
                                menu={{ items: menuItems }}
                                trigger={['click']}
                                placement="bottomRight"
                            >
                                <Button
                                    icon={<MoreOutlined />}
                                    size="small"
                                    type="text"
                                />
                            </Dropdown>
                        </Tooltip>
                        <Tooltip title="View Details">
                            <Button
                                icon={<EyeOutlined />}
                                size="small"
                                onClick={() => handleView(record)}
                            />
                        </Tooltip>
                    </Space>
                );
            },
        },
    ];

    const FilterSection = () => (
        <Card
            size="small"
            style={{ marginBottom: 16, border: '1px solid #d9d9d9' }}
            bodyStyle={{ padding: isMobile ? '12px' : '16px' }}
        >
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <div style={{
                        marginBottom: 12,
                        fontWeight: 600,
                        color: '#1a365d',
                        fontSize: isMobile ? '14px' : '16px'
                    }}>
                        <FilterOutlined /> Advanced Filters
                    </div>
                </Col>

                <Col xs={24} sm={12} md={8} lg={6}>
                    <div style={{
                        marginBottom: 8,
                        fontSize: isMobile ? '11px' : '12px',
                        fontWeight: 500
                    }}>
                        Status
                    </div>
                    <Select
                        value={statusFilter}
                        style={{ width: '100%' }}
                        onChange={handleStatusFilter}
                        size={isMobile ? "small" : "middle"}
                    >
                        <Option value="all">All Status</Option>
                        <Option value="verified">Verified</Option>
                        <Option value="unverified">Unverified</Option>
                    </Select>
                </Col>

                <Col xs={24} sm={12} md={8} lg={6}>
                    <div style={{
                        marginBottom: 8,
                        fontSize: isMobile ? '11px' : '12px',
                        fontWeight: 500
                    }}>
                        Experience
                    </div>
                    <Select
                        value={experienceFilter}
                        style={{ width: '100%' }}
                        onChange={handleExperienceFilter}
                        size={isMobile ? "small" : "middle"}
                    >
                        <Option value="all">All Experience</Option>
                        <Option value="0-2">0-2 years</Option>
                        <Option value="3-5">3-5 years</Option>
                        <Option value="6-10">6-10 years</Option>
                        <Option value="10+">10+ years</Option>
                    </Select>
                </Col>

                <Col xs={24} sm={12} md={8} lg={6}>
                    <div style={{
                        marginBottom: 8,
                        fontSize: isMobile ? '11px' : '12px',
                        fontWeight: 500
                    }}>
                        Specialization
                    </div>
                    <Select
                        value={specializationFilter}
                        style={{ width: '100%' }}
                        onChange={handleSpecializationFilter}
                        size={isMobile ? "small" : "middle"}
                    >
                        <Option value="all">All Specializations</Option>
                        {filterOptions.specializations.map(spec => (
                            <Option key={spec} value={spec}>{spec}</Option>
                        ))}
                    </Select>
                </Col>

                <Col xs={24} sm={12} md={8} lg={6}>
                    <div style={{
                        marginBottom: 8,
                        fontSize: isMobile ? '11px' : '12px',
                        fontWeight: 500
                    }}>
                        Language
                    </div>
                    <Select
                        value={languageFilter}
                        style={{ width: '100%' }}
                        onChange={handleLanguageFilter}
                        size={isMobile ? "small" : "middle"}
                    >
                        <Option value="all">All Languages</Option>
                        {filterOptions.languages.map(lang => (
                            <Option key={lang} value={lang}>{lang}</Option>
                        ))}
                    </Select>
                </Col>

                <Col xs={24} sm={12} md={8} lg={6}>
                    <div style={{
                        marginBottom: 8,
                        fontSize: isMobile ? '11px' : '12px',
                        fontWeight: 500
                    }}>
                        Brokerage
                    </div>
                    <Select
                        value={brokerageFilter}
                        style={{ width: '100%' }}
                        onChange={handleBrokerageFilter}
                        size={isMobile ? "small" : "middle"}
                    >
                        <Option value="all">All Brokerages</Option>
                        {filterOptions.brokerages.map(brokerage => (
                            <Option key={brokerage} value={brokerage}>{brokerage}</Option>
                        ))}
                    </Select>
                </Col>

                <Col xs={24} sm={12} md={8} lg={6}>
                    <div style={{
                        marginBottom: 8,
                        fontSize: isMobile ? '11px' : '12px',
                        fontWeight: 500
                    }}>
                        Registration Date
                    </div>
                    <RangePicker
                        value={dateRangeFilter}
                        onChange={handleDateRangeFilter}
                        style={{ width: '100%' }}
                        size={isMobile ? "small" : "middle"}
                        format="MMM DD, YYYY"
                    />
                </Col>

                <Col span={24}>
                    <Button
                        type="link"
                        onClick={clearAllFilters}
                        size={isMobile ? "small" : "middle"}
                        style={{ padding: 0, fontSize: isMobile ? '12px' : '14px' }}
                    >
                        Clear all filters
                    </Button>
                </Col>
            </Row>
        </Card>
    );

    return (
        <div>
            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={12} sm={6}>
                    <Card size="small" bodyStyle={{ padding: isMobile ? '12px' : '16px' }}>
                        <Statistic
                            title="Total Agents"
                            value={stats.total}
                            prefix={<UserOutlined />}
                            valueStyle={{
                                color: '#1a365d',
                                fontSize: isMobile ? '18px' : '24px'
                            }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small" bodyStyle={{ padding: isMobile ? '12px' : '16px' }}>
                        <Statistic
                            title="Verified"
                            value={stats.verified}
                            prefix={<CheckOutlined />}
                            valueStyle={{
                                color: '#52c41a',
                                fontSize: isMobile ? '18px' : '24px'
                            }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small" bodyStyle={{ padding: isMobile ? '12px' : '16px' }}>
                        <Statistic
                            title="Unverified"
                            value={stats.unverified}
                            prefix={<StarOutlined />}
                            valueStyle={{
                                color: '#faad14',
                                fontSize: isMobile ? '18px' : '24px'
                            }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small" bodyStyle={{ padding: isMobile ? '12px' : '16px' }}>
                        <Statistic
                            title="Active"
                            value={stats.active}
                            prefix={<CalendarOutlined />}
                            valueStyle={{
                                color: '#1890ff',
                                fontSize: isMobile ? '18px' : '24px'
                            }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card bodyStyle={{ padding: isMobile ? '12px' : '16px' }}>
                {/* Header Section */}
                <div style={{
                    marginBottom: 16,
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between',
                    alignItems: isMobile ? 'stretch' : 'flex-start',
                    gap: 16
                }}>
                    <Space direction="vertical" size="small" style={{
                        flex: 1,
                        width: isMobile ? '100%' : 'auto'
                    }}>
                        <Search
                            placeholder={isMobile ? "Search agents..." : "Search agents by name, email, license, or brokerage..."}
                            allowClear
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{ width: isMobile ? '100%' : 400 }}
                            size={isMobile ? "middle" : "large"}
                        />
                        <div style={{
                            fontSize: isMobile ? '11px' : '12px',
                            color: '#666'
                        }}>
                            Showing {filteredAgents.length} of {agents.length} agents
                        </div>
                    </Space>

                    <Space wrap style={{
                        justifyContent: isMobile ? 'center' : 'flex-end',
                        width: isMobile ? '100%' : 'auto'
                    }}>
                        <Button
                            icon={<FilterOutlined />}
                            onClick={() => setShowFilters(!showFilters)}
                            type={showFilters ? 'primary' : 'default'}
                            size={isMobile ? "middle" : "large"}
                        >
                            {isMobile ? 'Filters' : 'Filters'} {showFilters ? '(On)' : ''}
                        </Button>

                        <Button
                            icon={<FileExcelOutlined />}
                            onClick={handleExportExcel}
                            size={isMobile ? "middle" : "large"}
                        >
                            {isMobile ? 'Excel' : 'Excel'}
                        </Button>

                        <Button
                            icon={<FilePdfOutlined />}
                            onClick={handleExportPDF}
                            size={isMobile ? "middle" : "large"}
                        >
                            {isMobile ? 'PDF' : 'PDF'}
                        </Button>

                        <Button
                            icon={<ReloadOutlined />}
                            onClick={loadAgents}
                            loading={loading}
                            size={isMobile ? "middle" : "large"}
                        >
                            {isMobile ? 'Refresh' : 'Refresh'}
                        </Button>
                    </Space>
                </div>

                {/* Advanced Filters */}
                {showFilters && <FilterSection />}

                {/* Content - Auto-switch between table and card views */}
                {viewMode === 'table' ? (
                    <BaseTable
                        data={filteredAgents}
                        columns={columns}
                        loading={loading}
                        rowKey="id"
                        scroll={{ x: 1300 }}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} of ${total} agents`,
                            size: "default",
                        }}
                    />
                ) : (
                    <CardListView />
                )}
            </Card>
        </div>
    );
};

export default AgentPage;