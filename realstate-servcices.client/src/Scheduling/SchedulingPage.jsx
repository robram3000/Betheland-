// SchedulingPage.jsx
import React, { useState } from 'react';
import {
    Card,
    Calendar,
    Button,
    Modal,
    Form,
    Input,
    Select,
    TimePicker,
    Row,
    Col,
    Tag,
    message
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const SchedulingPage = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [events, setEvents] = useState([]);
    const [form] = Form.useForm();

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const handleOk = () => {
        form.validateFields()
            .then(values => {
                const newEvent = {
                    id: Date.now(),
                    title: values.title,
                    description: values.description,
                    date: values.date.format('YYYY-MM-DD'),
                    time: values.time.format('HH:mm'),
                    type: values.type,
                };

                setEvents([...events, newEvent]);
                message.success('Event scheduled successfully!');
                setIsModalVisible(false);
                form.resetFields();
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };

    const getListData = (value) => {
        return events.filter(event => event.date === value.format('YYYY-MM-DD'));
    };

    const dateCellRender = (value) => {
        const listData = getListData(value);
        return (
            <div style={{ minHeight: '80px' }}>
                {listData.map(item => (
                    <Tag
                        key={item.id}
                        color={item.type === 'meeting' ? 'blue' : item.type === 'appointment' ? 'green' : 'orange'}
                        style={{ marginBottom: '2px', width: '100%' }}
                    >
                        {item.time} - {item.title}
                    </Tag>
                ))}
            </div>
        );
    };

    return (
        <div style={{ padding: '24px' }}>
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card
                        title="Scheduling Calendar"
                        extra={
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={showModal}
                            >
                                Add Event
                            </Button>
                        }
                    >
                        <Calendar
                            dateCellRender={dateCellRender}
                            style={{ background: 'white', borderRadius: '8px' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Modal
                title="Schedule New Event"
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    name="scheduleForm"
                >
                    <Form.Item
                        name="title"
                        label="Event Title"
                        rules={[{ required: true, message: 'Please input the event title!' }]}
                    >
                        <Input placeholder="Enter event title" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                    >
                        <TextArea rows={3} placeholder="Enter event description" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="date"
                                label="Date"
                                rules={[{ required: true, message: 'Please select a date!' }]}
                            >
                                <Input type="date" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="time"
                                label="Time"
                                rules={[{ required: true, message: 'Please select a time!' }]}
                            >
                                <Input type="time" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="type"
                        label="Event Type"
                        rules={[{ required: true, message: 'Please select an event type!' }]}
                    >
                        <Select placeholder="Select event type">
                            <Option value="meeting">Meeting</Option>
                            <Option value="appointment">Appointment</Option>
                            <Option value="reminder">Reminder</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SchedulingPage;