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
    Descriptions,
    Row,
    Col,
    DatePicker,
    Statistic,
    Dropdown,
    Menu
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
    DownloadOutlined,
    MailOutlined,
    PhoneOutlined,
    StarOutlined,
    UserOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import BaseTable from './BaseTable';
import InsertAgent from './InsertAgent';
import EditAgent from './EditAgent';
import agentService from '../Creation_Agent/Services/agentService';
import TagsWithMore from './TagsWithMore';
import moment from 'moment';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const AgentPage = () => {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [experienceFilter, setExperienceFilter] = useState('all');
    const [specializationFilter, setSpecializationFilter] = useState('all');
    const [languageFilter, setLanguageFilter] = useState('all');
    const [brokerageFilter, setBrokerageFilter] = useState('all');
    const [dateRangeFilter, setDateRangeFilter] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        verified: 0,
        unverified: 0,
        active: 0
    });

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
        // Search filter
        const matchesSearch = searchText === '' ||
            agent.firstName?.toLowerCase().includes(searchText.toLowerCase()) ||
            agent.lastName?.toLowerCase().includes(searchText.toLowerCase()) ||
            agent.email?.toLowerCase().includes(searchText.toLowerCase()) ||
            agent.licenseNumber?.toLowerCase().includes(searchText.toLowerCase()) ||
            agent.brokerageName?.toLowerCase().includes(searchText.toLowerCase());

        // Status filter
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'verified' && agent.isVerified) ||
            (statusFilter === 'unverified' && !agent.isVerified);

        // Experience filter
        const matchesExperience = experienceFilter === 'all' ||
            (experienceFilter === '0-2' && agent.yearsOfExperience >= 0 && agent.yearsOfExperience <= 2) ||
            (experienceFilter === '3-5' && agent.yearsOfExperience >= 3 && agent.yearsOfExperience <= 5) ||
            (experienceFilter === '6-10' && agent.yearsOfExperience >= 6 && agent.yearsOfExperience <= 10) ||
            (experienceFilter === '10+' && agent.yearsOfExperience > 10);

        // Specialization filter
        const matchesSpecialization = specializationFilter === 'all' ||
            (agent.specialization && agent.specialization.includes(specializationFilter));

        // Language filter
        const matchesLanguage = languageFilter === 'all' ||
            (agent.languages && agent.languages.includes(languageFilter));

        // Brokerage filter
        const matchesBrokerage = brokerageFilter === 'all' ||
            agent.brokerageName === brokerageFilter;

        // Date range filter
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
        setSelectedAgent(agent);
        setIsModalVisible(true);
    };

    const handleView = (agent) => {
        setSelectedAgent(agent);
        setViewModalVisible(true);
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

    const handleModalClose = () => {
        setIsModalVisible(false);
        setSelectedAgent(null);
    };

    const handleSuccess = () => {
        loadAgents();
        handleModalClose();
    };

    const getExperienceLevel = (years) => {
        if (years <= 2) return { level: 'Beginner', color: 'blue' };
        if (years <= 5) return { level: 'Intermediate', color: 'green' };
        if (years <= 10) return { level: 'Experienced', color: 'orange' };
        return { level: 'Expert', color: 'red' };
    };

    const columns = [
        {
            title: 'Agent',
            dataIndex: 'firstName',
            key: 'agent',
            width: 220,
            fixed: 'left',
            render: (text, record) => (
                <Space>
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
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>
                            {record.firstName} {record.lastName}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            {record.email}
                        </div>
                        <div style={{ fontSize: '11px', color: '#999' }}>
                            {record.brokerageName || 'No Brokerage'}
                        </div>
                    </div>
                </Space>
            ),
        },
        {
            title: 'License',
            dataIndex: 'licenseNumber',
            key: 'licenseNumber',
            width: 120,
            render: (license) => (
                <Tag color="blue" style={{ fontFamily: 'monospace' }}>
                    {license || 'N/A'}
                </Tag>
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
                    <div style={{ fontSize: '12px', fontWeight: 500 }}>
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
                        <div style={{ fontSize: '12px', fontWeight: 500 }}>
                            {years ? `${years} years` : 'Not specified'}
                        </div>
                        <Tag color={color} style={{ fontSize: '10px', margin: 0 }}>
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
                    style={{ fontWeight: 500 }}
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
            bodyStyle={{ padding: '16px' }}
        >
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <div style={{ marginBottom: 12, fontWeight: 600, color: '#1a365d' }}>
                        <FilterOutlined /> Advanced Filters
                    </div>
                </Col>

                <Col xs={24} sm={12} md={8} lg={6}>
                    <div style={{ marginBottom: 8, fontSize: '12px', fontWeight: 500 }}>Status</div>
                    <Select
                        value={statusFilter}
                        style={{ width: '100%' }}
                        onChange={handleStatusFilter}
                        size="small"
                    >
                        <Option value="all">All Status</Option>
                        <Option value="verified">Verified</Option>
                        <Option value="unverified">Unverified</Option>
                    </Select>
                </Col>

                <Col xs={24} sm={12} md={8} lg={6}>
                    <div style={{ marginBottom: 8, fontSize: '12px', fontWeight: 500 }}>Experience</div>
                    <Select
                        value={experienceFilter}
                        style={{ width: '100%' }}
                        onChange={handleExperienceFilter}
                        size="small"
                    >
                        <Option value="all">All Experience</Option>
                        <Option value="0-2">0-2 years</Option>
                        <Option value="3-5">3-5 years</Option>
                        <Option value="6-10">6-10 years</Option>
                        <Option value="10+">10+ years</Option>
                    </Select>
                </Col>

                <Col xs={24} sm={12} md={8} lg={6}>
                    <div style={{ marginBottom: 8, fontSize: '12px', fontWeight: 500 }}>Specialization</div>
                    <Select
                        value={specializationFilter}
                        style={{ width: '100%' }}
                        onChange={handleSpecializationFilter}
                        size="small"
                    >
                        <Option value="all">All Specializations</Option>
                        {filterOptions.specializations.map(spec => (
                            <Option key={spec} value={spec}>{spec}</Option>
                        ))}
                    </Select>
                </Col>

                <Col xs={24} sm={12} md={8} lg={6}>
                    <div style={{ marginBottom: 8, fontSize: '12px', fontWeight: 500 }}>Language</div>
                    <Select
                        value={languageFilter}
                        style={{ width: '100%' }}
                        onChange={handleLanguageFilter}
                        size="small"
                    >
                        <Option value="all">All Languages</Option>
                        {filterOptions.languages.map(lang => (
                            <Option key={lang} value={lang}>{lang}</Option>
                        ))}
                    </Select>
                </Col>

                <Col xs={24} sm={12} md={8} lg={6}>
                    <div style={{ marginBottom: 8, fontSize: '12px', fontWeight: 500 }}>Brokerage</div>
                    <Select
                        value={brokerageFilter}
                        style={{ width: '100%' }}
                        onChange={handleBrokerageFilter}
                        size="small"
                    >
                        <Option value="all">All Brokerages</Option>
                        {filterOptions.brokerages.map(brokerage => (
                            <Option key={brokerage} value={brokerage}>{brokerage}</Option>
                        ))}
                    </Select>
                </Col>

                <Col xs={24} sm={12} md={8} lg={6}>
                    <div style={{ marginBottom: 8, fontSize: '12px', fontWeight: 500 }}>Registration Date</div>
                    <RangePicker
                        value={dateRangeFilter}
                        onChange={handleDateRangeFilter}
                        style={{ width: '100%' }}
                        size="small"
                        format="MMM DD, YYYY"
                    />
                </Col>

                <Col span={24}>
                    <Button
                        type="link"
                        onClick={clearAllFilters}
                        size="small"
                        style={{ padding: 0 }}
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
                    <Card size="small" bodyStyle={{ padding: '16px' }}>
                        <Statistic
                            title="Total Agents"
                            value={stats.total}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#1a365d' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small" bodyStyle={{ padding: '16px' }}>
                        <Statistic
                            title="Verified"
                            value={stats.verified}
                            prefix={<CheckOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small" bodyStyle={{ padding: '16px' }}>
                        <Statistic
                            title="Unverified"
                            value={stats.unverified}
                            prefix={<StarOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small" bodyStyle={{ padding: '16px' }}>
                        <Statistic
                            title="Active"
                            value={stats.active}
                            prefix={<CalendarOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card>
                {/* Header Section */}
                <div style={{
                    marginBottom: 16,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: 16
                }}>
                    <Space direction="vertical" size="small" style={{ flex: 1 }}>
                        <Search
                            placeholder="Search agents by name, email, license, or brokerage..."
                            allowClear
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{ width: 400, maxWidth: '100%' }}
                            size="large"
                        />
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            Showing {filteredAgents.length} of {agents.length} agents
                        </div>
                    </Space>

                    <Space wrap>
                        <Button
                            icon={<FilterOutlined />}
                            onClick={() => setShowFilters(!showFilters)}
                            type={showFilters ? 'primary' : 'default'}
                            size="large"
                        >
                            Filters {showFilters ? '(On)' : ''}
                        </Button>

                        <Button
                            icon={<DownloadOutlined />}
                            size="large"
                        >
                            Export
                        </Button>

                        <Button
                            icon={<ReloadOutlined />}
                            onClick={loadAgents}
                            loading={loading}
                            size="large"
                        >
                            Refresh
                        </Button>

                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                setSelectedAgent(null);
                                setIsModalVisible(true);
                            }}
                            size="large"
                        >
                            Add Agent
                        </Button>
                    </Space>
                </div>

                {/* Advanced Filters */}
                {showFilters && <FilterSection />}

                {/* Table */}
                <BaseTable
                    data={filteredAgents}
                    columns={columns}
                    loading={loading}
                    rowKey="id"
                    scroll={{ x: 1500 }}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} of ${total} agents`,
                        size: 'default',
                    }}
                />
            </Card>

            {/* Edit/Add Modal */}
            <Modal
                title={selectedAgent ? 'Edit Agent' : 'Add New Agent'}
                open={isModalVisible}
                onCancel={handleModalClose}
                footer={null}
                width={1000}
                style={{ top: 20 }}
                destroyOnClose
            >
                {selectedAgent ? (
                    <EditAgent
                        agent={selectedAgent}
                        onSuccess={handleSuccess}
                        onCancel={handleModalClose}
                    />
                ) : (
                    <InsertAgent
                        onSuccess={handleSuccess}
                        onCancel={handleModalClose}
                    />
                )}
            </Modal>

            {/* View Details Modal */}
            <Modal
                title="Agent Details"
                open={viewModalVisible}
                onCancel={() => setViewModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setViewModalVisible(false)}>
                        Close
                    </Button>,
                    <Button
                        key="edit"
                        type="primary"
                        onClick={() => {
                            setViewModalVisible(false);
                            handleEdit(selectedAgent);
                        }}
                    >
                        Edit Agent
                    </Button>
                ]}
                width={700}
            >
                {selectedAgent && (
                    <Descriptions column={1} bordered size="small" labelStyle={{ fontWeight: 600 }}>
                        <Descriptions.Item label="Profile Picture">
                            <Avatar
                                src={selectedAgent.profilePictureUrl}
                                size={80}
                                icon={<UserOutlined />}
                                onError={() => true}
                            >
                                {selectedAgent.firstName?.[0]}{selectedAgent.lastName?.[0]}
                            </Avatar>
                        </Descriptions.Item>
                        <Descriptions.Item label="Full Name">
                            {selectedAgent.firstName} {selectedAgent.middleName} {selectedAgent.lastName} {selectedAgent.suffix}
                        </Descriptions.Item>
                        <Descriptions.Item label="Email">
                            {selectedAgent.email}
                        </Descriptions.Item>
                        <Descriptions.Item label="Phone">
                            {selectedAgent.cellPhoneNo}
                        </Descriptions.Item>
                        <Descriptions.Item label="License Number">
                            {selectedAgent.licenseNumber}
                        </Descriptions.Item>
                        <Descriptions.Item label="Experience">
                            {selectedAgent.yearsOfExperience} years
                            <Tag
                                color={getExperienceLevel(selectedAgent.yearsOfExperience || 0).color}
                                style={{ marginLeft: 8 }}
                            >
                                {getExperienceLevel(selectedAgent.yearsOfExperience || 0).level}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Specialization">
                            {selectedAgent.specialization && selectedAgent.specialization.length > 0 ? (
                                <Space wrap>
                                    {selectedAgent.specialization.map((spec, index) => (
                                        <Tag key={index} color="purple">
                                            {spec}
                                        </Tag>
                                    ))}
                                </Space>
                            ) : 'None'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Languages">
                            {selectedAgent.languages && selectedAgent.languages.length > 0 ? (
                                <Space wrap>
                                    {selectedAgent.languages.map((lang, index) => (
                                        <Tag key={index} color="green">
                                            {lang}
                                        </Tag>
                                    ))}
                                </Space>
                            ) : 'None'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Brokerage">
                            {selectedAgent.brokerageName || 'Not specified'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Bio">
                            {selectedAgent.bio || 'Not provided'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Status">
                            <Tag color={selectedAgent.isVerified ? 'green' : 'orange'}>
                                {selectedAgent.isVerified ? 'Verified' : 'Unverified'}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Registration Date">
                            {selectedAgent.dateRegistered ? new Date(selectedAgent.dateRegistered).toLocaleDateString() : 'Not set'}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default AgentPage;