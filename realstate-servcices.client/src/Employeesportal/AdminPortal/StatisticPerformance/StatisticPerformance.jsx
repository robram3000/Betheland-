// AgentStatistics.jsx - Philippines Real Estate Focus
import React, { useState, useEffect } from 'react';
import {
    Card,
    Row,
    Col,
    Statistic,
    Table,
    DatePicker,
    Select,
    Progress,
    Tag,
    Space,
    Button,
    Typography,
    Divider,
    List,
    Avatar,
    Tooltip,
    Badge,
    theme,
    Tabs,
    Timeline,
    Rate
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
    PhoneOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

const AgentStatistics = () => {
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState([]);
    const [selectedAgent, setSelectedAgent] = useState('all');
    const [timeFrame, setTimeFrame] = useState('monthly');
    const { token: { colorPrimary, colorSuccess, colorWarning, colorError } } = theme.useToken();
    const navigate = useNavigate();

    // Philippines-specific real estate data
    const [statsData, setStatsData] = useState({
        overview: {
            totalLeads: 156,
            convertedLeads: 42,
            conversionRate: 26.9,
            responseTime: '1.8h',
            avgRating: 4.8,
            activeListings: 28,
            closedDeals: 19,
            totalRevenue: 85600000, // in PHP
            avgCommission: 3.2 // percentage
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

    const handleExportReport = () => {
        // Implement export functionality
        console.log('Exporting report...');
    };

    const handleDateChange = (dates) => {
        setDateRange(dates);
        // Fetch new data based on date range
    };

    return (
        <div style={{ padding: '24px' }}>
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
                            onRow={(record) => ({
                                onClick: () => {
                                    // Navigate to agent details
                                    console.log('View agent:', record.name);
                                }
                            })}
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
                                                        item.type === 'residential' : 'green' :
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
        </div >
    );
};

export default AgentStatistics;