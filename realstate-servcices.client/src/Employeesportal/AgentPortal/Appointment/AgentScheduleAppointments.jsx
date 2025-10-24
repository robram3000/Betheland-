// AgentScheduleAppointments.jsx
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
    TimePicker,
    message,
    Tooltip,
    Avatar,
    Row,
    Col,
    Popconfirm,
    Badge
} from 'antd';
import {
    SearchOutlined,
    EditOutlined,
    EyeOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    UserOutlined,
    HomeOutlined,
    MessageOutlined,
    CloseOutlined
} from '@ant-design/icons';
import BaseTable from './BaseTable';
import moment from 'moment';
import SchedulePropertiesService from '../../AdminPortal/appointment/Services/SchedulePropertiesService';

const { Option } = Select;
const { TextArea } = Input;

const AgentScheduleAppointments = ({ onScheduleUpdate }) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [chatModalVisible, setChatModalVisible] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const scheduleService = new SchedulePropertiesService();

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = async () => {
        setLoading(true);
        try {
            const agentId = localStorage.getItem('agentId') || 123;
            const result = await scheduleService.getByAgent(agentId);

            if (result.success) {
                setAppointments(result.data);
                onScheduleUpdate?.();
            } else {
                message.error(result.error?.message || 'Failed to load appointments');
            }
        } catch (error) {
            console.error('Error loading appointments:', error);
            message.error('Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    const handleView = (appointment) => {
        setSelectedAppointment(appointment);
        setViewModalVisible(true);
    };

    const handleChat = (appointment) => {
        setSelectedAppointment(appointment);
        loadChatMessages(appointment.id);
        setChatModalVisible(true);
    };

    const loadChatMessages = async (appointmentId) => {
        try {
            const mockMessages = [
                {
                    id: 1,
                    appointmentId: appointmentId,
                    sender: 'client',
                    message: 'Hi, I\'m looking forward to the viewing tomorrow!',
                    timestamp: '2024-01-14T15:30:00',
                    read: true
                },
                {
                    id: 2,
                    appointmentId: appointmentId,
                    sender: 'agent',
                    message: 'Great! The property is ready for viewing. Please bring your ID.',
                    timestamp: '2024-01-14T16:15:00',
                    read: true
                },
                {
                    id: 3,
                    appointmentId: appointmentId,
                    sender: 'client',
                    message: 'Should I bring any documents?',
                    timestamp: '2024-01-14T17:20:00',
                    read: false
                },
                {
                    id: 4,
                    appointmentId: appointmentId,
                    sender: 'client',
                    message: 'Also, is parking available?',
                    timestamp: '2024-01-14T17:21:00',
                    read: false
                }
            ];
            setChatMessages(mockMessages);
        } catch (error) {
            console.error('Error loading chat messages:', error);
            message.error('Failed to load chat messages');
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            const newMessageObj = {
                id: chatMessages.length + 1,
                appointmentId: selectedAppointment.id,
                sender: 'agent',
                message: newMessage,
                timestamp: new Date().toISOString(),
                read: true
            };

            setChatMessages([...chatMessages, newMessageObj]);
            setNewMessage('');

            message.success('Message sent successfully');
        } catch (error) {
            message.error('Failed to send message');
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            let result;
            if (newStatus === 'Completed') {
                result = await scheduleService.complete(id);
            } else if (newStatus === 'Cancelled') {
                result = await scheduleService.cancel(id);
            }

            if (result?.success) {
                message.success(`Appointment ${newStatus.toLowerCase()} successfully`);
                loadAppointments();
            } else {
                message.error(result?.error?.message || 'Failed to update appointment status');
            }
        } catch (error) {
            message.error('Failed to update appointment status');
        }
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
            title: 'Client',
            dataIndex: 'clientName',
            key: 'client',
            width: 150,
            render: (text, record) => (
                <Space>
                    <Avatar size="small" icon={<UserOutlined />} />
                    {text}
                    {record.unreadMessages > 0 && (
                        <Badge count={record.unreadMessages} size="small" />
                    )}
                </Space>
            )
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
            width: 150
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
            width: 180,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="View Details">
                        <Button
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={() => handleView(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Chat with Client">
                        <Badge dot={record.unreadMessages > 0}>
                            <Button
                                icon={<MessageOutlined />}
                                size="small"
                                type="default"
                                onClick={() => handleChat(record)}
                            />
                        </Badge>
                    </Tooltip>
                    {record.status === 'Scheduled' && (
                        <>
                            <Tooltip title="Mark Complete">
                                <Button
                                    icon={<CheckCircleOutlined />}
                                    size="small"
                                    type="primary"
                                    onClick={() => handleStatusChange(record.id, 'Completed')}
                                />
                            </Tooltip>
                            <Tooltip title="Cancel">
                                <Button
                                    icon={<CloseCircleOutlined />}
                                    size="small"
                                    danger
                                    onClick={() => handleStatusChange(record.id, 'Cancelled')}
                                />
                            </Tooltip>
                        </>
                    )}
                </Space>
            )
        }
    ];

    const filteredAppointments = appointments.filter(appointment => {
        const matchesSearch = searchText === '' ||
            appointment.clientName?.toLowerCase().includes(searchText.toLowerCase()) ||
            appointment.propertyTitle?.toLowerCase().includes(searchText.toLowerCase()) ||
            appointment.scheduleNo?.toLowerCase().includes(searchText.toLowerCase());

        const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div>
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
                            placeholder="Search my appointments..."
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
                        </Select>
                    </Space>
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

            <Modal
                title="Appointment Details"
                open={viewModalVisible}
                onCancel={() => setViewModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setViewModalVisible(false)}>
                        Close
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
                            <Col span={24}>
                                <strong>Client:</strong>
                                <div>{selectedAppointment.clientName}</div>
                                <div style={{ color: '#666', fontSize: '12px' }}>
                                    {selectedAppointment.clientPhone} • {selectedAppointment.clientEmail}
                                </div>
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
                                <div>{selectedAppointment.duration} minutes</div>
                            </Col>
                        </Row>
                        <Row gutter={16} style={{ marginBottom: 16 }}>
                            <Col span={24}>
                                <strong>Purpose:</strong>
                                <div>{selectedAppointment.purpose}</div>
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

            <Modal
                title={
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                        <Space>
                            <MessageOutlined />
                            Chat with {selectedAppointment?.clientName}
                            <Tag color="blue">{selectedAppointment?.scheduleNo}</Tag>
                        </Space>
                        <Button
                            type="text"
                            icon={<CloseOutlined />}
                            onClick={() => setChatModalVisible(false)}
                            size="small"
                        />
                    </Space>
                }
                open={chatModalVisible}
                onCancel={() => setChatModalVisible(false)}
                footer={null}
                width={400}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    top: 'auto',
                    left: 'auto',
                    margin: 0,
                    height: '500px',
                    display: 'flex',
                    flexDirection: 'column'
                }}
                bodyStyle={{
                    padding: 0,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {selectedAppointment && (
                    <div style={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'white'
                    }}>
                        <div style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid #f0f0f0',
                            background: '#fafafa'
                        }}>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                                <strong>Property:</strong> {selectedAppointment.propertyTitle}
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                                <strong>Time:</strong> {moment(selectedAppointment.scheduleTime).format('MMM DD, hh:mm A')}
                            </div>
                        </div>

                        <div style={{
                            flex: 1,
                            overflowY: 'auto',
                            padding: '16px',
                            background: 'white'
                        }}>
                            {chatMessages.map((message) => (
                                <div
                                    key={message.id}
                                    style={{
                                        marginBottom: '12px',
                                        display: 'flex',
                                        flexDirection: message.sender === 'agent' ? 'row-reverse' : 'row'
                                    }}
                                >
                                    <div
                                        style={{
                                            maxWidth: '85%',
                                            padding: '8px 12px',
                                            borderRadius: '12px',
                                            background: message.sender === 'agent' ? '#1890ff' : '#f0f0f0',
                                            color: message.sender === 'agent' ? 'white' : 'black',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        <div style={{ fontSize: '14px' }}>{message.message}</div>
                                        <div style={{
                                            fontSize: '10px',
                                            opacity: 0.7,
                                            textAlign: message.sender === 'agent' ? 'right' : 'left',
                                            marginTop: '4px'
                                        }}>
                                            {moment(message.timestamp).format('hh:mm A')}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{
                            padding: '16px',
                            borderTop: '1px solid #f0f0f0',
                            background: '#fafafa'
                        }}>
                            <Space.Compact style={{ width: '100%' }}>
                                <Input
                                    placeholder="Type your message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onPressEnter={handleSendMessage}
                                    size="small"
                                />
                                <Button
                                    type="primary"
                                    onClick={handleSendMessage}
                                    disabled={!newMessage.trim()}
                                    size="small"
                                >
                                    Send
                                </Button>
                            </Space.Compact>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AgentScheduleAppointments;