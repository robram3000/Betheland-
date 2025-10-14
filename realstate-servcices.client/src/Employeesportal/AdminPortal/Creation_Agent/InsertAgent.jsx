// InsertAgent.jsx
import React, { useState, useEffect } from 'react';
import {
    Form,
    Input,
    Button,
    Select,
    DatePicker,
    Switch,
    Row,
    Col,
    Card,
    Space,
    message,
    InputNumber,
    Divider,
    Upload,
    Typography,
    Descriptions,
    Alert,
    Steps
} from 'antd';
import agentService from './Services/AgentService';
import {
    agentValidator,
    useAgentErrorHandler,
    createAgentServiceWithErrorHandling
} from './Services/AgentErrorHandler';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { Step } = Steps;

const enhancedAgentService = createAgentServiceWithErrorHandling(agentService);

const InsertAgent = ({ agent, onSuccess, onCancel }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [submittedData, setSubmittedData] = useState(null);
    const [showAccountInfo, setShowAccountInfo] = useState(false);
    const [error, setError] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [missingFields, setMissingFields] = useState([]);
    const { handleError } = useAgentErrorHandler();

    useEffect(() => {
        if (agent) {
            form.setFieldsValue({
                ...agent,
                licenseExpiry: agent.licenseExpiry ? moment(agent.licenseExpiry) : null,
            });
            setImageUrl(agent.profilePictureUrl || '');
            setShowAccountInfo(true);
            setSubmittedData({
                username: agent.username,
                email: agent.email,
                password: '********'
            });
        }
    }, [agent, form]);

    const clearError = () => {
        setError(null);
        setMissingFields([]);
    };

    const validateCurrentStep = () => {
        const fieldNames = getStepFields(currentStep);
        const values = form.getFieldsValue(fieldNames);
        const currentMissing = [];

        fieldNames.forEach(field => {
            if (field === 'firstName' && !values.firstName) {
                currentMissing.push('First Name');
            }
            if (field === 'lastName' && !values.lastName) {
                currentMissing.push('Last Name');
            }
            if (field === 'cellPhoneNo' && !values.cellPhoneNo) {
                currentMissing.push('Cell Phone');
            }
            if (field === 'email' && !values.email) {
                currentMissing.push('Email');
            }
            if (field === 'licenseNumber' && !values.licenseNumber) {
                currentMissing.push('License Number');
            }
            if (field === 'username' && !values.username && !agent) {
                currentMissing.push('Username');
            }
            if (field === 'password' && !values.password && !agent) {
                currentMissing.push('Password');
            }
        });

        setMissingFields(currentMissing);
        return currentMissing.length === 0;
    };

    const getStepFields = (step) => {
        const stepFields = {
            0: ['firstName', 'middleName', 'lastName', 'suffix', 'cellPhoneNo', 'email'],
            1: ['licenseNumber', 'licenseExpiry', 'yearsOfExperience', 'brokerageName', 'specialization', 'experience'],
            2: ['officeAddress', 'officePhone', 'website', 'languages'],
            3: ['education', 'awards', 'bio'],
            4: agent ? ['isVerified'] : ['username', 'password', 'confirmPassword']
        };
        return stepFields[step] || [];
    };

    const next = () => {
        if (validateCurrentStep()) {
            setCurrentStep(currentStep + 1);
        } else {
            message.warning('Please fill in all required fields before proceeding');
        }
    };

    const prev = () => {
        setCurrentStep(currentStep - 1);
    };

    const onFinish = async (values) => {
        setLoading(true);
        clearError();

        try {
            // Validate ALL steps before submission
            const allStepFields = [0, 1, 2, 3, 4].flatMap(step => getStepFields(step));
            const allValues = form.getFieldsValue(allStepFields);

            // Check for missing required fields across all steps
            const missingFields = [];

            if (!allValues.firstName) missingFields.push('First Name');
            if (!allValues.lastName) missingFields.push('Last Name');
            if (!allValues.cellPhoneNo) missingFields.push('Cell Phone');
            if (!allValues.email) missingFields.push('Email');
            if (!allValues.licenseNumber) missingFields.push('License Number');
            if (!agent && !allValues.username) missingFields.push('Username');
            if (!agent && !allValues.password) missingFields.push('Password');

            if (missingFields.length > 0) {
                setMissingFields(missingFields);
                message.warning('Please complete all required fields before submitting');
                setLoading(false);
                return;
            }

            // Prepare agent data - FIX: Pass the original form values which include moment objects
            const agentData = {
                ...allValues,
                profilePictureUrl: imageUrl,
                specialization: Array.isArray(allValues.specialization)
                    ? JSON.stringify(allValues.specialization)
                    : allValues.specialization || '[]',
            };

            // Remove confirmPassword from the data sent to API
            delete agentData.confirmPassword;

            console.log('Submitting agent data:', agentData);

            let result;
            if (agent) {
                result = await enhancedAgentService.updateAgent(agent.id, agentData);
                message.success('Agent updated successfully');
            } else {
                result = await enhancedAgentService.createAgent(agentData);
                message.success('Agent created successfully');
            }

            console.log('API Response:', result);

            // Store account information to show after submission
            setSubmittedData({
                username: allValues.username,
                email: allValues.email,
                password: allValues.password || '********'
            });

            setShowAccountInfo(true);

            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Error saving agent:', error);
            const handledError = handleError(error);

            // Show appropriate error message
            if (handledError.isValidationError && handledError.details) {
                // Set form field errors for validation errors
                const fieldErrors = Object.entries(handledError.details).map(([field, errorMsg]) => ({
                    name: field,
                    errors: [errorMsg]
                }));
                form.setFields(fieldErrors);
                message.error('Please fix the form errors');
            } else {
                setError(handledError);
                message.error(handledError.message || `Failed to ${agent ? 'update' : 'create'} agent`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (info) => {
        clearError();

        if (info.file.status === 'uploading') {
            return;
        }

        if (info.file.status === 'done') {
            // Get the response from the server
            const response = info.file.response;
            if (response && response.success) {
                setImageUrl(response.url);
                message.success('Image uploaded successfully');
            } else {
                message.error(response?.message || 'Upload failed');
            }
        } else if (info.file.status === 'error') {
            message.error('Upload failed');
        }
    };

    const specializationOptions = [
        'Residential',
        'Commercial',
        'Luxury Homes',
        'Investment Properties',
        'Rentals',
        'Land',
        'Industrial',
        'Agricultural'
    ];

    const languageOptions = [
        'English',
        'Spanish',
        'French',
        'German',
        'Chinese',
        'Japanese',
        'Korean',
        'Arabic',
        'Hindi',
        'Portuguese'
    ];

    const validatePasswordConfirm = ({ getFieldValue }) => ({
        validator(_, value) {
            if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
            }
            return Promise.reject(new Error('The two passwords that you entered do not match!'));
        },
    });

    const handleCreateAnother = () => {
        setShowAccountInfo(false);
        setSubmittedData(null);
        setError(null);
        form.resetFields();
        setImageUrl('');
        setCurrentStep(0);
    };

    const getErrorAlert = () => {
        if (!error) return null;

        let alertType = 'error';
        let alertTitle = 'Error';

        if (error.isNetworkError) {
            alertType = 'warning';
            alertTitle = 'Network Issue';
        }
        if (error.isValidationError) {
            alertType = 'info';
            alertTitle = 'Validation Error';
        }
        if (error.isAuthError) {
            alertTitle = 'Authentication Error';
        }
        if (error.isLicenseError) {
            alertTitle = 'License Error';
        }

        return (
            <Alert
                message={alertTitle}
                description={
                    <div>
                        <div style={{ marginBottom: 8, fontWeight: 500 }}>{error.message}</div>
                        {error.details && typeof error.details === 'object' && Object.keys(error.details).length > 0 ? (
                            <div style={{ fontSize: '12px' }}>
                                <div style={{ marginBottom: 4, fontWeight: 500 }}>Details:</div>
                                {Object.entries(error.details).map(([key, value]) => (
                                    <div key={key} style={{ marginLeft: 8 }}>
                                        • <span style={{ fontWeight: 500 }}>{key}:</span> {String(value)}
                                    </div>
                                ))}
                            </div>
                        ) : error.details ? (
                            <div style={{ fontSize: '12px' }}>
                                {String(error.details)}
                            </div>
                        ) : null}
                    </div>
                }
                type={alertType}
                showIcon
                closable
                onClose={clearError}
                style={{
                    marginBottom: 16,
                    border: alertType === 'error' ? '1px solid #ffccc7' :
                        alertType === 'warning' ? '1px solid #ffe58f' : '1px solid #91d5ff'
                }}
            />
        );
    };

    const getMissingFieldsAlert = () => {
        if (missingFields.length === 0) return null;

        return (
            <Alert
                message="Missing Required Fields"
                description={
                    <div>
                        Please fill in the following required fields before submitting:
                        <ul style={{ margin: '8px 0 0 0', paddingLeft: '16px' }}>
                            {missingFields.map((field, index) => (
                                <li key={index} style={{ fontWeight: 500 }}>{field}</li>
                            ))}
                        </ul>
                    </div>
                }
                type="warning"
                showIcon
                closable
                onClose={() => setMissingFields([])}
                style={{
                    marginBottom: 16,
                    border: '1px solid #ffe58f'
                }}
            />
        );
    };

    // Fixed Upload component that doesn't use invalid 'value' prop
    const ProfilePictureUpload = () => (
        <Upload
            name="avatar"
            listType="picture-card"
            className="avatar-uploader"
            showUploadList={false}
            action="/api/agent/upload"
            onChange={handleImageUpload}
            beforeUpload={(file) => {
                const isImage = file.type.startsWith('image/');
                if (!isImage) {
                    message.error('You can only upload image files!');
                    return false;
                }

                const isLt5M = file.size / 1024 / 1024 < 5;
                if (!isLt5M) {
                    message.error('Image must be smaller than 5MB!');
                    return false;
                }
                return true;
            }}
        >
            {imageUrl ? (
                <img src={imageUrl} alt="avatar" style={{ width: '100%' }} />
            ) : (
                <div>
                    <div style={{ marginTop: 4, fontSize: '12px' }}>Upload Photo</div>
                </div>
            )}
        </Upload>
    );

    const steps = [
        {
            title: 'Basic Info',
            content: (
                <Card size="small" style={{ marginBottom: 12 }} bodyStyle={{ padding: '12px' }}>
                    <Row gutter={[8, 4]}>
                        <Col span={8}>
                            <Form.Item
                                label="First Name"
                                name="firstName"
                                rules={[{ required: true, message: 'Please enter first name' }]}
                                style={{ marginBottom: 8 }}
                            >
                                <Input
                                    placeholder="Enter first name"
                                    onChange={clearError}
                                    size="small"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="Middle Name"
                                name="middleName"
                                style={{ marginBottom: 8 }}
                            >
                                <Input
                                    placeholder="Enter middle name"
                                    onChange={clearError}
                                    size="small"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                label="Last Name"
                                name="lastName"
                                rules={[{ required: true, message: 'Please enter last name' }]}
                                style={{ marginBottom: 8 }}
                            >
                                <Input
                                    placeholder="Enter last name"
                                    onChange={clearError}
                                    size="small"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[8, 4]}>
                        <Col span={6}>
                            <Form.Item
                                label="Suffix"
                                name="suffix"
                                style={{ marginBottom: 0 }}
                            >
                                <Select
                                    placeholder="Select suffix"
                                    allowClear
                                    onChange={clearError}
                                    size="small"
                                >
                                    <Option value="Jr">Jr</Option>
                                    <Option value="Sr">Sr</Option>
                                    <Option value="II">II</Option>
                                    <Option value="III">III</Option>
                                    <Option value="IV">IV</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={9}>
                            <Form.Item
                                label="Cell Phone"
                                name="cellPhoneNo"
                                rules={[{ required: true, message: 'Please enter phone number' }]}
                                style={{ marginBottom: 0 }}
                            >
                                <Input
                                    placeholder="Enter phone number"
                                    onChange={clearError}
                                    size="small"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={9}>
                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[
                                    { required: true, message: 'Please enter email' },
                                    { type: 'email', message: 'Please enter valid email' }
                                ]}
                                style={{ marginBottom: 0 }}
                            >
                                <Input
                                    placeholder="Enter email"
                                    onChange={clearError}
                                    size="small"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>
            )
        },
        {
            title: 'Professional',
            content: (
                <Card size="small" style={{ marginBottom: 12 }} bodyStyle={{ padding: '12px' }}>
                    <Row gutter={[8, 4]}>
                        <Col span={12}>
                            <Form.Item
                                label="License Number"
                                name="licenseNumber"
                                rules={[{ required: true, message: 'Please enter license number' }]}
                                style={{ marginBottom: 8 }}
                            >
                                <Input
                                    placeholder="Enter license number"
                                    onChange={clearError}
                                    size="small"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="License Expiry"
                                name="licenseExpiry"
                                style={{ marginBottom: 8 }}
                            >
                                <DatePicker
                                    style={{ width: '100%' }}
                                    placeholder="Select expiry date"
                                    onChange={clearError}
                                    size="small"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[8, 4]}>
                        <Col span={12}>
                            <Form.Item
                                label="Years of Experience"
                                name="yearsOfExperience"
                                rules={[
                                    {
                                        type: 'number',
                                        min: 0,
                                        max: 50,
                                        message: 'Experience must be between 0-50 years'
                                    }
                                ]}
                                style={{ marginBottom: 8 }}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    placeholder="Enter years of experience"
                                    min={0}
                                    max={50}
                                    onChange={clearError}
                                    size="small"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Brokerage Name"
                                name="brokerageName"
                                style={{ marginBottom: 8 }}
                            >
                                <Input
                                    placeholder="Enter brokerage name"
                                    onChange={clearError}
                                    size="small"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[8, 4]}>
                        <Col span={24}>
                            <Form.Item
                                label="Specialization"
                                name="specialization"
                                style={{ marginBottom: 8 }}
                            >
                                <Select
                                    mode="multiple"
                                    placeholder="Select areas of specialization"
                                    allowClear
                                    onChange={clearError}
                                    size="small"
                                >
                                    {specializationOptions.map(spec => (
                                        <Option key={spec} value={spec}>{spec}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[8, 4]}>
                        <Col span={24}>
                            <Form.Item
                                label="Bio/Experience Summary"
                                name="experience"
                                style={{ marginBottom: 0 }}
                            >
                                <TextArea
                                    rows={2}
                                    placeholder="Describe your professional experience and background"
                                    onChange={clearError}
                                    showCount
                                    maxLength={500}
                                    size="small"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>
            )
        },
        {
            title: 'Contact',
            content: (
                <Card size="small" style={{ marginBottom: 12 }} bodyStyle={{ padding: '12px' }}>
                    <Row gutter={[8, 4]}>
                        <Col span={12}>
                            <Form.Item
                                label="Office Address"
                                name="officeAddress"
                                style={{ marginBottom: 8 }}
                            >
                                <TextArea
                                    rows={2}
                                    placeholder="Enter office address"
                                    onChange={clearError}
                                    size="small"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Office Phone"
                                name="officePhone"
                                style={{ marginBottom: 8 }}
                            >
                                <Input
                                    placeholder="Enter office phone number"
                                    onChange={clearError}
                                    size="small"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[8, 4]}>
                        <Col span={12}>
                            <Form.Item
                                label="Website"
                                name="website"
                                rules={[
                                    { type: 'url', message: 'Please enter a valid URL' }
                                ]}
                                style={{ marginBottom: 8 }}
                            >
                                <Input
                                    placeholder="https://example.com"
                                    onChange={clearError}
                                    size="small"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Languages Spoken"
                                name="languages"
                                style={{ marginBottom: 0 }}
                            >
                                <Select
                                    mode="multiple"
                                    placeholder="Select languages spoken"
                                    allowClear
                                    onChange={clearError}
                                    size="small"
                                >
                                    {languageOptions.map(lang => (
                                        <Option key={lang} value={lang}>{lang}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>
            )
        },
        {
            title: 'Education',
            content: (
                <Card size="small" style={{ marginBottom: 12 }} bodyStyle={{ padding: '12px' }}>
                    <Row gutter={[8, 4]}>
                        <Col span={24}>
                            <Form.Item
                                label="Education"
                                name="education"
                                style={{ marginBottom: 8 }}
                            >
                                <TextArea
                                    rows={2}
                                    placeholder="List your educational background and certifications"
                                    onChange={clearError}
                                    showCount
                                    maxLength={300}
                                    size="small"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[8, 4]}>
                        <Col span={24}>
                            <Form.Item
                                label="Awards & Recognition"
                                name="awards"
                                style={{ marginBottom: 8 }}
                            >
                                <TextArea
                                    rows={2}
                                    placeholder="List any awards, honors, or recognition received"
                                    onChange={clearError}
                                    showCount
                                    maxLength={300}
                                    size="small"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[8, 4]}>
                        <Col span={24}>
                            <Form.Item
                                label="Professional Bio"
                                name="bio"
                                style={{ marginBottom: 0 }}
                            >
                                <TextArea
                                    rows={2}
                                    placeholder="Write a detailed professional biography"
                                    onChange={clearError}
                                    showCount
                                    maxLength={1000}
                                    size="small"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>
            )
        },
        {
            title: agent ? 'Verification' : 'Account',
            content: (
                <Card size="small" style={{ marginBottom: 12 }} bodyStyle={{ padding: '12px' }}>
                    {/* Profile Picture Section */}
                    <Row gutter={[8, 4]} style={{ marginBottom: 8 }}>
                        <Col span={24}>
                            <div style={{ textAlign: 'center', marginBottom: 8 }}>
                                <Text strong>Profile Picture</Text>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <ProfilePictureUpload />
                            </div>
                        </Col>
                    </Row>

                    {agent ? (
                        // Verification for existing agents
                        <Row gutter={[8, 4]}>
                            <Col span={24}>
                                <Form.Item
                                    label="Agent Verified"
                                    name="isVerified"
                                    valuePropName="checked"
                                    style={{ marginBottom: 0 }}
                                >
                                    <Switch
                                        checkedChildren="Verified"
                                        unCheckedChildren="Not Verified"
                                        onChange={clearError}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    ) : (
                        // Account setup for new agents
                        <>
                            <Divider style={{ margin: '8px 0' }} />
                            <Row gutter={[8, 4]}>
                                <Col span={24}>
                                    <Form.Item
                                        label="Username"
                                        name="username"
                                        rules={[
                                            { required: true, message: 'Please enter username' },
                                            { min: 3, message: 'Username must be at least 3 characters' },
                                            {
                                                pattern: /^[a-zA-Z0-9_]+$/,
                                                message: 'Username can only contain letters, numbers and underscore'
                                            }
                                        ]}
                                        style={{ marginBottom: 8 }}
                                    >
                                        <Input
                                            placeholder="Enter username"
                                            onChange={clearError}
                                            size="small"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={[8, 4]}>
                                <Col span={12}>
                                    <Form.Item
                                        label="Password"
                                        name="password"
                                        rules={[
                                            { required: true, message: 'Please enter password' },
                                            { min: 6, message: 'Password must be at least 6 characters' },
                                            {
                                                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                                                message: 'Password must contain uppercase, lowercase and number'
                                            }
                                        ]}
                                        style={{ marginBottom: 0 }}
                                    >
                                        <Input.Password
                                            placeholder="Enter password"
                                            onChange={clearError}
                                            size="small"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label="Confirm Password"
                                        name="confirmPassword"
                                        dependencies={['password']}
                                        rules={[
                                            { required: true, message: 'Please confirm password' },
                                            validatePasswordConfirm
                                        ]}
                                        style={{ marginBottom: 0 }}
                                    >
                                        <Input.Password
                                            placeholder="Confirm password"
                                            onChange={clearError}
                                            size="small"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </>
                    )}
                </Card>
            )
        }
    ];

    return (
        <>
            {!showAccountInfo ? (
                // FORM VIEW WITH STEPS
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    onFieldsChange={clearError}
                    initialValues={{
                        isVerified: false,
                        yearsOfExperience: 0,
                    }}
                    scrollToFirstError
                >
                    {/* ERROR ALERTS AT THE TOP */}
                    <div style={{ marginBottom: 16 }}>
                        {getErrorAlert()}
                        {getMissingFieldsAlert()}
                    </div>

                    {/* Progress Steps */}
                    <div style={{ marginBottom: 16 }}>
                        <Steps current={currentStep} size="small">
                            {steps.map((step, index) => (
                                <Step key={index} title={step.title} />
                            ))}
                        </Steps>
                    </div>

                    {/* Current Step Content */}
                    {steps[currentStep].content}

                    <Divider style={{ margin: '12px 0' }} />

                    {/* Navigation Buttons */}
                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            {currentStep > 0 && (
                                <Button onClick={prev} size="small">
                                    Previous
                                </Button>
                            )}
                            {currentStep < steps.length - 1 && (
                                <Button type="primary" onClick={next} size="small">
                                    Next
                                </Button>
                            )}
                            {currentStep === steps.length - 1 && (
                                <>
                                    <Button onClick={onCancel} disabled={loading} size="small">
                                        Cancel
                                    </Button>
                                    <Button type="primary" htmlType="submit" loading={loading} size="small">
                                        {agent ? 'Update Agent' : 'Create Agent'}
                                    </Button>
                                </>
                            )}
                        </Space>
                    </Form.Item>
                </Form>
            ) : (
                // ACCOUNT INFORMATION VIEW (After Submission)
                <div>
                    <Card bodyStyle={{ padding: '16px' }}>
                        <div style={{ textAlign: 'center', marginBottom: 16 }}>
                            <Title level={4} style={{ color: '#52c41a', marginBottom: 4 }}>
                                ✅ {agent ? 'Agent Updated Successfully!' : 'Agent Created Successfully!'}
                            </Title>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                {agent ? 'The agent information has been updated.' : 'The new agent has been created successfully.'}
                            </Text>
                        </div>

                        <Card
                            title="Account Information"
                            type="inner"
                            style={{ marginBottom: 12 }}
                            headStyle={{ backgroundColor: '#f0f8ff', borderBottom: '1px solid #d9d9d9', padding: '8px 12px' }}
                            bodyStyle={{ padding: '12px' }}
                        >
                            <Descriptions bordered column={1} size="small">
                                <Descriptions.Item label="Username">
                                    <Text strong>{submittedData?.username}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Email">
                                    <Text strong>{submittedData?.email}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Password">
                                    <Text type="warning" strong>
                                        {submittedData?.password}
                                    </Text>
                                    <div style={{ marginTop: 2 }}>
                                        <Text type="secondary" italic style={{ fontSize: '11px' }}>
                                            {agent ? 'Password remains unchanged' : 'Please provide this password to the agent'}
                                        </Text>
                                    </div>
                                </Descriptions.Item>
                                <Descriptions.Item label="Status">
                                    <Text type="success">Active</Text>
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>

                        <div style={{ textAlign: 'center', marginTop: 12 }}>
                            <Space>
                                {!agent && (
                                    <Button
                                        type="primary"
                                        onClick={handleCreateAnother}
                                        size="small"
                                    >
                                        Create Another Agent
                                    </Button>
                                )}
                                <Button
                                    onClick={onCancel}
                                    size="small"
                                >
                                    Close
                                </Button>
                            </Space>
                        </div>
                    </Card>
                </div>
            )}
        </>
    );
};

export default InsertAgent;