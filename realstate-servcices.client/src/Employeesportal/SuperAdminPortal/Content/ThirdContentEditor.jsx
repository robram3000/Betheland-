import React, { useState, useEffect } from 'react';
import {
    Card,
    Form,
    Input,
    Button,
    Space,
    Divider,
    List,
    Typography,
    Row,
    Col,
    message,
    Spin,
    Modal,
    Collapse,
    Upload,
    Select
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    SaveOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    UploadOutlined,
    CheckCircleOutlined,
    ArrowRightOutlined
} from '@ant-design/icons';
import ThirdSectionServices from './Services/ThirdSectionServices';
import ThirdSectionMapper from './Services/ThirdSectionMapper';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

const ThirdContentEditor = ({ onEditContent, onViewContent }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [thirdSectionData, setThirdSectionData] = useState(null);
    const [processSteps, setProcessSteps] = useState([]);
    const [featureItems, setFeatureItems] = useState([]);
    const [previewVisible, setPreviewVisible] = useState(false);

    // Load data on component mount
    useEffect(() => {
        loadThirdSectionData();
    }, []);

    const loadThirdSectionData = async () => {
        setLoading(true);
        try {
            const data = await ThirdSectionServices.getThirdSection();
            const mappedData = ThirdSectionMapper.mapFromApi(data);

            // If no data exists, initialize with empty structure
            if (!mappedData.id && (!mappedData.processSteps || mappedData.processSteps.length === 0)) {
                const emptyData = ThirdSectionMapper.getEmptyThirdSection();
                setThirdSectionData(emptyData);
                setProcessSteps(emptyData.processSteps);
                setFeatureItems(emptyData.featureItems);

                form.setFieldsValue({
                    title: '',
                    subtitle: '',
                    description: ''
                });
            } else {
                setThirdSectionData(mappedData);
                setProcessSteps(mappedData.processSteps || []);
                setFeatureItems(mappedData.featureItems || []);

                // Set form values
                form.setFieldsValue({
                    title: mappedData.title,
                    subtitle: mappedData.subtitle,
                    description: mappedData.description
                });
            }
        } catch (error) {
            console.error('Error loading data:', error);

            // If error loading, initialize with empty data
            const emptyData = ThirdSectionMapper.getEmptyThirdSection();
            setThirdSectionData(emptyData);
            setProcessSteps(emptyData.processSteps);
            setFeatureItems(emptyData.featureItems);

            message.error('Failed to load third section data. Starting with empty template.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();

            // Validate minimum requirements
            if (processSteps.length < 5) {
                message.error('Minimum of 5 process steps required');
                return;
            }

            if (featureItems.length < 5) {
                message.error('Minimum of 5 feature items required');
                return;
            }

            setSaving(true);

            const formData = {
                ...thirdSectionData,
                ...values,
                processSteps: ThirdSectionMapper.cleanBeforeSubmit({
                    processSteps: processSteps.map(step => ({
                        ...step,
                        stepNumber: processSteps.indexOf(step) + 1
                    }))
                }).processSteps,
                featureItems: ThirdSectionMapper.cleanBeforeSubmit({
                    featureItems
                }).featureItems
            };

            const validation = ThirdSectionServices.validateThirdSection(formData);
            if (!validation.isValid) {
                message.error('Please fix validation errors before saving');
                return;
            }

            const apiData = ThirdSectionMapper.mapToApi(formData);
            await ThirdSectionServices.updateThirdSection(apiData);

            message.success('Third section updated successfully');
            await loadThirdSectionData(); // Reload to get updated IDs
        } catch (error) {
            message.error('Failed to save third section data');
            console.error('Error saving data:', error);
        } finally {
            setSaving(false);
        }
    };

    // Process Steps Management
    const addProcessStep = () => {
        const nextStepNumber = ThirdSectionServices.getNextStepNumber(processSteps);
        const newStep = ThirdSectionMapper.getEmptyProcessStep(nextStepNumber);
        setProcessSteps([...processSteps, newStep]);
    };

    const updateProcessStep = (index, field, value) => {
        const updatedSteps = [...processSteps];
        updatedSteps[index] = { ...updatedSteps[index], [field]: value };
        setProcessSteps(updatedSteps);
    };

    const removeProcessStep = (index) => {
        if (processSteps.length <= 5) {
            message.warning('Minimum of 5 process steps required. Cannot delete.');
            return;
        }

        Modal.confirm({
            title: 'Are you sure you want to remove this process step?',
            content: 'This action cannot be undone.',
            onOk: () => {
                const updatedSteps = processSteps.filter((_, i) => i !== index);
                setProcessSteps(updatedSteps);
                message.success('Process step removed successfully');
            }
        });
    };

    const moveProcessStep = (index, direction) => {
        const newIndex = index + direction;
        if (newIndex >= 0 && newIndex < processSteps.length) {
            const updatedSteps = [...processSteps];
            [updatedSteps[index], updatedSteps[newIndex]] = [updatedSteps[newIndex], updatedSteps[index]];
            setProcessSteps(updatedSteps);
        }
    };

    // Feature Items Management
    const addFeatureItem = () => {
        const newItem = ThirdSectionMapper.getEmptyFeatureItem();
        setFeatureItems([...featureItems, newItem]);
    };

    const updateFeatureItem = (index, field, value) => {
        const updatedItems = [...featureItems];
        updatedItems[index] = { ...updatedItems[index], [field]: value };
        setFeatureItems(updatedItems);
    };

    const removeFeatureItem = (index) => {
        if (featureItems.length <= 5) {
            message.warning('Minimum of 5 feature items required. Cannot delete.');
            return;
        }

        Modal.confirm({
            title: 'Are you sure you want to remove this feature item?',
            content: 'This action cannot be undone.',
            onOk: () => {
                const updatedItems = featureItems.filter((_, i) => i !== index);
                setFeatureItems(updatedItems);
                message.success('Feature item removed successfully');
            }
        });
    };

    const showPreview = () => {
        setPreviewVisible(true);
    };

    const handlePreviewCancel = () => {
        setPreviewVisible(false);
    };

    // Check if can delete (for UI display)
    const canDeleteProcessStep = processSteps.length > 5;
    const canDeleteFeatureItem = featureItems.length > 5;

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>
                    <Text>Loading third section data...</Text>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header Actions */}
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Title level={3} style={{ margin: 0 }}>Third Section Editor</Title>
                    <Text type="secondary">Manage process steps and feature items for the third section</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        Minimum 5 process steps and 5 feature items required
                    </Text>
                </div>
                <Space>
                    <Button icon={<EyeOutlined />} onClick={showPreview}>
                        Preview
                    </Button>
                    <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        loading={saving}
                        onClick={handleSave}
                    >
                        Save Changes
                    </Button>
                </Space>
            </div>

            <Row gutter={[24, 24]}>
                {/* Main Content Form */}
                <Col xs={24} lg={12}>
                    <Card title="Main Content" style={{ marginBottom: 24 }}>
                        <Form form={form} layout="vertical">
                            <Form.Item
                                name="title"
                                label="Title"
                                rules={[{ required: true, message: 'Please enter a title' }]}
                            >
                                <Input placeholder="Enter section title" />
                            </Form.Item>

                            <Form.Item
                                name="subtitle"
                                label="Subtitle"
                                rules={[{ required: true, message: 'Please enter a subtitle' }]}
                            >
                                <Input placeholder="Enter section subtitle" />
                            </Form.Item>

                            <Form.Item
                                name="description"
                                label="Description"
                                rules={[{ required: true, message: 'Please enter a description' }]}
                            >
                                <TextArea
                                    rows={4}
                                    placeholder="Enter section description"
                                />
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>

                {/* Process Steps */}
                <Col xs={24} lg={12}>
                    <Card
                        title={`Process Steps (${processSteps.length}/5 minimum)`}
                        extra={
                            <Button
                                type="dashed"
                                icon={<PlusOutlined />}
                                onClick={addProcessStep}
                                size="small"
                            >
                                Add Step
                            </Button>
                        }
                        style={{ marginBottom: 24 }}
                    >
                        {processSteps.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <Text type="secondary">No process steps added yet</Text>
                            </div>
                        ) : (
                            <Collapse ghost>
                                {processSteps.map((step, index) => (
                                    <Panel
                                        key={step.tempId || step.id}
                                        header={`Step ${index + 1}: ${step.title || 'Untitled Step'}`}
                                        extra={
                                            <Space>
                                                <Button
                                                    size="small"
                                                    icon={<ArrowUpOutlined />}
                                                    disabled={index === 0}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        moveProcessStep(index, -1);
                                                    }}
                                                />
                                                <Button
                                                    size="small"
                                                    icon={<ArrowDownOutlined />}
                                                    disabled={index === processSteps.length - 1}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        moveProcessStep(index, 1);
                                                    }}
                                                />
                                                {canDeleteProcessStep && (
                                                    <Button
                                                        size="small"
                                                        type="text"
                                                        danger
                                                        icon={<DeleteOutlined />}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeProcessStep(index);
                                                        }}
                                                    />
                                                )}
                                            </Space>
                                        }
                                    >
                                        <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                            <Input
                                                placeholder="Step Title"
                                                value={step.title}
                                                onChange={(e) => updateProcessStep(index, 'title', e.target.value)}
                                            />
                                            <TextArea
                                                placeholder="Step Description"
                                                rows={3}
                                                value={step.description}
                                                onChange={(e) => updateProcessStep(index, 'description', e.target.value)}
                                            />
                                            <Input
                                                placeholder="Icon URL or class name"
                                                value={step.icon}
                                                onChange={(e) => updateProcessStep(index, 'icon', e.target.value)}
                                                prefix={<UploadOutlined />}
                                            />
                                        </Space>
                                    </Panel>
                                ))}
                            </Collapse>
                        )}
                        {processSteps.length < 5 && (
                            <div style={{ textAlign: 'center', padding: '10px', background: '#fff2e8', borderRadius: '6px', marginTop: '10px' }}>
                                <Text type="warning">
                                    Add {5 - processSteps.length} more process step(s) to meet minimum requirement
                                </Text>
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Feature Items */}
            <Card
                title={`Feature Items (${featureItems.length}/5 minimum)`}
                extra={
                    <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={addFeatureItem}
                    >
                        Add Feature
                    </Button>
                }
            >
                <Row gutter={[16, 16]}>
                    {featureItems.map((item, index) => (
                        <Col xs={24} md={12} lg={8} key={item.tempId || item.id}>
                            <Card
                                size="small"
                                title={
                                    <Input
                                        value={item.title}
                                        onChange={(e) => updateFeatureItem(index, 'title', e.target.value)}
                                        placeholder="Feature Title"
                                        bordered={false}
                                        style={{ padding: 0 }}
                                    />
                                }
                                extra={
                                    canDeleteFeatureItem ? (
                                        <Button
                                            type="text"
                                            danger
                                            size="small"
                                            icon={<DeleteOutlined />}
                                            onClick={() => removeFeatureItem(index)}
                                        />
                                    ) : null
                                }
                            >
                                <Space direction="vertical" style={{ width: '100%' }} size="small">
                                    <TextArea
                                        placeholder="Feature Description"
                                        rows={2}
                                        value={item.description}
                                        onChange={(e) => updateFeatureItem(index, 'description', e.target.value)}
                                    />
                                    <Input
                                        placeholder="Icon URL or class name"
                                        value={item.icon}
                                        onChange={(e) => updateFeatureItem(index, 'icon', e.target.value)}
                                        prefix={<UploadOutlined />}
                                    />
                                </Space>
                            </Card>
                        </Col>
                    ))}

                    {featureItems.length === 0 && (
                        <Col span={24}>
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <Text type="secondary">No feature items added yet</Text>
                            </div>
                        </Col>
                    )}
                </Row>
                {featureItems.length < 5 && (
                    <div style={{ textAlign: 'center', padding: '10px', background: '#fff2e8', borderRadius: '6px', marginTop: '10px' }}>
                        <Text type="warning">
                            Add {5 - featureItems.length} more feature item(s) to meet minimum requirement
                        </Text>
                    </div>
                )}
            </Card>

            {/* Preview Modal */}
            {/* Preview Modal */}
            <Modal
                title="Third Section Preview"
                open={previewVisible}
                onCancel={handlePreviewCancel}
                footer={[
                    <Button key="close" onClick={handlePreviewCancel}>
                        Close
                    </Button>
                ]}
                width={1200}
                style={{ top: 20 }}
            >
                <div style={{
                    padding: '20px',
                    background: 'white',
                    maxHeight: '80vh',
                    overflow: 'auto'
                }}>
                    {/* This is the actual ThirdSection component preview */}
                    <section style={{
                        padding: '60px 24px',
                        background: 'white'
                    }}>
                        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                            <Row gutter={[64, 32]} align="middle">
                                <Col xs={24} lg={12}>
                                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                        <Title level={2} style={{ color: '#001529', fontSize: '2.5rem' }}>
                                            {form.getFieldValue('title') || 'Section Title'}
                                        </Title>

                                        {form.getFieldValue('subtitle') && (
                                            <Title level={4} style={{ color: '#666', margin: 0 }}>
                                                {form.getFieldValue('subtitle')}
                                            </Title>
                                        )}

                                        <Paragraph style={{
                                            fontSize: '1.1rem',
                                            color: '#666',
                                            lineHeight: '1.6'
                                        }}>
                                            {form.getFieldValue('description') || 'Section description will appear here.'}
                                        </Paragraph>

                                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                            {(featureItems.length > 0 ? featureItems.map(item => item.title) : [
                                                'No hidden fees or charges',
                                                '24/7 customer support',
                                                'Verified property listings',
                                                'Flexible viewing schedules',
                                                'Expert guidance'
                                            ]).map((item, index) => (
                                                <Space key={index} style={{ fontSize: '16px' }}>
                                                    <CheckCircleOutlined style={{ color: '#001529' }} />
                                                    <span style={{ color: '#001529' }}>{item}</span>
                                                </Space>
                                            ))}
                                        </Space>

                                        <Button
                                            type="primary"
                                            size="large"
                                            style={{
                                                height: '50px',
                                                padding: '0 32px',
                                                fontSize: '16px',
                                                background: 'linear-gradient(135deg, #001529 0%, #003366 100%)',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontWeight: '600',
                                                marginTop: '2rem'
                                            }}
                                        >
                                            Get Started Today
                                            <ArrowRightOutlined style={{ marginLeft: '8px' }} />
                                        </Button>
                                    </Space>
                                </Col>

                                <Col xs={24} lg={12}>
                                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                        {(processSteps.length > 0 ? processSteps : [
                                            { title: 'Browse Properties', description: 'Explore our extensive collection of verified properties' },
                                            { title: 'Schedule Viewing', description: 'Book appointments directly through our platform' },
                                            { title: 'Make Decision', description: 'Get expert advice and make informed decisions' },
                                            { title: 'Complete Paperwork', description: 'Streamlined documentation process' },
                                            { title: 'Move In', description: 'Complete paperwork and move into your new property' }
                                        ]).map((step, index) => (
                                            <Card
                                                key={index}
                                                hoverable
                                                style={{
                                                    border: 'none',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                                    background: index === 0 ? 'linear-gradient(135deg, #001529 0%, #003366 100%)' : 'white'
                                                }}
                                                bodyStyle={{ padding: '1.5rem' }}
                                            >
                                                <Row align="middle" gutter={16}>
                                                    <Col>
                                                        <div style={{
                                                            width: '60px',
                                                            height: '60px',
                                                            background: index === 0 ? 'white' : '#001529',
                                                            borderRadius: '50%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: index === 0 ? '#001529' : 'white',
                                                            fontSize: '24px',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            {(index + 1).toString().padStart(2, '0')}
                                                        </div>
                                                    </Col>
                                                    <Col flex={1}>
                                                        <Title
                                                            level={4}
                                                            style={{
                                                                margin: 0,
                                                                color: index === 0 ? 'white' : '#001529'
                                                            }}
                                                        >
                                                            {step.title || `Step ${index + 1}`}
                                                        </Title>
                                                        <Paragraph
                                                            style={{
                                                                margin: 0,
                                                                color: index === 0 ? 'rgba(255, 255, 255, 0.9)' : '#666'
                                                            }}
                                                        >
                                                            {step.description || 'Step description will appear here.'}
                                                        </Paragraph>
                                                    </Col>
                                                </Row>
                                            </Card>
                                        ))}
                                    </Space>
                                </Col>
                            </Row>
                        </div>
                    </section>
                </div>
            </Modal>
        </div >
    );
};

export default ThirdContentEditor;