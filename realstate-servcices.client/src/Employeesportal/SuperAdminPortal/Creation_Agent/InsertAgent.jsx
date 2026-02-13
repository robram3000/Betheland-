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
    Steps,
    Modal,
    Progress,
    notification,
    Spin,
    Image,
    Collapse
} from 'antd';
import {
    SaveOutlined,
    CloseOutlined,
    UploadOutlined,
    EyeOutlined,
    DeleteOutlined,
    CheckCircleOutlined,
    UserOutlined,
    PhoneOutlined,
    MailOutlined,
    IdcardOutlined,
    EnvironmentOutlined,
    BookOutlined,
    TrophyOutlined
} from '@ant-design/icons';
import agentService from '../../AdminPortal/Creation_Agent/Services/AgentService';
import {
    useAgentErrorHandler,
    createAgentServiceWithErrorHandling
} from '../../AdminPortal/Creation_Agent/Services/AgentErrorHandler';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;
const { Step } = Steps;
const { Panel } = Collapse;

const enhancedAgentService = createAgentServiceWithErrorHandling(agentService);

const InsertAgent = ({ agent, onSuccess, onCancel }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [imageList, setImageList] = useState([]);
    const [submittedData, setSubmittedData] = useState(null);
    const [showSuccessInfo, setShowSuccessInfo] = useState(false);
    const [error, setError] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [missingFields, setMissingFields] = useState([]);
    const [uploading, setUploading] = useState(false);
    const { handleError } = useAgentErrorHandler();
    const [showLicenseFields, setShowLicenseFields] = useState(false);

    // Progress states like InsertProperty
    const [progressVisible, setProgressVisible] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentAction, setCurrentAction] = useState('');

    // Preview states
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');

    useEffect(() => {
        if (agent) {
            form.setFieldsValue({
                ...agent,
                licenseExpiry: agent.licenseExpiry ? moment(agent.licenseExpiry) : null,
            });

            // Initialize image list like InsertProperty
            if (agent.profilePictureUrl) {
                setImageList([{
                    uid: '-1',
                    name: 'profile-picture.jpg',
                    status: 'done',
                    url: agent.profilePictureUrl,
                    thumbUrl: agent.profilePictureUrl
                }]);
            }

            setShowLicenseFields(!!agent.licenseNumber);
        }
    }, [agent, form]);

    // Progress functions like InsertProperty
    const startProgress = (actionName) => {
        setCurrentAction(actionName);
        setProgressVisible(true);
        setProgress(0);

        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return prev;
                }
                return prev + 10;
            });
        }, 100);

        return interval;
    };

    const completeProgress = (interval) => {
        setProgress(100);
        setTimeout(() => {
            if (interval) clearInterval(interval);
            setProgressVisible(false);
            setProgress(0);
            setCurrentAction('');
        }, 500);
    };

    // Success notification like InsertProperty
    const showSuccessMessage = (action, agentName) => {
        const messages = {
            create: 'Agent created successfully!',
            update: 'Agent updated successfully!'
        };

        notification.success({
            message: (
                <Space>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <span>{messages[action]}</span>
                </Space>
            ),
            description: `"${agentName}" has been ${action === 'create' ? 'created' : 'updated'} successfully.`,
            placement: 'topRight',
            duration: 4,
        });
    };

    const clearError = () => {
        setError(null);
        setMissingFields([]);
    };

    // Enhanced validation like InsertProperty
    const validateNoWhitespace = (_, value) => {
        if (value && value.trim() === '') {
            return Promise.reject(new Error('This field cannot be empty or contain only spaces'));
        }
        return Promise.resolve();
    };

    const validateCurrentStep = () => {
        const fieldNames = getStepFields(currentStep);
        const values = form.getFieldsValue(fieldNames);
        const currentMissing = [];

        fieldNames.forEach(field => {
            const value = values[field];

            // Skip license fields if hidden
            if ((field === 'licenseNumber' || field === 'licenseExpiry') && !showLicenseFields) {
                return;
            }

            // Required field validation
            if (field === 'firstName' && (!value || value.trim() === '')) {
                currentMissing.push('First Name');
            }
            if (field === 'lastName' && (!value || value.trim() === '')) {
                currentMissing.push('Last Name');
            }
            if (field === 'cellPhoneNo' && (!value || value.trim() === '')) {
                currentMissing.push('Cell Phone');
            } else if (field === 'cellPhoneNo' && value) {
                const cleanPhone = value.replace(/\D/g, '');
                if (cleanPhone.length !== 11) {
                    currentMissing.push('Cell Phone (must be 11 digits)');
                }
            }
            if (field === 'email' && (!value || value.trim() === '')) {
                currentMissing.push('Email');
            }
            if (field === 'licenseNumber' && showLicenseFields && (!value || value.trim() === '')) {
                currentMissing.push('License Number');
            }
            if (field === 'username' && !value && !agent) {
                currentMissing.push('Username');
            } else if (field === 'username' && value && value.trim() === '') {
                currentMissing.push('Username');
            }
            if (field === 'password' && !value && !agent) {
                currentMissing.push('Password');
            }
        });

        // Profile picture validation for new agents
        if (currentStep === 4 && !agent && imageList.length === 0) {
            currentMissing.push('Profile Picture');
        }

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

    // Enhanced image upload handling like InsertProperty
    const handleImageUpload = ({ file, fileList }) => {
        if (file.status === 'uploading') {
            setUploading(true);
        } else if (file.status === 'done') {
            setUploading(false);
            message.success(`${file.name} uploaded successfully`);

            const updatedList = fileList.map(item => {
                if (item.originFileObj && !item.url) {
                    return {
                        ...item,
                        url: URL.createObjectURL(item.originFileObj),
                        thumbUrl: URL.createObjectURL(item.originFileObj)
                    };
                }
                return item;
            });
            setImageList(updatedList);
        } else if (file.status === 'error') {
            setUploading(false);
            message.error(`${file.name} upload failed`);
        }

        setImageList(fileList);
    };

    const handlePreview = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        setPreviewImage(file.url || file.preview);
        setPreviewVisible(true);
        setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
    };

    const handleCancel = () => setPreviewVisible(false);

    const getBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onError = error => reject(error);
        });
    };

    const uploadButton = (
        <div>
            <UploadOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );

    const imageUploadProps = {
        beforeUpload: (file) => {
            const isImage = file.type.startsWith('image/');
            if (!isImage) {
                message.error('You can only upload image files!');
                return Upload.LIST_IGNORE;
            }

            // 5MB limit for profile pictures
            if (file.size > 5 * 1024 * 1024) {
                message.error('Image must be smaller than 5MB!');
                return Upload.LIST_IGNORE;
            }

            return false;
        },
        fileList: imageList,
        onChange: handleImageUpload,
        onPreview: handlePreview,
        multiple: false,
        accept: "image/*",
        listType: "picture-card",
        showUploadList: {
            showPreviewIcon: false,
            showRemoveIcon: false,
        },
        maxCount: 1
    };

    const onFinish = async (values) => {
        const progressInterval = startProgress(agent ? 'Updating agent...' : 'Creating agent...');
        setLoading(true);
        clearError();

        try {
            const allStepFields = [0, 1, 2, 3, 4].flatMap(step => getStepFields(step));
            const allValues = form.getFieldsValue(allStepFields);

            console.log('All form values:', allValues);

            const missingFields = [];

            // Enhanced validation like InsertProperty
            if (!allValues.firstName || allValues.firstName.trim() === '') missingFields.push('First Name');
            if (!allValues.lastName || allValues.lastName.trim() === '') missingFields.push('Last Name');
            if (!allValues.cellPhoneNo || allValues.cellPhoneNo.trim() === '') missingFields.push('Cell Phone');
            if (!allValues.email || allValues.email.trim() === '') missingFields.push('Email');
            if (showLicenseFields && (!allValues.licenseNumber || allValues.licenseNumber.trim() === '')) missingFields.push('License Number');
            if (!agent && (!allValues.username || allValues.username.trim() === '')) missingFields.push('Username');
            if (!agent && !allValues.password) missingFields.push('Password');

            // Profile picture validation
            if (!agent && imageList.length === 0) {
                missingFields.push('Profile Picture');
            }

            if (missingFields.length > 0) {
                setMissingFields(missingFields);
                message.warning('Please complete all required fields before submitting');
                setLoading(false);
                return;
            }

            // Get the uploaded image file
            const imageFile = imageList.length > 0 && imageList[0].originFileObj instanceof File
                ? imageList[0].originFileObj
                : null;

            let imageUrl = '';
            if (imageFile) {
                // Upload image and get URL
                const uploadResponse = await agentService.uploadImage(imageFile);
                if (uploadResponse && uploadResponse.success) {
                    imageUrl = uploadResponse.url || uploadResponse.data?.url || uploadResponse.profilePictureUrl;
                }
            } else if (imageList.length > 0 && imageList[0].url) {
                // Use existing URL for updates
                imageUrl = imageList[0].url;
            }

            const agentData = {
                ...allValues,
                photourl: imageUrl,
                profilePictureUrl: imageUrl,
            };

            // Remove license fields if hidden
            if (!showLicenseFields) {
                delete agentData.licenseNumber;
                delete agentData.licenseExpiry;
            }

            // Handle specialization
            if (Array.isArray(agentData.specialization)) {
                agentData.specialization = JSON.stringify(agentData.specialization);
            } else if (!agentData.specialization) {
                agentData.specialization = '[]';
            }

            // Handle languages
            if (Array.isArray(agentData.languages)) {
                agentData.languages = agentData.languages.join(', ');
            }

            // Remove confirmPassword
            delete agentData.confirmPassword;

            let result;
            if (agent) {
                result = await enhancedAgentService.updateAgent(agent.id, agentData);
            } else {
                result = await enhancedAgentService.createAgent(agentData);
            }

            completeProgress(progressInterval);
            showSuccessMessage(agent ? 'update' : 'create', `${allValues.firstName} ${allValues.lastName}`);

            if (result) {
                setSubmittedData({
                    firstName: allValues.firstName,
                    lastName: allValues.lastName,
                    email: allValues.email,
                    username: allValues.username,
                    password: allValues.password || '********',
                    profilePictureUrl: imageUrl,
                    referenceId: result.id || `AGT-${Date.now()}`,
                    licenseNumber: showLicenseFields ? allValues.licenseNumber : 'Not provided'
                });

                setShowSuccessInfo(true);

                if (onSuccess) {
                    onSuccess(result);
                }
            } else {
                throw new Error('Invalid response from server');
            }

        } catch (error) {
            console.error('Error saving agent:', error);
            completeProgress(progressInterval);
            const errorMessage = error.message || `Failed to ${agent ? 'update' : 'create'} agent`;

            let displayMessage = errorMessage;
            if (error.details && Array.isArray(error.details) && error.details.length > 0) {
                displayMessage += `: ${error.details.join(', ')}`;
            } else if (error.details) {
                displayMessage += `: ${error.details}`;
            }

            message.error(displayMessage);
            setError({
                message: displayMessage,
                details: error.details
            });
        } finally {
            setLoading(false);
        }
    };

    const getErrorAlert = () => {
        if (!error) return null;

        return (
            <Alert
                message="Error"
                description={error.message}
                type="error"
                showIcon
                closable
                onClose={clearError}
                style={{ marginBottom: 16 }}
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
                        Please fill in the following required fields:
                        <ul style={{ margin: '8px 0 0 0', paddingLeft: '16px' }}>
                            {missingFields.map((field, index) => (
                                <li key={index}>{field}</li>
                            ))}
                        </ul>
                    </div>
                }
                type="warning"
                showIcon
                closable
                onClose={() => setMissingFields([])}
                style={{ marginBottom: 16 }}
            />
        );
    };

    const handleCreateAnother = () => {
        setShowSuccessInfo(false);
        setSubmittedData(null);
        setError(null);
        form.resetFields();
        setImageList([]);
        setCurrentStep(0);
        setShowLicenseFields(false);
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
        'Filipino'
    ];

    const validatePasswordConfirm = ({ getFieldValue }) => ({
        validator(_, value) {
            if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
            }
            return Promise.reject(new Error('The two passwords that you entered do not match!'));
        },
    });

    const steps = [
        {
            title: 'Basic Info',
            icon: <UserOutlined />,
            content: (
                <Card title="Basic Information" size="small" style={{ border: 'none' }}>
                    <Row gutter={[16, 0]}>
                        <Col span={24} md={8}>
                            <Form.Item
                                label="First Name"
                                name="firstName"
                                rules={[
                                    { required: true, message: 'Please enter first name' },
                                    { validator: validateNoWhitespace }
                                ]}
                            >
                                <Input
                                    placeholder="Enter first name"
                                    prefix={<UserOutlined />}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24} md={8}>
                            <Form.Item
                                label="Middle Name"
                                name="middleName"
                            >
                                <Input placeholder="Enter middle name" />
                            </Form.Item>
                        </Col>
                        <Col span={24} md={8}>
                            <Form.Item
                                label="Last Name"
                                name="lastName"
                                rules={[
                                    { required: true, message: 'Please enter last name' },
                                    { validator: validateNoWhitespace }
                                ]}
                            >
                                <Input placeholder="Enter last name" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[16, 0]}>
                        <Col span={24} md={6}>
                            <Form.Item
                                label="Suffix"
                                name="suffix"
                            >
                                <Select placeholder="Select suffix" allowClear>
                                    <Option value="Jr">Jr</Option>
                                    <Option value="Sr">Sr</Option>
                                    <Option value="II">II</Option>
                                    <Option value="III">III</Option>
                                    <Option value="IV">IV</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={24} md={9}>
                            <Form.Item
                                label="Cell Phone"
                                name="cellPhoneNo"
                                rules={[
                                    { required: true, message: 'Please enter phone number' },
                                    {
                                        pattern: /^\d{11}$/,
                                        message: 'Phone number must be exactly 11 digits'
                                    }
                                ]}
                            >
                                <Input
                                    placeholder="Enter 11-digit number"
                                    prefix={<PhoneOutlined />}
                                    maxLength={11}
                                    onInput={(e) => {
                                        e.target.value = e.target.value.replace(/\D/g, '');
                                    }}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24} md={9}>
                            <Form.Item
                                label="Email"
                                name="email"
                                rules={[
                                    { required: true, message: 'Please enter email' },
                                    { type: 'email', message: 'Please enter valid email' },
                                    { validator: validateNoWhitespace }
                                ]}
                            >
                                <Input
                                    placeholder="Enter email"
                                    prefix={<MailOutlined />}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>
            )
        },
        {
            title: 'Professional',
            icon: <IdcardOutlined />,
            content: (
                <Card title="Professional Information" size="small" style={{ border: 'none' }}>
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <Text strong>License Information</Text>
                                <Switch
                                    checked={showLicenseFields}
                                    onChange={setShowLicenseFields}
                                    checkedChildren="Show License"
                                    unCheckedChildren="Hide License"
                                    size="small"
                                />
                            </div>
                        </Col>
                    </Row>

                    {showLicenseFields && (
                        <>
                            <Row gutter={[16, 0]}>
                                <Col span={24} md={12}>
                                    <Form.Item
                                        label="License Number"
                                        name="licenseNumber"
                                        rules={[
                                            { required: true, message: 'Please enter license number' },
                                            { validator: validateNoWhitespace }
                                        ]}
                                    >
                                        <Input placeholder="Enter license number" />
                                    </Form.Item>
                                </Col>
                                <Col span={24} md={12}>
                                    <Form.Item
                                        label="License Expiry"
                                        name="licenseExpiry"
                                    >
                                        <DatePicker
                                            style={{ width: '100%' }}
                                            placeholder="Select expiry date"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Divider style={{ margin: '16px 0' }} />
                        </>
                    )}

                    <Row gutter={[16, 0]}>
                        <Col span={24} md={12}>
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
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    placeholder="Enter years of experience"
                                    min={0}
                                    max={50}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24} md={12}>
                            <Form.Item
                                label="Brokerage Name"
                                name="brokerageName"
                            >
                                <Input placeholder="Enter brokerage name" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[16, 0]}>
                        <Col span={24}>
                            <Form.Item
                                label="Specialization"
                                name="specialization"
                            >
                                <Select
                                    mode="multiple"
                                    placeholder="Select areas of specialization"
                                    allowClear
                                >
                                    {specializationOptions.map(spec => (
                                        <Option key={spec} value={spec}>{spec}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        label="Bio/Experience Summary"
                        name="experience"
                    >
                        <TextArea
                            rows={3}
                            placeholder="Describe your professional experience and background"
                            showCount
                            maxLength={500}
                        />
                    </Form.Item>
                </Card>
            )
        },
        {
            title: 'Contact',
            icon: <EnvironmentOutlined />,
            content: (
                <Card title="Contact Information" size="small" style={{ border: 'none' }}>
                    <Row gutter={[16, 0]}>
                        <Col span={24}>
                            <Form.Item
                                label="Office Address"
                                name="officeAddress"
                            >
                                <TextArea
                                    rows={3}
                                    placeholder="Enter office address"
                                    showCount
                                    maxLength={300}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[16, 0]}>
                        <Col span={24} md={12}>
                            <Form.Item
                                label="Office Phone"
                                name="officePhone"
                            >
                                <Input placeholder="Enter office phone number" />
                            </Form.Item>
                        </Col>
                        <Col span={24} md={12}>
                            <Form.Item
                                label="Website"
                                name="website"
                                rules={[
                                    { type: 'url', message: 'Please enter a valid URL' }
                                ]}
                            >
                                <Input placeholder="https://example.com" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item
                        label="Languages Spoken"
                        name="languages"
                    >
                        <Select
                            mode="multiple"
                            placeholder="Select languages spoken"
                            allowClear
                        >
                            {languageOptions.map(lang => (
                                <Option key={lang} value={lang}>{lang}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Card>
            )
        },
        {
            title: 'Education',
            icon: <BookOutlined />,
            content: (
                <Card title="Education & Background" size="small" style={{ border: 'none' }}>
                    <Form.Item
                        label="Education"
                        name="education"
                    >
                        <TextArea
                            rows={3}
                            placeholder="List your educational background and certifications"
                            showCount
                            maxLength={300}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Awards & Recognition"
                        name="awards"
                    >
                        <TextArea
                            rows={3}
                            placeholder="List any awards, honors, or recognition received"
                            showCount
                            maxLength={300}
                        />
                    </Form.Item>
                    <Form.Item
                        label="Professional Bio"
                        name="bio"
                    >
                        <TextArea
                            rows={3}
                            placeholder="Write a detailed professional biography"
                            showCount
                            maxLength={1000}
                        />
                    </Form.Item>
                </Card>
            )
        },
        {
            title: agent ? 'Verification' : 'Account',
            icon: agent ? <CheckCircleOutlined /> : <UserOutlined />,
            content: (
                <Card title={agent ? "Verification" : "Account Setup"} size="small" style={{ border: 'none' }}>
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Form.Item
                                label="Profile Picture"
                                required={!agent}
                                rules={!agent ? [{ required: true, message: 'Profile picture is required' }] : []}
                            >
                                <div>
                                    <Upload {...imageUploadProps}>
                                        {imageList.length >= 1 ? null : uploadButton}
                                    </Upload>
                                    <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
                                        Upload profile picture (max 5MB). {!agent && 'Required for new agents.'}
                                    </div>
                                    {!agent && imageList.length === 0 && (
                                        <div style={{ marginTop: 8, color: '#ff4d4f', fontSize: '12px' }}>
                                            Profile picture is required
                                        </div>
                                    )}
                                </div>
                            </Form.Item>
                        </Col>
                    </Row>

                    {agent ? (
                        <Form.Item
                            label="Agent Verified"
                            name="isVerified"
                            valuePropName="checked"
                        >
                            <Switch
                                checkedChildren="Verified"
                                unCheckedChildren="Not Verified"
                            />
                        </Form.Item>
                    ) : (
                        <>
                            <Row gutter={[16, 0]}>
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
                                            },
                                            { validator: validateNoWhitespace }
                                        ]}
                                    >
                                        <Input placeholder="Enter username" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={[16, 0]}>
                                <Col span={24} md={12}>
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
                                    >
                                        <Input.Password placeholder="Enter password" />
                                    </Form.Item>
                                </Col>
                                <Col span={24} md={12}>
                                    <Form.Item
                                        label="Confirm Password"
                                        name="confirmPassword"
                                        dependencies={['password']}
                                        rules={[
                                            { required: true, message: 'Please confirm password' },
                                            validatePasswordConfirm
                                        ]}
                                    >
                                        <Input.Password placeholder="Confirm password" />
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
            {!showSuccessInfo ? (
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{
                        isVerified: false,
                        yearsOfExperience: 0,
                    }}
                >
                    {progressVisible && (
                        <div style={{ marginBottom: 16 }}>
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: 8
                                }}>
                                    <span style={{ fontWeight: 500, color: '#1890ff' }}>
                                        {currentAction}
                                    </span>
                                    <span style={{ fontSize: '12px', color: '#666' }}>
                                        {progress}%
                                    </span>
                                </div>
                                <Progress
                                    percent={progress}
                                    status="active"
                                    strokeColor={{
                                        '0%': '#108ee9',
                                        '100%': '#87d068',
                                    }}
                                    showInfo={false}
                                />
                            </Space>
                        </div>
                    )}

                    <div style={{ marginBottom: 16 }}>
                        {getErrorAlert()}
                        {getMissingFieldsAlert()}
                    </div>

                    <div style={{ marginBottom: 16 }}>
                        <Steps current={currentStep} size="small">
                            {steps.map((step, index) => (
                                <Step key={index} title={step.title} icon={step.icon} />
                            ))}
                        </Steps>
                    </div>

                    {steps[currentStep].content}

                    <Modal
                        open={previewVisible}
                        title={previewTitle}
                        footer={null}
                        onCancel={handleCancel}
                        width="80vw"
                        style={{ top: 20 }}
                    >
                        <img alt="Preview" style={{ width: '100%' }} src={previewImage} />
                    </Modal>

                    <Divider style={{ margin: '12px 0' }} />

                    <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                        <Space>
                            {currentStep > 0 && (
                                <Button onClick={prev}>Previous</Button>
                            )}
                            {currentStep < steps.length - 1 && (
                                <Button type="primary" onClick={next}>Next</Button>
                            )}
                            {currentStep === steps.length - 1 && (
                                <>
                                    <Button onClick={onCancel} disabled={loading}>
                                        <CloseOutlined /> Cancel
                                    </Button>
                                    <Button type="primary" htmlType="submit" loading={loading}>
                                        <SaveOutlined /> {agent ? 'Update Agent' : 'Create Agent'}
                                    </Button>
                                </>
                            )}
                        </Space>
                    </Form.Item>
                </Form>
            ) : (
                <div>
                    <Card bodyStyle={{ padding: '16px' }} style={{ border: 'none' }}>
                        <div style={{ textAlign: 'center', marginBottom: 16 }}>
                            <Title level={4} style={{ color: '#52c41a', marginBottom: 4 }}>
                                ✅ {agent ? 'Agent Updated Successfully!' : 'Agent Created Successfully!'}
                            </Title>
                            <Text type="secondary">
                                {agent ? 'The agent information has been updated.' : 'The new agent has been created successfully.'}
                            </Text>
                        </div>

                        {submittedData?.profilePictureUrl && (
                            <div style={{ textAlign: 'center', marginBottom: 16 }}>
                                <Image
                                    width={100}
                                    height={100}
                                    src={submittedData.profilePictureUrl}
                                    style={{
                                        borderRadius: '50%',
                                        objectFit: 'cover'
                                    }}
                                    preview={false}
                                />
                            </div>
                        )}

                        <Card title="Agent Information" type="inner" style={{ marginBottom: 12, border: 'none' }}>
                            <Descriptions bordered column={1} size="small">
                                <Descriptions.Item label="Agent Name">
                                    <Text strong>{submittedData?.firstName} {submittedData?.lastName}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Email">
                                    <Text strong>{submittedData?.email}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Username">
                                    <Text strong>{submittedData?.username}</Text>
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
                                <Descriptions.Item label="License Number">
                                    <Text>{submittedData?.licenseNumber}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Reference ID">
                                    <Text type="secondary">{submittedData?.referenceId}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Status">
                                    <Text type="success" strong>Active</Text>
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>

                        <div style={{ textAlign: 'center', marginTop: 12 }}>
                            <Space>
                                {!agent && (
                                    <Button type="primary" onClick={handleCreateAnother}>
                                        Create Another Agent
                                    </Button>
                                )}
                                <Button onClick={onCancel}>Close</Button>
                            </Space>
                        </div>
                    </Card>
                </div>
            )}
        </>
    );
};

export default InsertAgent;