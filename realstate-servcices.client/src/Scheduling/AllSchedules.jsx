// AllSchedules.jsx
import React from 'react';
import { Card, Table, Tag, Button, Space } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

const AllSchedules = ({ events }) => {
    const columns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            sorter: (a, b) => new Date(a.date) - new Date(b.date),
        },
        {
            title: 'Time',
            dataIndex: 'time',
            key: 'time',
            sorter: (a, b) => a.time.localeCompare(b.time),
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type) => (
                <Tag color={type === 'meeting' ? 'blue' : type === 'appointment' ? 'green' : 'orange'}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                </Tag>
            ),
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button size="small">Edit</Button>
                    <Button size="small" danger>Delete</Button>
                </Space>
            ),
        },
    ];

    const exportToCSV = () => {
        // Implement CSV export functionality
        message.info('Export feature coming soon!');
    };

    return (
        <div style={{ padding: '24px' }}>
            <Card
                title={`All Scheduled Events (${events.length})`}
                extra={
                    <Button
                        icon={<DownloadOutlined />}
                        onClick={exportToCSV}
                    >
                        Export
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={events}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    locale={{ emptyText: 'No scheduled events found' }}
                />
            </Card>
        </div>
    );
};

export default AllSchedules;