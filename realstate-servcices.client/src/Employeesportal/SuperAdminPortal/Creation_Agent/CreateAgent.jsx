// CreateAgent.jsx
import React from 'react';
import { Card, Button, Space, Row, Col } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import InsertAgent from './InsertAgent';

const CreateAgent = ({ agent, onSuccess, onBack }) => {
    const handleSuccess = () => {
        if (onSuccess) onSuccess();
    };

    return (
        <Card bodyStyle={{ padding: '16px' }}>
            {/* MOBILE-FRIENDLY HEADER */}
            <div style={{ marginBottom: 16 }}>
                <Row gutter={[8, 8]} align="middle">
                    <Col flex="none">
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={onBack}
                            size="small"
                            type="text"
                        />
                    </Col>
                    <Col flex="auto">
                        <h2 style={{ margin: 0, color: '#1a365d', fontSize: '18px' }}>
                            {agent ? 'Edit Agent' : 'Create New Agent'}
                        </h2>
                        <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>
                            {agent ? 'Update agent information, contact details, and assignments' : 'Add a new real estate agent to the system'}
                        </p>
                    </Col>
                </Row>
            </div>

            <InsertAgent
                agent={agent}
                onSuccess={handleSuccess}
                onCancel={onBack}
            />
        </Card>
    );
};

export default CreateAgent;