// ScheduleTable.jsx
import React, { useState, useEffect } from 'react';
import {
    Button,
    Modal,
    message,
    Space,
    Row,
    Col,
    Statistic,
    Typography,
    Card
} from 'antd';
import {
    PlusOutlined,
    ExportOutlined,
    ImportOutlined,
    CalendarOutlined,
} from '@ant-design/icons';
import BaseTableSchedule from './BaseTableSchedule';
import InsertSchedule from './InsertSchedule';

const { Title, Text } = Typography;

const ScheduleTable = () => {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);

    // Mock data - replace with actual API calls
    const mockSchedules = [
        {
            id: 1,
            scheduleNo: 'SCH-001-ABC123',
            propertyId: 1,
            agentId: 1,
            clientId: 1,
            scheduleTime: '2024-02-15T10:00:00Z',
            status: 'scheduled',
            notes: 'First viewing of the property',
            createdAt: '2024-02-01T09:00:00Z',
            updatedAt: null,
            property: {
                id: 1,
                title: 'Beautiful Modern House in Downtown',
                propertyNo: 'PROP-001-ABC123'
            },
            agent: {
                id: 1,
                name: 'John Smith',
                email: 'john@example.com'
            },
            client: {
                id: 1,
                name: 'Alice Johnson',
                email: 'alice@example.com'
            }
        },
        {
            id: 2,
            scheduleNo: 'SCH-002-DEF456',
            propertyId: 2,
            agentId: 2,
            clientId: 2,
            scheduleTime: '2024-02-16T14:30:00Z',
            status: 'completed',
            notes: 'Client very interested',
            createdAt: '2024-02-02T10:00:00Z',
            updatedAt: '2024-02-16T16:00:00Z',
            property: {
                id: 2,
                title: 'Luxury Apartment with Pool',
                propertyNo: 'PROP-002-DEF456'
            },
            agent: {
                id: 2,
                name: 'Maria Garcia',
                email: 'maria@example.com'
            },
            client: {
                id: 2,
                name: 'Bob Wilson',
                email: 'bob@example.com'
            }
        },
    ];

    // Mock data for dropdowns
    const mockProperties = [
        { id: 1, title: 'Beautiful Modern House in Downtown', propertyNo: 'PROP-001-ABC123' },
        { id: 2, title: 'Luxury Apartment with Pool', propertyNo: 'PROP-002-DEF456' },
        { id: 3, title: 'Cozy Studio in City Center', propertyNo: 'PROP-003-GHI789' },
    ];

    const mockAgents = [
        { id: 1, name: 'John Smith', email: 'john@example.com' },
        { id: 2, name: 'Maria Garcia', email: 'maria@example.com' },
        { id: 3, name: 'David Brown', email: 'david@example.com' },
    ];

    const mockClients = [
        { id: 1, name: 'Alice Johnson', email: 'alice@example.com' },
        { id: 2, name: 'Bob Wilson', email: 'bob@example.com' },
        { id: 3, name: 'Carol Davis', email: 'carol@example.com' },
    ];

    useEffect(() => {
        loadSchedules();
    }, []);

    const loadSchedules = async () => {
        setLoading(true);
        try {
            // Simulate API call
            setTimeout(() => {
                setSchedules(mockSchedules);
                setLoading(false);
            }, 1000);
        } catch (error) {
            message.error('Failed to load schedules');
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingSchedule(null);
        setModalVisible(true);
    };

    const handleEdit = (schedule) => {
        setEditingSchedule(schedule);
        setModalVisible(true);
    };

    const handleDelete = async (scheduleId) => {
        try {
            // Simulate API call
            setSchedules(prev => prev.filter(sched => sched.id !== scheduleId));
            message.success('Schedule deleted successfully');
        } catch (error) {
            message.error('Failed to delete schedule');
        }
    };

    const handleView = (schedule) => {
        Modal.info({
            title: `Schedule Details - ${schedule.scheduleNo}`,
            width: 600,
            content: (
                <div>
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <Row gutter={[16, 8]}>
                            <Col span={12}>
                                <Text strong>Property:</Text>
                                <br />
                                <Text>{schedule.property?.title}</Text>
                            </Col>
                            <Col span={12}>
                                <Text strong>Agent:</Text>
                                <br />
                                <Text>{schedule.agent?.name}</Text>
                            </Col>
                            <Col span={12}>
                                <Text strong>Client:</Text>
                                <br />
                                <Text>{schedule.client?.name}</Text>
                            </Col>
                            <Col span={12}>
                                <Text strong>Schedule Time:</Text>
                                <br />
                                <Text>{new Date(schedule.scheduleTime).toLocaleString()}</Text>
                            </Col>
                            <Col span={12}>
                                <Text strong>Status:</Text>
                                <br />
                                <Text>{schedule.status}</Text>
                            </Col>
                            <Col span={24}>
                                <Text strong>Notes:</Text>
                                <br />
                                <Text>{schedule.notes || 'No notes'}</Text>
                            </Col>
                        </Row>
                    </Space>
                </div>
            ),
        });
    };

    const handleSubmit = async (formData) => {
        setLoading(true);
        try {
            // Simulate API call
            if (editingSchedule) {
                // Update existing schedule
                setSchedules(prev => prev.map(sched =>
                    sched.id === editingSchedule.id
                        ? {
                            ...formData,
                            id: editingSchedule.id,
                            property: mockProperties.find(p => p.id === parseInt(formData.propertyId)),
                            agent: mockAgents.find(a => a.id === parseInt(formData.agentId)),
                            client: mockClients.find(c => c.id === parseInt(formData.clientId)),
                            updatedAt: new Date().toISOString()
                        }
                        : sched
                ));
                message.success('Schedule updated successfully');
            } else {
                // Create new schedule
                const newSchedule = {
                    ...formData,
                    id: Math.max(...schedules.map(s => s.id)) + 1,
                    scheduleNo: `SCH-${String(schedules.length + 1).padStart(3, '0')}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                    createdAt: new Date().toISOString(),
                    updatedAt: null,
                    property: mockProperties.find(p => p.id === parseInt(formData.propertyId)),
                    agent: mockAgents.find(a => a.id === parseInt(formData.agentId)),
                    client: mockClients.find(c => c.id === parseInt(formData.clientId)),
                };
                setSchedules(prev => [...prev, newSchedule]);
                message.success('Schedule created successfully');
            }
            setModalVisible(false);
            setEditingSchedule(null);
        } catch (error) {
            message.error(`Failed to ${editingSchedule ? 'update' : 'create'} schedule`);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setModalVisible(false);
        setEditingSchedule(null);
    };

    const handleExport = () => {
        message.info('Export functionality to be implemented');
    };

    const handleImport = () => {
        message.info('Import functionality to be implemented');
    };

    const rowSelection = {
        selectedRowKeys: selectedRows.map(row => row.id),
        onChange: (selectedRowKeys, selectedRows) => {
            setSelectedRows(selectedRows);
        },
    };

    const stats = {
        total: schedules.length,
        scheduled: schedules.filter(s => s.status === 'scheduled').length,
        completed: schedules.filter(s => s.status === 'completed').length,
        cancelled: schedules.filter(s => s.status === 'cancelled').length,
    };

    return (
        <div style={{ padding: '24px' }}>
            {/* Header Section */}
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col>
                    <Title level={2} style={{ margin: 0, color: '#1a365d' }}>
                        Schedule Management
                    </Title>
                    <Text type="secondary">
                        Manage property viewing schedules and appointments
                    </Text>
                </Col>
                <Col>
                    <Space>
                        <Button
                            icon={<ExportOutlined />}
                            onClick={handleExport}
                        >
                            Export
                        </Button>
                        <Button
                            icon={<ImportOutlined />}
                            onClick={handleImport}
                        >
                            Import
                        </Button>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleCreate}
                            style={{ backgroundColor: '#1a365d', borderColor: '#1a365d' }}
                        >
                            Add Schedule
                        </Button>
                    </Space>
                </Col>
            </Row>

            {/* Statistics */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="Total Schedules"
                            value={stats.total}
                            valueStyle={{ color: '#1a365d' }}
                            prefix={<CalendarOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="Scheduled"
                            value={stats.scheduled}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="Completed"
                            value={stats.completed}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="Cancelled"
                            value={stats.cancelled}
                            valueStyle={{ color: '#f5222d' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Schedule Table */}
            <BaseTableSchedule
                dataSource={schedules}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                onCreate={handleCreate}
                onRefresh={loadSchedules}
                rowSelection={rowSelection}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                }}
            />

            {/* Add/Edit Schedule Modal */}
            <Modal
                title={editingSchedule ? "Edit Schedule" : "Add New Schedule"}
                open={modalVisible}
                onCancel={handleCancel}
                footer={null}
                width={800}
                style={{ top: 20 }}
            >
                <InsertSchedule
                    initialValues={editingSchedule}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    loading={loading}
                    isEdit={!!editingSchedule}
                    properties={mockProperties}
                    agents={mockAgents}
                    clients={mockClients}
                />
            </Modal>
        </div>
    );
};

export default ScheduleTable;