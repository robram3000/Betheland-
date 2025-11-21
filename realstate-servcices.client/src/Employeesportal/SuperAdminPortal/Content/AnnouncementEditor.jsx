// AnnouncementEditor.jsx
import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Space,
    Card,
    Tag,
    Modal,
    Form,
    Input,
    InputNumber,
    Switch,
    message,
    Popconfirm,
    Tooltip,
    Divider,
    Empty,
    Spin,
    Row,
    Col,
    Select
} from 'antd';
import {
    EditOutlined,
    EyeOutlined,
    DeleteOutlined,
    PlusOutlined,
    CheckOutlined,
    CloseOutlined,
    ReloadOutlined,
    SearchOutlined,
    NotificationOutlined
} from '@ant-design/icons';
import AnnouncementServices from './Services/AnnouncementServices';
import AnnouncementMapper from './Services/AnnouncementMapper';

const { Option } = Select;
const { TextArea } = Input;

const AnnouncementEditor = ({ onEditContent, onViewContent, onContentUpdated, refreshTrigger }) => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // Load announcements on component mount and when refreshTrigger changes
    useEffect(() => {
        console.log('🚀 AnnouncementEditor mounted, loading announcements...');
        loadAnnouncements();
    }, [refreshTrigger]);

    const loadAnnouncements = async () => {
        setLoading(true);
        try {
            console.log('🔍 Starting to load announcements...');
            const response = await AnnouncementServices.getAllAnnouncements();
            console.log('📦 Raw API Response:', response);

            // Use the ultra-simple mapper for direct array responses
            let mappedAnnouncements = AnnouncementMapper.mapDirectArray(response);
            console.log('✅ Mapped Announcements:', mappedAnnouncements);

            const sortedAnnouncements = AnnouncementMapper.sortAnnouncements(mappedAnnouncements);
            console.log('🔢 Final Sorted Announcements:', sortedAnnouncements);

            setAnnouncements(sortedAnnouncements);

            if (sortedAnnouncements.length === 0) {
                console.warn('⚠️ No announcements found after mapping');
                message.info('No announcements found in the system');
            } else {
                console.log(`🎉 Successfully loaded ${sortedAnnouncements.length} announcements`);
                message.success(`Loaded ${sortedAnnouncements.length} announcements`);
            }
        } catch (error) {
            console.error('💥 Error loading announcements:', error);
            console.error('💥 Error response:', error.response);
            message.error(`Failed to load announcements: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingAnnouncement(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (announcement) => {
        setEditingAnnouncement(announcement);
        form.setFieldsValue(AnnouncementMapper.mapAnnouncementToForm(announcement));
        setModalVisible(true);
    };

    const handleView = (announcement) => {
        if (onViewContent) {
            onViewContent(announcement);
        }
    };

    const handleDelete = async (announcementId) => {
        try {
            await AnnouncementServices.deleteAnnouncement(announcementId);
            message.success('Announcement deleted successfully');
            loadAnnouncements();
            if (onContentUpdated) {
                onContentUpdated();
            }
        } catch (error) {
            message.error(`Failed to delete announcement: ${error.message}`);
        }
    };

    const handleToggleStatus = async (announcementId, currentStatus) => {
        try {
            await AnnouncementServices.toggleAnnouncementStatus(announcementId, !currentStatus);
            message.success(`Announcement ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
            loadAnnouncements();
            if (onContentUpdated) {
                onContentUpdated();
            }
        } catch (error) {
            message.error(`Failed to update announcement status: ${error.message}`);
        }
    };

    const handleSubmit = async (values) => {
        try {
            const validation = AnnouncementMapper.validateAnnouncement(values);
            if (!validation.isValid) {
                const firstError = Object.values(validation.errors)[0];
                message.error(firstError);
                return;
            }

            if (editingAnnouncement) {
                // Update existing announcement
                const updateDto = AnnouncementMapper.mapToUpdateAnnouncementDto(values);
                console.log('📤 Update DTO:', updateDto);
                await AnnouncementServices.updateAnnouncement(editingAnnouncement.id, updateDto);
                message.success('Announcement updated successfully');
            } else {
                // Create new announcement
                const createDto = AnnouncementMapper.mapToCreateAnnouncementDto(values);
                console.log('📤 Create DTO:', createDto);
                await AnnouncementServices.createAnnouncement(createDto);
                message.success('Announcement created successfully');
            }

            setModalVisible(false);
            form.resetFields();
            loadAnnouncements();
            if (onContentUpdated) {
                onContentUpdated();
            }
        } catch (error) {
            message.error(`Failed to ${editingAnnouncement ? 'update' : 'create'} announcement: ${error.message}`);
        }
    };

    const handleCancel = () => {
        setModalVisible(false);
        form.resetFields();
        setEditingAnnouncement(null);
    };

    // Filter announcements based on search text, category, and status
    const filteredAnnouncements = announcements.filter(announcement => {
        const matchesSearch = announcement.content.toLowerCase().includes(searchText.toLowerCase()) ||
            announcement.category.toLowerCase().includes(searchText.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || announcement.category === categoryFilter;
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' && announcement.isActive) ||
            (statusFilter === 'inactive' && !announcement.isActive);
        return matchesSearch && matchesCategory && matchesStatus;
    });

    // Get unique categories for filter
    const categories = [...new Set(announcements.map(announcement => announcement.category))];

    const columns = [
        {
            title: 'Content',
            dataIndex: 'content',
            key: 'content',
            render: (text, record) => (
                <div>
                    <div style={{ fontWeight: 500, maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {text}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>ID: {record.id}</div>
                </div>
            ),
        },
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            width: 150,
            render: (category) => (
                <Tag color="blue" style={{ margin: 0 }}>
                    {category}
                </Tag>
            ),
        },
        {
            title: 'Display Order',
            dataIndex: 'displayOrder',
            key: 'displayOrder',
            width: 120,
            sorter: (a, b) => a.displayOrder - b.displayOrder,
            render: (order) => (
                <Tag color="green">{order}</Tag>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            key: 'status',
            width: 100,
            render: (isActive, record) => (
                <Tooltip title={isActive ? 'Click to deactivate' : 'Click to activate'}>
                    <Switch
                        checked={isActive}
                        onChange={() => handleToggleStatus(record.id, isActive)}
                        checkedChildren={<CheckOutlined />}
                        unCheckedChildren={<CloseOutlined />}
                    />
                </Tooltip>
            ),
        },
        {
            title: 'Created',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            render: (date) => date ? new Date(date).toLocaleDateString() : '-',
        },
        {
            title: 'Updated',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            width: 120,
            render: (date) => date ? new Date(date).toLocaleDateString() : '-',
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="View Details">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => handleView(record)}
                            style={{ color: '#1890ff' }}
                        />
                    </Tooltip>
                    <Tooltip title="Edit">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                            style={{ color: '#52c41a' }}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Delete Announcement"
                        description="Are you sure you want to delete this announcement?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                        okType="danger"
                    >
                        <Tooltip title="Delete">
                            <Button
                                type="text"
                                icon={<DeleteOutlined />}
                                style={{ color: '#ff4d4f' }}
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
     

            {/* Header Section */}
            <Card
                style={{ marginBottom: 16 }}
                bodyStyle={{ padding: '16px 24px' }}
            >
                <Row justify="end" align="middle">
                    <Col>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleCreate}
                            size="large"
                        >
                            Add New Announcement
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* Filters Section */}
            <Card
                style={{ marginBottom: 16 }}
                bodyStyle={{ padding: '16px 24px' }}
            >
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12} md={8}>
                        <Input
                            placeholder="Search announcements by content or category..."
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Filter by category"
                            value={categoryFilter}
                            onChange={setCategoryFilter}
                            allowClear
                        >
                            <Option value="all">All Categories</Option>
                            {categories.map(category => (
                                <Option key={category} value={category}>
                                    {category}
                                </Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Filter by status"
                            value={statusFilter}
                            onChange={setStatusFilter}
                            allowClear
                        >
                            <Option value="all">All Status</Option>
                            <Option value="active">Active</Option>
                            <Option value="inactive">Inactive</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={3}>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={loadAnnouncements}
                            loading={loading}
                        >
                            Refresh
                        </Button>
                    </Col>
                    <Col xs={24} sm={12} md={3}>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{ color: '#666', fontSize: '14px' }}>
                                Showing {filteredAnnouncements.length} of {announcements.length} announcements
                            </span>
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* Announcements Table */}
            <Card>
                <Spin spinning={loading}>
                    {filteredAnnouncements.length > 0 ? (
                        <Table
                            columns={columns}
                            dataSource={filteredAnnouncements}
                            rowKey="id"
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total, range) =>
                                    `${range[0]}-${range[1]} of ${total} announcements`,
                            }}
                            scroll={{ x: 1000 }}
                        />
                    ) : (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                searchText || categoryFilter !== 'all' || statusFilter !== 'all'
                                    ? "No announcements match your search criteria"
                                    : announcements.length === 0
                                        ? "No announcements found in the system"
                                        : "No announcements match current filters"
                            }
                        >
                            {!searchText && categoryFilter === 'all' && statusFilter === 'all' && announcements.length === 0 && (
                                <Button type="primary" onClick={handleCreate}>
                                    <PlusOutlined /> Add Your First Announcement
                                </Button>
                            )}
                        </Empty>
                    )}
                </Spin>
            </Card>

            {/* Create/Edit Modal */}
            <Modal
                title={
                    <div>
                        <NotificationOutlined style={{ marginRight: 8 }} />
                        {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
                        {editingAnnouncement && (
                            <div style={{ fontSize: '12px', color: '#666', fontWeight: 'normal' }}>
                                ID: {editingAnnouncement.id}
                            </div>
                        )}
                    </div>
                }
                open={modalVisible}
                onCancel={handleCancel}
                footer={null}
                width={700}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        displayOrder: 0,
                        isActive: true
                    }}
                >
                    <Form.Item
                        label="Announcement Content"
                        name="content"
                        rules={[
                            { required: true, message: 'Please enter announcement content' },
                            { max: 500, message: 'Content must be less than 500 characters' }
                        ]}
                        extra="This text will be displayed in the running letter announcement"
                    >
                        <TextArea
                            placeholder="Enter announcement content (e.g., Special promotion: Get 20% off on all properties this month!)"
                            rows={3}
                            showCount
                            maxLength={500}
                        />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Category"
                                name="category"
                                rules={[
                                    { required: true, message: 'Please select category' },
                                    { max: 100, message: 'Category must be less than 100 characters' }
                                ]}
                                extra="Used to group similar announcements"
                            >
                                <Input placeholder="Enter category (e.g., Promotion, News, Update)" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Display Order"
                                name="displayOrder"
                                rules={[
                                    { type: 'number', min: 0, message: 'Display order must be 0 or greater' }
                                ]}
                                extra="Lower numbers appear first in the running letter"
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    placeholder="0"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label="Status"
                        name="isActive"
                        valuePropName="checked"
                        extra="Active announcements will be displayed in the running letter"
                    >
                        <Switch
                            checkedChildren="Active"
                            unCheckedChildren="Inactive"
                        />
                    </Form.Item>

                    <Divider />

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit">
                                {editingAnnouncement ? 'Update Announcement' : 'Create Announcement'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AnnouncementEditor;