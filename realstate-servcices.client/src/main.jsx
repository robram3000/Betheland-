// main.jsx (improved version)
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { EmailVerification, OTPVerification, AccountSetup, BasicInformation } from './Register/index.jsx'
import { ChangePassword, EmailSender, OtpVerify } from './Forgotpassword/index.jsx'
import BaseLandingPage from './LandingPage/BaselandingPage.jsx'
import BaseProperty from './Property/BaseProperty.jsx'
import BaseSeeProperty from './Property/BaseSeeProperty.jsx'
import { ContactUs, AboutUs, PrivacyAndPolicy } from './Views/index.jsx'
import AuthPage from './Authpage/AuthPage.jsx'
import WishlistPage from './Wishlist/WishlistPage.jsx'
import BaseChat from './Chat/BaseChat.jsx'
import { BaseSettings, BaseProfile } from './Accounts/index.jsx'
import EmployeePortal from './Employeesportal/EmployeePortal.jsx'
import AdminLayout from './Employeesportal/SuperAdminPortal/Navigation/adminlayout.jsx'


createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<BaseLandingPage />} />
                <Route path="/properties/view" element={<BaseSeeProperty />} />
                <Route path="/properties" element={<BaseProperty />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/contact-us" element={<ContactUs />} />
                <Route path="/privacy-and-policy" element={<PrivacyAndPolicy />} />

                {/* Registration Flow */}
                <Route path="/register/verify-email" element={<EmailVerification />} />
                <Route path="/register/verify-otp" element={<OTPVerification />} />
                <Route path="/register/basic-info" element={<BasicInformation />} />
                <Route path="/register/account-setup" element={<AccountSetup />} />

                {/* Password Reset Flow */}
                <Route path="/forgot-password/verify-email" element={<EmailSender />} />
                <Route path="/forgot-password/verify-otp" element={<OtpVerify />} />
                <Route path="/forgot-password/reset" element={<ChangePassword />} />

                {/* authenticated login user */}
                <Route path="/messages" element={<BaseChat />} />
                <Route path="/profile" element={<BaseProfile />} />
                <Route path="/settings" element={<BaseSettings />} />


                <Route path="/e-p" element={<EmployeePortal />} />
                <Route path="/e-p-s" element={<AdminLayout />} />
                {/* Fallback route */}
                <Route path="*" element={<BaseLandingPage />} />
            </Routes>
        </Router>
    </StrictMode>
)