// PartnerEditor.jsx - Card Version
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
    Image,
    Tooltip,
    Divider,
    Empty,
    Spin,
    Row,
    Col,
    Select,
    Upload,
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
    UploadOutlined,
    FileImageOutlined,
    TeamOutlined
} from '@ant-design/icons';
import PartnershipServices from './Services/PartnershipServices';
import PartnershipMapper from './Services/PartnershipMapper';

const { Option } = Select;
const { Dragger } = Upload;
const { useBreakpoint } = Grid;
const { Title, Text } = Typography;

const PartnerEditor = ({ onEditContent, onViewContent, onContentUpdated, refreshTrigger }) => {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingPartner, setEditingPartner] = useState(null);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [updatingStatus, setUpdatingStatus] = useState({});
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    useEffect(() => {
        loadPartners();
    }, [refreshTrigger]);

    const loadPartners = async () => {
        setLoading(true);
        try {
            const response = await PartnershipServices.getAllPartners();
            let mappedPartners;

            try {
                mappedPartners = PartnershipMapper.mapToPartnersList(response);
            } catch (mapperError) {
                if (Array.isArray(response)) {
                    mappedPartners = response.map(partner => ({
                        id: partner.id || 0,
                        name: partner.name || '',
                        logoUrl: partner.logoUrl || '',
                        category: partner.category || '',
                        displayOrder: partner.displayOrder || 0,
                        isActive: partner.isActive !== undefined ? partner.isActive : true,
                        createdAt: partner.createdAt ? new Date(partner.createdAt) : null,
                        updatedAt: partner.updatedAt ? new Date(partner.updatedAt) : null
                    }));
                } else {
                    mappedPartners = [];
                }
            }

            const sortedPartners = PartnershipMapper.sortPartners(mappedPartners);
            setPartners(sortedPartners);
        } catch (error) {
            message.error(`Failed to load partners: ${error.message}`);
            setPartners([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingPartner(null);
        setLogoFile(null);
        setLogoPreview(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (partner) => {
        setEditingPartner(partner);
        setLogoFile(null);
        setLogoPreview(partner.logoUrl || null);
        const formData = PartnershipMapper.mapPartnerToForm(partner);
        form.setFieldsValue(formData);
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

    const handleToggleStatus = async (partnerId, newStatus) => {
        setUpdatingStatus(prev => ({ ...prev, [partnerId]: true }));

        try {
            await PartnershipServices.togglePartnerStatus(partnerId, newStatus);
            setPartners(prevPartners =>
                prevPartners.map(partner =>
                    partner.id === partnerId ? { ...partner, isActive: newStatus } : partner
                )
            );
            message.success(`Partner ${newStatus ? 'activated' : 'deactivated'} successfully`);
            if (onContentUpdated) {
                onContentUpdated();
            }
        } catch (error) {
            message.error(`Failed to update partner status: ${error.message}`);
            setPartners(prevPartners =>
                prevPartners.map(partner =>
                    partner.id === partnerId ? { ...partner, isActive: !newStatus } : partner
                )
            );
        } finally {
            setUpdatingStatus(prev => ({ ...prev, [partnerId]: false }));
        }
    };

    const handleFileUpload = (file) => {
        const validationError = PartnershipMapper.getFileValidationError(file);
        if (validationError) {
            message.error(validationError);
            return false;
        }

        setLogoFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            setLogoPreview(e.target.result);
        };
        reader.readAsDataURL(file);

        return false;
    };

    const handleRemoveFile = () => {
        setLogoFile(null);
        setLogoPreview(null);
        form.setFieldValue('logoFile', null);
    };

    const handleSubmit = async (values) => {
        try {
            const partnerData = PartnershipMapper.mapFormToPartner(values, editingPartner);
            partnerData.logoFile = logoFile;

            const validation = PartnershipMapper.validatePartner(partnerData, !editingPartner);
            if (!validation.isValid) {
                const firstError = Object.values(validation.errors)[0];
                message.error(firstError);
                return;
            }

            setUploading(true);

            if (editingPartner) {
                const updateDto = PartnershipMapper.mapToUpdatePartnerDto(partnerData);
                await PartnershipServices.updatePartner(editingPartner.id, updateDto);
                message.success('Partner updated successfully');
            } else {
                const createDto = PartnershipMapper.mapToCreatePartnerDto(partnerData);
                await PartnershipServices.createPartner(createDto);
                message.success('Partner created successfully');
            }

            setModalVisible(false);
            form.resetFields();
            setLogoFile(null);
            setLogoPreview(null);
            loadPartners();

            if (onContentUpdated) {
                onContentUpdated();
            }
        } catch (error) {
            message.error(`Failed to ${editingPartner ? 'update' : 'create'} partner: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleCancel = () => {
        setModalVisible(false);
        form.resetFields();
        setEditingPartner(null);
        setLogoFile(null);
        setLogoPreview(null);
    };

    const filteredPartners = partners.filter(partner => {
        const matchesSearch = partner.name?.toLowerCase().includes(searchText.toLowerCase()) ||
            partner.category?.toLowerCase().includes(searchText.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || partner.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const categories = [...new Set(partners.map(partner => partner.category).filter(Boolean))];

    const renderPartnerCard = (partner) => {
        const processedUrl = PartnershipMapper.processImageUrl(partner.logoUrl);
        const isLoading = updatingStatus[partner.id];

        return (
            <Col xs={24} sm={12} lg={8} xl={6} key={partner.id}>
                <Card
                    style={{
                        height: '100%',
                        border: `1px solid ${partner.isActive ? '#d6e4ff' : '#f0f0f0'}`,
                        background: partner.isActive ? '#f6ffed' : '#fafafa'
                    }}
                    cover={
                        <div style={{
                            padding: '20px',
                            textAlign: 'center',
                            background: '#fafafa',
                            borderBottom: '1px solid #f0f0f0'
                        }}>
                            <Image
                                width={80}
                                height={80}
                                src={processedUrl}
                                alt={`${partner.name || 'Partner'} logo`}
                                style={{
                                    objectFit: 'contain',
                                    borderRadius: '8px'
                                }}
                                fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik00MCA0MEM0Ni4wMTgzIDQwIDUxIDM1LjAxODMgNTEgMjlDNTEgMjIuOTgxNyA0Ni4wMTgzIDE4IDQwIDE4QzMzLjk4MTcgMTggMjkgMjIuOTgxNyAyOSAyOUMyOSAzNS4wMTgzIDMzLjk4MTcgNDAgNDAgNDBaIiBmaWxsPSIjQ0VDRUNFIi8+CjxwYXRoIGQ9Ik01NiA1Nkw1MiA1Mkw0OCA1Mkw1Mi44IDU5LjJINTUuMkw1NiA1NloiIGZpbGw9IiNDRUNFQ0UiLz4KPC9zdmc+Cg=="
                            />
                        </div>
                    }
                    actions={[
                        <Tooltip title="View">
                            <EyeOutlined
                                onClick={() => handleView(partner)}
                                style={{ color: '#1890ff' }}
                            />
                        </Tooltip>,
                        <Tooltip title="Edit">
                            <EditOutlined
                                onClick={() => handleEdit(partner)}
                                style={{ color: '#52c41a' }}
                            />
                        </Tooltip>,
                        <Popconfirm
                            title="Delete Partner"
                            description="Are you sure you want to delete this partner?"
                            onConfirm={() => handleDelete(partner.id)}
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
                    <Card.Meta
                        title={
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <Text strong style={{ fontSize: '16px' }}>
                                    {partner.name || 'Unnamed Partner'}
                                </Text>
                                <Tag color={partner.isActive ? 'green' : 'red'} style={{ margin: 0 }}>
                                    {partner.isActive ? 'Active' : 'Inactive'}
                                </Tag>
                            </div>
                        }
                        description={
                            <div style={{ marginTop: '12px' }}>
                                <div style={{ marginBottom: '8px' }}>
                                    <Tag color="blue">{partner.category || 'Uncategorized'}</Tag>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text type="secondary">Order: {partner.displayOrder}</Text>
                                    <Tooltip title={partner.isActive ? 'Deactivate' : 'Activate'}>
                                        <Switch
                                            size="small"
                                            checked={partner.isActive}
                                            loading={isLoading}
                                            onChange={(checked) => handleToggleStatus(partner.id, checked)}
                                        />
                                    </Tooltip>
                                </div>
                            </div>
                        }
                    />
                </Card>
            </Col>
        );
    };

    const uploadProps = {
        beforeUpload: handleFileUpload,
        accept: '.jpg,.jpeg,.png,.gif,.webp,.bmp',
        showUploadList: false,
        multiple: false
    };

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
                            <TeamOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                            <div>
                                <Title level={4} style={{ margin: 0 }}>Partner Management</Title>
                                <Text type="secondary">
                                    Manage your partner organizations and their display settings
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
                            {isMobile ? 'Add Partner' : 'Add New Partner'}
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
                    <Col xs={24} sm={12} md={10}>
                        <Input
                            placeholder="Search partners by name or category..."
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                            size={isMobile ? "middle" : "large"}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={8}>
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
                    <Col xs={24} md={6}>
                        <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
                            <Text type="secondary">
                                Showing {filteredPartners.length} of {partners.length} partners
                            </Text>
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* Partners Grid */}
            <Card
                bodyStyle={{ padding: isMobile ? '16px' : '24px' }}
            >
                <Spin spinning={loading}>
                    {filteredPartners.length > 0 ? (
                        <Row gutter={[16, 16]}>
                            {filteredPartners.map(renderPartnerCard)}
                        </Row>
                    ) : (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                loading ? "Loading partners..." :
                                    searchText || categoryFilter !== 'all'
                                        ? "No partners match your search criteria"
                                        : "No partners found"
                            }
                        >
                            {!loading && !searchText && categoryFilter === 'all' && (
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TeamOutlined />
                        {editingPartner ? 'Edit Partner' : 'Create New Partner'}
                    </div>
                }
                open={modalVisible}
                onCancel={handleCancel}
                footer={null}
                width={isMobile ? '90vw' : 600}
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
                        <Col span={isMobile ? 24 : 12}>
                            <Form.Item
                                label="Partner Name"
                                name="name"
                                rules={[
                                    { required: true, message: 'Please enter partner name' },
                                    { max: 100, message: 'Name must be less than 100 characters' }
                                ]}
                            >
                                <Input placeholder="Enter partner name" size="large" />
                            </Form.Item>
                        </Col>
                        <Col span={isMobile ? 24 : 12}>
                            <Form.Item
                                label="Category"
                                name="category"
                                rules={[
                                    { required: true, message: 'Please select category' },
                                    { max: 100, message: 'Category must be less than 100 characters' }
                                ]}
                            >
                                <Input placeholder="Enter category (e.g., Developer, Broker)" size="large" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label="Logo"
                        name="logoFile"
                        rules={[
                            {
                                validator: (_, value) => {
                                    if (!logoFile && !logoPreview && !editingPartner) {
                                        return Promise.reject(new Error('Logo file is required'));
                                    }
                                    return Promise.resolve();
                                }
                            }
                        ]}
                        extra="Upload a logo image (JPEG, JPG, PNG, GIF, WEBP, BMP, max 10MB)"
                    >
                        <Dragger {...uploadProps}>
                            <div style={{ padding: '20px' }}>
                                {logoPreview ? (
                                    <div>
                                        <Image
                                            src={logoPreview}
                                            alt="Logo preview"
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '200px',
                                                objectFit: 'contain'
                                            }}
                                        />
                                        <div style={{ marginTop: '8px' }}>
                                            <Button
                                                type="link"
                                                danger
                                                onClick={handleRemoveFile}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="ant-upload-drag-icon">
                                            <FileImageOutlined />
                                        </p>
                                        <p className="ant-upload-text">
                                            Click or drag logo file to this area to upload
                                        </p>
                                        <p className="ant-upload-hint">
                                            Supports: JPEG, JPG, PNG, GIF, WEBP, BMP (max 10MB)
                                        </p>
                                    </div>
                                )}
                            </div>
                        </Dragger>
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={isMobile ? 24 : 12}>
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
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={isMobile ? 24 : 12}>
                            <Form.Item
                                label="Status"
                                name="isActive"
                                valuePropName="checked"
                            >
                                <Switch
                                    checkedChildren="Active"
                                    unCheckedChildren="Inactive"
                                    size={isMobile ? "default" : "small"}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider />

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={handleCancel} disabled={uploading} size={isMobile ? "middle" : "large"}>
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={uploading}
                                disabled={uploading}
                                size={isMobile ? "middle" : "large"}
                            >
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