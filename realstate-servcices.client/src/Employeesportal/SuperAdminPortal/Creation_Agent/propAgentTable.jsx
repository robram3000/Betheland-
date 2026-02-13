// PropAgentTable.jsx - Mobile Optimized
import React, { useState, useEffect } from 'react';
import {
    Table,
    Card,
    Select,
    Input,
    Space,
    Tag,
    Avatar,
    Tooltip,
    Button,
    Grid
} from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import BaseTable from './BaseTable';
import propertyService from '../../AdminPortal/Creation_Agent/Services/agentService';

const { Option } = Select;
const { Search } = Input;
const { useBreakpoint } = Grid;

const PropAgentTable = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [agentFilter, setAgentFilter] = useState('all');
    const [agents, setAgents] = useState([]);

    const screens = useBreakpoint();
    const isMobile = !screens.md;

    useEffect(() => {
        loadProperties();
        loadAgents();
    }, []);

    const loadProperties = async () => {
        setLoading(true);
        try {
            const data = await propertyService.getAgentProperties();
            setProperties(data);
        } catch (error) {
            console.error('Error loading properties:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadAgents = async () => {
        try {
            const data = await propertyService.getAgents();
            setAgents(data);
        } catch (error) {
            console.error('Error loading agents:', error);
        }
    };

    const filteredProperties = properties.filter(property => {
        const matchesSearch = property.title?.toLowerCase().includes(searchText.toLowerCase()) ||
            property.address?.toLowerCase().includes(searchText.toLowerCase()) ||
            property.agentName?.toLowerCase().includes(searchText.toLowerCase());

        const matchesAgent = agentFilter === 'all' || property.agentId == agentFilter;

        return matchesSearch && matchesAgent;
    });

    const columns = [
        {
            title: 'Property',
            dataIndex: 'title',
            key: 'property',
            width: isMobile ? 150 : 200,
            fixed: 'left',
            render: (text, record) => (
                <Space direction={isMobile ? "vertical" : "horizontal"} size={isMobile ? 2 : 8}>
                    <Avatar
                        src={record.images?.[0]}
                        shape="square"
                        size={isMobile ? "small" : "default"}
                        style={{ backgroundColor: '#1a365d' }}
                    >
                        {text?.[0]}
                    </Avatar>
                    <div>
                        <div style={{
                            fontWeight: 500,
                            fontSize: isMobile ? '12px' : '14px',
                            lineHeight: isMobile ? '1.2' : '1.4'
                        }}>
                            {text}
                        </div>
                        <div style={{
                            fontSize: isMobile ? '10px' : '12px',
                            color: '#666',
                            lineHeight: isMobile ? '1.2' : '1.4'
                        }}>
                            {record.address}
                        </div>
                    </div>
                </Space>
            ),
        },
        ...(isMobile ? [] : [
            {
                title: 'Agent',
                dataIndex: 'agentName',
                key: 'agentName',
                width: 120,
                render: (text, record) => (
                    <Space>
                        <Avatar size="small" src={record.agentPhoto}>
                            {record.agentName?.[0]}
                        </Avatar>
                        {text}
                    </Space>
                ),
            }
        ]),
        {
            title: 'Type',
            dataIndex: 'propertyType',
            key: 'propertyType',
            width: isMobile ? 80 : 100,
            render: (type) => (
                <Tag
                    color="blue"
                    style={{
                        fontSize: isMobile ? '10px' : '12px',
                        padding: isMobile ? '1px 4px' : '2px 6px'
                    }}
                >
                    {type}
                </Tag>
            ),
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            width: isMobile ? 90 : 120,
            render: (price) => (
                <div style={{
                    fontSize: isMobile ? '11px' : '13px',
                    fontWeight: 500
                }}>
                    {price ? `$${price.toLocaleString()}` : 'Not set'}
                </div>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: isMobile ? 80 : 100,
            render: (status) => {
                const color = status === 'Active' ? 'green' :
                    status === 'Pending' ? 'orange' : 'red';
                return (
                    <Tag
                        color={color}
                        style={{
                            fontSize: isMobile ? '10px' : '12px',
                            padding: isMobile ? '1px 4px' : '2px 6px'
                        }}
                    >
                        {status}
                    </Tag>
                );
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            width: isMobile ? 60 : 80,
            fixed: 'right',
            render: (_, record) => (
                <Tooltip title="View Property">
                    <Button
                        icon={<EyeOutlined />}
                        size="small"
                        onClick={() => handleViewProperty(record.id)}
                    />
                </Tooltip>
            ),
        },
    ];

    const handleViewProperty = (propertyId) => {
        console.log('View property:', propertyId);
    };

    return (
        <Card bodyStyle={{ padding: isMobile ? '12px' : '16px' }}>
            <div style={{
                marginBottom: 16,
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'stretch' : 'center',
                gap: 16
            }}>
                <Space
                    direction={isMobile ? 'vertical' : 'horizontal'}
                    style={{ width: isMobile ? '100%' : 'auto' }}
                >
                    <Search
                        placeholder={isMobile ? "Search properties..." : "Search properties..."}
                        allowClear
                        onSearch={setSearchText}
                        style={{ width: isMobile ? '100%' : 300 }}
                        size={isMobile ? "middle" : "large"}
                    />
                    <Select
                        defaultValue="all"
                        style={{ width: isMobile ? '100%' : 200 }}
                        onChange={setAgentFilter}
                        placeholder="Filter by agent"
                        size={isMobile ? "middle" : "large"}
                    >
                        <Option value="all">All Agents</Option>
                        {agents.map(agent => (
                            <Option key={agent.id} value={agent.id}>
                                {agent.firstName} {agent.lastName}
                            </Option>
                        ))}
                    </Select>
                </Space>
            </div>

            <BaseTable
                data={filteredProperties}
                columns={columns}
                loading={loading}
                rowKey="id"
                scroll={{ x: isMobile ? 600 : 800 }}
                pagination={{
                    pageSize: isMobile ? 5 : 10,
                    showSizeChanger: !isMobile,
                    showQuickJumper: !isMobile,
                    showTotal: (total, range) =>
                        `${range[0]}-${range[1]} of ${total} properties`,
                    size: isMobile ? "small" : "default",
                    simple: isMobile
                }}
            />
        </Card>
    );
};

export default PropAgentTable;