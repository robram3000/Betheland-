// EditAgent.jsx
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
    Upload,
    Typography,
    Divider,
    Alert,
    Descriptions,
    Avatar,
    Tag
} from 'antd';
import {
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    IdcardOutlined,
    GlobalOutlined,
    UploadOutlined,
    CheckOutlined,
    CloseOutlined,
    HomeOutlined,
    ShopOutlined,
    TrophyOutlined,
    ReadOutlined
} from '@ant-design/icons';
import agentService from '../../AdminPortal/Creation_Agent/Services/AgentService';
import { agentMapper } from '../../AdminPortal/Creation_Agent/Services/AgentMapper';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;
const { Text, Title } = Typography;

const EditAgent = ({ agent, onSuccess, onCancel }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [originalAgent, setOriginalAgent] = useState(null);

    useEffect(() => {
        if (agent) {
            console.log('DEBUG - Original agent data:', agent);
            setOriginalAgent(agent);

            // Use the mapper to ensure consistent data format
            const mappedAgent = agentMapper.toFrontend(agent);
            console.log('DEBUG - Mapped agent data for form:', mappedAgent);

            // Populate form with properly mapped agent data
            form.setFieldsValue({
                firstName: mappedAgent.firstName,
                middleName: mappedAgent.middleName || '',
                lastName: mappedAgent.lastName,
                suffix: mappedAgent.suffix || '',
                cellPhoneNo: mappedAgent.cellPhoneNo,
                email: mappedAgent.email,
                licenseNumber: mappedAgent.licenseNumber,
                licenseExpiry: mappedAgent.licenseExpiry,
                yearsOfExperience: mappedAgent.yearsOfExperience || 0,
                brokerageName: mappedAgent.brokerageName || '',
                specialization: mappedAgent.specialization || [],
                experience: mappedAgent.experience || '',
                officeAddress: mappedAgent.officeAddress || '',
                officePhone: mappedAgent.officePhone || '',
                website: mappedAgent.website || '',
                languages: mappedAgent.languages || [],
                education: mappedAgent.education || '',
                awards: mappedAgent.awards || '',
                bio: mappedAgent.bio || '',
                isVerified: mappedAgent.isVerified || false
            });

            setImageUrl(mappedAgent.profilePictureUrl || mappedAgent.photourl || '');
        }
    }, [agent, form]);

    const clearError = () => {
        setError(null);
    };

    const onFinish = async (values) => {
        setLoading(true);
        clearError();

        try {
            console.log('DEBUG - Form values before mapping:', values);

            // Prepare the data with proper formatting
            const formData = {
                ...values,
                profilePictureUrl: imageUrl,
                // Ensure arrays are properly formatted
                specialization: Array.isArray(values.specialization) ? values.specialization : [],
                languages: Array.isArray(values.languages) ? values.languages : []
            };

            console.log('DEBUG - Form data before mapper:', formData);

            // Use the mapper to convert to backend format
            const requestData = agentMapper.toUpdateRequest(formData);

            console.log('DEBUG - Mapped request data:', requestData);

            const result = await agentService.updateAgent(agent.id, requestData);

            if (result && result.success) {
                message.success('Agent updated successfully');
                if (onSuccess) onSuccess();
            } else {
                throw new Error(result?.message || 'Update failed');
            }

        } catch (error) {
            console.error('Error saving agent:', error);

            // More detailed error logging
            let errorMessage = error.message || `Failed to update agent`;
            let errorDetails = error.response?.data || error.data || error.originalError?.response?.data;

            console.error('Full error details:', {
                message: error.message,
                status: error.status,
                response: error.response,
                data: error.data
            });

            setError({
                message: errorMessage,
                details: errorDetails
            });
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (options) => {
        const { file, onSuccess, onError } = options;
        setUploading(true);

        try {
            console.log('Uploading profile picture...', file);
            const response = await agentService.uploadImage(file);
            console.log('Upload response:', response);

            let uploadedUrl = response.url || response.data?.url || response.profilePictureUrl || response.imageUrl;

            if (!uploadedUrl && response.data && typeof response.data === 'object') {
                uploadedUrl = response.data.url || response.data.imageUrl;
            }

            if (!uploadedUrl) {
                const findUrlInObject = (obj) => {
                    for (let key in obj) {
                        if (typeof obj[key] === 'string' && obj[key].includes('/uploads/')) {
                            return obj[key];
                        }
                        if (typeof obj[key] === 'object' && obj[key] !== null) {
                            const found = findUrlInObject(obj[key]);
                            if (found) return found;
                        }
                    }
                    return null;
                };
                uploadedUrl = findUrlInObject(response);
            }

            if (!uploadedUrl) {
                throw new Error('Upload successful but no image URL returned');
            }

            setImageUrl(uploadedUrl);
            onSuccess(response);
            message.success('Profile picture uploaded successfully');
        } catch (error) {
            console.error('Upload error:', error);
            onError(error);
            message.error('Failed to upload profile picture');
        } finally {
            setUploading(false);
        }
    };

    const specializationOptions = [
        'Residential', 'Commercial', 'Luxury Homes', 'Investment Properties',
        'Rentals', 'Land', 'Industrial', 'Agricultural'
    ];

    const languageOptions = [
        'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese',
        'Korean', 'Arabic', 'Hindi', 'Portuguese'
    ];

    const ProfilePictureUpload = () => (
        <Upload
            name="file"
            listType="picture-card"
            className="avatar-uploader"
            showUploadList={false}
            customRequest={handleImageUpload}
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
            disabled={uploading}
        >
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt="avatar"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
                />
            ) : (
                <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>
                        {uploading ? 'Uploading...' : 'Upload'}
                    </div>
                </div>
            )}
        </Upload>
    );

    const getErrorAlert = () => {
        if (!error) return null;

        return (
            <Alert
                message="Error"
                description={
                    <div>
                        <div style={{ marginBottom: 8, fontWeight: 500 }}>{error.message}</div>
                        {error.details && (
                            <div style={{ fontSize: '12px' }}>
                                {typeof error.details === 'object' ?
                                    JSON.stringify(error.details) : String(error.details)
                                }
                            </div>
                        )}
                    </div>
                }
                type="error"
                showIcon
                closable
                onClose={clearError}
                style={{ marginBottom: 16 }}
            />
        );
    };

    return (
        <div>
            {/* Agent Info Summary */}
            {originalAgent && (
                <Card size="small" style={{ marginBottom: 16 }} bodyStyle={{ padding: '12px' }}>
                    <Descriptions size="small" column={2}>
                        <Descriptions.Item label="Current Status">
                            <Space>
                                <Avatar size="small" src={originalAgent.profilePictureUrl} icon={<UserOutlined />} />
                                <Text strong>{originalAgent.firstName} {originalAgent.lastName}</Text>
                                <Tag color={originalAgent.isVerified ? 'green' : 'orange'} icon={originalAgent.isVerified ? <CheckOutlined /> : <CloseOutlined />}>
                                    {originalAgent.isVerified ? 'Verified' : 'Unverified'}
                                </Tag>
                            </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="Last Updated">
                            {originalAgent.updatedAt ? moment(originalAgent.updatedAt).format('MMM DD, YYYY') : 'Never'}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>
            )}

            {getErrorAlert()}

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                onFieldsChange={clearError}
                scrollToFirstError
            >
                <Row gutter={[16, 16]}>
                    {/* Left Column - Personal & Professional Info */}
                    <Col xs={24} lg={12}>
                        {/* Profile Picture */}
                        <Card size="small" title="Profile Picture" style={{ marginBottom: 16 }}>
                            <div style={{ textAlign: 'center' }}>
                                <ProfilePictureUpload />
                                {imageUrl && (
                                    <Text type="success" style={{ display: 'block', marginTop: 8 }}>
                                        <CheckOutlined /> Profile picture uploaded
                                    </Text>
                                )}
                            </div>
                        </Card>

                        {/* Personal Information */}
                        <Card size="small" title="Personal Information" style={{ marginBottom: 16 }}>
                            <Row gutter={[8, 8]}>
                                <Col span={8}>
                                    <Form.Item
                                        label="First Name"
                                        name="firstName"
                                        rules={[{ required: true, message: 'Please enter first name' }]}
                                    >
                                        <Input prefix={<UserOutlined />} placeholder="First name" />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        label="Middle Name"
                                        name="middleName"
                                    >
                                        <Input placeholder="Middle name" />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        label="Last Name"
                                        name="lastName"
                                        rules={[{ required: true, message: 'Please enter last name' }]}
                                    >
                                        <Input placeholder="Last name" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={[8, 8]}>
                                <Col span={6}>
                                    <Form.Item
                                        label="Suffix"
                                        name="suffix"
                                    >
                                        <Select placeholder="Suffix" allowClear>
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
                                        rules={[
                                            { required: true, message: 'Please enter phone number' },
                                            { pattern: /^\d{11}$/, message: 'Must be 11 digits' }
                                        ]}
                                    >
                                        <Input
                                            prefix={<PhoneOutlined />}
                                            placeholder="11-digit number"
                                            maxLength={11}
                                            onInput={(e) => {
                                                e.target.value = e.target.value.replace(/\D/g, '');
                                            }}
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
                                    >
                                        <Input prefix={<MailOutlined />} placeholder="Email address" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>

                        {/* Professional Information */}
                        <Card size="small" title="Professional Information" style={{ marginBottom: 16 }}>
                            <Row gutter={[8, 8]}>
                                <Col span={12}>
                                    <Form.Item
                                        label="License Number"
                                        name="licenseNumber"
                                        rules={[{ required: true, message: 'Please enter license number' }]}
                                    >
                                        <Input prefix={<IdcardOutlined />} placeholder="License number" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label="License Expiry"
                                        name="licenseExpiry"
                                    >
                                        <DatePicker style={{ width: '100%' }} placeholder="Expiry date" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={[8, 8]}>
                                <Col span={12}>
                                    <Form.Item
                                        label="Years of Experience"
                                        name="yearsOfExperience"
                                        rules={[{ type: 'number', min: 0, max: 50 }]}
                                    >
                                        <InputNumber
                                            style={{ width: '100%' }}
                                            placeholder="Years"
                                            min={0}
                                            max={50}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label="Brokerage Name"
                                        name="brokerageName"
                                    >
                                        <Input prefix={<ShopOutlined />} placeholder="Brokerage name" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                label="Specialization"
                                name="specialization"
                            >
                                <Select
                                    mode="multiple"
                                    placeholder="Select specializations"
                                    allowClear
                                >
                                    {specializationOptions.map(spec => (
                                        <Option key={spec} value={spec}>{spec}</Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                label="Experience Summary"
                                name="experience"
                            >
                                <TextArea rows={2} placeholder="Professional experience summary" />
                            </Form.Item>
                        </Card>
                    </Col>

                    {/* Right Column - Contact & Additional Info */}
                    <Col xs={24} lg={12}>
                        {/* Contact Information */}
                        <Card size="small" title="Contact Information" style={{ marginBottom: 16 }}>
                            <Form.Item
                                label="Office Address"
                                name="officeAddress"
                            >
                                <TextArea rows={2} placeholder="Full office address" />
                            </Form.Item>

                            <Row gutter={[8, 8]}>
                                <Col span={12}>
                                    <Form.Item
                                        label="Office Phone"
                                        name="officePhone"
                                    >
                                        <Input placeholder="Office phone number" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item
                                        label="Website"
                                        name="website"
                                        rules={[{ type: 'url', message: 'Please enter valid URL' }]}
                                    >
                                        <Input prefix={<GlobalOutlined />} placeholder="https://example.com" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                label="Languages Spoken"
                                name="languages"
                            >
                                <Select
                                    mode="multiple"
                                    placeholder="Select languages"
                                    allowClear
                                >
                                    {languageOptions.map(lang => (
                                        <Option key={lang} value={lang}>{lang}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Card>

                        {/* Additional Information */}
                        <Card size="small" title="Additional Information" style={{ marginBottom: 16 }}>
                            <Form.Item
                                label="Education & Certifications"
                                name="education"
                            >
                                <TextArea
                                    rows={2}
                                    placeholder="Educational background and certifications"
                                    prefix={<ReadOutlined />}
                                />
                            </Form.Item>

                            <Form.Item
                                label="Awards & Recognition"
                                name="awards"
                            >
                                <TextArea
                                    rows={2}
                                    placeholder="Awards, honors, and recognition"
                                    prefix={<TrophyOutlined />}
                                />
                            </Form.Item>

                            <Form.Item
                                label="Professional Bio"
                                name="bio"
                            >
                                <TextArea rows={3} placeholder="Detailed professional biography" />
                            </Form.Item>
                        </Card>

                        {/* Verification */}
                        <Card size="small" title="Verification">
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
                        </Card>
                    </Col>
                </Row>

                <Divider />
                <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                    <Space>
                        <Button onClick={onCancel} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Update Agent
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </div>
    );
};

export default EditAgent;