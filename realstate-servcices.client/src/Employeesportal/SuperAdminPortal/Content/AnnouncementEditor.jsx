// AnnouncementEditor.jsx - Card Version
import React, { useState, useEffect } from 'react';
import {
    Card,
    Button,
    Space,
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
    Select,
    Grid,
    Typography
} from 'antd';
import {
    EditOutlined,
    EyeOutlined,
    DeleteOutlined,
    PlusOutlined,
    CheckOutlined,
    CloseOutlined,
    SearchOutlined,
    NotificationOutlined
} from '@ant-design/icons';
import AnnouncementServices from './Services/AnnouncementServices';
import AnnouncementMapper from './Services/AnnouncementMapper';

const { Option } = Select;
const { TextArea } = Input;
const { useBreakpoint } = Grid;
const { Title, Text, Paragraph } = Typography;

const AnnouncementEditor = ({ onEditContent, onViewContent, onContentUpdated, refreshTrigger }) => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    useEffect(() => {
        loadAnnouncements();
    }, [refreshTrigger]);

    const loadAnnouncements = async () => {
        setLoading(true);
        try {
            const response = await AnnouncementServices.getAllAnnouncements();
            let mappedAnnouncements = AnnouncementMapper.mapDirectArray(response);
            const sortedAnnouncements = AnnouncementMapper.sortAnnouncements(mappedAnnouncements);
            setAnnouncements(sortedAnnouncements);
        } catch (error) {
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
                const updateDto = AnnouncementMapper.mapToUpdateAnnouncementDto(values);
                await AnnouncementServices.updateAnnouncement(editingAnnouncement.id, updateDto);
                message.success('Announcement updated successfully');
            } else {
                const createDto = AnnouncementMapper.mapToCreateAnnouncementDto(values);
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

    const filteredAnnouncements = announcements.filter(announcement => {
        const matchesSearch = announcement.content.toLowerCase().includes(searchText.toLowerCase()) ||
            announcement.category.toLowerCase().includes(searchText.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || announcement.category === categoryFilter;
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' && announcement.isActive) ||
            (statusFilter === 'inactive' && !announcement.isActive);
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const categories = [...new Set(announcements.map(announcement => announcement.category))];

    const renderAnnouncementCard = (announcement) => (
        <Col xs={24} lg={12} xl={8} key={announcement.id}>
            <Card
                style={{
                    height: '100%',
                    border: `1px solid ${announcement.isActive ? '#d6e4ff' : '#f0f0f0'}`,
                    background: announcement.isActive ? '#f6ffed' : '#fafafa'
                }}
                actions={[
                    <Tooltip title="View">
                        <EyeOutlined
                            onClick={() => handleView(announcement)}
                            style={{ color: '#1890ff' }}
                        />
                    </Tooltip>,
                    <Tooltip title="Edit">
                        <EditOutlined
                            onClick={() => handleEdit(announcement)}
                            style={{ color: '#52c41a' }}
                        />
                    </Tooltip>,
                    <Popconfirm
                        title="Delete Announcement"
                        description="Are you sure you want to delete this announcement?"
                        onConfirm={() => handleDelete(announcement.id)}
                        okText="Yes"
                        cancelText="No"
                        okType="danger"
                    >
                        <Tooltip title="Delete">
                            <DeleteOutlined style={{ color: '#ff4d4f' }} />
                        </Tooltip>
                    </Popconfirm>
                ]}
            >
                <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                        <Tag color="blue" style={{ margin: 0 }}>
                            {announcement.category}
                        </Tag>
                        <Tag color={announcement.isActive ? 'green' : 'red'} style={{ margin: 0 }}>
                            {announcement.isActive ? 'Active' : 'Inactive'}
                        </Tag>
                    </div>

                    <Paragraph
                        ellipsis={{ rows: 3, expandable: true, symbol: 'more' }}
                        style={{
                            marginBottom: '12px',
                            fontSize: '14px',
                            lineHeight: '1.5'
                        }}
                    >
                        {announcement.content}
                    </Paragraph>
                </div>

                <Divider style={{ margin: '12px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            Order: {announcement.displayOrder}
                        </Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {announcement.isActive ? 'Active' : 'Inactive'}
                        </Text>
                        <Tooltip title={announcement.isActive ? 'Deactivate' : 'Activate'}>
                            <Switch
                                size="small"
                                checked={announcement.isActive}
                                onChange={() => handleToggleStatus(announcement.id, announcement.isActive)}
                            />
                        </Tooltip>
                    </div>
                </div>

                {announcement.createdAt && (
                    <div style={{ marginTop: '8px' }}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            Created: {new Date(announcement.createdAt).toLocaleDateString()}
                        </Text>
                    </div>
                )}
            </Card>
        </Col>
    );

    return (
        <div>
            {/* Header Section */}
            <Card
                style={{ marginBottom: 16 }}
                bodyStyle={{ padding: isMobile ? '16px' : '20px' }}
            >
                <Row justify="space-between" align="middle" gutter={[16, 16]}>
                    <Col flex="auto">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <NotificationOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                            <div>
                                <Title level={4} style={{ margin: 0 }}>Announcement Management</Title>
                                <Text type="secondary">
                                    Manage running letter announcements and display settings
                                </Text>
                            </div>
                        </div>
                    </Col>
                    <Col>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleCreate}
                            size={isMobile ? "middle" : "large"}
                        >
                            {isMobile ? 'Add Announcement' : 'Add New Announcement'}
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* Filters Section */}
            <Card
                style={{ marginBottom: 16 }}
                bodyStyle={{ padding: isMobile ? '16px' : '20px' }}
            >
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12} md={8}>
                        <Input
                            placeholder="Search announcements..."
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                            size={isMobile ? "middle" : "large"}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Filter by category"
                            value={categoryFilter}
                            onChange={setCategoryFilter}
                            allowClear
                            size={isMobile ? "middle" : "large"}
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
                            size={isMobile ? "middle" : "large"}
                        >
                            <Option value="all">All Status</Option>
                            <Option value="active">Active</Option>
                            <Option value="inactive">Inactive</Option>
                        </Select>
                    </Col>
                    <Col xs={24} md={6}>
                        <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
                            <Text type="secondary">
                                Showing {filteredAnnouncements.length} of {announcements.length} announcements
                            </Text>
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* Announcements Grid */}
            <Card
                bodyStyle={{ padding: isMobile ? '16px' : '24px' }}
            >
                <Spin spinning={loading}>
                    {filteredAnnouncements.length > 0 ? (
                        <Row gutter={[16, 16]}>
                            {filteredAnnouncements.map(renderAnnouncementCard)}
                        </Row>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <NotificationOutlined />
                        {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
                    </div>
                }
                open={modalVisible}
                onCancel={handleCancel}
                footer={null}
                width={isMobile ? '90vw' : 700}
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
                            size="large"
                        />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={isMobile ? 24 : 12}>
                            <Form.Item
                                label="Category"
                                name="category"
                                rules={[
                                    { required: true, message: 'Please select category' },
                                    { max: 100, message: 'Category must be less than 100 characters' }
                                ]}
                                extra="Used to group similar announcements"
                            >
                                <Input
                                    placeholder="Enter category (e.g., Promotion, News, Update)"
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={isMobile ? 24 : 12}>
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
                                    size="large"
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
                            size={isMobile ? "default" : "small"}
                        />
                    </Form.Item>

                    <Divider />

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={handleCancel} size={isMobile ? "middle" : "large"}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit" size={isMobile ? "middle" : "large"}>
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