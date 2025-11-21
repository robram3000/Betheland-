import React, { useState, useEffect, useCallback } from 'react';
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
    Select,
    Alert,
    notification
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
    ArrowRightOutlined,
    ExclamationCircleOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import ThirdSectionServices from './Services/ThirdSectionServices';
import ThirdSectionMapper from './Services/ThirdSectionMapper';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

// Fixed Feature Title Input Component
const FeatureTitleInput = ({ item, index, onUpdate }) => {
    const [localValue, setLocalValue] = useState(item.title || '');

    // Handle immediate updates without debounce for better UX
    const handleChange = (e) => {
        const value = e.target.value;
        setLocalValue(value);
        // Update parent immediately
        onUpdate(index, 'title', value);
    };

    // Sync with parent when prop changes
    useEffect(() => {
        setLocalValue(item.title || '');
    }, [item.title]);

    return (
        <Input
            value={localValue}
            onChange={handleChange}
            placeholder="Feature Title"
            bordered={false}
            style={{ padding: 0, fontWeight: 'bold' }}
        />
    );
};

// Fixed Process Step Input Component
const ProcessStepInput = ({ step, index, onUpdate }) => {
    const [title, setTitle] = useState(step.title || '');
    const [description, setDescription] = useState(step.description || '');
    const [icon, setIcon] = useState(step.icon || '');

    // Update parent immediately on change
    const handleTitleChange = (e) => {
        const value = e.target.value;
        setTitle(value);
        onUpdate(index, 'title', value);
    };

    const handleDescriptionChange = (e) => {
        const value = e.target.value;
        setDescription(value);
        onUpdate(index, 'description', value);
    };

    const handleIconChange = (e) => {
        const value = e.target.value;
        setIcon(value);
        onUpdate(index, 'icon', value);
    };

    // Sync with parent when props change
    useEffect(() => {
        setTitle(step.title || '');
        setDescription(step.description || '');
        setIcon(step.icon || '');
    }, [step.title, step.description, step.icon]);

    return (
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Input
                placeholder="Step Title"
                value={title}
                onChange={handleTitleChange}
            />
            <TextArea
                placeholder="Step Description"
                rows={3}
                value={description}
                onChange={handleDescriptionChange}
            />
            <Input
                placeholder="Icon URL or class name"
                value={icon}
                onChange={handleIconChange}
                prefix={<UploadOutlined />}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Text type="secondary">Step Number:</Text>
                <Input
                    type="number"
                    min={1}
                    max={100}
                    value={step.stepNumber}
                    onChange={(e) => onUpdate(index, 'stepNumber', parseInt(e.target.value) || 1)}
                    style={{ width: '80px' }}
                />
            </div>
        </Space>
    );
};

const ThirdContentEditor = ({ onEditContent, onViewContent }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [thirdSectionData, setThirdSectionData] = useState(null);
    const [processSteps, setProcessSteps] = useState([]);
    const [featureItems, setFeatureItems] = useState([]);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [error, setError] = useState(null);
    const [activeProcessKeys, setActiveProcessKeys] = useState([]);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Load data on component mount
    useEffect(() => {
        loadThirdSectionData();
    }, []);

    // Warn user about unsaved changes
    useEffect(() => {
        if (hasUnsavedChanges) {
            const handleBeforeUnload = (e) => {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            };

            window.addEventListener('beforeunload', handleBeforeUnload);
            return () => window.removeEventListener('beforeunload', handleBeforeUnload);
        }
    }, [hasUnsavedChanges]);

    const loadThirdSectionData = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Loading third section data...');
            const data = await ThirdSectionServices.getThirdSection();
            console.log('Raw API data:', data);

            // Always map the data, even if it's empty
            const mappedData = ThirdSectionMapper.mapFromApi(data);
            console.log('Mapped data:', mappedData);

            // Set the data
            setThirdSectionData(mappedData);
            setProcessSteps(mappedData.processSteps || []);
            setFeatureItems(mappedData.featureItems || []);

            // Set form values
            form.setFieldsValue({
                title: mappedData.title || '',
                subtitle: mappedData.subtitle || '',
                description: mappedData.description || ''
            });

            setHasUnsavedChanges(false);
            console.log('Data loading completed successfully');

        } catch (error) {
            console.error('Error loading data:', error);
            setError(`Failed to load third section data: ${error.message}`);
            message.error('Failed to load third section data');
            initializeWithEmptyData();
        } finally {
            setLoading(false);
        }
    };

    const initializeWithEmptyData = () => {
        const emptyData = ThirdSectionMapper.getEmptyThirdSection();
        setThirdSectionData(emptyData);
        setProcessSteps(emptyData.processSteps);
        setFeatureItems(emptyData.featureItems);

        form.setFieldsValue({
            title: '',
            subtitle: '',
            description: ''
        });
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);

            // REMOVED: Minimum item requirement validation
            // Users can now save with any number of items (including 0)

            // Validate that existing process steps have required fields
            const processStepsErrors = [];
            processSteps.forEach((step, index) => {
                if (!step.title || step.title.trim() === '') {
                    processStepsErrors.push(`Process step ${index + 1} title is required`);
                }
                if (!step.description || step.description.trim() === '') {
                    processStepsErrors.push(`Process step ${index + 1} description is required`);
                }
            });

            if (processStepsErrors.length > 0) {
                message.error(`Please fix process step errors: ${processStepsErrors.join(', ')}`);
                return;
            }

            // Validate that existing feature items have required fields
            const featureItemsErrors = [];
            featureItems.forEach((item, index) => {
                if (!item.title || item.title.trim() === '') {
                    featureItemsErrors.push(`Feature item ${index + 1} title is required`);
                }
                if (!item.description || item.description.trim() === '') {
                    featureItemsErrors.push(`Feature item ${index + 1} description is required`);
                }
            });

            if (featureItemsErrors.length > 0) {
                message.error(`Please fix feature item errors: ${featureItemsErrors.join(', ')}`);
                return;
            }

            // Prepare data for saving
            const formData = {
                ...thirdSectionData,
                ...values,
                processSteps: ThirdSectionMapper.cleanBeforeSubmit({
                    processSteps: processSteps.map((step, index) => ({
                        ...step,
                        stepNumber: step.stepNumber || index + 1, // Ensure step numbers are set
                        id: step.id || 0 // Ensure ID is properly set (0 for new items)
                    }))
                }).processSteps,
                featureItems: ThirdSectionMapper.cleanBeforeSubmit({
                    featureItems: featureItems.map(item => ({
                        ...item,
                        id: item.id || 0 // Ensure ID is properly set (0 for new items)
                    }))
                }).featureItems
            };

            console.log('Saving data:', formData);

            const apiData = ThirdSectionMapper.mapToApi(formData);
            const result = await ThirdSectionServices.updateThirdSection(apiData);

            // Show success notification with update confirmation
            notification.success({
                message: 'Update Successful',
                description: 'Third section data has been updated successfully!',
                duration: 4,
                icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
            });

            setHasUnsavedChanges(false);

            // Reload to get updated IDs from server
            await loadThirdSectionData();

        } catch (error) {
            console.error('Error saving data:', error);
            if (error.errorFields) {
                message.error('Please fix form validation errors');
            } else {
                message.error(`Failed to save third section data: ${error.message}`);
            }
        } finally {
            setSaving(false);
        }
    };

    // Process Steps Management
    const addProcessStep = () => {
        const nextStepNumber = processSteps.length > 0
            ? Math.max(...processSteps.map(step => step.stepNumber)) + 1
            : 1;

        const newStep = ThirdSectionMapper.getEmptyProcessStep(nextStepNumber);
        const updatedSteps = [...processSteps, newStep];
        setProcessSteps(updatedSteps);
        setHasUnsavedChanges(true);
        message.success('New process step added');
    };

    const updateProcessStep = useCallback((index, field, value) => {
        setProcessSteps(prevSteps => {
            const updatedSteps = [...prevSteps];
            updatedSteps[index] = { ...updatedSteps[index], [field]: value };

            // Auto-update step numbers when reordering manually
            if (field === 'stepNumber') {
                // Ensure step numbers are unique and sequential
                const stepNumbers = updatedSteps.map(step => step.stepNumber);
                const hasDuplicates = new Set(stepNumbers).size !== stepNumbers.length;

                if (hasDuplicates) {
                    // Auto-correct duplicate step numbers
                    updatedSteps.forEach((step, idx) => {
                        step.stepNumber = idx + 1;
                    });
                }
            }

            return updatedSteps;
        });
        setHasUnsavedChanges(true);
    }, []);

    const removeProcessStep = (index) => {
        // REMOVED: Minimum item requirement check
        // Users can now remove items freely

        Modal.confirm({
            title: 'Are you sure you want to remove this process step?',
            content: 'This action cannot be undone.',
            okText: 'Yes, Remove',
            cancelText: 'Cancel',
            onOk: () => {
                const updatedSteps = processSteps.filter((_, i) => i !== index);

                // Re-number steps after deletion to maintain sequence
                const renumberedSteps = updatedSteps.map((step, idx) => ({
                    ...step,
                    stepNumber: idx + 1
                }));

                setProcessSteps(renumberedSteps);
                setHasUnsavedChanges(true);

                // Remove from active keys if it was open
                setActiveProcessKeys(prevKeys =>
                    prevKeys.filter(key => key !== ThirdSectionMapper.generateUniqueKey(processSteps[index], index, 'step'))
                );

                message.success('Process step removed successfully');
            }
        });
    };

    const moveProcessStep = (index, direction) => {
        const newIndex = index + direction;
        if (newIndex >= 0 && newIndex < processSteps.length) {
            setProcessSteps(prevSteps => {
                const updatedSteps = [...prevSteps];
                [updatedSteps[index], updatedSteps[newIndex]] = [updatedSteps[newIndex], updatedSteps[index]];

                // Update step numbers after reordering
                const renumberedSteps = updatedSteps.map((step, idx) => ({
                    ...step,
                    stepNumber: idx + 1
                }));

                setHasUnsavedChanges(true);
                return renumberedSteps;
            });
        }
    };

    // Feature Items Management
    const addFeatureItem = () => {
        const newItem = ThirdSectionMapper.getEmptyFeatureItem();
        const updatedItems = [...featureItems, newItem];
        setFeatureItems(updatedItems);
        setHasUnsavedChanges(true);
        message.success('New feature item added');
    };

    const updateFeatureItem = useCallback((index, field, value) => {
        setFeatureItems(prevItems => {
            const updatedItems = [...prevItems];
            updatedItems[index] = { ...updatedItems[index], [field]: value };
            return updatedItems;
        });
        setHasUnsavedChanges(true);
    }, []);

    const removeFeatureItem = (index) => {
        // REMOVED: Minimum item requirement check
        // Users can now remove items freely

        Modal.confirm({
            title: 'Are you sure you want to remove this feature item?',
            content: 'This action cannot be undone.',
            okText: 'Yes, Remove',
            cancelText: 'Cancel',
            onOk: () => {
                const updatedItems = featureItems.filter((_, i) => i !== index);
                setFeatureItems(updatedItems);
                setHasUnsavedChanges(true);
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

    // Handle form field changes
    const handleFormChange = () => {
        setHasUnsavedChanges(true);
    };

    // Check if can delete (for UI display) - REMOVED restrictions
    const canDeleteProcessStep = processSteps.length > 0;
    const canDeleteFeatureItem = featureItems.length > 0;

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
            {/* Unsaved Changes Alert */}
            {hasUnsavedChanges && (
                <Alert
                    message="You have unsaved changes"
                    description="Don't forget to save your changes before leaving."
                    type="warning"
                    showIcon
                    closable
                    style={{ marginBottom: 16 }}
                    action={
                        <Button size="small" type="primary" onClick={handleSave} loading={saving}>
                            Save Now
                        </Button>
                    }
                />
            )}

            {/* Error Display */}
            {error && (
                <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                    action={
                        <Button size="small" onClick={loadThirdSectionData}>
                            Retry
                        </Button>
                    }
                    style={{ marginBottom: 16 }}
                />
            )}

            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' , margin : "10px" }}>
                {/* Empty space on left to push buttons to right */}
                <div></div>

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

                    {/* Unsaved changes indicator */}
                    {hasUnsavedChanges && (
                        <Text type="warning" style={{ marginLeft: 16 }}>
                            <InfoCircleOutlined /> Unsaved changes
                        </Text>
                    )}
                </Space>
            </div>
            <Row gutter={[24, 24]}>
                {/* Main Content Form */}
                <Col xs={24} lg={12}>
                    <Card title="Main Content" style={{ marginBottom: 24 }}>
                        <Form form={form} layout="vertical" onFieldsChange={handleFormChange}>
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
                        title={`Process Steps (${processSteps.length} items)`}
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
                                <div style={{ marginTop: 8 }}>
                                    <Button type="dashed" icon={<PlusOutlined />} onClick={addProcessStep}>
                                        Add Your First Step
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Collapse
                                ghost
                                activeKey={activeProcessKeys}
                                onChange={(keys) => setActiveProcessKeys(keys)}
                            >
                                {processSteps.map((step, index) => (
                                    <Panel
                                        key={ThirdSectionMapper.generateUniqueKey(step, index, 'step')}
                                        header={`Step ${step.stepNumber}: ${step.title || 'Untitled Step'}`}
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
                                        <ProcessStepInput
                                            step={step}
                                            index={index}
                                            onUpdate={updateProcessStep}
                                        />
                                    </Panel>
                                ))}
                            </Collapse>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Feature Items */}
            <Card
                title={`Feature Items (${featureItems.length} items)`}
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
                        <Col xs={24} md={12} lg={8} key={ThirdSectionMapper.generateUniqueKey(item, index, 'feature')}>
                            <Card
                                size="small"
                                title={
                                    <FeatureTitleInput
                                        item={item}
                                        index={index}
                                        onUpdate={updateFeatureItem}
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
                                <div style={{ marginTop: 16 }}>
                                    <Button type="dashed" icon={<PlusOutlined />} onClick={addFeatureItem}>
                                        Add Your First Feature
                                    </Button>
                                </div>
                            </div>
                        </Col>
                    )}
                </Row>
            </Card>

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
                                                            {(step.stepNumber || index + 1).toString().padStart(2, '0')}
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
                                                            {step.title || `Step ${step.stepNumber || index + 1}`}
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