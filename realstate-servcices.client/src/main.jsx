// main.jsx (Corrected Version)
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { UserProvider } from './Authpage/Services/UserContextService'
import ProtectedRoute, { PublicOnlyRoute, RoleSpecificRoute } from './Authpage/Services/ProtectedRoute'
import Unauthorized from './Authpage/Unauthorized'
import { EmailVerification, OTPVerification, AccountSetup, BasicInformation } from './Register/index.jsx'
import { ChangePassword, EmailSender, OtpVerify } from './Forgotpassword/index.jsx'
import BaseLandingPage from './LandingPage/BaselandingPage.jsx'
import BaseProperty from './Property/BaseProperty.jsx'
import BaseSeeProperty from './Property/BaseSeeProperty.jsx'
import { ContactUs, AboutUs, PrivacyAndPolicy } from './Views/index.jsx'
import AuthPage from './Authpage/AuthPage.jsx'
import BaseWishlist from './Wishlist/BaseWishlist.jsx'
import BaseChat from './Chat/BaseChat.jsx'
import { BaseSettings, BaseProfile } from './Accounts/index.jsx'
import EmployeePortal from './Employeesportal/EmployeePortal.jsx'
import SuperAdminLayout from './Employeesportal/SuperAdminPortal/Navigation/adminlayout.jsx'
import AdminLayout from './Employeesportal/AdminPortal/Navigation/adminlayout.jsx'
import BaseScheduling from './Scheduling/BaseScheduling.jsx'
import PropertyManagementPage from './Employeesportal/AgentPortal/Properties/PropertyManagementPage.jsx'
import ScheduleManagementPage from './Employeesportal/AgentPortal/Appointment/ScheduleManagementPage.jsx'
import AgentLayout from './Employeesportal/AgentPortal/Navigation/adminlayout.jsx'

// Add these agent-specific components if they don't exist



createRoot(document.getElementById('root')).render(
    <StrictMode>
        <UserProvider>
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<BaseLandingPage />} />
                    <Route path="/properties/view" element={<BaseSeeProperty />} />
                    <Route path="/properties" element={<BaseProperty />} />
                    <Route path="/about" element={<AboutUs />} />
                    <Route path="/contact-us" element={<ContactUs />} />
                    <Route path="/privacy-and-policy" element={<PrivacyAndPolicy />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />

                    {/* Authentication Routes */}
                    <Route path="/login" element={
                        <PublicOnlyRoute>
                            <AuthPage />
                        </PublicOnlyRoute>
                    } />

                    {/* Registration Routes */}
                    <Route path="/register/verify-email" element={
                        <PublicOnlyRoute>
                            <EmailVerification />
                        </PublicOnlyRoute>
                    } />
                    <Route path="/register/verify-otp" element={
                        <PublicOnlyRoute>
                            <OTPVerification />
                        </PublicOnlyRoute>
                    } />
                    <Route path="/register/basic-info" element={
                        <PublicOnlyRoute>
                            <BasicInformation />
                        </PublicOnlyRoute>
                    } />
                    <Route path="/register/account-setup" element={
                        <PublicOnlyRoute>
                            <AccountSetup />
                        </PublicOnlyRoute>
                    } />

                    {/* Password Reset Routes */}
                    <Route path="/forgot-password/verify-email" element={
                        <PublicOnlyRoute>
                            <EmailSender />
                        </PublicOnlyRoute>
                    } />
                    <Route path="/forgot-password/verify-otp" element={
                        <PublicOnlyRoute>
                            <OtpVerify />
                        </PublicOnlyRoute>
                    } />
                    <Route path="/forgot-password/reset" element={
                        <PublicOnlyRoute>
                            <ChangePassword />
                        </PublicOnlyRoute>
                    } />

                    {/* Authenticated User Routes */}
                    <Route path="/messages" element={
                        <ProtectedRoute requiredPermission="send_messages">
                            <BaseChat />
                        </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                        <ProtectedRoute requiredPermission="manage_own_profile">
                            <BaseProfile />
                        </ProtectedRoute>
                    } />
                    <Route path="/settings" element={
                        <ProtectedRoute requiredPermission="manage_own_profile">
                            <BaseSettings />
                        </ProtectedRoute>
                    } />
                    <Route path="/schedule" element={
                        <ProtectedRoute requiredAnyPermission={['manage_schedule', 'schedule_viewings']}>
                            <BaseScheduling />
                        </ProtectedRoute>
                    } />
                    <Route path="/wishlist" element={
                        <ProtectedRoute requiredPermission="view_wishlist">
                            <BaseWishlist />
                        </ProtectedRoute>
                    } />

                    {/* Employee Portal */}
                    <Route path="/employeeportal" element={
                        <ProtectedRoute requiredAnyPermission={['manage_properties', 'manage_users', 'manage_system']}>
                            <EmployeePortal />
                        </ProtectedRoute>
                    } />

                    {/* Role-Specific Admin Routes */}
                    <Route path="/portal/super-admin/*" element={
                        <ProtectedRoute
                            requiredRole="SuperAdmin"
                            requiredPermission="manage_system"
                        >
                            <SuperAdminLayout />
                        </ProtectedRoute>
                    } />

                    <Route path="/portal/admin/*" element={
                        <ProtectedRoute
                            requiredRole="Admin"
                            requiredPermission="manage_users"
                        >
                            <AdminLayout />
                        </ProtectedRoute>
                    } />


               
                    {/* Agent Portal with Nested Routes */}
                    <Route path="/portal/agent/*" element={
                        <ProtectedRoute
                            requiredRole="Agent"
                            requiredPermission="manage_properties"
                        >
                            <AgentLayout />
                        </ProtectedRoute>
                    } />

                    {/* Add individual agent routes if needed */}
                    <Route path="/portal/agent/all-properties" element={
                        <ProtectedRoute requiredRole="Agent">
                            <AgentLayout>
                                <PropertyManagementPage />
                            </AgentLayout>
                        </ProtectedRoute>
                    } />
                    <Route path="/portal/agent/all-schedule" element={
                        <ProtectedRoute requiredRole="Agent">
                            <AgentLayout>
                                <ScheduleManagementPage />
                            </AgentLayout>
                        </ProtectedRoute>
                    } />

                    {/* Fallback route */}
                    <Route path="*" element={<BaseLandingPage />} />
                </Routes>
            </Router>
        </UserProvider>
    </StrictMode>
)