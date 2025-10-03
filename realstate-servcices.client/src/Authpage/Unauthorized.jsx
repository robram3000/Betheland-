// Views/Unauthorized.jsx
import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
        }}>
            <Result
                status="403"
                title="403"
                subTitle="Sorry, you are not authorized to access this page."
                extra={
                    <Button type="primary" onClick={() => navigate('/')}>
                        Back Home
                    </Button>
                }
            />
        </div>
    );
};

export default Unauthorized;