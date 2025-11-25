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
    SearchOutlined,
    UploadOutlined,
    FileImageOutlined
} from '@ant-design/icons';
import PartnershipServices from './Services/PartnershipServices';
import PartnershipMapper from './Services/PartnershipMapper';

const { Option } = Select;
const { Dragger } = Upload;

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

    // Load partners on component mount and when refreshTrigger changes
    useEffect(() => {
        console.log('PartnerEditor mounted or refreshTrigger changed:', refreshTrigger);
        loadPartners();
    }, [refreshTrigger]);

    const loadPartners = async () => {
        setLoading(true);
        try {
            console.log('Starting to load partners...');
            const response = await PartnershipServices.getAllPartners();
            console.log('Raw partners response:', response);

            let mappedPartners;
            try {
                mappedPartners = PartnershipMapper.mapToPartnersList(response);
                console.log('Mapped partners after mapper:', mappedPartners);
            } catch (mapperError) {
                console.error('Mapper error, trying direct mapping:', mapperError);
                // Fallback: if mapper fails, try direct mapping
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
                } else if (response && response.data && Array.isArray(response.data)) {
                    mappedPartners = response.data.map(partner => ({
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
                    console.warn('Response is not an array, setting empty array');
                    mappedPartners = [];
                }
            }

            const sortedPartners = PartnershipMapper.sortPartners(mappedPartners);
            console.log('Final sorted partners:', sortedPartners);
            setPartners(sortedPartners);

            if (sortedPartners.length === 0) {
                console.warn('No partners found after processing');
            }
        } catch (error) {
            console.error('Full partners error:', error);
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
        } else {
            // Fallback view behavior
            Modal.info({
                title: partner.name || 'Partner Details',
                content: (
                    <div>
                        <p><strong>Category:</strong> {partner.category || 'Uncategorized'}</p>
                        <p><strong>Display Order:</strong> {partner.displayOrder}</p>
                        <p><strong>Status:</strong> {partner.isActive ? 'Active' : 'Inactive'}</p>
                        <p><strong>Logo URL:</strong> {partner.logoUrl}</p>
                        {partner.createdAt && (
                            <p><strong>Created:</strong> {new Date(partner.createdAt).toLocaleDateString()}</p>
                        )}
                    </div>
                ),
                width: 500,
            });
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
        console.log('=== TOGGLE STATUS DEBUG START ===');
        console.log('Partner ID:', partnerId);
        console.log('New Status:', newStatus);
        console.log('Current updatingStatus state:', updatingStatus);

        // Set loading state for this specific partner
        setUpdatingStatus(prev => {
            const newState = { ...prev, [partnerId]: true };
            console.log('Setting updatingStatus to:', newState);
            return newState;
        });

        try {
            console.log('Calling PartnershipServices.togglePartnerStatus...');
            const result = await PartnershipServices.togglePartnerStatus(partnerId, newStatus);
            console.log('API call successful, response:', result);

            // Update local state after successful API call
            setPartners(prevPartners => {
                const updatedPartners = prevPartners.map(partner =>
                    partner.id === partnerId
                        ? { ...partner, isActive: newStatus }
                        : partner
                );
                console.log('Updated partners state:', updatedPartners);
                return updatedPartners;
            });

            message.success(`Partner ${newStatus ? 'activated' : 'deactivated'} successfully`);

            if (onContentUpdated) {
                onContentUpdated();
            }
        } catch (error) {
            console.error('Toggle status error:', error);

            // Show error message
            message.error(`Failed to update partner status: ${error.message}`);

            // Revert the UI change on error
            setPartners(prevPartners => {
                const revertedPartners = prevPartners.map(partner =>
                    partner.id === partnerId
                        ? { ...partner, isActive: !newStatus } // Revert to previous state
                        : partner
                );
                console.log('Reverted partners state due to error:', revertedPartners);
                return revertedPartners;
            });
        } finally {
            // Always clear loading state
            setUpdatingStatus(prev => {
                const newState = { ...prev, [partnerId]: false };
                console.log('Clearing loading state, new state:', newState);
                return newState;
            });
            console.log('=== TOGGLE STATUS DEBUG END ===');
        }
    };

    const handleFileUpload = (file) => {
        const validationError = PartnershipMapper.getFileValidationError(file);
        if (validationError) {
            message.error(validationError);
            return false;
        }

        setLogoFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setLogoPreview(e.target.result);
        };
        reader.readAsDataURL(file);

        return false; // Prevent automatic upload
    };

    const handleRemoveFile = () => {
        setLogoFile(null);
        setLogoPreview(null);
        form.setFieldValue('logoFile', null);
    };

    const handleSubmit = async (values) => {
        try {
            console.log('=== SUBMIT DEBUG START ===');
            console.log('Form values:', values);
            console.log('Editing partner:', editingPartner);
            console.log('Logo file:', logoFile);

            // Map form values to partner object
            const partnerData = PartnershipMapper.mapFormToPartner(values, editingPartner);
            partnerData.logoFile = logoFile;

            console.log('Mapped partner data:', partnerData);

            // Validate partner data
            const validation = PartnershipMapper.validatePartner(partnerData, !editingPartner);
            if (!validation.isValid) {
                const firstError = Object.values(validation.errors)[0];
                message.error(firstError);
                return;
            }

            setUploading(true);

            if (editingPartner) {
                // Update existing partner
                console.log('Updating partner with ID:', editingPartner.id);
                const updateDto = PartnershipMapper.mapToUpdatePartnerDto(partnerData);
                console.log('Update DTO (FormData):', updateDto);

                // Log FormData contents
                for (let [key, value] of updateDto.entries()) {
                    console.log(`FormData - ${key}:`, value);
                }

                await PartnershipServices.updatePartner(editingPartner.id, updateDto);
                message.success('Partner updated successfully');
            } else {
                // Create new partner
                console.log('Creating new partner');
                const createDto = PartnershipMapper.mapToCreatePartnerDto(partnerData);
                console.log('Create DTO (FormData):', createDto);

                // Log FormData contents
                for (let [key, value] of createDto.entries()) {
                    console.log(`FormData - ${key}:`, value);
                }

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

            console.log('=== SUBMIT DEBUG END ===');
        } catch (error) {
            console.error('Submit error:', error);
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

    // Filter partners based on search text and category
    const filteredPartners = partners.filter(partner => {
        const matchesSearch = partner.name?.toLowerCase().includes(searchText.toLowerCase()) ||
            partner.category?.toLowerCase().includes(searchText.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || partner.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    // Get unique categories for filter
    const categories = [...new Set(partners.map(partner => partner.category).filter(Boolean))];

    const columns = [
        // In PartnerEditor.jsx, update the Image components to use the processed URLs:

        // In the columns definition, update the logo renderer:
        {
            title: 'Logo',
            dataIndex: 'logoUrl',
            key: 'logo',
            width: 80,
            render: (logoUrl, record) => {
                // Ensure the URL is processed for display
                const processedUrl = PartnershipMapper.processImageUrl(logoUrl);

                return (
                    <Image
                        width={50}
                        height={50}
                        src={processedUrl}
                        alt={`${record.name || 'Partner'} logo`}
                        style={{
                            objectFit: 'contain',
                            borderRadius: '4px',
                            backgroundColor: '#f5f5f5'
                        }}
                        fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yNSAzMEMyNy43NjE0IDMwIDMwIDI3Ljc2MTQgMzAgMjVDMzAgMjIuMjM4NiAyNy43NjE0IDIwIDI1IDIwQzIyLjIzODYgMjAgMjAgMjIuMjM4NiAyMCAyNUMyMCAyNy43NjE0IDIyLjIzODYgMzAgMjUgMzBaIiBmaWxsPSIjQ0VDRUNFIi8+CjxwYXRoIGQ9Ik0zNSAzNUwzMi41IDMyLjVMMzAuNSAzNC41TDMzIDM3TDM1IDM1WiIgZmlsbD0iI0NFQ0VDRSIvPgo8L3N2Zz4K"
                        onError={(e) => {
                            e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yNSAzMEMyNy43NjE0IDMwIDMwIDI3Ljc2MTQgMzAgMjVDMzAgMjIuMjM4NiAyNy43NjE0IDIwIDI1IDIwQzIyLjIzODYgMjAgMjAgMjIuMjM4NiAyMCAyNUMyMCAyNy43NjE0IDIyLjIzODYgMzAgMjUgMzBaIiBmaWxsPSIjQ0VDRUNFIi8+CjxwYXRoIGQ9Ik0zNSAzNUwzMi41IDMyLjVMMzAuNSAzNC41TDMzIDM3TDM1IDM1WiIgZmlsbD0iI0NFQ0VDRSIvPgo8L3N2Zz4K";
                        }}
                    />
                );
            },
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
            render: (text, record) => (
                <div>
                    <div style={{ fontWeight: 500 }}>{text || 'Unnamed Partner'}</div>
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
                    {category || 'Uncategorized'}
                </Tag>
            ),
        },
        {
            title: 'Display Order',
            dataIndex: 'displayOrder',
            key: 'displayOrder',
            width: 120,
            sorter: (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0),
            render: (order) => (
                <Tag color="green">{order}</Tag>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            key: 'status',
            width: 120,
            render: (isActive, record) => {
                const isLoading = updatingStatus[record.id];
                console.log(`Rendering status column for partner ${record.id}:`, {
                    isActive,
                    isLoading,
                    updatingStatus
                });

                return (
                    <Tooltip title={isActive ? 'Click to deactivate' : 'Click to activate'}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isLoading ? (
                                <Spin size="small" />
                            ) : (
                                <Switch
                                    checked={isActive}
                                    onChange={(checked) => {
                                        console.log('Switch changed:', checked, 'for partner:', record.id);
                                        handleToggleStatus(record.id, checked);
                                    }}
                                    checkedChildren={<CheckOutlined />}
                                    unCheckedChildren={<CloseOutlined />}
                                    disabled={isLoading}
                                />
                            )}
                            <span style={{ fontSize: '12px', color: '#666' }}>
                                {isLoading ? 'Updating...' : (isActive ? 'Active' : 'Inactive')}
                            </span>
                        </div>
                    </Tooltip>
                );
            },
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
                bodyStyle={{ padding: '16px 24px' }}
            >
                <Row justify="space-between" align="middle" gutter={[16, 16]}>
                    <Col>

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
                    <Col xs={24} sm={12} md={10}>
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
                            dataSource={filteredPartners.map(partner => ({ ...partner, key: partner.id }))}
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
                    <div>
                        {editingPartner ? 'Edit Partner' : 'Create New Partner'}
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
                            <Button onClick={handleCancel} disabled={uploading}>
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={uploading}
                                disabled={uploading}
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