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


import BaseScheduling from './Scheduling/BaseScheduling.jsx'

import AgentScheduleLayout from './Employeesportal/AgentPortal/Appointment/AgentScheduleLayout.jsx'
import AgentLayout from './Employeesportal/AgentPortal/Navigation/adminlayout.jsx'
import ProfileLayoutAgent from './Employeesportal/AgentPortal/Profile/ProfileLayoutAgent.jsx'
import ProfileLayoutAdmin from './Employeesportal/AdminPortal/Profile/profilelayoutadmin'

import AgentLayoutadmn from './Employeesportal/AdminPortal/Creation_Agent/agentlayoutadmn.jsx'
import PropertyLayout from './Employeesportal/AdminPortal/Creation_Property/Propertylayout.jsx'
import ScheduleLayout from './Employeesportal/AdminPortal/appointment/Schedulelayout.jsx'
import StatisticPerformanceLayout from './Employeesportal/AdminPortal/StatisticPerformance/StatisticPerformanceLayout'


import Propertylaouts from './Employeesportal/AgentPortal/Properties/PropertyLayout'

import StatisticPerformanceLayoutSuper from './Employeesportal/SuperAdminPortal/StatisticPerformance/StatisticPerformanceLayout';
import ScheduleLayouts from './Employeesportal/SuperAdminPortal/appointment/ScheduleLayout'
import PropertyLayouts from './Employeesportal/SuperAdminPortal/Creation_Property/PropertyLayout'
import Agentlayoutadmins from './Employeesportal/SuperAdminPortal/Creation_Agent/agentlayoutadmn'
import ProfileLayoutAdmins from './Employeesportal/SuperadminPortal/Profile/profilelayoutadmin'
import ConfigContentLandingpage from './Employeesportal/SuperAdminPortal/Content/ConfigContentLandingpage'
import ClientPageLayout from './Employeesportal/SuperAdminPortal/Client/ClientPageLayout'
import AuthLogLayout from './Employeesportal/SuperAdminPortal/authlog/AuthLogLayout'
import ChatMonitor from './Employeesportal/SuperAdminPortal/Convo/ChatMonitor'

import BaseChatAgent from './Employeesportal/AgentPortal/Conversation/BaseChatagent.jsx'


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

                
                    {/* ################ SUPERADMIN ROUTES ################## */}
                    <Route path="/portal/super-admin/chat-monitor" element={
                        <ProtectedRoute
                            requiredRole="SuperAdmin"
                            requiredPermission="all"
                        >
                            <ChatMonitor />
                        </ProtectedRoute>
                    } />

                    <Route path="/portal/super-admin/dashboard" element={
                        <ProtectedRoute
                            requiredRole="SuperAdmin"
                            requiredPermission="all"
                        >
                            <StatisticPerformanceLayoutSuper />
                        </ProtectedRoute>
                    } />
                    <Route path="/portal/super-admin/schedules" element={
                        <ProtectedRoute
                            requiredRole="SuperAdmin"
                            requiredPermission="all"
                        >
                            <ScheduleLayouts />
                        </ProtectedRoute>
                    } />
                    <Route path="/portal/super-admin/agent" element={
                        <ProtectedRoute
                            requiredRole="SuperAdmin"
                            requiredPermission="all"
                        >
                            <Agentlayoutadmins />
                        </ProtectedRoute>
                    } />
                    <Route path="/portal/super-admin/property" element={
                        <ProtectedRoute
                            requiredRole="SuperAdmin"
                            requiredPermission="all"
                        >
                            <PropertyLayouts />
                        </ProtectedRoute>
                    } />
                    <Route path="/portal/super-admin/profile" element={
                        <ProtectedRoute
                            requiredRole="SuperAdmin"
                            requiredPermission="all"
                        >
                            <ProfileLayoutAdmins />
                        </ProtectedRoute>
                    } />
                    <Route path="/portal/super-admin/config-landing-page" element={
                        <ProtectedRoute
                            requiredRole="SuperAdmin"
                            requiredPermission="all"
                        >
                            <ConfigContentLandingpage />
                        </ProtectedRoute>
                    } />

                    <Route path="/portal/super-admin/client" element={
                        <ProtectedRoute
                            requiredRole="SuperAdmin"
                            requiredPermission="all"
                        >
                            <ClientPageLayout />
                        </ProtectedRoute>
                    } />

                    <Route path="/portal/super-admin/authlog" element={
                        <ProtectedRoute
                            requiredRole="SuperAdmin"
                            requiredPermission="all"
                        >
                            <AuthLogLayout />
                        </ProtectedRoute>
                    } />





                    {/* ################ ADMIN ROUTES ################## */}
                    <Route path="/portal/admin/*" element={
                        <ProtectedRoute
                            requiredRole="Admin"
                            requiredPermission="manage_users"
                        >
                            <PropertyLayout />
                        </ProtectedRoute>
                    } />
                    <Route path="/portal/admin/agent" element={
                        <ProtectedRoute
                            requiredRole="Admin"
                            requiredPermission="manage_agents"
                        >
                            <AgentLayoutadmn />
                        </ProtectedRoute>
                    } />
                    <Route path="/portal/admin/properties" element={
                        <ProtectedRoute
                            requiredRole="Admin"
                            requiredPermission="manage_properties"
                        >
                            <PropertyLayout />
                        </ProtectedRoute>
                    } />
                    <Route path="/portal/admin/schedules" element={
                        <ProtectedRoute
                            requiredRole="Admin"
                            requiredPermission="manage_schedule"
                        >
                            <ScheduleLayout/>
                        </ProtectedRoute>
                    } />
                    <Route path="/portal/admin/profile" element={
                        <ProtectedRoute
                            requiredRole="Admin"
                            requiredPermission="manage_schedule"
                        >
                            <ProfileLayoutAdmin />
                        </ProtectedRoute>
                    } />
                    <Route path="/portal/admin/dashboard" element={
                        <ProtectedRoute
                            requiredRole="Admin"
                            requiredPermission="manage_schedule"
                        >
                            <StatisticPerformanceLayout />
                        </ProtectedRoute>
                    } />
           

                    {/* ################ AGENT ROUTES ################## */}
                    <Route path="/portal/agent/*" element={
                        <ProtectedRoute
                            requiredRole="Agent"
                            requiredPermission="manage_properties"
                        >
                            <PropertyLayout />
                        </ProtectedRoute>
                    } /> 
                    <Route path="/portal/agent/all-properties" element={
                        <ProtectedRoute requiredRole="Agent">
                            <Propertylaouts/>
                        </ProtectedRoute>
                    } />
                    <Route
                        path="/portal/agent/all-chats"
                        element={
                            <ProtectedRoute
                                requiredRole="Agent"
                                requiredPermission="manage_profile"
                            >
                                <AgentLayout>
                                    <BaseChatAgent>
                                     
                                    </BaseChatAgent>
                                </AgentLayout>
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/portal/agent/profile" element={
                        <ProtectedRoute requiredRole="Agent"
                            requiredPermission= "manage_profile"
                        >
                           
                                <ProfileLayoutAgent />
                         
                        </ProtectedRoute>
                    } />
                    <Route path="/portal/agent/schedule" element={
                        <ProtectedRoute requiredRole="Agent">
                            <AgentLayout>
                                <AgentScheduleLayout />
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