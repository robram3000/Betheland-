// Components/AgentProfile/AgentProfileEdit.jsx
import React, { useState, useEffect } from 'react';
import {
    Card,
    Form,
    Input,
    Button,
    Upload,
    Avatar,
    Row,
    Col,
    DatePicker,
    Select,
    message,
    Tabs,
    Space,
    Spin
} from 'antd';
import {
    UserOutlined,
    CameraOutlined,
    SaveOutlined,
    CloseOutlined,
    MailOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    GlobalOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import useAgents from './Services/useAgents';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const AgentProfileEdit = ({ currentAgent, updating, onSave, onCancel, baseMemberId }) => {
    const [form] = Form.useForm();
    const [loadingImage, setLoadingImage] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');
    const { updateAgent, uploadAgentProfilePicture, getAgentByBaseMemberId } = useAgents();

    useEffect(() => {
        if (currentAgent) {
            const processedData = processFormData(currentAgent);
            form.setFieldsValue(processedData);
        }
    }, [currentAgent, form]);

    const processFormData = (agentData) => {
        if (!agentData) return {};

        let processedSpecialization = [];
        if (agentData.specialization) {
            if (typeof agentData.specialization === 'string') {
                try {
                    processedSpecialization = JSON.parse(agentData.specialization);
                } catch (e) {
                    processedSpecialization = agentData.specialization.split(',').map(item => item.trim());
                }
            } else if (Array.isArray(agentData.specialization)) {
                processedSpecialization = agentData.specialization;
            }
        }

        let processedLanguages = [];
        if (agentData.languages) {
            if (typeof agentData.languages === 'string') {
                processedLanguages = agentData.languages.split(',').map(lang => lang.trim()).filter(lang => lang !== '');
            } else if (Array.isArray(agentData.languages)) {
                processedLanguages = agentData.languages;
            }
        }

        return {
            ...agentData,
            specialization: processedSpecialization,
            languages: processedLanguages,
            licenseExpiry: agentData.licenseExpiry ? dayjs(agentData.licenseExpiry) : null,
        };
    };

    const handleSave = async (values) => {
        try {
            console.log('📝 Form values:', values);

            const updateData = {
                ...values,
                licenseExpiry: values.licenseExpiry ? values.licenseExpiry.format('YYYY-MM-DD') : null,
            };

            if (Array.isArray(updateData.specialization)) {
                updateData.specialization = JSON.stringify(updateData.specialization);
            }
            if (Array.isArray(updateData.languages)) {
                updateData.languages = updateData.languages.join(', ');
            }

            console.log('📤 Update data:', updateData);

            const result = await updateAgent(currentAgent.id, updateData);
            if (result.success) {
                message.success('Profile updated successfully');
                onSave();
            } else {
                message.error(result.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('❌ Profile update error:', error);
            message.error('Failed to update profile');
        }
    };

    const handleImageUpload = async (file) => {
        setLoadingImage(true);
        try {
            const result = await uploadAgentProfilePicture(baseMemberId, file);
            if (result.success) {
                message.success('Profile picture updated successfully');
                await getAgentByBaseMemberId(baseMemberId);
            } else {
                message.error(result.message || 'Failed to upload image');
            }
        } catch (error) {
            message.error('Failed to upload profile picture');
        } finally {
            setLoadingImage(false);
        }
        return false;
    };

    const uploadProps = {
        beforeUpload: handleImageUpload,
        showUploadList: false,
        accept: 'image/*',
    };

    const processImageUrl = (url) => {
        if (!url || typeof url !== 'string' || url.trim() === '') {
            return null;
        }
        if (url.startsWith('http') || url.startsWith('//') || url.startsWith('blob:')) {
            return url;
        }
        if (url.startsWith('/uploads/')) {
            return `https://localhost:7075${url}`;
        }
        if (url.includes('.') && !url.startsWith('/')) {
            return `https://localhost:7075/uploads/profile-pictures/${url}`;
        }
        if (url.startsWith('uploads/')) {
            return `https://localhost:7075/${url}`;
        }
        return null;
    };

    const getProfilePictureUrl = () => {
        if (currentAgent?.profilePicture) {
            return processImageUrl(currentAgent.profilePicture);
        }
        return null;
    };

    const profilePictureUrl = getProfilePictureUrl();

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Profile Header with Image Upload */}
            <Card>
                <Row gutter={[24, 24]} align="middle">
                    <Col xs={24} sm={8} md={6} style={{ textAlign: 'center' }}>
                        <Space direction="vertical" size="middle">
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                <Avatar
                                    size={120}
                                    src={profilePictureUrl || null}
                                    icon={<UserOutlined />}
                                    style={{ border: '4px solid #f0f0f0' }}
                                />
                                <Upload {...uploadProps}>
                                    <Button
                                        type="primary"
                                        shape="circle"
                                        icon={loadingImage ? <Spin size="small" /> : <CameraOutlined />}
                                        size="small"
                                        style={{
                                            position: 'absolute',
                                            bottom: 8,
                                            right: 8,
                                        }}
                                        disabled={loadingImage}
                                    />
                                </Upload>
                            </div>
                            <div>
                                <h4 style={{ margin: 0 }}>
                                    {currentAgent?.firstName} {currentAgent?.lastName}
                                </h4>
                                <span style={{ color: '#8c8c8c' }}>
                                    {currentAgent?.brokerageName || 'Real Estate Agent'}
                                </span>
                            </div>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Action Buttons */}
            <Card>
                <Space>
                    <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        onClick={() => form.submit()}
                        loading={updating}
                    >
                        Save Changes
                    </Button>
                    <Button
                        icon={<CloseOutlined />}
                        onClick={onCancel}
                        disabled={updating}
                    >
                        Cancel
                    </Button>
                </Space>
            </Card>

            {/* Single Form wrapping all tabs */}
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
                disabled={updating}
            >
                <Tabs
                    defaultActiveKey="basic"
                    activeKey={activeTab}
                    onChange={setActiveTab}
                >
                    <TabPane tab="Basic Information" key="basic">
                        <Card title="Basic Information" bordered={false}>
                            <Row gutter={16}>
                                <Col xs={24} sm={8}>
                                    <Form.Item
                                        name="firstName"
                                        label="First Name"
                                        rules={[{ required: true, message: 'Please enter first name' }]}
                                    >
                                        <Input prefix={<UserOutlined />} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={8}>
                                    <Form.Item
                                        name="middleName"
                                        label="Middle Name"
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={8}>
                                    <Form.Item
                                        name="lastName"
                                        label="Last Name"
                                        rules={[{ required: true, message: 'Please enter last name' }]}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        name="email"
                                        label="Email"
                                        rules={[
                                            { required: true, message: 'Please enter email' },
                                            { type: 'email', message: 'Please enter valid email' }
                                        ]}
                                    >
                                        <Input prefix={<MailOutlined />} disabled />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        name="cellPhoneNo"
                                        label="Phone Number"
                                    >
                                        <Input prefix={<PhoneOutlined />} />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        name="licenseNumber"
                                        label="License Number"
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        name="licenseExpiry"
                                        label="License Expiry"
                                    >
                                        <DatePicker style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                name="bio"
                                label="Bio"
                            >
                                <TextArea rows={4} placeholder="Tell us about yourself..." />
                            </Form.Item>
                        </Card>
                    </TabPane>

                    <TabPane tab="Professional Information" key="professional">
                        <Card title="Professional Information" bordered={false}>
                            <Row gutter={16}>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        name="specialization"
                                        label="Specialization"
                                    >
                                        <Select mode="tags" placeholder="Add specializations">
                                            <Option value="residential">Residential</Option>
                                            <Option value="commercial">Commercial</Option>
                                            <Option value="luxury">Luxury Homes</Option>
                                            <Option value="investment">Investment Properties</Option>
                                            <Option value="rental">Rental Properties</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        name="yearsOfExperience"
                                        label="Years of Experience"
                                    >
                                        <Input type="number" min={0} max={50} />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        name="brokerageName"
                                        label="Brokerage Name"
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        name="officePhone"
                                        label="Office Phone"
                                    >
                                        <Input prefix={<PhoneOutlined />} />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item
                                name="officeAddress"
                                label="Office Address"
                            >
                                <Input prefix={<EnvironmentOutlined />} />
                            </Form.Item>

                            <Form.Item
                                name="website"
                                label="Website"
                            >
                                <Input prefix={<GlobalOutlined />} placeholder="https://..." />
                            </Form.Item>

                            <Form.Item
                                name="languages"
                                label="Languages"
                            >
                                <Select mode="tags" placeholder="Add languages you speak">
                                    <Option value="english">English</Option>
                                    <Option value="spanish">Spanish</Option>
                                    <Option value="french">French</Option>
                                    <Option value="mandarin">Mandarin</Option>
                                    <Option value="cantonese">Cantonese</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="education"
                                label="Education"
                            >
                                <TextArea rows={3} placeholder="Educational background, certifications, training..." />
                            </Form.Item>

                            <Form.Item
                                name="awards"
                                label="Awards & Recognition"
                            >
                                <TextArea rows={3} placeholder="Awards, honors, and professional recognition..." />
                            </Form.Item>

                            <Form.Item
                                name="experience"
                                label="Professional Experience"
                            >
                                <TextArea rows={4} placeholder="Describe your professional experience and background..." />
                            </Form.Item>
                        </Card>
                    </TabPane>
                </Tabs>
            </Form>
        </Space>
    );
};

export default AgentProfileEdit;