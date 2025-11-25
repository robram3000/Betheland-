// ThirdContentEditor.jsx
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
    InputNumber
} from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    EyeOutlined,
    CheckOutlined,
    CloseOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined
} from '@ant-design/icons';
import ThirdSectionServices from './Services/ThirdSectionServices';
import ThirdSectionMapper from './Services/ThirdSectionMapper';

const { Title, Text } = Typography;
const { TextArea } = Input;

const ThirdContentEditor = ({ onEditContent, onViewContent, onContentUpdated, refreshTrigger }) => {
    const [thirdSectionData, setThirdSectionData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingStep, setEditingStep] = useState(null);
    const [editingFeature, setEditingFeature] = useState(null);
    const [activeTab, setActiveTab] = useState('main'); // 'main', 'process', 'features'
    const [form] = Form.useForm();
    const [stepForm] = Form.useForm();
    const [featureForm] = Form.useForm();

    // Load third section data on component mount and when refreshTrigger changes
    useEffect(() => {
        console.log('ThirdContentEditor mounted or refreshTrigger changed:', refreshTrigger);
        loadThirdSectionData();
    }, [refreshTrigger]);

    const loadThirdSectionData = async () => {
        setLoading(true);
        try {
            console.log('Starting to load third section data...');
            const response = await ThirdSectionServices.getThirdSection();
            console.log('Raw third section response:', response);

            const mappedData = ThirdSectionMapper.mapFromApi(response);
            console.log('Mapped third section data:', mappedData);

            setThirdSectionData(mappedData);

            if (ThirdSectionMapper.isEmpty(mappedData)) {
                console.warn('Third section data is empty');
            }
        } catch (error) {
            console.error('Full third section error:', error);
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
                // New step
                updatedSteps = [...(thirdSectionData.processSteps || []), values];
            } else {
                // Update existing step
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
                // New item
                updatedItems = [...(thirdSectionData.featureItems || []), values];
            } else {
                // Update existing item
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

    const renderMainContent = () => (
        <Card
            title="Main Content"
            style={{ marginBottom: 16 }}
            extra={
                <Button
                    type="primary"
                    onClick={() => form.submit()}
                    loading={saving}
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
                    <Col span={12}>
                        <Form.Item
                            label="Title"
                            name="title"
                            rules={[{ required: true, message: 'Please enter title' }]}
                        >
                            <Input placeholder="Enter section title" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Subtitle"
                            name="subtitle"
                            rules={[{ required: true, message: 'Please enter subtitle' }]}
                        >
                            <Input placeholder="Enter section subtitle" />
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
                    />
                </Form.Item>
            </Form>
        </Card>
    );

    const renderProcessSteps = () => (
        <Card
            title={
                <Space>
                    <span>Process Steps</span>
                    <Tag color="blue">
                        {thirdSectionData?.processSteps?.length || 0}/{ThirdSectionMapper.MAX_PROCESS_STEPS}
                    </Tag>
                </Space>
            }
            style={{ marginBottom: 16 }}
            extra={
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddProcessStep}
                    disabled={!ThirdSectionMapper.canAddProcessStep(thirdSectionData?.processSteps)}
                >
                    Add Step
                </Button>
            }
        >
            {thirdSectionData?.processSteps?.length > 0 ? (
                <List
                    dataSource={ThirdSectionServices.sortProcessSteps(thirdSectionData.processSteps)}
                    renderItem={(step, index) => (
                        <List.Item
                            key={ThirdSectionMapper.generateUniqueKey(step, index, 'step')}
                            actions={[
                                <Tooltip title="Edit">
                                    <Button
                                        type="text"
                                        icon={<EditOutlined />}
                                        onClick={() => handleEditProcessStep(step)}
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
                                        <Button
                                            type="text"
                                            icon={<DeleteOutlined />}
                                            danger
                                        />
                                    </Tooltip>
                                </Popconfirm>
                            ]}
                        >
                            <List.Item.Meta
                                avatar={
                                    <div style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '50%',
                                        backgroundColor: '#1890ff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: 'bold'
                                    }}>
                                        {step.stepNumber}
                                    </div>
                                }
                                title={step.title || 'Untitled Step'}
                                description={
                                    <Text ellipsis={{ tooltip: step.description }}>
                                        {step.description || 'No description'}
                                    </Text>
                                }
                            />
                            {step.icon && (
                                <Tag color="green">Icon: {step.icon}</Tag>
                            )}
                        </List.Item>
                    )}
                />
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
                <Space>
                    <span>Feature Items</span>
                    <Tag color="green">
                        {thirdSectionData?.featureItems?.length || 0}/{ThirdSectionMapper.MAX_FEATURE_ITEMS}
                    </Tag>
                </Space>
            }
            extra={
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddFeatureItem}
                    disabled={!ThirdSectionMapper.canAddFeatureItem(thirdSectionData?.featureItems)}
                >
                    Add Feature
                </Button>
            }
        >
            {thirdSectionData?.featureItems?.length > 0 ? (
                <List
                    grid={{ gutter: 16, column: 2 }}
                    dataSource={thirdSectionData.featureItems}
                    renderItem={(item, index) => (
                        <List.Item
                            key={ThirdSectionMapper.generateUniqueKey(item, index, 'feature')}
                        >
                            <Card
                                size="small"
                                actions={[
                                    <Tooltip title="Edit">
                                        <EditOutlined onClick={() => handleEditFeatureItem(item)} />
                                    </Tooltip>,
                                    <Tooltip title="Delete">
                                        <Popconfirm
                                            title="Delete Feature Item"
                                            description="Are you sure you want to delete this feature item?"
                                            onConfirm={() => handleDeleteFeatureItem(item.id)}
                                            okText="Yes"
                                            cancelText="No"
                                            okType="danger"
                                        >
                                            <DeleteOutlined />
                                        </Popconfirm>
                                    </Tooltip>
                                ]}
                            >
                                <Card.Meta
                                    avatar={item.icon && (
                                        <div style={{ fontSize: '24px' }}>
                                            {item.icon}
                                        </div>
                                    )}
                                    title={item.title || 'Untitled Feature'}
                                    description={
                                        <Text ellipsis={{ tooltip: item.description }}>
                                            {item.description || 'No description'}
                                        </Text>
                                    }
                                />
                            </Card>
                        </List.Item>
                    )}
                />
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
            {/* Navigation Tabs */}
            <Card style={{ marginBottom: 16 }}>
                <Row gutter={16}>
                    <Col>
                        <Button
                            type={activeTab === 'main' ? 'primary' : 'default'}
                            onClick={() => setActiveTab('main')}
                        >
                            Main Content
                        </Button>
                    </Col>
                    <Col>
                        <Button
                            type={activeTab === 'process' ? 'primary' : 'default'}
                            onClick={() => setActiveTab('process')}
                        >
                            Process Steps
                        </Button>
                    </Col>
                    <Col>
                        <Button
                            type={activeTab === 'features' ? 'primary' : 'default'}
                            onClick={() => setActiveTab('features')}
                        >
                            Feature Items
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* Content based on active tab */}
            {activeTab === 'main' && renderMainContent()}
            {activeTab === 'process' && renderProcessSteps()}
            {activeTab === 'features' && renderFeatureItems()}

            {/* Process Step Modal */}
            <Modal
                title={editingStep ? 'Edit Process Step' : 'Add Process Step'}
                open={modalVisible && !!editingStep}
                onCancel={handleCancelModal}
                footer={null}
                width={600}
                destroyOnClose
            >
                <Form
                    form={stepForm}
                    layout="vertical"
                    onFinish={handleSaveProcessStep}
                >
                    <Row gutter={16}>
                        <Col span={8}>
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
                                />
                            </Form.Item>
                        </Col>
                        <Col span={16}>
                            <Form.Item
                                label="Icon"
                                name="icon"
                                extra="Enter icon name or code"
                            >
                                <Input placeholder="e.g., check-circle, user, etc." />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label="Title"
                        name="title"
                        rules={[{ required: true, message: 'Please enter step title' }]}
                    >
                        <Input placeholder="Enter step title" />
                    </Form.Item>

                    <Form.Item
                        label="Description"
                        name="description"
                        rules={[{ required: true, message: 'Please enter step description' }]}
                    >
                        <TextArea
                            rows={3}
                            placeholder="Enter step description"
                        />
                    </Form.Item>

                    <Divider />

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={handleCancelModal}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit">
                                {editingStep?.id === 0 ? 'Add Step' : 'Update Step'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Feature Item Modal */}
            <Modal
                title={editingFeature ? 'Edit Feature Item' : 'Add Feature Item'}
                open={modalVisible && !!editingFeature}
                onCancel={handleCancelModal}
                footer={null}
                width={600}
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
                        <Input placeholder="e.g., star, heart, shield, etc." />
                    </Form.Item>

                    <Form.Item
                        label="Title"
                        name="title"
                        rules={[{ required: true, message: 'Please enter feature title' }]}
                    >
                        <Input placeholder="Enter feature title" />
                    </Form.Item>

                    <Form.Item
                        label="Description"
                        name="description"
                        rules={[{ required: true, message: 'Please enter feature description' }]}
                    >
                        <TextArea
                            rows={3}
                            placeholder="Enter feature description"
                        />
                    </Form.Item>

                    <Divider />

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            <Button onClick={handleCancelModal}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit">
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