// UserManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    Card,
    Table,
    Button,
    Space,
    Tag,
    Input,
    Select,
    Modal,
    Form,
    InputNumber,
    message,
    Tooltip,
    Avatar,
    Badge,
    Dropdown,
    Menu,
    Row,
    Col,
    Divider,
    Switch,
    List,
    Typography,
    Popconfirm,
    DatePicker,
    Tabs,
    Statistic
} from 'antd';
import {
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    UserAddOutlined,
    LockOutlined,
    UnlockOutlined,
    MoreOutlined,
    UserOutlined,
    SecurityScanOutlined,
    WarningOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    KeyOutlined,
    TeamOutlined,
    MailOutlined,
    PhoneOutlined,
    CalendarOutlined,
    ReloadOutlined,
    ExportOutlined,
    ImportOutlined,
    FilterOutlined,
    SettingOutlined
} from '@ant-design/icons';
import BaseTable from './BaseTable';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Mock data service for user management (same as before)
const mockUserService = {
    getUsers: () => Promise.resolve([
        {
            id: 1,
            username: 'admin',
            email: 'admin@betheland.com',
            firstName: 'System',
            lastName: 'Administrator',
            role: 'admin',
            status: 'active',
            lastLogin: new Date().toISOString(),
            loginCount: 1247,
            createdAt: '2023-01-15T00:00:00Z',
            permissions: ['all'],
            twoFactorEnabled: true,
            phone: '+1-555-0101',
            department: 'IT',
            location: 'New York, US',
            avatar: null
        },
        // ... other mock data remains the same
    ]),
    // ... other service methods remain the same
};

const UserManagement = ({ user, onSuccess, onBack }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState(user || null);
    const [isEditing, setIsEditing] = useState(!!user);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [form] = Form.useForm();

    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await mockUserService.getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Error loading users:', error);
            message.error('Failed to load users');
            // Fallback data
            setUsers([
                {
                    id: 1,
                    username: 'admin',
                    email: 'admin@betheland.com',
                    firstName: 'Admin',
                    lastName: 'User',
                    role: 'admin',
                    status: 'active'
                }
            ]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    useEffect(() => {
        if (user) {
            setSelectedUser(user);
            setIsEditing(true);
        }
    }, [user]);

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const handleRoleFilter = (value) => {
        setRoleFilter(value);
    };

    const handleStatusFilter = (value) => {
        setStatusFilter(value);
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.username?.toLowerCase().includes(searchText.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchText.toLowerCase()) ||
            user.firstName?.toLowerCase().includes(searchText.toLowerCase()) ||
            user.lastName?.toLowerCase().includes(searchText.toLowerCase());

        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

        return matchesSearch && matchesRole && matchesStatus;
    });

    const handleCreateUser = () => {
        setCreateModalVisible(true);
        form.resetFields();
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setIsEditing(true);
        form.setFieldsValue({
            ...user,
            department: user.department || '',
            phone: user.phone || '',
            location: user.location || ''
        });
        setCreateModalVisible(true);
    };

    const handleViewUser = (user) => {
        setSelectedUser(user);
        setViewModalVisible(true);
    };

    const handleDeleteUser = (userId) => {
        Modal.confirm({
            title: 'Delete User',
            content: 'Are you sure you want to delete this user? This action cannot be undone.',
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await mockUserService.deleteUser(userId);
                    setUsers(prev => prev.filter(user => user.id !== userId));
                    if (onSuccess) onSuccess();
                } catch (error) {
                    console.error('Delete error:', error);
                    message.error('Failed to delete user');
                }
            },
        });
    };

    const handleLockUser = (userId) => {
        Modal.confirm({
            title: 'Lock User',
            content: 'Are you sure you want to lock this user? They will not be able to login until unlocked.',
            okText: 'Lock User',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await mockUserService.lockUser(userId);
                    setUsers(prev => prev.map(user =>
                        user.id === userId ? { ...user, status: 'locked' } : user
                    ));
                    if (onSuccess) onSuccess();
                } catch (error) {
                    console.error('Lock error:', error);
                    message.error('Failed to lock user');
                }
            },
        });
    };

    const handleUnlockUser = (userId) => {
        Modal.confirm({
            title: 'Unlock User',
            content: 'Are you sure you want to unlock this user?',
            okText: 'Unlock User',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await mockUserService.unlockUser(userId);
                    setUsers(prev => prev.map(user =>
                        user.id === userId ? { ...user, status: 'active' } : user
                    ));
                    if (onSuccess) onSuccess();
                } catch (error) {
                    console.error('Unlock error:', error);
                    message.error('Failed to unlock user');
                }
            },
        });
    };

    const handleResetPassword = (userId) => {
        Modal.confirm({
            title: 'Reset Password',
            content: 'Send password reset instructions to this user?',
            okText: 'Send Reset',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await mockUserService.resetPassword(userId);
                    message.success('Password reset instructions sent');
                } catch (error) {
                    console.error('Reset password error:', error);
                    message.error('Failed to send reset instructions');
                }
            },
        });
    };

    const handleFormSubmit = async (values) => {
        try {
            if (isEditing && selectedUser) {
                await mockUserService.updateUser(selectedUser.id, values);
                setUsers(prev => prev.map(user =>
                    user.id === selectedUser.id ? { ...user, ...values } : user
                ));
            } else {
                await mockUserService.createUser(values);
                loadUsers(); // Reload to get the new user
            }
            setCreateModalVisible(false);
            form.resetFields();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Form submission error:', error);
            message.error(`Failed to ${isEditing ? 'update' : 'create'} user`);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'green';
            case 'locked': return 'red';
            case 'inactive': return 'orange';
            case 'suspended': return 'volcano';
            default: return 'default';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'active': return <CheckCircleOutlined />;
            case 'locked': return <LockOutlined />;
            case 'inactive': return <CloseCircleOutlined />;
            case 'suspended': return <WarningOutlined />;
            default: return <InfoCircleOutlined />;
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return 'red';
            case 'manager': return 'orange';
            case 'auditor': return 'purple';
            case 'user': return 'blue';
            default: return 'default';
        }
    };

    const actionMenu = (record) => (
        <Menu>
            <Menu.Item key="view" icon={<EyeOutlined />} onClick={() => handleViewUser(record)}>
                View Details
            </Menu.Item>
            <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => handleEditUser(record)}>
                Edit User
            </Menu.Item>
            <Menu.Item key="reset" icon={<KeyOutlined />} onClick={() => handleResetPassword(record.id)}>
                Reset Password
            </Menu.Item>
            <Menu.Divider />
            {record.status === 'active' ? (
                <Menu.Item key="lock" icon={<LockOutlined />} onClick={() => handleLockUser(record.id)}>
                    Lock User
                </Menu.Item>
            ) : (
                <Menu.Item key="unlock" icon={<UnlockOutlined />} onClick={() => handleUnlockUser(record.id)}>
                    Unlock User
                </Menu.Item>
            )}
            <Menu.Divider />
            <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => handleDeleteUser(record.id)}>
                Delete User
            </Menu.Item>
        </Menu>
    );

    const columns = [
        {
            title: 'User',
            dataIndex: 'username',
            key: 'user',
            render: (username, record) => (
                <Space>
                    <Avatar
                        size="small"
                        style={{
                            backgroundColor: record.status === 'active' ? '#52c41a' : '#ff4d4f'
                        }}
                    >
                        {username?.[0]?.toUpperCase()}
                    </Avatar>
                    <div>
                        <div style={{ fontWeight: 500 }}>{username}</div>
                        <div style={{ fontSize: '11px', color: '#666' }}>
                            {record.firstName} {record.lastName}
                        </div>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Contact',
            dataIndex: 'email',
            key: 'email',
            render: (email, record) => (
                <Space direction="vertical" size={0}>
                    <div style={{ fontSize: '12px' }}>{email}</div>
                    {record.phone && (
                        <div style={{ fontSize: '11px', color: '#666' }}>{record.phone}</div>
                    )}
                </Space>
            ),
        },
        {
            title: 'Role & Status',
            key: 'roleStatus',
            render: (_, record) => (
                <Space direction="vertical" size={2}>
                    <Tag color={getRoleColor(record.role)}>
                        {record.role.toUpperCase()}
                    </Tag>
                    <Tag icon={getStatusIcon(record.status)} color={getStatusColor(record.status)}>
                        {record.status.toUpperCase()}
                    </Tag>
                </Space>
            ),
        },
        {
            title: 'Last Login',
            dataIndex: 'lastLogin',
            key: 'lastLogin',
            render: (lastLogin) => (
                <div style={{ fontSize: '11px' }}>
                    {lastLogin ? dayjs(lastLogin).format('MMM D, YYYY') : 'Never'}
                </div>
            ),
        },
        {
            title: '2FA',
            dataIndex: 'twoFactorEnabled',
            key: 'twoFactor',
            render: (enabled) => (
                <Tag color={enabled ? 'green' : 'default'}>
                    {enabled ? 'ENABLED' : 'DISABLED'}
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
                            onClick={() => handleViewUser(record)}
                            style={{ borderColor: '#1890ff', color: '#1890ff' }}
                        />
                    </Tooltip>
                    <Tooltip title="Edit User">
                        <Button
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => handleEditUser(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Reset Password">
                        <Button
                            icon={<KeyOutlined />}
                            size="small"
                            onClick={() => handleResetPassword(record.id)}
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
            {/* Header with Stats */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={6}>
                    <Card size="small" style={{ background: '#ffffff', border: '1px solid #d9d9d9' }}>
                        <Statistic
                            title="Total Users"
                            value={users.length}
                            prefix={<TeamOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card size="small" style={{ background: '#ffffff', border: '1px solid #d9d9d9' }}>
                        <Statistic
                            title="Active Users"
                            value={users.filter(u => u.status === 'active').length}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card size="small" style={{ background: '#ffffff', border: '1px solid #d9d9d9' }}>
                        <Statistic
                            title="Locked Users"
                            value={users.filter(u => u.status === 'locked').length}
                            valueStyle={{ color: '#ff4d4f' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card size="small" style={{ background: '#ffffff', border: '1px solid #d9d9d9' }}>
                        <Statistic
                            title="2FA Enabled"
                            value={users.filter(u => u.twoFactorEnabled).length}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card
                style={{
                    background: '#ffffff',
                    border: '1px solid #d9d9d9',
                }}
            >
                <div style={{
                    marginBottom: 16,
                    display: 'flex',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px'
                }}>
                    <Space wrap>
                        <Search
                            placeholder="search users, email, name..."
                            allowClear
                            onSearch={handleSearch}
                            style={{ width: 250 }}
                        />
                        <Select
                            defaultValue="all"
                            style={{ width: 120 }}
                            onChange={handleRoleFilter}
                        >
                            <Option value="all">All Roles</Option>
                            <Option value="admin">Admin</Option>
                            <Option value="manager">Manager</Option>
                            <Option value="auditor">Auditor</Option>
                            <Option value="user">User</Option>
                        </Select>
                        <Select
                            defaultValue="all"
                            style={{ width: 120 }}
                            onChange={handleStatusFilter}
                        >
                            <Option value="all">All Status</Option>
                            <Option value="active">Active</Option>
                            <Option value="locked">Locked</Option>
                            <Option value="inactive">Inactive</Option>
                        </Select>
                    </Space>

                    <Space>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={loadUsers}
                            style={{
                                borderColor: '#1890ff',
                                color: '#1890ff',
                            }}
                        >
                            Refresh
                        </Button>
                        <Button
                            icon={<ExportOutlined />}
                            onClick={() => mockUserService.exportUsers()}
                            style={{
                                borderColor: '#1890ff',
                                color: '#1890ff',
                            }}
                        >
                            Export
                        </Button>
                        <Button
                            type="primary"
                            icon={<UserAddOutlined />}
                            onClick={handleCreateUser}
                            style={{
                                background: '#1890ff',
                                borderColor: '#1890ff',
                                fontWeight: 'bold'
                            }}
                        >
                            Add User
                        </Button>
                    </Space>
                </div>

                <BaseTable
                    data={filteredUsers}
                    columns={columns}
                    loading={loading}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} of ${total} users`,
                    }}
                    style={{
                        background: 'transparent',
                    }}
                />
            </Card>

            {/* Create/Edit User Modal */}
            <Modal
                title={isEditing ? `Edit User - ${selectedUser?.username}` : 'Create New User'}
                open={createModalVisible}
                onCancel={() => {
                    setCreateModalVisible(false);
                    form.resetFields();
                    if (isEditing && onBack) onBack();
                }}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFormSubmit}
                    initialValues={{
                        role: 'user',
                        status: 'active',
                        twoFactorEnabled: false
                    }}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="username"
                                label="Username"
                                rules={[{ required: true, message: 'Please enter username' }]}
                            >
                                <Input prefix={<UserOutlined />} placeholder="username" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { required: true, message: 'Please enter email' },
                                    { type: 'email', message: 'Please enter valid email' }
                                ]}
                            >
                                <Input prefix={<MailOutlined />} placeholder="email@domain.com" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="firstName"
                                label="First Name"
                                rules={[{ required: true, message: 'Please enter first name' }]}
                            >
                                <Input placeholder="First name" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="lastName"
                                label="Last Name"
                                rules={[{ required: true, message: 'Please enter last name' }]}
                            >
                                <Input placeholder="Last name" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="role"
                                label="Role"
                                rules={[{ required: true, message: 'Please select role' }]}
                            >
                                <Select>
                                    <Option value="user">User</Option>
                                    <Option value="manager">Manager</Option>
                                    <Option value="auditor">Auditor</Option>
                                    <Option value="admin">Administrator</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="status"
                                label="Status"
                                rules={[{ required: true, message: 'Please select status' }]}
                            >
                                <Select>
                                    <Option value="active">Active</Option>
                                    <Option value="inactive">Inactive</Option>
                                    <Option value="locked">Locked</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="department" label="Department">
                                <Input placeholder="Department" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="phone" label="Phone">
                                <Input prefix={<PhoneOutlined />} placeholder="Phone number" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="location" label="Location">
                        <Input placeholder="Location" />
                    </Form.Item>

                    <Form.Item name="twoFactorEnabled" valuePropName="checked" label="Two-Factor Authentication">
                        <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button
                                type="primary"
                                htmlType="submit"
                                style={{ background: '#1890ff', borderColor: '#1890ff' }}
                            >
                                {isEditing ? 'Update User' : 'Create User'}
                            </Button>
                            <Button
                                onClick={() => {
                                    setCreateModalVisible(false);
                                    form.resetFields();
                                    if (isEditing && onBack) onBack();
                                }}
                            >
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* View User Details Modal */}
            <Modal
                title="User Details"
                open={viewModalVisible}
                onCancel={() => setViewModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setViewModalVisible(false)}>
                        Close
                    </Button>,
                ]}
                width={700}
            >
                {selectedUser && (
                    <div>
                        <Tabs defaultActiveKey="profile">
                            <TabPane tab="Profile" key="profile">
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <h4 style={{ color: '#1890ff' }}>Basic Information</h4>
                                        <p><strong>Username:</strong> {selectedUser.username}</p>
                                        <p><strong>Email:</strong> {selectedUser.email}</p>
                                        <p><strong>Name:</strong> {selectedUser.firstName} {selectedUser.lastName}</p>
                                        <p><strong>Role:</strong> <Tag color={getRoleColor(selectedUser.role)}>{selectedUser.role.toUpperCase()}</Tag></p>
                                        <p><strong>Status:</strong> <Tag color={getStatusColor(selectedUser.status)}>{selectedUser.status.toUpperCase()}</Tag></p>
                                    </Col>
                                    <Col span={12}>
                                        <h4 style={{ color: '#1890ff' }}>Contact Information</h4>
                                        <p><strong>Phone:</strong> {selectedUser.phone || 'N/A'}</p>
                                        <p><strong>Department:</strong> {selectedUser.department || 'N/A'}</p>
                                        <p><strong>Location:</strong> {selectedUser.location || 'N/A'}</p>
                                        <p><strong>2FA:</strong> <Tag color={selectedUser.twoFactorEnabled ? 'green' : 'default'}>{selectedUser.twoFactorEnabled ? 'ENABLED' : 'DISABLED'}</Tag></p>
                                    </Col>
                                </Row>
                            </TabPane>
                            <TabPane tab="Activity" key="activity">
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <p><strong>Last Login:</strong> {selectedUser.lastLogin ? dayjs(selectedUser.lastLogin).format('YYYY-MM-DD HH:mm:ss') : 'Never'}</p>
                                    <p><strong>Login Count:</strong> {selectedUser.loginCount}</p>
                                    <p><strong>Account Created:</strong> {dayjs(selectedUser.createdAt).format('YYYY-MM-DD')}</p>
                                    <p><strong>Permissions:</strong> {selectedUser.permissions?.join(', ') || 'None'}</p>
                                </Space>
                            </TabPane>
                        </Tabs>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default UserManagement;