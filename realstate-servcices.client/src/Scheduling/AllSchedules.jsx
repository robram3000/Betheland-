// AllSchedules.jsx
import React, { useState } from 'react';
import { Card, Table, Tag, Button, Space, Avatar, Tooltip, message, Modal, Form, Input } from 'antd';
import { DownloadOutlined, UserOutlined, HomeOutlined, EditOutlined, DeleteOutlined, MessageOutlined } from '@ant-design/icons';

const AllSchedules = ({
    events = [], // Default to empty array
    properties = [],
    agents = [],
    propertyDetails = {},
    agentDetails = {},
    onEdit,
    onDelete,
    onExport,
    onUpdateNotes
}) => {
    const [isNotesModalVisible, setIsNotesModalVisible] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [notesForm] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const getStatusColor = (status) => {
        const colors = {
            'Scheduled': 'blue',
            'Completed': 'green',
            'Cancelled': 'red',
            'Rescheduled': 'orange'
        };
        return colors[status] || 'default';
    };

    // Function to handle opening the notes edit modal
    const handleEditNotes = (record) => {
        setSelectedAppointment(record);
        notesForm.setFieldsValue({
            notes: record.notes || ''
        });
        setIsNotesModalVisible(true);
    };

    // Function to handle saving notes
    const handleSaveNotes = async () => {
        try {
            const values = await notesForm.validateFields();
            setLoading(true);

            if (onUpdateNotes && selectedAppointment) {
                await onUpdateNotes(selectedAppointment.id, values.notes);
                message.success('Notes updated successfully!');
                setIsNotesModalVisible(false);
                setSelectedAppointment(null);
                notesForm.resetFields();
            } else {
                // Fallback if no callback provided
                message.warning('Update notes functionality not implemented');
                setIsNotesModalVisible(false);
            }
        } catch (error) {
            console.error('Error updating notes:', error);
            message.error('Failed to update notes');
        } finally {
            setLoading(false);
        }
    };

    // Function to handle canceling notes edit
    const handleCancelNotes = () => {
        setIsNotesModalVisible(false);
        setSelectedAppointment(null);
        notesForm.resetFields();
    };

    const columns = [
        {
            title: 'Date & Time',
            dataIndex: 'scheduleTime',
            key: 'scheduleTime',
            render: (time) => {
                if (!time) return 'N/A';
                try {
                    const date = new Date(time);
                    return (
                        <Space direction="vertical" size={0}>
                            <div style={{ fontWeight: 500 }}>
                                {date.toLocaleDateString()}
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                                {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </Space>
                    );
                } catch (error) {
                    return 'Invalid Date';
                }
            },
            sorter: (a, b) => new Date(a.scheduleTime) - new Date(b.scheduleTime),
        },
        {
            title: 'Property',
            key: 'property',
            render: (_, record) => {
                // Safe property data extraction
                let property = null;
                if (record.propertyId) {
                    property = propertyDetails[record.propertyId] ||
                        properties.find(p => p.id === record.propertyId);
                }

                return (
                    <Tooltip title={property?.address || 'No address available'}>
                        <Space>
                            <Avatar size="small" icon={<HomeOutlined />} />
                            <div>
                                <div style={{ fontWeight: 500 }}>
                                    {property?.title || 'Unknown Property'}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>
                                    {property?.address ?
                                        property.address.length > 30 ?
                                            `${property.address.substring(0, 30)}...` :
                                            property.address
                                        : 'No address'
                                    }
                                </div>
                            </div>
                        </Space>
                    </Tooltip>
                );
            },
        },
        {
            title: 'Agent',
            key: 'agent',
            render: (_, record) => {
                // Safe agent data extraction
                let agent = null;
                if (record.agentId) {
                    agent = agentDetails[record.agentId] ||
                        agents.find(a => a.id === record.agentId);
                }

                return (
                    <Tooltip title={`Phone: ${agent?.cellPhoneNo || 'N/A'}`}>
                        <Space>
                            <Avatar
                                size="small"
                                icon={<UserOutlined />}
                                src={agent?.profilePictureUrl}
                            />
                            <div>
                                <div style={{ fontWeight: 500 }}>
                                    {agent ? `${agent.firstName} ${agent.lastName}` : 'Unknown Agent'}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>
                                    {agent?.brokerageName || 'No brokerage'}
                                </div>
                            </div>
                        </Space>
                    </Tooltip>
                );
            },
        },
        {
            title: 'Meeting Type',
            dataIndex: 'meetingType',
            key: 'meetingType',
            render: (type) => (
                <Tag color={type === 'Virtual' ? 'blue' : type === 'InPerson' ? 'green' : 'orange'}>
                    {type === 'InPerson' ? 'In Person' :
                        type === 'Virtual' ? 'Virtual Tour' :
                            type === 'Phone' ? 'Phone Call' :
                                type || 'Not specified'}
                </Tag>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {status || 'Scheduled'}
                </Tag>
            ),
            filters: [
                { text: 'Scheduled', value: 'Scheduled' },
                { text: 'Completed', value: 'Completed' },
                { text: 'Cancelled', value: 'Cancelled' },
                { text: 'Rescheduled', value: 'Rescheduled' },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Location/Link',
            key: 'location',
            render: (_, record) => (
                <div style={{ maxWidth: '200px' }}>
                    {record.meetingType === 'Virtual' ? (
                        <a href={record.virtualMeetingLink} target="_blank" rel="noopener noreferrer">
                            {record.virtualMeetingLink || 'No link'}
                        </a>
                    ) : (
                        <span>{record.meetingLocation || 'Not specified'}</span>
                    )}
                </div>
            ),
        },
        {
            title: 'Notes',
            dataIndex: 'notes',
            key: 'notes',
            ellipsis: true,
            render: (notes) => (
                <Tooltip title={notes || 'No notes'}>
                    <span style={{ cursor: 'pointer' }} onClick={() => notes && handleEditNotes({ notes })}>
                        {notes || 'No notes'}
                    </span>
                </Tooltip>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            fixed: 'right',
            width: 120,
            render: (_, record) => {
                const isDisabled = record.status === 'Completed' || record.status === 'Cancelled';

                return (
                    <Space size="small" direction="vertical" style={{ width: '100%' }}>
                        <Space size="small" style={{ justifyContent: 'flex-start', width: '100%' }}>
                            <Tooltip title="Edit appointment">
                                <Button
                                    size="small"
                                    icon={<EditOutlined />}
                                    onClick={() => onEdit && onEdit(record)}
                                    disabled={isDisabled || !onEdit}
                                />
                            </Tooltip>

                            <Tooltip title="Edit notes">
                                <Button
                                    size="small"
                                    icon={<MessageOutlined />}
                                    onClick={() => handleEditNotes(record)}
                                />
                            </Tooltip>

                            <Tooltip title="Cancel appointment">
                                <Button
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => onDelete && onDelete(record)}
                                    disabled={isDisabled || !onDelete}
                                />
                            </Tooltip>
                        </Space>
                    </Space>
                );
            },
        },
    ];

    const exportToCSV = () => {
        if (onExport) {
            onExport(events);
        } else {
            // Basic CSV export implementation
            if (!events || events.length === 0) {
                message.warning('No data to export');
                return;
            }

            const headers = ['Date', 'Time', 'Property', 'Agent', 'Meeting Type', 'Status', 'Location', 'Notes'];
            const csvData = events.map(event => {
                let property = null;
                let agent = null;

                if (event.propertyId) {
                    property = propertyDetails[event.propertyId] || properties.find(p => p.id === event.propertyId);
                }
                if (event.agentId) {
                    agent = agentDetails[event.agentId] || agents.find(a => a.id === event.agentId);
                }

                return [
                    event.scheduleTime ? new Date(event.scheduleTime).toLocaleDateString() : 'N/A',
                    event.scheduleTime ? new Date(event.scheduleTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
                    property?.title || 'Unknown Property',
                    agent ? `${agent.firstName} ${agent.lastName}` : 'Unknown Agent',
                    event.meetingType || 'Not specified',
                    event.status || 'Scheduled',
                    event.meetingLocation || event.virtualMeetingLink || 'Not specified',
                    event.notes || 'No notes'
                ];
            });

            const csvContent = [
                headers.join(','),
                ...csvData.map(row => row.map(field => `"${field}"`).join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `property-viewings-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            message.success('Data exported successfully');
        }
    };

    // Safe data source for table
    const tableDataSource = Array.isArray(events) ? events : [];

    return (
        <div style={{ padding: '24px' }}>
            <Card
                title={`My Property Viewing Appointments (${tableDataSource.length})`}
                extra={
                    <Button
                        icon={<DownloadOutlined />}
                        onClick={exportToCSV}
                        disabled={tableDataSource.length === 0}
                    >
                        Export to CSV
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={tableDataSource}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} of ${total} appointments`
                    }}
                    loading={events === null}
                    locale={{
                        emptyText: 'No property viewing appointments scheduled'
                    }}
                    scroll={{ x: 1200 }}
                />
            </Card>

            {/* Edit Notes Modal */}
            <Modal
                title="Edit Appointment Notes"
                open={isNotesModalVisible}
                onOk={handleSaveNotes}
                onCancel={handleCancelNotes}
                confirmLoading={loading}
                okText="Save Notes"
                cancelText="Cancel"
                width={600}
            >
                {selectedAppointment && (
                    <Form
                        form={notesForm}
                        layout="vertical"
                        name="notesForm"
                    >
                        <Form.Item
                            name="notes"
                            label="Appointment Notes"
                            rules={[
                                {
                                    max: 1000,
                                    message: 'Notes cannot exceed 1000 characters!',
                                },
                            ]}
                        >
                            <Input.TextArea
                                rows={6}
                                placeholder="Enter notes about this appointment..."
                                showCount
                                maxLength={1000}
                            />
                        </Form.Item>
                    </Form>
                )}
            </Modal>
        </div>
    );
};

export default AllSchedules;