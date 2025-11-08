// ViewAgent.jsx
import React from 'react';
import {
    Card,
    Button,
    Space,
    Descriptions,
    Tag,
    Avatar,
    Row,
    Col,
    Divider,
    Typography,
    Statistic,
    Badge
} from 'antd';
import {
    ArrowLeftOutlined,
    EditOutlined,
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    IdcardOutlined,
    CheckOutlined,
    CloseOutlined,
    StarOutlined,
    TrophyOutlined,
    ReadOutlined,
    GlobalOutlined,
    ShopOutlined,
    CalendarOutlined,
    EnvironmentOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { Title, Text } = Typography;

const ViewAgent = ({ agent, onEdit, onBack }) => {
    if (!agent) {
        return (
            <Card>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Title level={4} type="secondary">
                        No agent data available
                    </Title>
                    <Button onClick={onBack} icon={<ArrowLeftOutlined />}>
                        Back to Agents
                    </Button>
                </div>
            </Card>
        );
    }

    const getExperienceLevel = (years) => {
        if (years <= 2) return { level: 'Beginner', color: 'blue' };
        if (years <= 5) return { level: 'Intermediate', color: 'green' };
        if (years <= 10) return { level: 'Experienced', color: 'orange' };
        return { level: 'Expert', color: 'red' };
    };

    const experienceInfo = getExperienceLevel(agent.yearsOfExperience || 0);

    return (
        <div>


            <Row gutter={[24, 24]}>
                {/* Left Column - Profile & Basic Info */}
                <Col xs={24} lg={8}>
                    {/* Profile Overview Card */}
                    <Card
                        style={{ marginBottom: 24 }}
                        bodyStyle={{ padding: '24px' }}
                    >
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <Badge
                                count={agent.isVerified ? "Verified" : "Unverified"}
                                style={{
                                    backgroundColor: agent.isVerified ? '#52c41a' : '#faad14',
                                    fontSize: '12px'
                                }}
                                offset={[-10, 80]}
                            >
                                <Avatar
                                    src={agent.profilePictureUrl}
                                    size={120}
                                    icon={<UserOutlined />}
                                    style={{
                                        border: '4px solid #f0f0f0',
                                        marginBottom: 16
                                    }}
                                />
                            </Badge>
                            <Title level={3} style={{ margin: '16px 0 8px 0' }}>
                                {agent.firstName} {agent.middleName} {agent.lastName} {agent.suffix}
                            </Title>
                            <Text type="secondary" style={{ fontSize: '16px' }}>
                                Real Estate Agent
                            </Text>
                        </div>

                        <Divider />

                        <Space direction="vertical" style={{ width: '100%' }} size="middle">
                            <div>
                                <Text strong style={{ display: 'block', marginBottom: 8 }}>Contact Information</Text>
                                <Space direction="vertical" style={{ width: '100%' }} size="small">
                                    <Space>
                                        <MailOutlined style={{ color: '#1890ff' }} />
                                        <Text>{agent.email}</Text>
                                    </Space>
                                    <Space>
                                        <PhoneOutlined style={{ color: '#52c41a' }} />
                                        <Text>{agent.cellPhoneNo || 'Not provided'}</Text>
                                    </Space>
                                    {agent.website && (
                                        <Space>
                                            <GlobalOutlined style={{ color: '#722ed1' }} />
                                            <a href={agent.website} target="_blank" rel="noopener noreferrer">
                                                Visit Website
                                            </a>
                                        </Space>
                                    )}
                                </Space>
                            </div>

                            <div>
                                <Text strong style={{ display: 'block', marginBottom: 8 }}>Professional Stats</Text>
                                <Row gutter={[16, 16]}>
                                    <Col span={12}>
                                        <Statistic
                                            title="Experience"
                                            value={agent.yearsOfExperience || 0}
                                            suffix="years"
                                            valueStyle={{ color: '#1890ff', fontSize: '20px' }}
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <div style={{ textAlign: 'center' }}>
                                            <Text strong style={{ display: 'block', color: experienceInfo.color }}>
                                                {experienceInfo.level}
                                            </Text>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>Level</Text>
                                        </div>
                                    </Col>
                                </Row>
                            </div>

                            <div>
                                <Text strong style={{ display: 'block', marginBottom: 8 }}>Registration</Text>
                                <Space direction="vertical" size={2}>
                                    <Text>
                                        <CalendarOutlined style={{ marginRight: 8 }} />
                                        {agent.dateRegistered ?
                                            new Date(agent.dateRegistered).toLocaleDateString() : 'Not set'
                                        }
                                    </Text>
                                    {agent.dateRegistered && (
                                        <Text type="secondary" style={{ fontSize: '12px', marginLeft: '24px' }}>
                                            {moment(agent.dateRegistered).fromNow()}
                                        </Text>
                                    )}
                                </Space>
                            </div>
                        </Space>
                    </Card>

                    {/* Brokerage Information */}
                    <Card
                        title={
                            <Space>
                                <ShopOutlined />
                                Brokerage
                            </Space>
                        }
                    >
                        {agent.brokerageName ? (
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Text strong style={{ fontSize: '16px' }}>{agent.brokerageName}</Text>
                                {agent.officeAddress && (
                                    <Space>
                                        <EnvironmentOutlined />
                                        <Text type="secondary">{agent.officeAddress}</Text>
                                    </Space>
                                )}
                                {agent.officePhone && (
                                    <Space>
                                        <PhoneOutlined />
                                        <Text>{agent.officePhone}</Text>
                                    </Space>
                                )}
                            </Space>
                        ) : (
                            <Text type="secondary">No brokerage information</Text>
                        )}
                    </Card>
                </Col>

                {/* Right Column - Professional Details */}
                <Col xs={24} lg={16}>
                    <Row gutter={[24, 24]}>
                        {/* License & Specialization */}
                        <Col span={24}>
                            <Card
                                title={
                                    <Space>
                                        <IdcardOutlined />
                                        License & Qualifications
                                    </Space>
                                }
                            >
                                <Row gutter={[24, 16]}>
                                    <Col xs={24} md={12}>
                                        <Text strong style={{ display: 'block', marginBottom: 8 }}>License Number</Text>
                                        <Text>{agent.licenseNumber || 'Not provided'}</Text>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Text strong style={{ display: 'block', marginBottom: 8 }}>License Expiry</Text>
                                        {agent.licenseExpiry ? (
                                            <Space direction="vertical" size={2}>
                                                <Text>{moment(agent.licenseExpiry).format('MMM DD, YYYY')}</Text>
                                                <Tag
                                                    color={moment(agent.licenseExpiry).isBefore(moment()) ? 'red' : 'green'}
                                                    style={{ fontSize: '12px' }}
                                                >
                                                    {moment(agent.licenseExpiry).isBefore(moment()) ? 'Expired' : 'Active'}
                                                </Tag>
                                            </Space>
                                        ) : (
                                            <Text type="secondary">Not set</Text>
                                        )}
                                    </Col>
                                </Row>
                            </Card>
                        </Col>

                        {/* Specialization & Languages */}
                        <Col xs={24} lg={12}>
                            <Card title="Areas of Specialization">
                                {agent.specialization && agent.specialization.length > 0 ? (
                                    <Space wrap>
                                        {agent.specialization.map((spec, index) => (
                                            <Tag
                                                key={index}
                                                color="blue"
                                                style={{
                                                    fontSize: '12px',
                                                    padding: '4px 8px',
                                                    marginBottom: '8px'
                                                }}
                                            >
                                                {spec}
                                            </Tag>
                                        ))}
                                    </Space>
                                ) : (
                                    <Text type="secondary">No specializations specified</Text>
                                )}
                            </Card>
                        </Col>

                        <Col xs={24} lg={12}>
                            <Card title="Languages Spoken">
                                {agent.languages && agent.languages.length > 0 ? (
                                    <Space wrap>
                                        {agent.languages.map((lang, index) => (
                                            <Tag
                                                key={index}
                                                color="green"
                                                style={{
                                                    fontSize: '12px',
                                                    padding: '4px 8px',
                                                    marginBottom: '8px'
                                                }}
                                            >
                                                {lang}
                                            </Tag>
                                        ))}
                                    </Space>
                                ) : (
                                    <Text type="secondary">No languages specified</Text>
                                )}
                            </Card>
                        </Col>

                        {/* Experience Summary */}
                        {agent.experience && (
                            <Col span={24}>
                                <Card title="Professional Experience Summary">
                                    <Text style={{ lineHeight: '1.6' }}>{agent.experience}</Text>
                                </Card>
                            </Col>
                        )}

                        {/* Education & Certifications */}
                        {agent.education && (
                            <Col span={24}>
                                <Card
                                    title={
                                        <Space>
                                            <ReadOutlined />
                                            Education & Certifications
                                        </Space>
                                    }
                                >
                                    <Text style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                        {agent.education}
                                    </Text>
                                </Card>
                            </Col>
                        )}

                        {/* Awards & Recognition */}
                        {agent.awards && (
                            <Col span={24}>
                                <Card
                                    title={
                                        <Space>
                                            <TrophyOutlined />
                                            Awards & Recognition
                                        </Space>
                                    }
                                >
                                    <Text style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                        {agent.awards}
                                    </Text>
                                </Card>
                            </Col>
                        )}

                        {/* Professional Bio */}
                        {agent.bio && (
                            <Col span={24}>
                                <Card title="Professional Biography">
                                    <Text style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                        {agent.bio}
                                    </Text>
                                </Card>
                            </Col>
                        )}
                    </Row>
                </Col>
            </Row>

   
        </div>
    );
};

export default ViewAgent;