// PropAgentTable.jsx
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
    Button
} from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import BaseTable from './BaseTable';
import propertyService from '../Creation_Agent/Services/agentService';

const { Option } = Select;
const { Search } = Input;

const PropAgentTable = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [agentFilter, setAgentFilter] = useState('all');
    const [agents, setAgents] = useState([]);

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
            render: (text, record) => (
                <Space>
                    <Avatar
                        src={record.images?.[0]}
                        shape="square"
                        style={{ backgroundColor: '#1a365d' }}
                    >
                        {text?.[0]}
                    </Avatar>
                    <div>
                        <div style={{ fontWeight: 500 }}>{text}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            {record.address}
                        </div>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Agent',
            dataIndex: 'agentName',
            key: 'agentName',
            render: (text, record) => (
                <Space>
                    <Avatar size="small" src={record.agentPhoto}>
                        {record.agentName?.[0]}
                    </Avatar>
                    {text}
                </Space>
            ),
        },
        {
            title: 'Type',
            dataIndex: 'propertyType',
            key: 'propertyType',
            render: (type) => <Tag color="blue">{type}</Tag>,
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
            render: (price) => price ? `$${price.toLocaleString()}` : 'Not set',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const color = status === 'Active' ? 'green' :
                    status === 'Pending' ? 'orange' : 'red';
                return <Tag color={color}>{status}</Tag>;
            },
        },
        {
            title: 'Actions',
            key: 'actions',
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
        <Card>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Space>
                    <Search
                        placeholder="Search properties..."
                        allowClear
                        onSearch={setSearchText}
                        style={{ width: 300 }}
                    />
                    <Select
                        defaultValue="all"
                        style={{ width: 200 }}
                        onChange={setAgentFilter}
                        placeholder="Filter by agent"
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
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                }}
            />
        </Card>
    );
};

export default PropAgentTable;