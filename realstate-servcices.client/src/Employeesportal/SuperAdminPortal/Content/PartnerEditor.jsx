// PartnerEditor.jsx
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
    Image,
    Tooltip,
    Divider,
    Empty,
    Spin,
    Row,
    Col,
    Select,
    Upload
} from 'antd';
import {
    EditOutlined,
    EyeOutlined,
    DeleteOutlined,
    PlusOutlined,
    CheckOutlined,
    CloseOutlined,
    ReloadOutlined,
    UploadOutlined,
    SearchOutlined
} from '@ant-design/icons';
import PartnershipServices from './Services/PartnershipServices';
import PartnershipMapper from './Services/PartnershipMapper';

const { Option } = Select;
const { TextArea } = Input;

const PartnerEditor = ({ onEditContent, onViewContent, onContentUpdated, refreshTrigger }) => {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingPartner, setEditingPartner] = useState(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    // Load partners on component mount and when refreshTrigger changes
    useEffect(() => {
        loadPartners();
    }, [refreshTrigger]);

    const loadPartners = async () => {
        setLoading(true);
        try {
            const response = await PartnershipServices.getAllPartners();
            const mappedPartners = PartnershipMapper.mapToPartnersList(response);
            const sortedPartners = PartnershipMapper.sortPartners(mappedPartners);
            setPartners(sortedPartners);
        } catch (error) {
            message.error(`Failed to load partners: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingPartner(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (partner) => {
        setEditingPartner(partner);
        form.setFieldsValue(PartnershipMapper.mapPartnerToForm(partner));
        setModalVisible(true);
    };

    const handleView = (partner) => {
        if (onViewContent) {
            onViewContent(partner);
        }
    };

    const handleDelete = async (partnerId) => {
        try {
            await PartnershipServices.deletePartner(partnerId);
            message.success('Partner deleted successfully');
            loadPartners();
            if (onContentUpdated) {
                onContentUpdated();
            }
        } catch (error) {
            message.error(`Failed to delete partner: ${error.message}`);
        }
    };

    const handleToggleStatus = async (partnerId, currentStatus) => {
        try {
            await PartnershipServices.togglePartnerStatus(partnerId, !currentStatus);
            message.success(`Partner ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
            loadPartners();
            if (onContentUpdated) {
                onContentUpdated();
            }
        } catch (error) {
            message.error(`Failed to update partner status: ${error.message}`);
        }
    };

    const handleSubmit = async (values) => {
        try {
            const validation = PartnershipMapper.validatePartner(values);
            if (!validation.isValid) {
                const firstError = Object.values(validation.errors)[0];
                message.error(firstError);
                return;
            }

            if (editingPartner) {
                // Update existing partner
                const updateDto = PartnershipMapper.mapToUpdatePartnerDto(values);
                await PartnershipServices.updatePartner(editingPartner.id, updateDto);
                message.success('Partner updated successfully');
            } else {
                // Create new partner
                const createDto = PartnershipMapper.mapToCreatePartnerDto(values);
                await PartnershipServices.createPartner(createDto);
                message.success('Partner created successfully');
            }

            setModalVisible(false);
            form.resetFields();
            loadPartners();
            if (onContentUpdated) {
                onContentUpdated();
            }
        } catch (error) {
            message.error(`Failed to ${editingPartner ? 'update' : 'create'} partner: ${error.message}`);
        }
    };

    const handleCancel = () => {
        setModalVisible(false);
        form.resetFields();
        setEditingPartner(null);
    };

    // Filter partners based on search text and category
    const filteredPartners = partners.filter(partner => {
        const matchesSearch = partner.name.toLowerCase().includes(searchText.toLowerCase()) ||
            partner.category.toLowerCase().includes(searchText.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || partner.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    // Get unique categories for filter
    const categories = [...new Set(partners.map(partner => partner.category))];

    const columns = [
        {
            title: 'Logo',
            dataIndex: 'logoUrl',
            key: 'logo',
            width: 80,
            render: (logoUrl) => (
                <Image
                    width={50}
                    height={50}
                    src={logoUrl}
                    alt="Partner Logo"
                    style={{
                        objectFit: 'contain',
                        borderRadius: '4px',
                        backgroundColor: '#f5f5f5'
                    }}
                    fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yNSAzMEMyNy43NjE0IDMwIDMwIDI3Ljc2MTQgMzAgMjVDMzAgMjIuMjM4NiAyNy43NjE0IDIwIDI1IDIwQzIyLjIzODYgMjAgMjAgMjIuMjM4NiAyMCAyNUMyMCAyNy43NjE0IDIyLjIzODYgMzAgMjUgMzBaIiBmaWxsPSIjQ0VDRUNFIi8+CjxwYXRoIGQ9Ik0zNSAzNUwzMi41IDMyLjVMMzAuNSAzNC41TDMzIDM3TDM1IDM1WiIgZmlsbD0iI0NFQ0VDRSIvPgo8L3N2Zz4K"
                />
            ),
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (text, record) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{text}</div>
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
                        title="Delete Partner"
                        description="Are you sure you want to delete this partner?"
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
                <Row justify="space-between" align="middle" gutter={[16, 16]}>
                    <Col>
                        <div>
                            <h3 style={{ margin: 0, color: '#1a365d' }}>Partner Management</h3>
                            <p style={{ margin: 0, color: '#666' }}>
                                Manage your partner organizations and their display settings
                            </p>
                        </div>
                    </Col>
                    <Col>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleCreate}
                            size="large"
                        >
                            Add New Partner
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
                            placeholder="Search partners by name or category..."
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
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={loadPartners}
                            loading={loading}
                        >
                            Refresh
                        </Button>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{ color: '#666', fontSize: '14px' }}>
                                Showing {filteredPartners.length} of {partners.length} partners
                            </span>
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* Partners Table */}
            <Card>
                <Spin spinning={loading}>
                    {filteredPartners.length > 0 ? (
                        <Table
                            columns={columns}
                            dataSource={filteredPartners}
                            rowKey="id"
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total, range) =>
                                    `${range[0]}-${range[1]} of ${total} partners`,
                            }}
                            scroll={{ x: 800 }}
                        />
                    ) : (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                searchText || categoryFilter !== 'all'
                                    ? "No partners match your search criteria"
                                    : "No partners found"
                            }
                        >
                            {!searchText && categoryFilter === 'all' && (
                                <Button type="primary" onClick={handleCreate}>
                                    <PlusOutlined /> Add Your First Partner
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
                        {editingPartner ? 'Edit Partner' : 'Create New Partner'}
                        {editingPartner && (
                            <div style={{ fontSize: '12px', color: '#666', fontWeight: 'normal' }}>
                                ID: {editingPartner.id}
                            </div>
                        )}
                    </div>
                }
                open={modalVisible}
                onCancel={handleCancel}
                footer={null}
                width={600}
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
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Partner Name"
                                name="name"
                                rules={[
                                    { required: true, message: 'Please enter partner name' },
                                    { max: 100, message: 'Name must be less than 100 characters' }
                                ]}
                            >
                                <Input placeholder="Enter partner name" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Category"
                                name="category"
                                rules={[
                                    { required: true, message: 'Please select category' },
                                    { max: 100, message: 'Category must be less than 100 characters' }
                                ]}
                            >
                                <Input placeholder="Enter category (e.g., Developer, Broker)" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label="Logo URL"
                        name="logoUrl"
                        rules={[
                            { required: true, message: 'Please enter logo URL' },
                            {
                                validator: (_, value) => {
                                    if (!value) return Promise.resolve();
                                    if (value.length > 500) {
                                        return Promise.reject(new Error('Logo URL must be less than 500 characters'));
                                    }
                                    if (!PartnershipMapper.isValidUrl(value)) {
                                        return Promise.reject(new Error('Please enter a valid URL'));
                                    }
                                    return Promise.resolve();
                                }
                            }
                        ]}
                        extra="Enter a direct link to the partner's logo image"
                    >
                        <Input placeholder="https://example.com/logo.png" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Display Order"
                                name="displayOrder"
                                rules={[
                                    { type: 'number', min: 0, message: 'Display order must be 0 or greater' }
                                ]}
                                extra="Lower numbers appear first"
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    placeholder="0"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Status"
                                name="isActive"
                                valuePropName="checked"
                            >
                                <Switch
                                    checkedChildren="Active"
                                    unCheckedChildren="Inactive"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider />

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit">
                                {editingPartner ? 'Update Partner' : 'Create Partner'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default PartnerEditor;