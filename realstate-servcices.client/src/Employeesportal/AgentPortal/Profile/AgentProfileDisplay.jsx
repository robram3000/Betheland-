// Components/AgentProfile/AgentProfileDisplay.jsx
import React from 'react';
import {
    Card,
    Descriptions,
    Tag,
    Avatar,
    Row,
    Col,
    Space,
    Typography,
    Divider,
    Button
} from 'antd';
import {
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    GlobalOutlined,
    TrophyOutlined,
    SafetyCertificateOutlined,
    EditOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const AgentProfileDisplay = ({ currentAgent, onEdit }) => {
    const processFormData = (agentData) => {
        if (!agentData) return { specialization: [], languages: [] };

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
            languages: processedLanguages
        };
    };

    const getStatusTag = (status) => {
        const statusConfig = {
            active: { color: 'green', text: 'Active' },
            inactive: { color: 'red', text: 'Inactive' },
            pending: { color: 'orange', text: 'Pending' },
            suspended: { color: 'volcano', text: 'Suspended' }
        };
        const config = statusConfig[status?.toLowerCase()] || statusConfig.inactive;
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const getVerificationTag = (isVerified) => {
        return isVerified ? (
            <Tag icon={<SafetyCertificateOutlined />} color="blue">Verified</Tag>
        ) : (
            <Tag color="orange">Not Verified</Tag>
        );
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

    const processedData = processFormData(currentAgent);
    const profilePictureUrl = getProfilePictureUrl();

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Profile Header */}
            <Card>
                <Row gutter={[24, 24]} align="middle">
                    <Col xs={24} sm={8} md={6} style={{ textAlign: 'center' }}>
                        <Space direction="vertical" size="middle">
                            <Avatar
                                size={120}
                                src={profilePictureUrl || null}
                                icon={<UserOutlined />}
                                style={{ border: '4px solid #f0f0f0' }}
                            />
                            <div>
                                <Title level={4} style={{ margin: 0 }}>
                                    {currentAgent?.firstName} {currentAgent?.lastName}
                                </Title>
                                <Text type="secondary">{currentAgent?.brokerageName || 'Real Estate Agent'}</Text>
                            </div>
                        </Space>
                    </Col>

                    <Col xs={24} sm={16} md={18}>
                        <Row gutter={[16, 16]}>
                            <Col span={24}>
                                <Space size="middle">
                                    {getStatusTag(currentAgent?.status)}
                                    {getVerificationTag(currentAgent?.isVerified)}
                                    <Tag icon={<TrophyOutlined />}>
                                        {currentAgent?.yearsOfExperience || 0} years experience
                                    </Tag>
                                </Space>
                            </Col>
                            <Col span={24}>
                                <Space direction="vertical" size="small">
                                    <Space>
                                        <MailOutlined />
                                        <Text>{currentAgent?.email}</Text>
                                    </Space>
                                    <Space>
                                        <PhoneOutlined />
                                        <Text>{currentAgent?.cellPhoneNo || 'No phone number'}</Text>
                                    </Space>
                                    {currentAgent?.officeAddress && (
                                        <Space>
                                            <EnvironmentOutlined />
                                            <Text>{currentAgent.officeAddress}</Text>
                                        </Space>
                                    )}
                                </Space>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Card>

            <Divider />

            {/* Profile Details */}
            <Card
                title="Profile Details"
                bordered={false}
                extra={
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={onEdit}
                    >
                        Edit Profile
                    </Button>
                }
            >
                <Descriptions column={2} bordered>
                    <Descriptions.Item label="Full Name" span={2}>
                        {currentAgent?.firstName} {currentAgent?.middleName} {currentAgent?.lastName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">{currentAgent?.email}</Descriptions.Item>
                    <Descriptions.Item label="Phone">{currentAgent?.cellPhoneNo || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="License Number">{currentAgent?.licenseNumber || 'N/A'}</Descriptions.Item>
                    <Descriptions.Item label="License Expiry">
                        {currentAgent?.licenseExpiry ? dayjs(currentAgent.licenseExpiry).format('MMM D, YYYY') : 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Status" span={2}>
                        {getStatusTag(currentAgent?.status)}
                        {getVerificationTag(currentAgent?.isVerified)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Specialization" span={2}>
                        {Array.isArray(processedData.specialization) && processedData.specialization.length > 0 ? (
                            processedData.specialization.map((spec, index) => (
                                <Tag key={index} color="blue">{spec}</Tag>
                            ))
                        ) : (
                            'No specialization specified'
                        )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Years of Experience">
                        {currentAgent?.yearsOfExperience || 0}
                    </Descriptions.Item>
                    <Descriptions.Item label="Brokerage">
                        {currentAgent?.brokerageName || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Office Address" span={2}>
                        {currentAgent?.officeAddress || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Office Phone">
                        {currentAgent?.officePhone || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Website">
                        {currentAgent?.website ? (
                            <a href={currentAgent.website} target="_blank" rel="noopener noreferrer">
                                {currentAgent.website}
                            </a>
                        ) : 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Languages" span={2}>
                        {Array.isArray(processedData.languages) && processedData.languages.length > 0 ? (
                            processedData.languages.map((lang, index) => (
                                <Tag key={index}>{lang}</Tag>
                            ))
                        ) : (
                            'No languages specified'
                        )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Bio" span={2}>
                        {currentAgent?.bio || 'No bio provided'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Education" span={2}>
                        {currentAgent?.education || 'No education information provided'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Awards" span={2}>
                        {currentAgent?.awards || 'No awards specified'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Experience" span={2}>
                        {currentAgent?.experience || 'No experience details provided'}
                    </Descriptions.Item>
                </Descriptions>
            </Card>
        </Space>
    );
};

export default AgentProfileDisplay;