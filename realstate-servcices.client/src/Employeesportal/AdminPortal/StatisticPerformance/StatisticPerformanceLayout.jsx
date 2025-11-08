// StatisticPerformanceLayout.jsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import {
    Layout,
    theme,
    ConfigProvider,
    Tabs,
    Card,
    Space,
    Typography,
    Button,
    Row,
    Col,
    Select,
    DatePicker,
    Badge,
    Avatar,
    Table,
    Progress,
    List,
    Statistic,
    Tag,
    message
} from 'antd';
import {
    ArrowUpOutlined,
    ArrowDownOutlined,
    EyeOutlined,
    MessageOutlined,
    CalendarOutlined,
    StarOutlined,
    UserOutlined,
    DownloadOutlined,
    FilterOutlined,
    HomeOutlined,
    BankOutlined,
    ShopOutlined,
    EnvironmentOutlined,
    PhoneOutlined,
    BarChartOutlined,
    TrophyOutlined,
    TeamOutlined,
    // Replace ActivityOutlined with available icons
    LineChartOutlined,
    DashboardOutlined,
    RiseOutlined
} from '@ant-design/icons';
import GlobalAdminNavigation from '../Navigation/GlobalAdminNavigation';
import GlobalAdminTopbar from '../Navigation/GlobalAdminTopbar';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

const StatisticPerformanceLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState([]);
    const [selectedAgent, setSelectedAgent] = useState('all');
    const [timeFrame, setTimeFrame] = useState('monthly');

    const { token: { colorBgContainer, borderRadiusLG, colorPrimary, colorSuccess, colorWarning, colorError } } = theme.useToken();

    // Statistics data - same as before
    const [statsData, setStatsData] = useState({
        overview: {
            totalLeads: 156,
            convertedLeads: 42,
            conversionRate: 26.9,
            responseTime: '1.8h',
            avgRating: 4.8,
            activeListings: 28,
            closedDeals: 19,
            totalRevenue: 85600000,
            avgCommission: 3.2
        },
        propertyTypes: {
            residential: 65,
            commercial: 22,
            condominium: 45,
            lot: 18
        },
        locationPerformance: [
            { location: 'Metro Manila', leads: 89, conversions: 25, revenue: 45200000 },
            { location: 'Cebu', leads: 34, conversions: 9, revenue: 18500000 },
            { location: 'Davao', leads: 18, conversions: 5, revenue: 9800000 },
            { location: 'Clark', leads: 15, conversions: 3, revenue: 12100000 }
        ],
        performanceMetrics: {
            leadResponseRate: 94,
            showingsCompleted: 67,
            contractsSigned: 38,
            clientSatisfaction: 96,
            listingViews: 1245,
            inquiryCalls: 234
        },
        recentActivities: [
            {
                id: 1,
                agent: 'Maria Santos',
                action: 'New Condo Lead',
                property: '2-BR Condo in BGC, Taguig',
                price: '₱8.5M',
                time: '2 hours ago',
                status: 'new',
                type: 'condominium'
            },
            {
                id: 2,
                agent: 'Juan Dela Cruz',
                action: 'House Listing Live',
                property: '3-BR House in Quezon City',
                price: '₱12.2M',
                time: '4 hours ago',
                status: 'completed',
                type: 'residential'
            },
            {
                id: 3,
                agent: 'Ana Reyes',
                action: 'Commercial Deal Closed',
                property: 'Office Space in Makati',
                price: '₱25.7M',
                time: '1 day ago',
                status: 'success',
                type: 'commercial'
            },
            {
                id: 4,
                agent: 'Carlos Lim',
                action: 'Lot Reservation',
                property: '500sqm Lot in Cavite',
                price: '₱3.8M',
                time: '2 days ago',
                status: 'pending',
                type: 'lot'
            }
        ],
        leaderboard: [
            {
                rank: 1,
                name: 'Maria Santos',
                leads: 38,
                conversions: 12,
                rate: '31.6%',
                revenue: 24500000,
                closedDeals: 8,
                trend: 'up',
                specialization: 'Condominium'
            },
            {
                rank: 2,
                name: 'Juan Dela Cruz',
                leads: 42,
                conversions: 11,
                rate: '26.2%',
                revenue: 18700000,
                closedDeals: 7,
                trend: 'up',
                specialization: 'Residential'
            },
            {
                rank: 3,
                name: 'Ana Reyes',
                leads: 35,
                conversions: 9,
                rate: '25.7%',
                revenue: 15600000,
                closedDeals: 6,
                trend: 'stable',
                specialization: 'Commercial'
            },
            {
                rank: 4,
                name: 'Carlos Lim',
                leads: 41,
                conversions: 10,
                rate: '24.4%',
                revenue: 14200000,
                closedDeals: 5,
                trend: 'down',
                specialization: 'Lots'
            }
        ]
    });

    const philippineAgents = [
        { id: 'all', name: 'All Agents', city: 'Nationwide' },
        { id: '1', name: 'Maria Santos', city: 'Metro Manila', specialization: 'Condominium' },
        { id: '2', name: 'Juan Dela Cruz', city: 'Quezon City', specialization: 'Residential' },
        { id: '3', name: 'Ana Reyes', city: 'Makati', specialization: 'Commercial' },
        { id: '4', name: 'Carlos Lim', city: 'Cavite', specialization: 'Lots' },
        { id: '5', name: 'Elena Torres', city: 'Cebu', specialization: 'Beach Properties' }
    ];

    const propertyTypeIcons = {
        residential: <HomeOutlined style={{ color: colorPrimary }} />,
        commercial: <BankOutlined style={{ color: colorWarning }} />,
        condominium: <ShopOutlined style={{ color: colorSuccess }} />,
        lot: <EnvironmentOutlined style={{ color: colorError }} />
    };

    const overviewStats = [
        {
            title: 'Total Leads',
            value: statsData.overview.totalLeads,
            precision: 0,
            valueStyle: { color: colorPrimary },
            prefix: <UserOutlined />,
            suffix: null
        },
        {
            title: 'Conversion Rate',
            value: statsData.overview.conversionRate,
            precision: 1,
            valueStyle: { color: colorSuccess },
            prefix: statsData.overview.conversionRate > 25 ? <ArrowUpOutlined /> : <ArrowDownOutlined />,
            suffix: '%'
        },
        {
            title: 'Avg Response Time',
            value: statsData.overview.responseTime,
            valueStyle: { color: colorWarning },
            prefix: <PhoneOutlined />
        },
        {
            title: 'Total Revenue',
            value: statsData.overview.totalRevenue / 1000000,
            precision: 1,
            valueStyle: { color: '#52c41a' },
            prefix: '₱',
            suffix: 'M'
        }
    ];

    const performanceCards = [
        {
            title: 'Lead Response Rate',
            value: statsData.performanceMetrics.leadResponseRate,
            suffix: '%',
            color: colorSuccess,
            icon: <MessageOutlined />
        },
        {
            title: 'Client Satisfaction',
            value: statsData.performanceMetrics.clientSatisfaction,
            suffix: '%',
            color: colorPrimary,
            icon: <StarOutlined />
        },
        {
            title: 'Property Showings',
            value: statsData.performanceMetrics.showingsCompleted,
            color: colorWarning,
            icon: <EyeOutlined />
        },
        {
            title: 'Inquiry Calls',
            value: statsData.performanceMetrics.inquiryCalls,
            color: '#722ed1',
            icon: <PhoneOutlined />
        }
    ];

    const locationColumns = [
        {
            title: 'Location',
            dataIndex: 'location',
            key: 'location',
            render: (location) => (
                <Space>
                    <EnvironmentOutlined />
                    {location}
                </Space>
            )
        },
        {
            title: 'Leads',
            dataIndex: 'leads',
            key: 'leads',
            sorter: (a, b) => a.leads - b.leads
        },
        {
            title: 'Conversions',
            dataIndex: 'conversions',
            key: 'conversions',
            sorter: (a, b) => a.conversions - b.conversions
        },
        {
            title: 'Revenue (₱)',
            dataIndex: 'revenue',
            key: 'revenue',
            render: (revenue) => `₱${(revenue / 1000000).toFixed(1)}M`,
            sorter: (a, b) => a.revenue - b.revenue
        },
        {
            title: 'Conversion Rate',
            key: 'rate',
            render: (_, record) => `${((record.conversions / record.leads) * 100).toFixed(1)}%`
        }
    ];

    const leaderboardColumns = [
        {
            title: 'Rank',
            dataIndex: 'rank',
            key: 'rank',
            render: (rank) => (
                <Badge
                    count={rank}
                    style={{
                        backgroundColor: rank === 1 ? '#ffd666' : rank === 2 ? '#d9d9d9' : rank === 3 ? '#ff9c6e' : '#f0f0f0',
                        color: rank <= 3 ? '#000' : '#999'
                    }}
                />
            )
        },
        {
            title: 'Agent',
            dataIndex: 'name',
            key: 'name',
            render: (name, record) => (
                <Space>
                    <Avatar size="small" style={{ backgroundColor: colorPrimary }}>
                        {name.split(' ').map(n => n[0]).join('')}
                    </Avatar>
                    <div>
                        <div style={{ fontWeight: 500 }}>{name}</div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>{record.specialization}</Text>
                    </div>
                </Space>
            )
        },
        {
            title: 'Leads',
            dataIndex: 'leads',
            key: 'leads',
            sorter: (a, b) => a.leads - b.leads
        },
        {
            title: 'Conversion Rate',
            dataIndex: 'rate',
            key: 'rate',
            sorter: (a, b) => parseFloat(a.rate) - parseFloat(b.rate)
        },
        {
            title: 'Revenue (₱)',
            dataIndex: 'revenue',
            key: 'revenue',
            render: (revenue) => `₱${(revenue / 1000000).toFixed(1)}M`,
            sorter: (a, b) => a.revenue - b.revenue
        },
        {
            title: 'Trend',
            dataIndex: 'trend',
            key: 'trend',
            render: (trend) => (
                trend === 'up' ? <ArrowUpOutlined style={{ color: colorSuccess }} /> :
                    trend === 'down' ? <ArrowDownOutlined style={{ color: colorError }} /> :
                        <span style={{ color: colorWarning }}>→</span>
            )
        }
    ];

    const handleToggle = () => {
        setCollapsed(!collapsed);
    };

    const handleTabChange = (key) => {
        setActiveTab(key);
    };

    const handleExportReport = () => {
        message.success('Exporting performance report...');
    };

    const handleDateChange = (dates) => {
        setDateRange(dates);
    };

    const getSeoData = () => {
        const baseTitle = "Betheland Performance Dashboard";
        const baseDescription = "Monitor and analyze agent performance metrics";
        const baseUrl = window.location.origin;

        return {
            title: `Performance Dashboard | ${baseTitle}`,
            description: baseDescription,
            keywords: "performance metrics, agent statistics, real estate analytics, Betheland",
            canonical: `${baseUrl}/performance`,
            ogImage: `${baseUrl}/images/performance-og.jpg`
        };
    };

    const seoData = getSeoData();

    // Updated tab items with available icons
    const tabItems = [
        {
            key: 'overview',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BarChartOutlined />
                    Overview
                </span>
            ),
        },
        {
            key: 'leaderboard',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrophyOutlined />
                    Leaderboard
                </span>
            ),
        },
        {
            key: 'analytics',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <LineChartOutlined />
                    Analytics
                </span>
            ),
        },
    ];

    const StatisticsContent = () => (
        <div style={{ padding: '0' }}>
            {/* Header Section */}
            <div style={{ marginBottom: 24 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <Title level={2} style={{ margin: 0, color: colorPrimary }}>
                                Agent Performance Dashboard
                            </Title>
                            <Text type="secondary">
                                Monitor and analyze agent performance across the Philippines
                            </Text>
                        </div>
                        <Space>
                            <Button icon={<DownloadOutlined />} onClick={handleExportReport}>
                                Export Report
                            </Button>
                        </Space>
                    </div>

                    {/* Filters */}
                    <Card size="small" style={{ background: 'rgba(0,0,0,0.02)' }}>
                        <Space wrap>
                            <FilterOutlined />
                            <Text strong>Filters:</Text>
                            <Select
                                value={selectedAgent}
                                onChange={setSelectedAgent}
                                style={{ width: 200 }}
                                placeholder="Select Agent"
                            >
                                {philippineAgents.map(agent => (
                                    <Option key={agent.id} value={agent.id}>
                                        {agent.name} {agent.city && `- ${agent.city}`}
                                    </Option>
                                ))}
                            </Select>
                            <RangePicker onChange={handleDateChange} />
                            <Select
                                value={timeFrame}
                                onChange={setTimeFrame}
                                style={{ width: 120 }}
                            >
                                <Option value="weekly">Weekly</Option>
                                <Option value="monthly">Monthly</Option>
                                <Option value="quarterly">Quarterly</Option>
                            </Select>
                        </Space>
                    </Card>
                </Space>
            </div>

            {/* Overview Statistics */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                {overviewStats.map((stat, index) => (
                    <Col xs={24} sm={12} lg={6} key={index}>
                        <Card>
                            <Statistic
                                title={stat.title}
                                value={stat.value}
                                precision={stat.precision}
                                valueStyle={stat.valueStyle}
                                prefix={stat.prefix}
                                suffix={stat.suffix}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            <Tabs defaultActiveKey="performance">
                <TabPane tab="Performance Metrics" key="performance">
                    <Row gutter={[16, 16]}>
                        {/* Performance Indicators */}
                        <Col xs={24} lg={12}>
                            <Card title="Performance Indicators" extra={<CalendarOutlined />}>
                                <Row gutter={[16, 16]}>
                                    {performanceCards.map((card, index) => (
                                        <Col xs={12} key={index}>
                                            <Card size="small">
                                                <Space direction="vertical" style={{ width: '100%', textAlign: 'center' }}>
                                                    <div style={{ fontSize: '24px', color: card.color }}>
                                                        {card.icon}
                                                    </div>
                                                    <Statistic
                                                        title={card.title}
                                                        value={card.value}
                                                        suffix={card.suffix}
                                                        valueStyle={{ color: card.color, fontSize: '20px' }}
                                                    />
                                                    <Progress
                                                        percent={card.value}
                                                        showInfo={false}
                                                        strokeColor={card.color}
                                                    />
                                                </Space>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </Card>
                        </Col>

                        {/* Property Type Distribution */}
                        <Col xs={24} lg={12}>
                            <Card title="Property Type Distribution">
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    {Object.entries(statsData.propertyTypes).map(([type, count]) => (
                                        <div key={type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                            <Space>
                                                {propertyTypeIcons[type]}
                                                <Text style={{ textTransform: 'capitalize' }}>{type}</Text>
                                            </Space>
                                            <div>
                                                <Text strong>{count}</Text>
                                                <Text type="secondary" style={{ marginLeft: 8 }}>
                                                    {((count / Object.values(statsData.propertyTypes).reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%
                                                </Text>
                                            </div>
                                        </div>
                                    ))}
                                </Space>
                            </Card>
                        </Col>

                        {/* Location Performance */}
                        <Col xs={24}>
                            <Card title="Performance by Location (Philippines)">
                                <Table
                                    dataSource={statsData.locationPerformance}
                                    columns={locationColumns}
                                    pagination={false}
                                    size="small"
                                />
                            </Card>
                        </Col>
                    </Row>
                </TabPane>

                <TabPane tab="Agent Leaderboard" key="leaderboard">
                    <Card>
                        <Table
                            dataSource={statsData.leaderboard}
                            columns={leaderboardColumns}
                            pagination={false}
                        />
                    </Card>
                </TabPane>

                <TabPane tab="Recent Activities" key="activities">
                    <Card>
                        <List
                            dataSource={statsData.recentActivities}
                            renderItem={(item) => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={
                                            <Avatar style={{
                                                backgroundColor:
                                                    item.status === 'new' ? colorPrimary :
                                                        item.status === 'completed' ? colorSuccess :
                                                            item.status === 'success' ? '#52c41a' : colorWarning
                                            }}>
                                                {item.agent.split(' ').map(n => n[0]).join('')}
                                            </Avatar>
                                        }
                                        title={
                                            <Space>
                                                <Text strong>{item.agent}</Text>
                                                <Tag color={
                                                    item.type === 'condominium' ? 'blue' :
                                                        item.type === 'residential' ? 'green' :
                                                            item.type === 'commercial' ? 'orange' : 'purple'
                                                }>
                                                    {item.type}
                                                </Tag>
                                            </Space>
                                        }
                                        description={
                                            <Space direction="vertical" size={0}>
                                                <Text>{item.action} - {item.property}</Text>
                                                <Space>
                                                    <Text strong style={{ color: colorPrimary }}>{item.price}</Text>
                                                    <Text type="secondary">{item.time}</Text>
                                                </Space>
                                            </Space>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </TabPane>
            </Tabs>
        </div>
    );

    return (
        <ConfigProvider
            theme={{
                token: {
                    borderRadius: 8,
                    colorPrimary: '#1a365d',
                    colorInfo: '#1a365d',
                    colorSuccess: '#1a365d',
                },
                components: {
                    Tabs: {
                        itemSelectedColor: '#1a365d',
                        itemActiveColor: '#1a365d',
                        horizontalItemPadding: '12px 16px',
                    },
                    Layout: {
                        siderBg: '#f8f9fa',
                    }
                },
            }}
        >
            <Helmet>
                <title>{seoData.title}</title>
                <meta name="description" content={seoData.description} />
                <meta name="keywords" content={seoData.keywords} />
                <meta property="og:title" content={seoData.title} />
                <meta property="og:description" content={seoData.description} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={seoData.canonical} />
                <meta property="og:image" content={seoData.ogImage} />
                <meta property="og:site_name" content="Betheland Performance Dashboard" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={seoData.title} />
                <meta name="twitter:description" content={seoData.description} />
                <meta name="twitter:image" content={seoData.ogImage} />
                <meta name="robots" content="noindex, nofollow" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta name="theme-color" content="#1a365d" />
                <link rel="canonical" href={seoData.canonical} />
            </Helmet>

            <Layout style={{ minHeight: '100vh' }}>
                <GlobalAdminTopbar onToggle={handleToggle} collapsed={collapsed} />
                <Layout>
                    <GlobalAdminNavigation collapsed={collapsed} />
                    <Layout
                        style={{
                            marginLeft: collapsed ? 80 : 200,
                            marginTop: 52,
                            transition: 'all 0.2s',
                        }}
                    >
                        <Layout>
                            {/* Vertical Tabs Sidebar */}
                            <Sider
                                width={220}
                                style={{
                                    background: colorBgContainer,
                                    borderRadius: borderRadiusLG,
                                    boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
                                    borderRight: '1px solid #f0f0f0'
                                }}
                            >
                                <div style={{ padding: '20px 0' }}>
                                    {/* Performance Control Header */}
                                    <div style={{
                                        padding: '0 16px 16px 16px',
                                        borderBottom: '1px solid #f0f0f0',
                                        marginBottom: '8px'
                                    }}>
                                        <Title
                                            level={4}
                                            style={{
                                                margin: 0,
                                                color: '#1a365d',
                                                fontSize: '16px',
                                                fontWeight: 600
                                            }}
                                        >
                                            Performance Dashboard
                                        </Title>
                                        <Text style={{
                                            margin: '4px 0 0 0',
                                            color: '#666',
                                            fontSize: '12px',
                                            lineHeight: 1.4,
                                            display: 'block'
                                        }}>
                                            Monitor agent performance and analytics
                                        </Text>
                                    </div>

                                    <Tabs
                                        activeKey={activeTab}
                                        onChange={handleTabChange}
                                        tabPosition="left"
                                        type="line"
                                        size="middle"
                                        style={{ width: '100%' }}
                                        tabBarStyle={{ border: 'none', width: '100%' }}
                                        items={tabItems}
                                    />
                                </div>
                            </Sider>

                            {/* Main Content Area */}
                            <Content
                                style={{
                                    background: colorBgContainer,
                                    margin: '16px 16px 16px 0',
                                    minHeight: 280,
                                    borderRadius: borderRadiusLG,
                                    overflow: 'hidden',
                                    padding: '24px'
                                }}
                            >
                                {/* Header Section */}
                                <div style={{ marginBottom: 24 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div>
                                            <h1 style={{
                                                margin: 0,
                                                color: '#1a365d',
                                                fontSize: '24px',
                                                fontWeight: 600
                                            }}>
                                                {activeTab === 'overview' ? 'Performance Overview' :
                                                    activeTab === 'leaderboard' ? 'Agent Leaderboard' :
                                                        'Advanced Analytics'}
                                            </h1>
                                            <p style={{
                                                margin: '6px 0 0 0',
                                                color: '#666',
                                                fontSize: '14px'
                                            }}>
                                                {activeTab === 'overview'
                                                    ? 'Real-time performance metrics and key indicators'
                                                    : activeTab === 'leaderboard'
                                                        ? 'Top performing agents and rankings'
                                                        : 'Detailed analytics and insights'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Statistics Content */}
                                <StatisticsContent />
                            </Content>
                        </Layout>
                    </Layout>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
};

export default StatisticPerformanceLayout;