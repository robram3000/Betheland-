// RatingPage.jsx
import React, { useState, useEffect } from 'react';
import {
    Card,
    Rate,
    Input,
    Button,
    Space,
    Typography,
    message,
    Spin,
    Alert,
    Descriptions
} from 'antd';
import {
    StarOutlined,
    UserOutlined,
    HomeOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import ratingScheduleService from '../Employeesportal/AdminPortal/Ratings/RatingScheduleServices';

import authService from '../Authpage/Services/LoginAuth';

const { Title, Text } = Typography;
const { TextArea } = Input;

const RatingPage = ({ appointment, onClose, user }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [checkingEligibility, setCheckingEligibility] = useState(true);
    const [canRate, setCanRate] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    // Check if user can rate this schedule
    useEffect(() => {
        const checkRatingEligibility = async () => {
            if (!appointment) {
                setCheckingEligibility(false);
                return;
            }

            try {
                setCheckingEligibility(true);
                const currentUser = user || authService.getCurrentUser();

                if (!currentUser) {
                    setError('Please log in to submit a rating');
                    setCanRate(false);
                    return;
                }

                console.log('Checking rating eligibility for appointment:', appointment);
                console.log('Appointment status:', appointment.status);
                console.log('Current user ID:', currentUser.userId);
                console.log('Appointment clientId:', appointment.clientId);

                // Check if user can rate this schedule
                const canRateSchedule = await ratingScheduleService.canRateSchedule(appointment.id);
                console.log('Can rate schedule result:', canRateSchedule);

                setCanRate(canRateSchedule);

                if (!canRateSchedule) {
                    // Provide more specific error message
                    let errorMessage = 'You are not eligible to rate this appointment. ';

                    if (appointment.status !== 'Completed') {
                        errorMessage += 'The appointment must be completed.';
                    } else if (appointment.clientId !== currentUser.userId) {
                        errorMessage += 'You must be the client who scheduled this appointment.';
                    } else {
                        errorMessage += 'You may have already rated this appointment.';
                    }

                    setError(errorMessage);
                }

            } catch (error) {
                console.error('Error checking rating eligibility:', error);
                setError('Unable to verify rating eligibility. Please try again.');
                setCanRate(false);
            } finally {
                setCheckingEligibility(false);
            }
        };

        checkRatingEligibility();
    }, [appointment, user]);

    const handleSubmitRating = async () => {
        if (rating === 0) {
            message.warning('Please select a star rating');
            return;
        }

        if (!appointment) {
            message.error('No appointment data found');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const currentUser = user || authService.getCurrentUser();

            if (!currentUser) {
                throw new Error('Please log in to submit a rating');
            }

            console.log('Appointment data:', appointment);
            console.log('Current user:', currentUser);

            // Prepare rating schedule data - agentId will be handled by backend
            const ratingData = {
                scheduleId: appointment.id,
                rating: rating,
                comment: comment.trim(),
                ratingType: 'agent'
            };

            console.log('Submitting rating schedule data:', ratingData);

            // Submit rating using schedule service
            const result = await ratingScheduleService.createRatingSchedule(ratingData);

            console.log('Rating submitted successfully:', result);

            // Reset form
            setRating(0);
            setComment('');
            setSubmitted(true);

            message.success('Thank you for your rating! Your feedback has been submitted successfully.');

            // Close the modal after successful submission
            if (onClose) {
                setTimeout(() => {
                    onClose();
                }, 2000);
            }

        } catch (error) {
            console.error('Error submitting rating:', error);
            const errorMessage = error.message || 'Failed to submit rating. Please try again.';
            setError(errorMessage);
            message.error(errorMessage);

            // Log detailed error information
            if (error.response) {
                console.error('Server response error:', error.response.data);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRateChange = (value) => {
        setRating(value);
        // Clear error when user starts rating
        if (error && value > 0) {
            setError(null);
        }
    };

    const handleCommentChange = (e) => {
        setComment(e.target.value);
    };

    // Success state after submission
    if (submitted) {
        return (
            <div style={{
                padding: '40px 24px',
                textAlign: 'center'
            }}>
                <div style={{ marginBottom: 24 }}>
                    <div style={{
                        fontSize: '48px',
                        color: '#52c41a',
                        marginBottom: 16
                    }}>
                        ✓
                    </div>
                    <Title level={2} style={{ color: '#52c41a', marginBottom: 16 }}>
                        Thank You!
                    </Title>
                    <Text style={{ fontSize: '16px', color: '#666' }}>
                        Your rating has been submitted successfully.
                    </Text>
                </div>
                <Button
                    type="primary"
                    onClick={onClose}
                    style={{
                        backgroundColor: '#1B3C53',
                        borderColor: '#1B3C53',
                        height: 45,
                        fontSize: '16px',
                        fontWeight: 'bold',
                        borderRadius: 8
                    }}
                >
                    Close
                </Button>
            </div>
        );
    }

    // Loading state while checking eligibility
    if (checkingEligibility) {
        return (
            <div style={{
                padding: '40px 24px',
                textAlign: 'center'
            }}>
                <Spin size="large" tip="Checking rating eligibility...">
                    <div style={{ height: 100 }} />
                </Spin>
            </div>
        );
    }

    // Not eligible to rate
    if (!canRate && !checkingEligibility) {
        return (
            <div style={{
                padding: '24px',
                textAlign: 'center'
            }}>
                <Alert
                    message="Rating Not Available"
                    description={error || "You are not eligible to rate this appointment. The appointment must be completed and you must be the client who scheduled it."}
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
                <Button
                    onClick={onClose}
                    style={{
                        backgroundColor: '#1B3C53',
                        borderColor: '#1B3C53',
                        color: 'white'
                    }}
                >
                    Close
                </Button>
            </div>
        );
    }

    return (
        <div style={{
            padding: '0px',
            margin: '0 auto',
            maxWidth: 600
        }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ color: '#1B3C53', marginBottom: 8 }}>
                    Rate Your Experience
                </Title>
                <Text type="secondary" style={{ fontSize: '16px' }}>
                    Share your feedback about the property viewing appointment
                </Text>
            </div>

            {/* Error Alert */}
            {error && (
                <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                    style={{ marginBottom: 16 }}
                    closable
                    onClose={() => setError(null)}
                />
            )}

            {/* Rating Form */}
            <Card
                style={{
                    margin: '0 auto',
                    border: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
                bodyStyle={{ padding: 24 }}
            >
                <Spin spinning={loading} tip="Submitting your rating...">
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>

                        {/* Appointment Information */}
                        {appointment && (
                            <Card
                                size="small"
                                title={
                                    <Space>
                                        <CalendarOutlined />
                                        <Text strong>Appointment Details</Text>
                                    </Space>
                                }
                                style={{ backgroundColor: '#f8fafc' }}
                            >
                                <Descriptions column={1} size="small">
                                    <Descriptions.Item label="Property">
                                        <Space>
                                            <HomeOutlined />
                                            {appointment.property?.title || 'Property Viewing'}
                                        </Space>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Agent">
                                        <Space>
                                            <UserOutlined />
                                            {appointment.agent?.firstName ?
                                                `${appointment.agent.firstName} ${appointment.agent.lastName}` :
                                                'Assigned Agent'
                                            }
                                        </Space>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Date">
                                        <Space>
                                            <CalendarOutlined />
                                            {appointment.scheduleTime ?
                                                new Date(appointment.scheduleTime).toLocaleDateString() :
                                                'Scheduled'
                                            }
                                        </Space>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Status">
                                        <Space>
                                            <Text style={{
                                                color: appointment.status === 'Completed' ? '#52c41a' : '#faad14',
                                                fontWeight: 'bold'
                                            }}>
                                                {appointment.status}
                                            </Text>
                                        </Space>
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>
                        )}

                        {/* Star Rating */}
                        <div style={{ textAlign: 'center', padding: '16px 0' }}>
                            <Text strong style={{ fontSize: '18px', display: 'block', marginBottom: 20 }}>
                                How would you rate your overall experience?
                            </Text>
                            <Rate
                                value={rating}
                                onChange={handleRateChange}
                                style={{ fontSize: 36 }}
                                disabled={loading}
                                character={<StarOutlined />}
                            />
                            <div style={{ marginTop: 12 }}>
                                <Text style={{ fontSize: '16px', color: rating > 0 ? '#1B3C53' : '#666', fontWeight: 500 }}>
                                    {rating === 0 && 'Click stars to rate'}
                                    {rating === 1 && 'Poor'}
                                    {rating === 2 && 'Fair'}
                                    {rating === 3 && 'Good'}
                                    {rating === 4 && 'Very Good'}
                                    {rating === 5 && 'Excellent'}
                                </Text>
                            </div>
                        </div>

                        {/* Comment Section */}
                        <div>
                            <Text strong style={{ fontSize: '16px', display: 'block', marginBottom: 8 }}>
                                Your Comments (Optional)
                            </Text>
                            <TextArea
                                value={comment}
                                onChange={handleCommentChange}
                                placeholder="Share details about your experience... What did you like? Any suggestions for improvement?"
                                rows={4}
                                style={{
                                    marginTop: 8,
                                    borderRadius: 8
                                }}
                                maxLength={500}
                                showCount
                                disabled={loading}
                            />
                        </div>

                        {/* Action Buttons */}
                        <Space style={{ width: '100%', justifyContent: 'space-between', marginTop: 8 }}>
                            <Button
                                onClick={onClose}
                                disabled={loading}
                                style={{
                                    borderColor: '#1B3C53',
                                    color: '#1B3C53'
                                }}
                            >
                                Cancel
                            </Button>

                            <Button
                                type="primary"
                                size="large"
                                onClick={handleSubmitRating}
                                disabled={rating === 0 || loading}
                                loading={loading}
                                style={{
                                    backgroundColor: '#1B3C53',
                                    borderColor: '#1B3C53',
                                    height: 45,
                                    minWidth: 150,
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    borderRadius: 8
                                }}
                            >
                                {loading ? 'Submitting...' : 'Submit Rating'}
                            </Button>
                        </Space>

                    </Space>
                </Spin>
            </Card>
        </div>
    );
};

export default RatingPage;