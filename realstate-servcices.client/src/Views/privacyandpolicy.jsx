import React from 'react';
import { Typography, Divider, Card } from 'antd';
import BaseView from './BaseView';

const { Title, Paragraph, Text } = Typography;

const PrivacyAndPolicy = () => {
    return (
        <BaseView>
            <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                <Title level={1} style={{ marginBottom: 50 }}>
                    Privacy Policy
                </Title>

                <Card>
                    <Typography>
                        <Paragraph>
                            <Text strong>Last Updated:</Text> {new Date().toLocaleDateString()}
                        </Paragraph>

                        <Divider />

                        <Title level={2}>1. Information We Collect</Title>
                        <Paragraph>
                            At Betheland Real Estate Services, we collect information that you provide directly to us,
                            including when you inquire about properties, contact us through our website, or interact with
                            our social media channels.
                        </Paragraph>

                        <Title level={2}>2. How We Use Your Information</Title>
                        <Paragraph>
                            We use the information we collect to:
                        </Paragraph>
                        <ul>
                            <li>Respond to your inquiries and provide real estate services</li>
                            <li>Send you property information and market updates</li>
                            <li>Improve our services and customer experience</li>
                            <li>Communicate with you about our services</li>
                        </ul>

                        <Title level={2}>3. Information Sharing</Title>
                        <Paragraph>
                            We do not sell, trade, or rent your personal information to third parties. We may share
                            information only when required by law or to protect our rights.
                        </Paragraph>

                        <Title level={2}>4. Data Security</Title>
                        <Paragraph>
                            We implement appropriate security measures to protect your personal information from
                            unauthorized access, alteration, or disclosure.
                        </Paragraph>

                        <Title level={2}>5. Third-Party Links</Title>
                        <Paragraph>
                            Our website may contain links to third-party sites, including our Facebook page.
                            We are not responsible for the privacy practices of these external sites.
                        </Paragraph>

                        <Title level={2}>6. Your Rights</Title>
                        <Paragraph>
                            You have the right to access, correct, or delete your personal information.
                            Contact us to exercise these rights.
                        </Paragraph>

                        <Title level={2}>7. Changes to This Policy</Title>
                        <Paragraph>
                            We may update this privacy policy from time to time. We will notify you of any changes
                            by posting the new policy on this page.
                        </Paragraph>

                        <Title level={2}>8. Contact Us</Title>
                        <Paragraph>
                            If you have any questions about this Privacy Policy, please contact us through:
                        </Paragraph>
                        <ul>
                            <li>Facebook: @bethelandrealestateservices</li>
                            <li>Email: (Coming Soon)</li>
                            <li>Phone: (Coming Soon)</li>
                        </ul>

                        <Divider />

                        <Paragraph>
                            <Text type="secondary">
                                By using our services, you agree to the terms of this Privacy Policy.
                            </Text>
                        </Paragraph>
                    </Typography>
                </Card>
            </div>
        </BaseView>
    );
};

export default PrivacyAndPolicy;