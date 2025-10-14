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
    Spin,
    Descriptions
} from 'antd';
import {
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    PlusOutlined,
    ReloadOutlined,
    CheckOutlined
} from '@ant-design/icons';
import BaseTable from './BaseTable';
import InsertAgent from './InsertAgent';
import agentService from '../Creation_Agent/Services/agentService';

const { Search } = Input;
const { Option } = Select;

const AgentPage = () => {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        loadAgents();
    }, []);

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

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const handleStatusFilter = (value) => {
        setStatusFilter(value);
    };

    const filteredAgents = agents.filter(agent => {
        const matchesSearch = agent.firstName?.toLowerCase().includes(searchText.toLowerCase()) ||
            agent.lastName?.toLowerCase().includes(searchText.toLowerCase()) ||
            agent.email?.toLowerCase().includes(searchText.toLowerCase()) ||
            agent.licenseNumber?.toLowerCase().includes(searchText.toLowerCase());

        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'verified' && agent.isVerified) ||
            (statusFilter === 'unverified' && !agent.isVerified);

        return matchesSearch && matchesStatus;
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

    const handleModalClose = () => {
        setIsModalVisible(false);
        setSelectedAgent(null);
    };

    const handleSuccess = () => {
        loadAgents();
        handleModalClose();
    };

    const columns = [
        {
            title: 'Agent',
            dataIndex: 'firstName',
            key: 'agent',
            render: (text, record) => (
                <Space>
                    <Avatar
                        src={record.profilePictureUrl}
                        style={{ backgroundColor: '#1a365d' }}
                    >
                        {record.firstName?.[0]}{record.lastName?.[0]}
                    </Avatar>
                    <div>
                        <div style={{ fontWeight: 500 }}>
                            {record.firstName} {record.lastName}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            {record.email}
                        </div>
                    </div>
                </Space>
            ),
        },
        {
            title: 'License Number',
            dataIndex: 'licenseNumber',
            key: 'licenseNumber',
        },
        {
            title: 'Phone',
            dataIndex: 'cellPhoneNo',
            key: 'cellPhoneNo',
        },
        {
            title: 'Experience',
            dataIndex: 'yearsOfExperience',
            key: 'yearsOfExperience',
            render: (years) => years ? `${years} years` : 'Not specified',
        },
        {
            title: 'Status',
            dataIndex: 'isVerified',
            key: 'isVerified',
            render: (verified, record) => (
                <Tag color={verified ? 'green' : 'orange'} icon={verified ? <CheckOutlined /> : null}>
                    {verified ? 'Verified' : 'Unverified'}
                </Tag>
            ),
        },
        {
            title: 'Registration Date',
            dataIndex: 'dateRegistered',
            key: 'dateRegistered',
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
                    {!record.isVerified && (
                        <Tooltip title="Verify Agent">
                            <Button
                                icon={<CheckOutlined />}
                                size="small"
                                type="primary"
                                ghost
                                loading={actionLoading === record.id}
                                onClick={() => handleVerify(record.id)}
                            />
                        </Tooltip>
                    )}
                    <Tooltip title="Delete">
                        <Button
                            icon={<DeleteOutlined />}
                            size="small"
                            danger
                            loading={actionLoading === record.id}
                            onClick={() => handleDelete(record.id)}
                        />
                    </Tooltip>
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
                            placeholder="Search agents..."
                            allowClear
                            onSearch={handleSearch}
                            style={{ width: 300 }}
                        />
                        <Select
                            defaultValue="all"
                            style={{ width: 150 }}
                            onChange={handleStatusFilter}
                        >
                            <Option value="all">All Status</Option>
                            <Option value="verified">Verified</Option>
                            <Option value="unverified">Unverified</Option>
                        </Select>
                    </Space>
                    <Space>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={loadAgents}
                            loading={loading}
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
                        >
                            Add Agent
                        </Button>
                    </Space>
                </div>

                <BaseTable
                    data={filteredAgents}
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

            <Modal
                title={selectedAgent ? 'Edit Agent' : 'Add New Agent'}
                open={isModalVisible}
                onCancel={handleModalClose}
                footer={null}
                width={800}
                destroyOnClose
            >
                <InsertAgent
                    agent={selectedAgent}
                    onSuccess={handleSuccess}
                    onCancel={handleModalClose}
                />
            </Modal>

            <Modal
                title="Agent Details"
                open={viewModalVisible}
                onCancel={() => setViewModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setViewModalVisible(false)}>
                        Close
                    </Button>
                ]}
                width={600}
            >
                {selectedAgent && (
                    <Descriptions column={1} bordered size="small">
                        <Descriptions.Item label="Name">
                            {selectedAgent.firstName} {selectedAgent.middleName} {selectedAgent.lastName} {selectedAgent.suffix}
                        </Descriptions.Item>
                        <Descriptions.Item label="Email">
                            {selectedAgent.email}
                        </Descriptions.Item>
                        <Descriptions.Item label="Phone">
                            {selectedAgent.cellPhoneNo}
                        </Descriptions.Item>
                        <Descriptions.Item label="License">
                            {selectedAgent.licenseNumber}
                        </Descriptions.Item>
                        <Descriptions.Item label="Experience">
                            {selectedAgent.yearsOfExperience} years
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