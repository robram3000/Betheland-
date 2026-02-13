// ThirdContentEditor.jsx - Card Version
import React, { useState, useEffect } from 'react';
import {
    Card,
    Button,
    Form,
    Input,
    Switch,
    message,
    Modal,
    List,
    Space,
    Tag,
    Divider,
    Row,
    Col,
    Typography,
    Popconfirm,
    Tooltip,
    Spin,
    Empty,
    InputNumber,
    Grid
} from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    EyeOutlined,
    CheckOutlined,
    CloseOutlined,
    AppstoreOutlined,
    OrderedListOutlined,
    StarOutlined
} from '@ant-design/icons';
import ThirdSectionServices from './Services/ThirdSectionServices';
import ThirdSectionMapper from './Services/ThirdSectionMapper';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { useBreakpoint } = Grid;

const ThirdContentEditor = ({ onEditContent, onViewContent, onContentUpdated, refreshTrigger }) => {
    const [thirdSectionData, setThirdSectionData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingStep, setEditingStep] = useState(null);
    const [editingFeature, setEditingFeature] = useState(null);
    const [activeTab, setActiveTab] = useState('main');
    const [form] = Form.useForm();
    const [stepForm] = Form.useForm();
    const [featureForm] = Form.useForm();
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    useEffect(() => {
        loadThirdSectionData();
    }, [refreshTrigger]);

    const loadThirdSectionData = async () => {
        setLoading(true);
        try {
            const response = await ThirdSectionServices.getThirdSection();
            const mappedData = ThirdSectionMapper.mapFromApi(response);
            setThirdSectionData(mappedData);
        } catch (error) {
            message.error(`Failed to load third section data: ${error.message}`);
            setThirdSectionData(ThirdSectionMapper.getEmptyThirdSection());
        } finally {
            setLoading(false);
        }
    };

    const handleSaveMainContent = async (values) => {
        setSaving(true);
        try {
            const updatedData = {
                ...thirdSectionData,
                ...values
            };

            const cleanedData = ThirdSectionMapper.cleanBeforeSubmit(updatedData);
            const result = await ThirdSectionServices.updateThirdSection(cleanedData);

            const mappedResult = ThirdSectionMapper.mapFromApi(result);
            setThirdSectionData(mappedResult);

            message.success('Third section content updated successfully');
            if (onContentUpdated) {
                onContentUpdated();
            }
        } catch (error) {
            message.error(`Failed to update content: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleAddProcessStep = () => {
        if (!ThirdSectionMapper.canAddProcessStep(thirdSectionData?.processSteps)) {
            message.warning(`Maximum ${ThirdSectionMapper.MAX_PROCESS_STEPS} process steps allowed`);
            return;
        }

        const nextStepNumber = ThirdSectionServices.getNextStepNumber(thirdSectionData?.processSteps);
        setEditingStep(ThirdSectionMapper.getEmptyProcessStep(nextStepNumber));
        stepForm.resetFields();
        setModalVisible(true);
    };

    const handleEditProcessStep = (step) => {
        setEditingStep(step);
        stepForm.setFieldsValue(step);
        setModalVisible(true);
    };

    const handleDeleteProcessStep = async (stepId) => {
        try {
            const updatedSteps = thirdSectionData.processSteps.filter(step => step.id !== stepId);
            const updatedData = {
                ...thirdSectionData,
                processSteps: updatedSteps
            };

            const cleanedData = ThirdSectionMapper.cleanBeforeSubmit(updatedData);
            const result = await ThirdSectionServices.updateThirdSection(cleanedData);

            const mappedResult = ThirdSectionMapper.mapFromApi(result);
            setThirdSectionData(mappedResult);

            message.success('Process step deleted successfully');
            if (onContentUpdated) {
                onContentUpdated();
            }
        } catch (error) {
            message.error(`Failed to delete process step: ${error.message}`);
        }
    };

    const handleSaveProcessStep = async (values) => {
        try {
            let updatedSteps;
            if (editingStep.id === 0) {
                updatedSteps = [...(thirdSectionData.processSteps || []), values];
            } else {
                updatedSteps = thirdSectionData.processSteps.map(step =>
                    step.id === editingStep.id ? { ...step, ...values } : step
                );
            }

            const updatedData = {
                ...thirdSectionData,
                processSteps: updatedSteps
            };

            const cleanedData = ThirdSectionMapper.cleanBeforeSubmit(updatedData);
            const result = await ThirdSectionServices.updateThirdSection(cleanedData);

            const mappedResult = ThirdSectionMapper.mapFromApi(result);
            setThirdSectionData(mappedResult);

            setModalVisible(false);
            setEditingStep(null);
            message.success(`Process step ${editingStep.id === 0 ? 'added' : 'updated'} successfully`);
            if (onContentUpdated) {
                onContentUpdated();
            }
        } catch (error) {
            message.error(`Failed to save process step: ${error.message}`);
        }
    };

    const handleAddFeatureItem = () => {
        if (!ThirdSectionMapper.canAddFeatureItem(thirdSectionData?.featureItems)) {
            message.warning(`Maximum ${ThirdSectionMapper.MAX_FEATURE_ITEMS} feature items allowed`);
            return;
        }

        setEditingFeature(ThirdSectionMapper.getEmptyFeatureItem());
        featureForm.resetFields();
        setModalVisible(true);
    };

    const handleEditFeatureItem = (feature) => {
        setEditingFeature(feature);
        featureForm.setFieldsValue(feature);
        setModalVisible(true);
    };

    const handleDeleteFeatureItem = async (featureId) => {
        try {
            const updatedItems = thirdSectionData.featureItems.filter(item => item.id !== featureId);
            const updatedData = {
                ...thirdSectionData,
                featureItems: updatedItems
            };

            const cleanedData = ThirdSectionMapper.cleanBeforeSubmit(updatedData);
            const result = await ThirdSectionServices.updateThirdSection(cleanedData);

            const mappedResult = ThirdSectionMapper.mapFromApi(result);
            setThirdSectionData(mappedResult);

            message.success('Feature item deleted successfully');
            if (onContentUpdated) {
                onContentUpdated();
            }
        } catch (error) {
            message.error(`Failed to delete feature item: ${error.message}`);
        }
    };

    const handleSaveFeatureItem = async (values) => {
        try {
            let updatedItems;
            if (editingFeature.id === 0) {
                updatedItems = [...(thirdSectionData.featureItems || []), values];
            } else {
                updatedItems = thirdSectionData.featureItems.map(item =>
                    item.id === editingFeature.id ? { ...item, ...values } : item
                );
            }

            const updatedData = {
                ...thirdSectionData,
                featureItems: updatedItems
            };

            const cleanedData = ThirdSectionMapper.cleanBeforeSubmit(updatedData);
            const result = await ThirdSectionServices.updateThirdSection(cleanedData);

            const mappedResult = ThirdSectionMapper.mapFromApi(result);
            setThirdSectionData(mappedResult);

            setModalVisible(false);
            setEditingFeature(null);
            message.success(`Feature item ${editingFeature.id === 0 ? 'added' : 'updated'} successfully`);
            if (onContentUpdated) {
                onContentUpdated();
            }
        } catch (error) {
            message.error(`Failed to save feature item: ${error.message}`);
        }
    };

    const handleCancelModal = () => {
        setModalVisible(false);
        setEditingStep(null);
        setEditingFeature(null);
        stepForm.resetFields();
        featureForm.resetFields();
    };

    // Card-based navigation
    const navigationCards = [
        {
            key: 'main',
            title: 'Main Content',
            description: 'Edit section title, subtitle and description',
            icon: <AppstoreOutlined />,
            color: '#1890ff',
            active: activeTab === 'main'
        },
        {
            key: 'process',
            title: 'Process Steps',
            description: 'Manage process steps and workflow',
            icon: <OrderedListOutlined />,
            color: '#52c41a',
            active: activeTab === 'process'
        },
        {
            key: 'features',
            title: 'Features',
            description: 'Configure feature items and benefits',
            icon: <StarOutlined />,
            color: '#fa8c16',
            active: activeTab === 'features'
        }
    ];

    const renderNavigationCards = () => (
        <Card
            style={{ marginBottom: 24 }}
            bodyStyle={{ padding: isMobile ? '16px' : '24px' }}
        >
            <Title level={5} style={{ marginBottom: 16, color: '#1a365d' }}>
                Content Sections
            </Title>
            <Row gutter={[16, 16]}>
                {navigationCards.map((card) => (
                    <Col xs={24} sm={12} lg={8} key={card.key}>
                        <Card
                            hoverable
                            style={{
                                border: `2px solid ${card.active ? card.color : '#f0f0f0'}`,
                                background: card.active ? `${card.color}08` : 'white',
                                transition: 'all 0.3s ease',
                                height: '100%'
                            }}
                            bodyStyle={{
                                padding: '20px',
                                textAlign: 'center'
                            }}
                            onClick={() => setActiveTab(card.key)}
                        >
                            <div style={{
                                fontSize: '32px',
                                color: card.active ? card.color : '#666',
                                marginBottom: '12px'
                            }}>
                                {card.icon}
                            </div>
                            <Title level={5} style={{
                                margin: '8px 0',
                                color: card.active ? card.color : '#1a365d'
                            }}>
                                {isMobile ? card.title.split(' ')[0] : card.title}
                            </Title>
                            <Text style={{
                                color: card.active ? card.color : '#666',
                                fontSize: '13px'
                            }}>
                                {isMobile ? card.description.split(' ').slice(0, 3).join(' ') + '...' : card.description}
                            </Text>
                            {card.active && (
                                <div style={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor: card.color
                                }} />
                            )}
                        </Card>
                    </Col>
                ))}
            </Row>
        </Card>
    );

    const renderMainContent = () => (
        <Card
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AppstoreOutlined />
                    Main Content
                </div>
            }
            style={{ marginBottom: 16 }}
            extra={
                <Button
                    type="primary"
                    onClick={() => form.submit()}
                    loading={saving}
                    size={isMobile ? "middle" : "large"}
                >
                    Save Changes
                </Button>
            }
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSaveMainContent}
                initialValues={thirdSectionData}
            >
                <Row gutter={16}>
                    <Col span={isMobile ? 24 : 12}>
                        <Form.Item
                            label="Title"
                            name="title"
                            rules={[{ required: true, message: 'Please enter title' }]}
                        >
                            <Input placeholder="Enter section title" size="large" />
                        </Form.Item>
                    </Col>
                    <Col span={isMobile ? 24 : 12}>
                        <Form.Item
                            label="Subtitle"
                            name="subtitle"
                            rules={[{ required: true, message: 'Please enter subtitle' }]}
                        >
                            <Input placeholder="Enter section subtitle" size="large" />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    label="Description"
                    name="description"
                    rules={[{ required: true, message: 'Please enter description' }]}
                >
                    <TextArea
                        rows={4}
                        placeholder="Enter section description"
                        size="large"
                    />
                </Form.Item>
            </Form>
        </Card>
    );

    const renderProcessSteps = () => (
        <Card
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <OrderedListOutlined />
                    Process Steps
                    <Tag color="blue">
                        {thirdSectionData?.processSteps?.length || 0}/{ThirdSectionMapper.MAX_PROCESS_STEPS}
                    </Tag>
                </div>
            }
            style={{ marginBottom: 16 }}
            extra={
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddProcessStep}
                    disabled={!ThirdSectionMapper.canAddProcessStep(thirdSectionData?.processSteps)}
                    size={isMobile ? "middle" : "large"}
                >
                    {isMobile ? 'Add Step' : 'Add Process Step'}
                </Button>
            }
        >
            {thirdSectionData?.processSteps?.length > 0 ? (
                <Row gutter={[16, 16]}>
                    {ThirdSectionServices.sortProcessSteps(thirdSectionData.processSteps).map((step, index) => (
                        <Col xs={24} lg={12} xl={8} key={ThirdSectionMapper.generateUniqueKey(step, index, 'step')}>
                            <Card
                                style={{
                                    height: '100%',
                                    border: '1px solid #f0f0f0'
                                }}
                                actions={[
                                    <Tooltip title="Edit">
                                        <EditOutlined
                                            onClick={() => handleEditProcessStep(step)}
                                            style={{ color: '#52c41a' }}
                                        />
                                    </Tooltip>,
                                    <Popconfirm
                                        title="Delete Process Step"
                                        description="Are you sure you want to delete this process step?"
                                        onConfirm={() => handleDeleteProcessStep(step.id)}
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
                                <div style={{ display: 'flex', alignItems: 'start', gap: '12px', marginBottom: '12px' }}>
                                    <div style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '50%',
                                        backgroundColor: '#1890ff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        flexShrink: 0
                                    }}>
                                        {step.stepNumber}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <Title level={5} style={{ margin: '0 0 8px 0' }}>
                                            {step.title || 'Untitled Step'}
                                        </Title>
                                        <Paragraph
                                            type="secondary"
                                            style={{ margin: 0, fontSize: '14px' }}
                                            ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
                                        >
                                            {step.description || 'No description'}
                                        </Paragraph>
                                    </div>
                                </div>
                                {step.icon && (
                                    <div style={{ marginTop: '12px' }}>
                                        <Tag color="green">Icon: {step.icon}</Tag>
                                    </div>
                                )}
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No process steps added yet"
                >
                    <Button type="primary" onClick={handleAddProcessStep}>
                        <PlusOutlined /> Add First Process Step
                    </Button>
                </Empty>
            )}
        </Card>
    );

    const renderFeatureItems = () => (
        <Card
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <StarOutlined />
                    Feature Items
                    <Tag color="green">
                        {thirdSectionData?.featureItems?.length || 0}/{ThirdSectionMapper.MAX_FEATURE_ITEMS}
                    </Tag>
                </div>
            }
            extra={
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddFeatureItem}
                    disabled={!ThirdSectionMapper.canAddFeatureItem(thirdSectionData?.featureItems)}
                    size={isMobile ? "middle" : "large"}
                >
                    {isMobile ? 'Add Feature' : 'Add Feature Item'}
                </Button>
            }
        >
            {thirdSectionData?.featureItems?.length > 0 ? (
                <Row gutter={[16, 16]}>
                    {thirdSectionData.featureItems.map((item, index) => (
                        <Col xs={24} lg={12} xl={8} key={ThirdSectionMapper.generateUniqueKey(item, index, 'feature')}>
                            <Card
                                style={{
                                    height: '100%',
                                    border: '1px solid #f0f0f0'
                                }}
                                actions={[
                                    <Tooltip title="Edit">
                                        <EditOutlined
                                            onClick={() => handleEditFeatureItem(item)}
                                            style={{ color: '#52c41a' }}
                                        />
                                    </Tooltip>,
                                    <Popconfirm
                                        title="Delete Feature Item"
                                        description="Are you sure you want to delete this feature item?"
                                        onConfirm={() => handleDeleteFeatureItem(item.id)}
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
                                    avatar={item.icon && (
                                        <div style={{ fontSize: '32px', color: '#fa8c16' }}>
                                            {item.icon}
                                        </div>
                                    )}
                                    title={item.title || 'Untitled Feature'}
                                    description={
                                        <Paragraph
                                            type="secondary"
                                            style={{ margin: 0 }}
                                            ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
                                        >
                                            {item.description || 'No description'}
                                        </Paragraph>
                                    }
                                />
                            </Card>
                        </Col>
                    ))}
                </Row>
            ) : (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No feature items added yet"
                >
                    <Button type="primary" onClick={handleAddFeatureItem}>
                        <PlusOutlined /> Add First Feature Item
                    </Button>
                </Empty>
            )}
        </Card>
    );

    if (loading && !thirdSectionData) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>Loading third section content...</div>
            </div>
        );
    }

    return (
        <div>
            {/* Card-based Navigation */}
            {renderNavigationCards()}

            {/* Content based on active tab */}
            {activeTab === 'main' && renderMainContent()}
            {activeTab === 'process' && renderProcessSteps()}
            {activeTab === 'features' && renderFeatureItems()}

            {/* Process Step Modal */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <OrderedListOutlined />
                        {editingStep ? 'Edit Process Step' : 'Add Process Step'}
                    </div>
                }
                open={modalVisible && !!editingStep}
                onCancel={handleCancelModal}
                footer={null}
                width={isMobile ? '90vw' : 600}
                destroyOnClose
            >
                <Form
                    form={stepForm}
                    layout="vertical"
                    onFinish={handleSaveProcessStep}
                >
                    <Row gutter={16}>
                        <Col span={isMobile ? 24 : 8}>
                            <Form.Item
                                label="Step Number"
                                name="stepNumber"
                                rules={[
                                    { required: true, message: 'Please enter step number' },
                                    { type: 'number', min: 1, message: 'Step number must be at least 1' }
                                ]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={1}
                                    placeholder="1"
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={isMobile ? 24 : 16}>
                            <Form.Item
                                label="Icon"
                                name="icon"
                                extra="Enter icon name or code"
                            >
                                <Input placeholder="e.g., check-circle, user, etc." size="large" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label="Title"
                        name="title"
                        rules={[{ required: true, message: 'Please enter step title' }]}
                    >
                        <Input placeholder="Enter step title" size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Description"
                        name="description"
                        rules={[{ required: true, message: 'Please enter step description' }]}
                    >
                        <TextArea
                            rows={3}
                            placeholder="Enter step description"
                            size="large"
                        />
                    </Form.Item>

                    <Divider />

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={handleCancelModal} size={isMobile ? "middle" : "large"}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit" size={isMobile ? "middle" : "large"}>
                                {editingStep?.id === 0 ? 'Add Step' : 'Update Step'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Feature Item Modal */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <StarOutlined />
                        {editingFeature ? 'Edit Feature Item' : 'Add Feature Item'}
                    </div>
                }
                open={modalVisible && !!editingFeature}
                onCancel={handleCancelModal}
                footer={null}
                width={isMobile ? '90vw' : 600}
                destroyOnClose
            >
                <Form
                    form={featureForm}
                    layout="vertical"
                    onFinish={handleSaveFeatureItem}
                >
                    <Form.Item
                        label="Icon"
                        name="icon"
                        extra="Enter icon name or code"
                    >
                        <Input placeholder="e.g., star, heart, shield, etc." size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Title"
                        name="title"
                        rules={[{ required: true, message: 'Please enter feature title' }]}
                    >
                        <Input placeholder="Enter feature title" size="large" />
                    </Form.Item>

                    <Form.Item
                        label="Description"
                        name="description"
                        rules={[{ required: true, message: 'Please enter feature description' }]}
                    >
                        <TextArea
                            rows={3}
                            placeholder="Enter feature description"
                            size="large"
                        />
                    </Form.Item>

                    <Divider />

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={handleCancelModal} size={isMobile ? "middle" : "large"}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit" size={isMobile ? "middle" : "large"}>
                                {editingFeature?.id === 0 ? 'Add Feature' : 'Update Feature'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ThirdContentEditor;