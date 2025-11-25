import React, { useState, useEffect, useCallback } from 'react';
import {
    Table,
    Button,
    Space,
    Tag,
    Card,
    Input,
    Select,
    Modal,
    message,
    Tooltip,
    Avatar,
    Image,
    Badge,
    Dropdown,
    Menu,
    Row,
    Col,
    Divider
} from 'antd';
import {
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    CheckOutlined,
    CloseOutlined,
    UserOutlined,
    MoreOutlined,
    MailOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    CalendarOutlined,
    UserSwitchOutlined,
    PlusOutlined,
    ExportOutlined,
    PrinterOutlined,
    FilePdfOutlined,
    FileExcelOutlined
} from '@ant-design/icons';
import BaseTable from './BaseTable';
import clientService from '../../AdminPortal/Creation_Agent/Services/ClientService';
import {processImageUrl } from '../../AdminPortal/Creation_Property/processImageUrl';

const { Search } = Input;
const { Option } = Select;

const ClientPage = ({ onFilterUpdate, onClientsUpdate, onEditClient, onViewClient, onAddClient }) => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [genderFilter, setGenderFilter] = useState('all');
    const [cityFilter, setCityFilter] = useState('all');
    const [selectedClient, setSelectedClient] = useState(null);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    // Notify parent component when filters change
    useEffect(() => {
        if (onFilterUpdate) {
            onFilterUpdate(searchText, statusFilter, genderFilter);
        }
    }, [searchText, statusFilter, genderFilter, onFilterUpdate]);

    // Load clients
    const loadClients = useCallback(async () => {
        setLoading(true);
        try {
            console.log('Loading clients...');
            const data = await clientService.getClients();
            console.log('Raw clients data:', data);

            if (data && data.length > 0) {
                setClients(data);
            } else {
                console.log('No clients found');
                setClients([]);
            }
        } catch (error) {
            console.error('Error loading clients:', error);
            message.error('Failed to load clients: ' + (error.message || 'Unknown error'));
            setClients([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadClients();
    }, [loadClients]);

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const handleStatusFilter = (value) => {
        setStatusFilter(value);
    };

    const handleGenderFilter = (value) => {
        setGenderFilter(value);
    };

    const handleCityFilter = (value) => {
        setCityFilter(value);
    };

    // Get unique cities for filter
    const getUniqueCities = () => {
        const cities = clients
            .map(client => client.city)
            .filter(city => city && city.trim() !== '');
        return [...new Set(cities)].sort();
    };

    // Get unique statuses for filter
    const getUniqueStatuses = () => {
        const statuses = clients
            .map(client => client.status)
            .filter(status => status && status.trim() !== '');
        return [...new Set(statuses)].sort();
    };

    const filteredClients = clients.filter(client => {
        const matchesSearch = client.firstName?.toLowerCase().includes(searchText.toLowerCase()) ||
            client.lastName?.toLowerCase().includes(searchText.toLowerCase()) ||
            client.email?.toLowerCase().includes(searchText.toLowerCase()) ||
            client.username?.toLowerCase().includes(searchText.toLowerCase()) ||
            client.cellPhoneNo?.includes(searchText);

        const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
        const matchesGender = genderFilter === 'all' || client.gender === genderFilter;
        const matchesCity = cityFilter === 'all' || client.city === cityFilter;

        return matchesSearch && matchesStatus && matchesGender && matchesCity;
    });

    // Export functions
    const handlePrint = () => {
        const printContent = document.querySelector('.ant-card');
        const originalContents = document.body.innerHTML;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Clients Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f5f5f5; }
                        .header { text-align: center; margin-bottom: 20px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Clients Report</h1>
                        <p>Generated on: ${new Date().toLocaleDateString()}</p>
                    </div>
                    ${printContent.innerHTML}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const handleExportPDF = () => {
        message.info('PDF export functionality would be implemented here');
        // In a real implementation, you would use a library like jsPDF or html2pdf
    };

    const handleExportExcel = () => {
        try {
            // Create CSV content
            const headers = ['Name', 'Email', 'Phone', 'Gender', 'City', 'Status', 'Date Registered'];
            const csvContent = [
                headers.join(','),
                ...filteredClients.map(client => [
                    `"${getFullName(client)}"`,
                    `"${client.email || ''}"`,
                    `"${client.cellPhoneNo || ''}"`,
                    `"${client.gender || ''}"`,
                    `"${client.city || ''}"`,
                    `"${client.status || ''}"`,
                    `"${client.dateRegistered ? new Date(client.dateRegistered).toLocaleDateString() : ''}"`
                ].join(','))
            ].join('\n');

            // Create and download file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `clients_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            message.success('Excel/CSV file exported successfully');
        } catch (error) {
            console.error('Export error:', error);
            message.error('Failed to export Excel file');
        }
    };

    const handleEdit = (client) => {
        if (onEditClient) {
            onEditClient(client);
        }
    };

    const handleView = (client) => {
        setSelectedClient(client);
        setViewModalVisible(true);
    };

    const handleDelete = async (clientId) => {
        Modal.confirm({
            title: 'Confirm Delete',
            content: 'Are you sure you want to delete this client? This action cannot be undone.',
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await clientService.deleteClient(clientId);
                    message.success('Client deleted successfully');

                    // Remove from state immediately
                    setClients(prev => prev.filter(client => client.id !== clientId));

                    // Notify parent of update
                    if (onClientsUpdate) {
                        onClientsUpdate();
                    }
                } catch (error) {
                    console.error('Delete error:', error);
                    message.error(error.message || 'Failed to delete client');
                }
            },
        });
    };

    const handleStatusChange = async (clientId, newStatus) => {
        try {
            await clientService.updateClientStatus(clientId, newStatus);
            message.success(`Client status changed to ${newStatus}`);

            // Update status in state
            setClients(prev => prev.map(client =>
                client.id === clientId ? { ...client, status: newStatus } : client
            ));

            // Notify parent of update
            if (onClientsUpdate) {
                onClientsUpdate();
            }
        } catch (error) {
            console.error('Status change error:', error);
            message.error(error.message || 'Failed to change client status');
        }
    };

    const handleAddClient = () => {
        if (onAddClient) {
            onAddClient();
        }
    };

    const handleSuccess = () => {
        loadClients();
        if (onClientsUpdate) {
            onClientsUpdate();
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active': return 'green';
            case 'inactive': return 'red';
            case 'pending': return 'orange';
            case 'suspended': return 'volcano';
            case 'verified': return 'blue';
            default: return 'default';
        }
    };

    const getStatusText = (status) => {
        if (!status) return 'UNKNOWN';
        return status.toUpperCase();
    };

    const getFullName = (client) => {
        if (!client) return 'Unknown Client';
        const nameParts = [
            client.firstName,
            client.middleName,
            client.lastName,
            client.suffix
        ].filter(part => part && part.trim() !== '');
        return nameParts.join(' ');
    };

    const getClientAvatar = (client) => {
        if (client?.profilePictureUrl) {
            return (
                <Avatar
                    size="large"
                    src={processImageUrl(client.profilePictureUrl)}
                    onError={(e) => {
                        e.target.src = processImageUrl('/default-client.jpg');
                    }}
                />
            );
        }
        return <Avatar size="large" icon={<UserOutlined />} />;
    };

    const getContactInfo = (client) => {
        if (!client) return '';
        const contactInfo = [];
        if (client.email) contactInfo.push(client.email);
        if (client.cellPhoneNo) contactInfo.push(client.cellPhoneNo);
        return contactInfo.join(' • ');
    };

    const getLocationInfo = (client) => {
        if (!client) return '';
        const locationInfo = [];
        if (client.city) locationInfo.push(client.city);
        if (client.country) locationInfo.push(client.country);
        return locationInfo.join(', ');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const actionMenu = (record) => (
        <Menu>
            <Menu.Item key="view" icon={<EyeOutlined />} onClick={() => handleView(record)}>
                View Details
            </Menu.Item>
            <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                Edit Client
            </Menu.Item>
            <Menu.SubMenu key="status" title="Change Status" icon={<UserSwitchOutlined />}>
                <Menu.Item key="active" onClick={() => handleStatusChange(record.id, 'Active')}>
                    Mark as Active
                </Menu.Item>
                <Menu.Item key="inactive" onClick={() => handleStatusChange(record.id, 'Inactive')}>
                    Mark as Inactive
                </Menu.Item>
                <Menu.Item key="pending" onClick={() => handleStatusChange(record.id, 'Pending')}>
                    Mark as Pending
                </Menu.Item>
                <Menu.Item key="suspended" onClick={() => handleStatusChange(record.id, 'Suspended')}>
                    Mark as Suspended
                </Menu.Item>
                <Menu.Item key="verified" onClick={() => handleStatusChange(record.id, 'Verified')}>
                    Mark as Verified
                </Menu.Item>
            </Menu.SubMenu>
            <Menu.Divider />
            <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)}>
                Delete Client
            </Menu.Item>
        </Menu>
    );

    const columns = [
        {
            title: 'Client',
            dataIndex: 'firstName',
            key: 'client',
            render: (text, record) => (
                <Space direction="vertical" size={4}>
                    <Space>
                        <Badge dot={record.status === 'Active'} color="green" offset={[-5, 5]}>
                            {getClientAvatar(record)}
                        </Badge>
                        <div>
                            <div style={{ fontWeight: 500 }}>{getFullName(record)}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                                @{record.username || 'No username'}
                            </div>
                            <Divider style={{ margin: '8px 0' }} />
                          
                        </div>
                    </Space>
                </Space>
            ),
        },
        {
            title: 'Contact Information',
            key: 'contact',
            render: (_, record) => (
                <Space direction="vertical" size={8}>
                  
               
                    <Space direction="vertical" size={4}>
                        {record.email && (
                            <Space size={4}>
                                <MailOutlined style={{ color: '#1e3a8a', fontSize: '12px' }} />
                                <span style={{ fontSize: '12px' }}>{record.email}</span>
                            </Space>
                        )}
                        {record.cellPhoneNo && (
                            <Space size={4}>
                                <PhoneOutlined style={{ color: '#1e3a8a', fontSize: '12px' }} />
                                <span style={{ fontSize: '12px' }}>{record.cellPhoneNo}</span>
                            </Space>
                        )}
                        {getLocationInfo(record) && (
                            <Space size={4}>
                                <EnvironmentOutlined style={{ color: '#1e3a8a', fontSize: '12px' }} />
                                <span style={{ fontSize: '12px' }}>{getLocationInfo(record)}</span>
                            </Space>
                        )}
                    </Space>
                </Space>
            ),
        },
        {
            title: 'Personal Details',
            key: 'details',
            render: (_, record) => (
                <Space direction="vertical" size={8}>
                    <div style={{ fontSize: '12px' }}>
                        <strong>Gender:</strong> {record.gender || 'Not specified'}
                    </div>
                    <Divider style={{ margin: '8px 0' }} />
                    <Space direction="vertical" size={4}>
                        <Space size={4}>
                            <CalendarOutlined style={{ color: '#1e3a8a', fontSize: '12px' }} />
                            <span style={{ fontSize: '11px', color: '#666' }}>
                                Registered: {formatDate(record.dateRegistered)}
                            </span>
                        </Space>
                        {record.createdAt && (
                            <Space size={4}>
                                <CalendarOutlined style={{ color: '#1e3a8a', fontSize: '12px' }} />
                                <span style={{ fontSize: '11px', color: '#666' }}>
                                    Created: {formatDate(record.createdAt)}
                                </span>
                            </Space>
                        )}
                    </Space>
                </Space>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {getStatusText(status)}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
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
                    <Dropdown overlay={actionMenu(record)} trigger={['click']}>
                        <Button
                            icon={<MoreOutlined />}
                            size="small"
                        />
                    </Dropdown>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Card>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                    <Space wrap>
                        <Search
                            placeholder="Search clients by name, email, phone..."
                            allowClear
                            onSearch={handleSearch}
                            style={{ width: 300 }}
                        />
                        <Select
                            defaultValue="all"
                            style={{ width: 150 }}
                            onChange={handleStatusFilter}
                        >
                            <Option value="all">All Status</Option>
                            {getUniqueStatuses().map(status => (
                                <Option key={status} value={status}>{status}</Option>
                            ))}
                        </Select>
                        <Select
                            defaultValue="all"
                            style={{ width: 120 }}
                            onChange={handleGenderFilter}
                        >
                            <Option value="all">All Gender</Option>
                            <Option value="Male">Male</Option>
                            <Option value="Female">Female</Option>
                            <Option value="Other">Other</Option>
                        </Select>
                        <Select
                            defaultValue="all"
                            style={{ width: 150 }}
                            onChange={handleCityFilter}
                        >
                            <Option value="all">All Cities</Option>
                            {getUniqueCities().map(city => (
                                <Option key={city} value={city}>{city}</Option>
                            ))}
                        </Select>
                    </Space>

                    <Space>
                    
                        <Tooltip title="Print">
                            <Button icon={<PrinterOutlined />} onClick={handlePrint}>
                                Print
                            </Button>
                        </Tooltip>
                        <Tooltip title="Export PDF">
                            <Button icon={<FilePdfOutlined />} onClick={handleExportPDF}>
                                PDF
                            </Button>
                        </Tooltip>
                        <Tooltip title="Export Excel">
                            <Button icon={<FileExcelOutlined />} onClick={handleExportExcel}>
                                Excel
                            </Button>
                        </Tooltip>
                    </Space>
                </div>

                <BaseTable
                    data={filteredClients}
                    columns={columns}
                    loading={loading}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} of ${total} clients`,
                        position: ['bottomRight']
                    }}
                    style={{ marginBottom: 0 }}
                />
            </Card>

            {/* View Client Modal */}
            <Modal
                title="Client Details"
                open={viewModalVisible}
                onCancel={() => setViewModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setViewModalVisible(false)}>
                        Close
                    </Button>,
                ]}
                width={700}
            >
                {selectedClient && (
                    <div>
                        <Row gutter={16} style={{ marginBottom: 16 }}>
                            <Col span={8} style={{ textAlign: 'center' }}>
                                {getClientAvatar(selectedClient)}
                                <div style={{ marginTop: 8 }}>
                                    <Tag color={getStatusColor(selectedClient.status)}>
                                        {getStatusText(selectedClient.status)}
                                    </Tag>
                                </div>
                            </Col>
                            <Col span={16}>
                                <h2>{getFullName(selectedClient)}</h2>
                                <p style={{ color: '#666' }}>@{selectedClient.username || 'No username'}</p>
                                <Space direction="vertical">
                                    {selectedClient.email && (
                                        <Space>
                                            <MailOutlined />
                                            <span>{selectedClient.email}</span>
                                        </Space>
                                    )}
                                    {selectedClient.cellPhoneNo && (
                                        <Space>
                                            <PhoneOutlined />
                                            <span>{selectedClient.cellPhoneNo}</span>
                                        </Space>
                                    )}
                                </Space>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <h3>Personal Information</h3>
                                <p><strong>Gender:</strong> {selectedClient.gender || 'Not specified'}</p>
                                <p><strong>Date Registered:</strong> {formatDate(selectedClient.dateRegistered)}</p>
                                {selectedClient.createdAt && (
                                    <p><strong>Created:</strong> {formatDate(selectedClient.createdAt)}</p>
                                )}
                            </Col>
                            <Col span={12}>
                                <h3>Address Information</h3>
                                <p><strong>City:</strong> {selectedClient.city || 'N/A'}</p>
                                <p><strong>Country:</strong> {selectedClient.country || 'N/A'}</p>
                                <p><strong>Street:</strong> {selectedClient.street || 'N/A'}</p>
                                <p><strong>Zip Code:</strong> {selectedClient.zipCode || 'N/A'}</p>
                            </Col>
                        </Row>

                        {selectedClient.middleName || selectedClient.suffix ? (
                            <div style={{ marginTop: 16 }}>
                                <h3>Additional Information</h3>
                                {selectedClient.middleName && (
                                    <p><strong>Middle Name:</strong> {selectedClient.middleName}</p>
                                )}
                                {selectedClient.suffix && (
                                    <p><strong>Suffix:</strong> {selectedClient.suffix}</p>
                                )}
                            </div>
                        ) : null}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ClientPage;