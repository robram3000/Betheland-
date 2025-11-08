import React, { useState, useEffect } from 'react';
import {
    Table,
    Card,
    Button,
    Space,
    Tag,
    Modal,
    Form,
    Select,
    DatePicker,
    Input,
    message,
    Tooltip,
    Avatar,
    Row,
    Col,
    Statistic,
    Popconfirm,
    InputNumber
} from 'antd';
import {
    SearchOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    CalendarOutlined,
    UserOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import BaseTable from './BaseTable';
import moment from 'moment';

// Import the service
import { schedulePropertiesService } from '../appointment/Services/index.js';

const { TextArea } = Input;
const { Option } = Select;

const ScheduleAppointments = ({ onScheduleUpdate }) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [form] = Form.useForm();
    const [agents, setAgents] = useState([]);
    const [properties, setProperties] = useState([]);
    const [clients, setClients] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        loadAppointments();
        loadAgents();
        loadProperties();
        loadClients();
    }, []);

    const loadAppointments = async () => {
        setLoading(true);
        try {
            const schedules = await schedulePropertiesService.getAllSchedules();
            setAppointments(schedules || []);
        } catch (error) {
            console.error('Error loading appointments:', error);
            message.error(error.message || 'Failed to load appointments');
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    };

    const loadAgents = async () => {
        // Mock agents data - replace with actual API call
        setAgents([
            { id: 1, name: 'John Smith' },
            { id: 2, name: 'Sarah Johnson' },
            { id: 3, name: 'Mike Wilson' }
        ]);
    };

    const loadProperties = async () => {
        // Mock properties data - replace with actual API call
        setProperties([
            { id: 1, title: 'Luxury Villa in Beverly Hills' },
            { id: 2, title: 'Modern Apartment Downtown' },
            { id: 3, title: 'Family Home in Suburbs' }
        ]);
    };

    const loadClients = async () => {
        // Mock clients data - replace with actual API call
        setClients([
            { id: 1, name: 'Alice Johnson' },
            { id: 2, name: 'Bob Brown' },
            { id: 3, name: 'Carol Davis' }
        ]);
    };

    const handleCreate = () => {
        setSelectedAppointment(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (appointment) => {
        setSelectedAppointment(appointment);
        form.setFieldsValue({
            ...appointment,
            scheduleTime: moment(appointment.scheduleTime),
            agentId: appointment.agentId,
            clientId: appointment.clientId,
            propertyId: appointment.propertyId
        });
        setModalVisible(true);
    };

    const handleView = (appointment) => {
        setSelectedAppointment(appointment);
        setViewModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await schedulePropertiesService.deleteSchedule(id);
            message.success('Appointment deleted successfully');
            loadAppointments();
            if (onScheduleUpdate) onScheduleUpdate();
        } catch (error) {
            console.error('Error deleting appointment:', error);
            message.error(error.message || 'Failed to delete appointment');
        }
    };

    const handleSubmit = async (values) => {
        try {
            const appointmentData = {
                ...values,
                scheduleTime: values.scheduleTime.format(),
                id: selectedAppointment?.id
            };

            if (selectedAppointment) {
                await schedulePropertiesService.updateSchedule(selectedAppointment.id, appointmentData);
                message.success('Appointment updated successfully');
            } else {
                await schedulePropertiesService.createSchedule(appointmentData);
                message.success('Appointment created successfully');
            }

            setModalVisible(false);
            loadAppointments();
            if (onScheduleUpdate) onScheduleUpdate();
        } catch (error) {
            console.error('Error saving appointment:', error);
            message.error(error.message || 'Failed to save appointment');
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            if (newStatus === 'Completed') {
                await schedulePropertiesService.completeSchedule(id);
            } else if (newStatus === 'Cancelled') {
                await schedulePropertiesService.cancelSchedule(id);
            }

            message.success(`Appointment ${newStatus.toLowerCase()} successfully`);
            loadAppointments();
            if (onScheduleUpdate) onScheduleUpdate();
        } catch (error) {
            console.error('Error updating appointment status:', error);
            message.error(error.message || 'Failed to update appointment status');
        }
    };

    // Enhanced data mapping for display
    const mapAppointmentData = (appointment) => {
        return {
            ...appointment,
            agentName: appointment.agent?.name || 'Unknown Agent',
            clientName: appointment.client?.name || 'Unknown Client',
            propertyTitle: appointment.property?.title || 'Unknown Property',
            propertyAddress: appointment.property?.address || 'No address available'
        };
    };

    const getStatusColor = (status) => {
        const colors = {
            'Scheduled': 'blue',
            'Completed': 'green',
            'Cancelled': 'red',
            'Rescheduled': 'orange'
        };
        return colors[status] || 'default';
    };

    const columns = [
        {
            title: 'Schedule No',
            dataIndex: 'scheduleNo',
            key: 'scheduleNo',
            width: 120,
            render: (text) => <Tag color="blue">{text}</Tag>
        },
        {
            title: 'Agent',
            dataIndex: 'agentName',
            key: 'agent',
            width: 150,
            render: (text, record) => (
                <Space>
                    <Avatar size="small" src={record.agent?.photo} icon={<UserOutlined />} />
                    {text}
                </Space>
            )
        },
        {
            title: 'Client',
            dataIndex: 'clientName',
            key: 'client',
            width: 150
        },
        {
            title: 'Property',
            dataIndex: 'propertyTitle',
            key: 'property',
            width: 200,
            render: (text, record) => (
                <Space direction="vertical" size={0}>
                    <div style={{ fontWeight: 500 }}>{text}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                        {record.propertyAddress}
                    </div>
                </Space>
            )
        },
        {
            title: 'Schedule Time',
            dataIndex: 'scheduleTime',
            key: 'scheduleTime',
            width: 180,
            render: (time) => (
                <Space direction="vertical" size={0}>
                    <div>{moment(time).format('MMM DD, YYYY')}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                        {moment(time).format('hh:mm A')}
                    </div>
                </Space>
            ),
            sorter: (a, b) => moment(a.scheduleTime) - moment(b.scheduleTime)
        },
        {
            title: 'Purpose',
            dataIndex: 'purpose',
            key: 'purpose',
            width: 150,
            render: (purpose) => purpose || 'Property Viewing'
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {status}
                </Tag>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="View Details">
                        <Button
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={() => handleView(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Edit">
                        <Button
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Are you sure to delete this appointment?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Tooltip title="Delete">
                            <Button
                                icon={<DeleteOutlined />}
                                size="small"
                                danger
                            />
                        </Tooltip>
                    </Popconfirm>
                    {record.status === 'Scheduled' && (
                        <Tooltip title="Mark Complete">
                            <Button
                                icon={<CheckCircleOutlined />}
                                size="small"
                                type="primary"
                                onClick={() => handleStatusChange(record.id, 'Completed')}
                            />
                        </Tooltip>
                    )}
                </Space>
            )
        }
    ];

    // Map appointment data for display
    const displayAppointments = appointments.map(mapAppointmentData);

    const filteredAppointments = displayAppointments.filter(appointment => {
        const matchesSearch = searchText === '' ||
            appointment.agentName?.toLowerCase().includes(searchText.toLowerCase()) ||
            appointment.clientName?.toLowerCase().includes(searchText.toLowerCase()) ||
            appointment.propertyTitle?.toLowerCase().includes(searchText.toLowerCase()) ||
            appointment.scheduleNo?.toLowerCase().includes(searchText.toLowerCase());

        const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: appointments.length,
        scheduled: appointments.filter(a => a.status === 'Scheduled').length,
        completed: appointments.filter(a => a.status === 'Completed').length,
        upcoming: appointments.filter(a =>
            a.status === 'Scheduled' &&
            moment(a.scheduleTime).isAfter(moment())
        ).length
    };

    return (
        <div>
            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title="Total Appointments"
                            value={stats.total}
                            prefix={<CalendarOutlined />}
                            valueStyle={{ color: '#1a365d' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title="Scheduled"
                            value={stats.scheduled}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title="Completed"
                            value={stats.completed}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small">
                        <Statistic
                            title="Upcoming"
                            value={stats.upcoming}
                            prefix={<CalendarOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card>
                <div style={{
                    marginBottom: 16,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 16
                }}>
                    <Space>
                        <Input
                            placeholder="Search appointments..."
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{ width: 300 }}
                        />
                        <Select
                            value={statusFilter}
                            onChange={setStatusFilter}
                            style={{ width: 150 }}
                            placeholder="Filter by status"
                        >
                            <Option value="all">All Status</Option>
                            <Option value="Scheduled">Scheduled</Option>
                            <Option value="Completed">Completed</Option>
                            <Option value="Cancelled">Cancelled</Option>
                            <Option value="Rescheduled">Rescheduled</Option>
                        </Select>
                    </Space>

                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreate}
                    >
                        New Appointment
                    </Button>
                </div>

                <BaseTable
                    data={filteredAppointments}
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

            {/* Create/Edit Modal */}
            <Modal
                title={selectedAppointment ? 'Edit Appointment' : 'Create New Appointment'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="agentId"
                                label="Agent"
                                rules={[{ required: true, message: 'Please select an agent' }]}
                            >
                                <Select placeholder="Select agent">
                                    {agents.map(agent => (
                                        <Option key={agent.id} value={agent.id}>
                                            {agent.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="clientId"
                                label="Client"
                                rules={[{ required: true, message: 'Please select a client' }]}
                            >
                                <Select placeholder="Select client">
                                    {clients.map(client => (
                                        <Option key={client.id} value={client.id}>
                                            {client.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="propertyId"
                        label="Property"
                        rules={[{ required: true, message: 'Please select a property' }]}
                    >
                        <Select placeholder="Select property">
                            {properties.map(property => (
                                <Option key={property.id} value={property.id}>
                                    {property.title}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="scheduleTime"
                                label="Schedule Date & Time"
                                rules={[{ required: true, message: 'Please select date and time' }]}
                            >
                                <DatePicker
                                    showTime
                                    format="YYYY-MM-DD HH:mm"
                                    style={{ width: '100%' }}
                                    placeholder="Select date and time"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="duration"
                                label="Duration (minutes)"
                                initialValue={60}
                            >
                                <InputNumber
                                    min={15}
                                    max={480}
                                    style={{ width: '100%' }}
                                    placeholder="Duration in minutes"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="purpose"
                        label="Purpose"
                        initialValue="Property Viewing"
                    >
                        <Input placeholder="e.g., Property Viewing, Consultation" />
                    </Form.Item>

                    <Form.Item
                        name="notes"
                        label="Notes"
                    >
                        <TextArea rows={3} placeholder="Additional notes..." />
                    </Form.Item>

                    <Form.Item style={{ textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setModalVisible(false)}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit">
                                {selectedAppointment ? 'Update' : 'Create'} Appointment
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* View Details Modal */}
            <Modal
                title="Appointment Details"
                open={viewModalVisible}
                onCancel={() => setViewModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setViewModalVisible(false)}>
                        Close
                    </Button>,
                    <Button
                        key="edit"
                        type="primary"
                        onClick={() => {
                            setViewModalVisible(false);
                            handleEdit(selectedAppointment);
                        }}
                    >
                        Edit Appointment
                    </Button>
                ]}
                width={600}
            >
                {selectedAppointment && (
                    <div>
                        <Row gutter={16} style={{ marginBottom: 16 }}>
                            <Col span={12}>
                                <strong>Schedule No:</strong>
                                <div>{selectedAppointment.scheduleNo}</div>
                            </Col>
                            <Col span={12}>
                                <strong>Status:</strong>
                                <div>
                                    <Tag color={getStatusColor(selectedAppointment.status)}>
                                        {selectedAppointment.status}
                                    </Tag>
                                </div>
                            </Col>
                        </Row>
                        <Row gutter={16} style={{ marginBottom: 16 }}>
                            <Col span={12}>
                                <strong>Agent:</strong>
                                <div>{selectedAppointment.agentName}</div>
                            </Col>
                            <Col span={12}>
                                <strong>Client:</strong>
                                <div>{selectedAppointment.clientName}</div>
                            </Col>
                        </Row>
                        <Row gutter={16} style={{ marginBottom: 16 }}>
                            <Col span={24}>
                                <strong>Property:</strong>
                                <div>{selectedAppointment.propertyTitle}</div>
                                <div style={{ color: '#666', fontSize: '12px' }}>
                                    {selectedAppointment.propertyAddress}
                                </div>
                            </Col>
                        </Row>
                        <Row gutter={16} style={{ marginBottom: 16 }}>
                            <Col span={12}>
                                <strong>Schedule Time:</strong>
                                <div>{moment(selectedAppointment.scheduleTime).format('MMM DD, YYYY hh:mm A')}</div>
                            </Col>
                            <Col span={12}>
                                <strong>Duration:</strong>
                                <div>{selectedAppointment.duration || 60} minutes</div>
                            </Col>
                        </Row>
                        <Row gutter={16} style={{ marginBottom: 16 }}>
                            <Col span={24}>
                                <strong>Purpose:</strong>
                                <div>{selectedAppointment.purpose || 'Property Viewing'}</div>
                            </Col>
                        </Row>
                        {selectedAppointment.notes && (
                            <Row gutter={16}>
                                <Col span={24}>
                                    <strong>Notes:</strong>
                                    <div>{selectedAppointment.notes}</div>
                                </Col>
                            </Row>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ScheduleAppointments;