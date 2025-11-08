// SchedulingPage.jsx
import React, { useState, useEffect } from 'react';
import {
    Card,
    Calendar,
    Button,
    Modal,
    Form,
    Input,
    Select,
    Row,
    Col,
    Tag,
    message,
    Tabs,
    Table,
    Space,
    Avatar,
    Tooltip
} from 'antd';
import {
    PlusOutlined,
    CalendarOutlined,
    UnorderedListOutlined,
    UserOutlined,
    HomeOutlined,
    PhoneOutlined
} from '@ant-design/icons';
import clientService from '../Employeesportal/AdminPortal/Creation_Agent/Services/ClientService';
import propertyService from '../Employeesportal/AdminPortal/Creation_Property/services/propertyService';
import SchedulePropertiesService from '../Employeesportal/AdminPortal/appointment/Services/SchedulePropertiesService'; // ✅ Fixed import
import authService from '../Authpage/Services/LoginAuth';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const SchedulingPage = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [clients, setClients] = useState([]);
    const [properties, setProperties] = useState([]);
    const [activeTab, setActiveTab] = useState('calendar');
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const scheduleService = new SchedulePropertiesService();

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        setLoading(true);
        try {
            const currentUser = authService.getCurrentUser();
            const agentId = currentUser?.userId;

            if (!agentId) {
                throw new Error('Unable to determine agent ID');
            }

            // Load agent's appointments
            const appointmentsData = await scheduleService.getSchedulesByAgent(parseInt(agentId));
            console.log('Loaded appointments:', appointmentsData);
            setAppointments(appointmentsData || []);

            // Load clients
            const clientsData = await clientService.getClients();
            console.log('Loaded clients:', clientsData);
            setClients(clientsData || []);

            // Load properties
            const propertiesData = await propertyService.getAllProperties();
            console.log('Loaded properties:', propertiesData);
            setProperties(propertiesData || []);

        } catch (error) {
            console.error('Error loading data:', error);
            message.error('Failed to load scheduling data');
        } finally {
            setLoading(false);
        }
    };

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const handleOk = () => {
        form.validateFields()
            .then(async (values) => {
                try {
                    const currentUser = authService.getCurrentUser();
                    const agentId = currentUser?.userId;

                    if (!agentId) {
                        throw new Error('Unable to determine agent ID');
                    }

                    // Create proper appointment data
                    const newAppointment = {
                        clientId: parseInt(values.clientId),
                        propertyId: parseInt(values.propertyId),
                        scheduleTime: `${values.date}T${values.time}:00`,
                        notes: values.notes || '',
                        meetingType: values.meetingType || 'InPerson',
                        meetingLocation: values.meetingLocation || '',
                        agentId: parseInt(agentId),
                        status: 'Scheduled'
                    };

                    console.log('Creating appointment:', newAppointment);

                    const result = await scheduleService.createSchedule(newAppointment);

                    if (result && result.success) {
                        message.success('Appointment scheduled successfully!');
                        setIsModalVisible(false);
                        form.resetFields();
                        loadAllData(); // Refresh data
                    } else {
                        throw new Error(result?.message || 'Failed to create appointment');
                    }
                } catch (error) {
                    console.error('Error creating appointment:', error);
                    message.error(error.message || 'Failed to schedule appointment');
                }
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };

    const getListData = (value) => {
        return appointments.filter(appointment => {
            if (!appointment.scheduleTime) return false;
            const appointmentDate = new Date(appointment.scheduleTime).toISOString().split('T')[0];
            return appointmentDate === value.format('YYYY-MM-DD');
        });
    };

    const dateCellRender = (value) => {
        const listData = getListData(value);
        return (
            <div style={{ minHeight: '80px' }}>
                {listData.map(item => {
                    const client = clients.find(c => c.id === item.clientId);
                    const property = properties.find(p => p.id === item.propertyId);

                    return (
                        <Tooltip
                            key={item.id}
                            title={
                                <div>
                                    <div><strong>Client:</strong> {client ? `${client.firstName} ${client.lastName}` : 'Unknown'}</div>
                                    <div><strong>Property:</strong> {property?.title || 'Unknown'}</div>
                                    <div><strong>Time:</strong> {new Date(item.scheduleTime).toLocaleTimeString()}</div>
                                    <div><strong>Status:</strong> {item.status}</div>
                                </div>
                            }
                        >
                            <Tag
                                color={getStatusColor(item.status)}
                                style={{ marginBottom: '2px', width: '100%', cursor: 'pointer' }}
                            >
                                {new Date(item.scheduleTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                {client ? ` ${client.firstName}` : ' Appointment'}
                            </Tag>
                        </Tooltip>
                    );
                })}
            </div>
        );
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

    // Enhanced table columns for client appointments
    const columns = [
        {
            title: 'Date & Time',
            dataIndex: 'scheduleTime',
            key: 'scheduleTime',
            render: (time) => (
                <Space direction="vertical" size={0}>
                    <div>{time ? new Date(time).toLocaleDateString() : 'N/A'}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                        {time ? new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </div>
                </Space>
            ),
            sorter: (a, b) => new Date(a.scheduleTime) - new Date(b.scheduleTime),
        },
        {
            title: 'Client',
            key: 'client',
            render: (_, record) => {
                const client = clients.find(c => c.id === record.clientId);
                return (
                    <Space>
                        <Avatar size="small" icon={<UserOutlined />} />
                        <div>
                            <div style={{ fontWeight: 500 }}>
                                {client ? `${client.firstName} ${client.lastName}` : 'Unknown Client'}
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                                {client?.cellPhoneNo || 'N/A'}
                            </div>
                        </div>
                    </Space>
                );
            },
        },
        {
            title: 'Property',
            key: 'property',
            render: (_, record) => {
                const property = properties.find(p => p.id === record.propertyId);
                return (
                    <Space direction="vertical" size={0}>
                        <div style={{ fontWeight: 500 }}>
                            {property?.title || 'Unknown Property'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            {property?.address || 'No address'}
                        </div>
                    </Space>
                );
            },
        },
        {
            title: 'Meeting Type',
            dataIndex: 'meetingType',
            key: 'meetingType',
            render: (type) => (
                <Tag color={type === 'Virtual' ? 'blue' : type === 'InPerson' ? 'green' : 'orange'}>
                    {type || 'Not specified'}
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
        },
        {
            title: 'Notes',
            dataIndex: 'notes',
            key: 'notes',
            ellipsis: true,
            render: (notes) => notes || 'No notes',
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card
                        title="Client Appointment Scheduling"
                        extra={
                            <Space>
                                <Button
                                    icon={<PlusOutlined />}
                                    onClick={showModal}
                                    loading={loading}
                                >
                                    Schedule Appointment
                                </Button>
                                <Button
                                    icon={<UnorderedListOutlined />}
                                    onClick={loadAllData}
                                    loading={loading}
                                >
                                    Refresh
                                </Button>
                            </Space>
                        }
                    >
                        <Tabs
                            activeKey={activeTab}
                            onChange={setActiveTab}
                            type="card"
                        >
                            <TabPane
                                tab={
                                    <span>
                                        <CalendarOutlined />
                                        Calendar View
                                    </span>
                                }
                                key="calendar"
                            >
                                <Calendar
                                    dateCellRender={dateCellRender}
                                    style={{ background: 'white', borderRadius: '8px' }}
                                />
                            </TabPane>

                            <TabPane
                                tab={
                                    <span>
                                        <UnorderedListOutlined />
                                        All Appointments ({appointments.length})
                                    </span>
                                }
                                key="list"
                            >
                                <Table
                                    columns={columns}
                                    dataSource={appointments}
                                    rowKey="id"
                                    pagination={{ pageSize: 10 }}
                                    loading={loading}
                                    locale={{ emptyText: 'No appointments scheduled' }}
                                />
                            </TabPane>
                        </Tabs>
                    </Card>
                </Col>
            </Row>

            {/* Schedule Appointment Modal */}
            <Modal
                title="Schedule Client Appointment"
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                width={600}
                confirmLoading={loading}
                okText="Schedule Appointment"
                cancelText="Cancel"
            >
                <Form
                    form={form}
                    layout="vertical"
                    name="appointmentForm"
                >
                    <Form.Item
                        name="clientId"
                        label="Select Client"
                        rules={[{ required: true, message: 'Please select a client!' }]}
                    >
                        <Select
                            placeholder="Choose a client"
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option.children.toLowerCase().includes(input.toLowerCase())
                            }
                            loading={loading}
                        >
                            {clients.map(client => (
                                <Option key={client.id} value={client.id}>
                                    <Space>
                                        <UserOutlined />
                                        {client.firstName} {client.lastName}
                                        {client.cellPhoneNo && <span>({client.cellPhoneNo})</span>}
                                    </Space>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="propertyId"
                        label="Select Property"
                        rules={[{ required: true, message: 'Please select a property!' }]}
                    >
                        <Select
                            placeholder="Choose a property"
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option.children.toLowerCase().includes(input.toLowerCase())
                            }
                            loading={loading}
                        >
                            {properties.map(property => (
                                <Option key={property.id} value={property.id}>
                                    <Space>
                                        <HomeOutlined />
                                        {property.title} - {property.address}
                                    </Space>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="date"
                                label="Appointment Date"
                                rules={[{ required: true, message: 'Please select a date!' }]}
                            >
                                <Input type="date" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="time"
                                label="Appointment Time"
                                rules={[{ required: true, message: 'Please select a time!' }]}
                            >
                                <Input type="time" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="meetingType"
                        label="Meeting Type"
                        rules={[{ required: true, message: 'Please select meeting type!' }]}
                    >
                        <Select placeholder="Select meeting type">
                            <Option value="InPerson">In Person</Option>
                            <Option value="Virtual">Virtual</Option>
                            <Option value="Phone">Phone Call</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="meetingLocation"
                        label="Meeting Location"
                        extra="Required for in-person meetings"
                        rules={[
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (getFieldValue('meetingType') === 'InPerson' && !value) {
                                        return Promise.reject(new Error('Please provide meeting location for in-person meetings'));
                                    }
                                    return Promise.resolve();
                                },
                            }),
                        ]}
                    >
                        <Input placeholder="Enter meeting location (for in-person meetings)" />
                    </Form.Item>

                    <Form.Item
                        name="notes"
                        label="Additional Notes"
                    >
                        <TextArea
                            rows={3}
                            placeholder="Enter any additional notes or instructions for the client"
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SchedulingPage;