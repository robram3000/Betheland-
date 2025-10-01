// BaseTableSchedule.jsximport React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Space,
    Tag,
    Modal,
    message,
    Popconfirm,
    Tooltip,
    Card,
    Input,
    Select,
    DatePicker,
} from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    PlusOutlined,
    SearchOutlined,
    ReloadOutlined,
    CalendarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const BaseTableSchedule = ({
    dataSource = [],
    loading = false,
    onEdit,
    onDelete,
    onView,
    onCreate,
    onRefresh,
    pagination = {},
    rowSelection
}) => {
    const [filteredData, setFilteredData] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState(null);

    useEffect(() => {
        setFilteredData(dataSource);
    }, [dataSource]);

    const handleSearch = (value) => {
        setSearchText(value);
        const filtered = dataSource.filter(item =>
            item.property?.title?.toLowerCase().includes(value.toLowerCase()) ||
            item.agent?.name?.toLowerCase().includes(value.toLowerCase()) ||
            item.client?.name?.toLowerCase().includes(value.toLowerCase()) ||
            item.scheduleNo?.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredData(filtered);
    };

    const handleStatusFilter = (value) => {
        setStatusFilter(value);
        if (value === 'all') {
            setFilteredData(dataSource);
        } else {
            const filtered = dataSource.filter(item => item.status === value);
            setFilteredData(filtered);
        }
    };

    const handleDateFilter = (dates) => {
        setDateFilter(dates);
        if (!dates || dates.length === 0) {
            setFilteredData(dataSource);
        } else {
            const [start, end] = dates;
            const filtered = dataSource.filter(item => {
                const scheduleDate = dayjs(item.scheduleTime);
                return scheduleDate.isAfter(start) && scheduleDate.isBefore(end);
            });
            setFilteredData(filtered);
        }
    };

    const handleResetFilters = () => {
        setSearchText('');
        setStatusFilter('all');
        setDateFilter(null);
        setFilteredData(dataSource);
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'scheduled':
                return 'blue';
            case 'completed':
                return 'green';
            case 'cancelled':
                return 'red';
            case 'rescheduled':
                return 'orange';
            default:
                return 'default';
        }
    };

    const formatDateTime = (dateTime) => {
        return dayjs(dateTime).format('MMM DD, YYYY HH:mm');
    };

    const columns = [
        {
            title: 'Schedule No',
            dataIndex: 'scheduleNo',
            key: 'scheduleNo',
            width: 120,
            render: (text) => (
                <Tooltip title={text}>
                    <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                        {text?.substring(0, 8)}...
                    </span>
                </Tooltip>
            ),
        },
        {
            title: 'Property',
            dataIndex: ['property', 'title'],
            key: 'property',
            width: 200,
            ellipsis: true,
            render: (text) => (
                <Tooltip title={text}>
                    <span>{text}</span>
                </Tooltip>
            ),
        },
        {
            title: 'Agent',
            dataIndex: ['agent', 'name'],
            key: 'agent',
            width: 120,
        },
        {
            title: 'Client',
            dataIndex: ['client', 'name'],
            key: 'client',
            width: 120,
        },
        {
            title: 'Schedule Time',
            dataIndex: 'scheduleTime',
            key: 'scheduleTime',
            width: 150,
            render: (dateTime) => formatDateTime(dateTime),
            sorter: (a, b) => dayjs(a.scheduleTime).unix() - dayjs(b.scheduleTime).unix(),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {status?.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Notes',
            dataIndex: 'notes',
            key: 'notes',
            width: 150,
            ellipsis: true,
            render: (text) => (
                <Tooltip title={text}>
                    <span>{text || '-'}</span>
                </Tooltip>
            ),
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            render: (date) => dayjs(date).format('MMM DD, YYYY'),
            sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            fixed: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="View Details">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => onView && onView(record)}
                            size="small"
                        />
                    </Tooltip>
                    <Tooltip title="Edit">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => onEdit && onEdit(record)}
                            size="small"
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Delete Schedule"
                        description="Are you sure you want to delete this schedule?"
                        onConfirm={() => onDelete && onDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                        okType="danger"
                    >
                        <Tooltip title="Delete">
                            <Button
                                type="text"
                                icon={<DeleteOutlined />}
                                danger
                                size="small"
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Card>
            {/* Filters Section */}
            <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Search
                    placeholder="Search schedules..."
                    allowClear
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onSearch={handleSearch}
                    style={{ width: 250 }}
                />

                <Select
                    value={statusFilter}
                    onChange={handleStatusFilter}
                    style={{ width: 150 }}
                    placeholder="Filter by status"
                >
                    <Option value="all">All Status</Option>
                    <Option value="scheduled">Scheduled</Option>
                    <Option value="completed">Completed</Option>
                    <Option value="cancelled">Cancelled</Option>
                    <Option value="rescheduled">Rescheduled</Option>
                </Select>

                <RangePicker
                    showTime
                    value={dateFilter}
                    onChange={handleDateFilter}
                    style={{ width: 300 }}
                    placeholder={['Start Date', 'End Date']}
                />

                <Button
                    icon={<ReloadOutlined />}
                    onClick={handleResetFilters}
                >
                    Reset
                </Button>

                <div style={{ flex: 1 }} />

                <Space>
                    {onRefresh && (
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={onRefresh}
                            loading={loading}
                        >
                            Refresh
                        </Button>
                    )}
                    {onCreate && (
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={onCreate}
                            style={{ backgroundColor: '#1a365d', borderColor: '#1a365d' }}
                        >
                            Add Schedule
                        </Button>
                    )}
                </Space>
            </div>

            {/* Table */}
            <Table
                columns={columns}
                dataSource={filteredData}
                loading={loading}
                rowKey="id"
                scroll={{ x: 1200 }}
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                        `Showing ${range[0]}-${range[1]} of ${total} schedules`,
                }}
                rowSelection={rowSelection}
            />
        </Card>
    );
};

export default BaseTableSchedule;