// globalNavigation.jsx - REFACTORED: Keeps property type bar below main nav
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Layout, Button, Drawer, Grid, Badge, Dropdown, Avatar, Space, List, Typography, Tooltip, Skeleton, message } from 'antd';
import {
    MenuOutlined,
    CloseOutlined,
    HeartOutlined,
    MessageOutlined,
    UserOutlined,
    LogoutOutlined,
    SettingOutlined,
    DownOutlined,
    CalendarOutlined,
    BellOutlined,
    EyeOutlined,
    PhoneOutlined,
    MailOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../Authpage/Services/LoginAuth';
import profileService from '../Accounts/Services/ProfileService';
import { processImageUrl } from '../Employeesportal/AdminPortal/Creation_Property/processImageUrl';
import chatService from '../Employeesportal/AdminPortal/Convo/chatService';

const { Header } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

// ==================== ICONS ====================
const PhoneIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.06 1.18 2 2 0 012.03 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
);

const MailIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
    </svg>
);

const LocationIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const ChevronDown = ({ open }) => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        style={{ transition: "transform 0.22s", transform: open ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}>
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

const ChevronLeftIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z" />
    </svg>
);

const ChevronRightIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
    </svg>
);

const MountainLogo = () => (
    <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
        <rect width="42" height="42" rx="4" fill="white" stroke="#1a3a2a" strokeWidth="1.5" />
        <polyline points="8,32 17,16 22,24 27,18 34,32" stroke="#1a3a2a" strokeWidth="2" fill="none" strokeLinejoin="round" />
        <circle cx="30" cy="12" r="3" fill="none" stroke="#1a3a2a" strokeWidth="1.5" />
    </svg>
);

// Property Types for the horizontal scroll bar
const propertyTypes = [
    { label: "Condominium", icon: "" },
    { label: "Lots", icon: "" },
    { label: "Rent", icon: "" },
    { label: "House & Lot", icon: "" },
    { label: "Townhouse", icon: "" },
    { label: "Apartment", icon: "" },
    { label: "Studio Unit", icon: "" },
    { label: "Office Space", icon: "" },
    { label: "Commercial", icon: "" },
    { label: "Warehouse", icon: "" },
    { label: "Farm Lot", icon: "" },
    { label: "Beach Property", icon: "" },
];

// Dropdown items
const aboutUsItems = [
    { icon: "📖", label: "Our Story", desc: "How Betheland started" },
    { icon: "👥", label: "Our Team", desc: "Meet the people behind us" },
    { icon: "🏆", label: "Awards & Recognition", desc: "Our achievements" },
    { icon: "📍", label: "Our Offices", desc: "Find us near you" },
    { icon: "📰", label: "News & Updates", desc: "Latest from Betheland" },
];

const termItems = [
    { icon: "📜", label: "Terms of Service", desc: "General usage terms" },
    { icon: "🔒", label: "Privacy Policy", desc: "How we handle your data" },
    { icon: "✍️", label: "Buyer's Agreement", desc: "Rights and obligations" },
    { icon: "📋", label: "Seller's Agreement", desc: "Listing requirements" },
    { icon: "💳", label: "Payment Terms", desc: "Accepted modes & policies" },
    { icon: "⚖️", label: "Dispute Resolution", desc: "How we handle issues" },
    { icon: "↩️", label: "Refund Policy", desc: "Cancellation guidelines" },
];

// ==================== DROPDOWN COMPONENT ====================
const NavDropdown = ({ label, items, open, onToggle, onClose }) => {
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) onClose();
        };
        if (open) document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open, onClose]);

    return (
        <div ref={ref} style={{ position: "relative" }}>
            <button
                className={`nav-link ${open ? "active" : ""}`}
                onClick={onToggle}
                style={{ display: "flex", alignItems: "center", gap: 5 }}
            >
                {label}
                <ChevronDown open={open} />
            </button>

            {open && (
                <div className="dropdown-panel">
                    <div className="dropdown-header">{label}</div>
                    <div className="dropdown-grid">
                        {items.map((item) => (
                            <button key={item.label} className="dropdown-item" onClick={onClose}>
                                <span className="dropdown-item-icon">{item.icon}</span>
                                <div>
                                    <div className="dropdown-item-label">{item.label}</div>
                                    <div className="dropdown-item-desc">{item.desc}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ==================== WISHLIST HOOK ====================
const useSafeWishlistData = () => {
    const [wishlistData, setWishlistData] = useState({
        wishlistCount: 0,
        isAuthenticated: false,
    });

    const loadWishlistCount = useCallback(async () => {
        try {
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            if (!token) {
                setWishlistData(prev => ({ ...prev, wishlistCount: 0, isAuthenticated: false }));
                return;
            }
            // Replace with your actual API call
            // const response = await api.get('/wishlist/count');
            setWishlistData(prev => ({ ...prev, wishlistCount: 3, isAuthenticated: true }));
        } catch (error) {
            console.error('Error loading wishlist count:', error);
            setWishlistData(prev => ({ ...prev, wishlistCount: 0, isAuthenticated: false }));
        }
    }, []);

    useEffect(() => {
        loadWishlistCount();
        const interval = setInterval(loadWishlistCount, 10000);
        return () => clearInterval(interval);
    }, [loadWishlistCount]);

    return wishlistData;
};

// ==================== NOTIFICATION HOOK ====================
const useNotifications = (isLoggedIn) => {
    const [notifications, setNotifications] = useState([]);
    const [notificationCount, setNotificationCount] = useState(0);
    const [loadingNotifications, setLoadingNotifications] = useState(false);

    const loadNotifications = useCallback(async () => {
        if (!isLoggedIn) {
            setNotifications([]);
            setNotificationCount(0);
            return;
        }
        setLoadingNotifications(true);
        try {
            // Replace with your actual API call
            // const userNotifications = await chatService.getUserNotifications(true);
            setNotifications([]);
            setNotificationCount(0);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoadingNotifications(false);
        }
    }, [isLoggedIn]);

    return {
        notifications,
        notificationCount,
        loadingNotifications,
        loadNotifications,
        refreshNotifications: loadNotifications
    };
};

// ==================== MAIN COMPONENT ====================
const GlobalNavigation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [profileImageError, setProfileImageError] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [activePropertyType, setActivePropertyType] = useState("Condominium");
    const scrollRef = useRef(null);
    const screens = useBreakpoint();
    const isDesktop = screens.md;

    const { wishlistCount } = useSafeWishlistData();
    const { notifications, notificationCount, loadingNotifications, refreshNotifications } = useNotifications(isLoggedIn);
    const displayWishlistCount = wishlistCount || 0;

    const companyContact = {
        phone: '0977-849-1888 / 0917-791-1981',
        email: 'allanlao@betheland.com.ph'
    };

    const toggleDropdown = (name) => setOpenDropdown(prev => prev === name ? null : name);
    const closeDropdown = () => setOpenDropdown(null);

    const handleMenuClick = (key) => {
        navigate(key);
        setDrawerVisible(false);
        closeDropdown();
    };

    const handlePropertyTypeClick = (type) => {
        setActivePropertyType(type);
        navigate(`/properties?type=${encodeURIComponent(type)}`);
    };

    const scroll = (dir) => {
        scrollRef.current?.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
    };

    const handleLogoClick = () => navigate('/');

    const handleWishlistClick = () => {
        if (!isLoggedIn) {
            const returnUrl = window.location.pathname + window.location.search;
            navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}&action=${encodeURIComponent('view wishlist')}`);
            return;
        }
        navigate('/wishlist');
        setDrawerVisible(false);
    };

    const handleChatClick = () => navigate('/messages');
    const handleScheduleClick = () => navigate('/schedule');
    const handleNotificationsClick = () => navigate('/notifications');
    const handleProfileClick = () => navigate('/profile');

    const handleLogout = () => {
        authService.logout();
        setIsLoggedIn(false);
        setCurrentUser(null);
        setProfileData(null);
        window.location.href = '/login';
        setDrawerVisible(false);
    };

    const checkAuthStatus = () => {
        const authenticated = authService.isAuthenticated();
        if (authenticated) {
            const user = authService.getCurrentUser();
            if (!user || !user.userId) {
                authService.logout();
                setIsLoggedIn(false);
                setCurrentUser(null);
                return;
            }
            setCurrentUser(user);
        } else {
            setCurrentUser(null);
            setProfileData(null);
        }
        setIsLoggedIn(authenticated);
    };

    const loadUserProfile = async () => {
        if (!isLoggedIn) return;
        try {
            const result = await profileService.getProfile();
            if (result.success && result.data) {
                setProfileData(result.data);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    };

    useEffect(() => {
        checkAuthStatus();
    }, [location]);

    useEffect(() => {
        if (isLoggedIn) {
            loadUserProfile();
            refreshNotifications();
        }
    }, [isLoggedIn]);

    const getDisplayName = () => {
        if (profileData?.firstName || profileData?.lastName) {
            return `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() || 'User';
        }
        if (profileData?.username) return profileData.username;
        if (currentUser?.username) return currentUser.username;
        if (currentUser?.email) return currentUser.email.split('@')[0];
        return 'User';
    };

    const getUserInitials = () => {
        const name = getDisplayName();
        if (name === 'User') return 'U';
        if (profileData?.firstName) {
            return `${profileData.firstName[0]}${profileData.lastName?.[0] || ''}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    const getUserEmail = () => profileData?.email || currentUser?.email || 'No email';
    const getProfilePictureUrl = () => {
        if (profileData?.profilePicture) return processImageUrl(profileData.profilePicture);
        if (currentUser?.profilePicture) return processImageUrl(currentUser.profilePicture);
        return null;
    };
    const handleImageError = () => setProfileImageError(true);

    const notificationContent = (
        <div style={{ width: 350, maxHeight: 400, overflow: 'auto', background: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong style={{ fontSize: '16px' }}>Notifications</Text>
            </div>
            {loadingNotifications ? (
                <div style={{ padding: '16px' }}><Skeleton active paragraph={{ rows: 3 }} /></div>
            ) : (
                <List
                    dataSource={notifications}
                    locale={{ emptyText: 'No notifications' }}
                    renderItem={(notification) => (
                        <List.Item style={{ padding: '12px 16px', cursor: 'pointer', backgroundColor: notification.read ? 'white' : '#f6ffed' }}>
                            <List.Item.Meta
                                avatar={<div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: '#1890ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>🔔</div>}
                                title={<Text strong={!notification.read}>{notification.title}</Text>}
                                description={<div><Text type="secondary" style={{ fontSize: '12px' }}>{notification.description}</Text></div>}
                            />
                        </List.Item>
                    )}
                />
            )}
        </div>
    );

    const userMenuItems = [
        { key: 'user-info', label: (<div style={{ padding: '8px 12px' }}><div style={{ fontWeight: 600 }}>{getDisplayName()}</div><div style={{ fontSize: 12, color: '#666' }}>{getUserEmail()}</div></div>), disabled: true },
        { type: 'divider' },
        { key: 'profile', icon: <UserOutlined />, label: 'My Profile', onClick: handleProfileClick },
        { type: 'divider' },
        { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', onClick: handleLogout, danger: true }
    ];

    return (
        <div style={{ fontFamily: "'Georgia','Times New Roman',serif" }}>
            <style>{`
                * { box-sizing: border-box; margin: 0; padding: 0; }
                
                /* Top Bar */
                .top-bar {
                    background: #0c084d; color: #c8d9c0;
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 0 32px; height: 34px;
                    font-size: 12px; font-family: 'Trebuchet MS', sans-serif;
                }
                .top-bar-left, .top-bar-right { display: flex; gap: 20px; align-items: center; }
                .top-bar-item { display: flex; align-items: center; gap: 5px; opacity: 0.85; cursor: pointer; }
                .top-bar-item:hover { opacity: 1; }
                
                /* Main Navigation */
                .main-nav {
                    background: #fff; border-bottom: 1px solid #e8e2d9;
                    display: flex; align-items: center; padding: 0 32px; height: 64px;
                    justify-content: space-between; box-shadow: 0 1px 8px rgba(0,0,0,0.06);
                    position: relative; z-index: 200;
                }
                .brand { display: flex; align-items: center; gap: 12px; cursor: pointer; }
                .brand-text h1 { font-size: 20px; font-weight: 800; color: #132161; letter-spacing: 0.06em; font-family: 'Georgia', serif; line-height: 1; }
                .brand-text p { font-size: 10px; color: #7a8c7a; letter-spacing: 0.12em; font-family: 'Trebuchet MS', sans-serif; text-transform: uppercase; margin-top: 2px; }
                
                /* Navigation Links */
                .nav-links { display: flex; gap: 4px; align-items: center; }
                .nav-link {
                    padding: 8px 14px; font-size: 13.5px; color: #3a4a3a;
                    cursor: pointer; border-radius: 4px; transition: all 0.18s;
                    font-family: 'Trebuchet MS', sans-serif; font-weight: 500;
                    border: none; background: transparent;
                }
                .nav-link:hover, .nav-link.active { color: #1a3a2a; background: #f0ede7; }
                
                /* Dropdown Panel */
                .dropdown-panel {
                    position: absolute; top: calc(100% + 8px); left: 0;
                    background: white; border: 1px solid #e8e2d9; border-radius: 10px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.13);
                    min-width: 340px; z-index: 999; overflow: hidden;
                    animation: dropIn 0.18s ease;
                }
                @keyframes dropIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
                .dropdown-header { padding: 12px 16px 10px; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #9aaa9a; border-bottom: 1px solid #f0ede7; }
                .dropdown-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; padding: 6px; }
                .dropdown-item { display: flex; align-items: flex-start; gap: 10px; padding: 10px; border: none; background: transparent; cursor: pointer; border-radius: 6px; text-align: left; width: 100%; }
                .dropdown-item:hover { background: #f5f3ef; }
                .dropdown-item-label { font-size: 13px; font-weight: 600; color: #1a3a2a; }
                .dropdown-item-desc { font-size: 11px; color: #9aaa9a; margin-top: 2px; }
                
                /* Sign Up Button */
                .join-btn {
                    padding: 8px 20px; background: transparent;
                    border: 1.5px solid #1a3a2a; color: #1a3a2a; border-radius: 4px;
                    font-size: 13px; font-family: 'Trebuchet MS', sans-serif;
                    font-weight: 600; cursor: pointer; transition: all 0.18s;
                }
                .join-btn:hover { background: #1a3a2a; color: white; }
                
                /* Property Type Bar */
                .type-bar-wrapper {
                    background: #fff; border-bottom: 2px solid #e0d9cf;
                    display: flex; align-items: center; position: relative;
                }
                .scroll-btn {
                    width: 32px; height: 40px; display: flex; align-items: center; justify-content: center;
                    background: white; border: none; cursor: pointer; color: #5a6a5a;
                    transition: all 0.15s; flex-shrink: 0; z-index: 2;
                }
                .scroll-btn:hover { color: #1a3a2a; background: #f5f3ef; }
                .scroll-btn.left { border-right: 1px solid #e8e2d9; }
                .scroll-btn.right { border-left: 1px solid #e8e2d9; }
                
                .type-bar {
                    display: flex; align-items: center; overflow-x: auto;
                    scrollbar-width: none; flex: 1; padding: 0 8px;
                }
                .type-bar::-webkit-scrollbar { display: none; }
                
                .type-btn {
                    display: flex; align-items: center; gap: 6px;
                    padding: 10px 16px; font-size: 12.5px; color: #6a7a6a;
                    cursor: pointer; border: none; background: transparent; white-space: nowrap;
                    font-family: 'Trebuchet MS', sans-serif; font-weight: 500; letter-spacing: 0.02em;
                    border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.18s;
                }
                .type-btn:hover { color: #1a3a2a; background: #faf8f5; }
                .type-btn.active { color: #1a3a2a; border-bottom-color: #1a3a2a; font-weight: 700; }
                .type-icon { font-size: 14px; }
                
                @media (max-width: 768px) {
                    .top-bar { display: none; }
                    .main-nav { padding: 0 16px; }
                    .brand-text h1 { font-size: 16px; }
                    .brand-text p { font-size: 8px; }
                    .nav-links { display: none; }
                    .type-btn { padding: 8px 12px; font-size: 11px; }
                }
            `}</style>

            {/* Top Bar */}
            <div className="top-bar">
                <div className="top-bar-left">
                    <span className="top-bar-item"><PhoneIcon /> {companyContact.phone}</span>
                    <span className="top-bar-item"><MailIcon /> {companyContact.email}</span>
                </div>
                <div className="top-bar-right">
                    <span className="top-bar-item"><LocationIcon /> Location</span>
                    <span style={{ opacity: 0.4 }}>|</span>
                    <span className="top-bar-item">FAQ'S</span>
                </div>
            </div>

            {/* Main Navigation */}
            <nav className="main-nav">
                <div className="brand" onClick={handleLogoClick}>
                    <MountainLogo />
                    <div className="brand-text">
                        <h1>BETHELAND</h1>
                        <p>Real Estate Services</p>
                    </div>
                </div>

                {isDesktop && (
                    <div className="nav-links">
                        <NavDropdown label="About Us" items={aboutUsItems} open={openDropdown === "about"} onToggle={() => toggleDropdown("about")} onClose={closeDropdown} />
                        <NavDropdown label="Terms & Conditions" items={termItems} open={openDropdown === "terms"} onToggle={() => toggleDropdown("terms")} onClose={closeDropdown} />
                        <button className="nav-link" onClick={() => handleMenuClick('/properties')}>Properties</button>
                        <button className="nav-link" onClick={() => handleMenuClick('/contact-us')}>Contact Us</button>
                        {isLoggedIn && (
                            <>
                                <button className="nav-link" onClick={handleScheduleClick}>Schedule</button>
                                <button className="nav-link" onClick={handleChatClick}>Chat</button>
                            </>
                        )}
                    </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Wishlist Icon */}
                    <Tooltip title={isLoggedIn ? "Wishlist" : "Login to view wishlist"}>
                        <Badge count={displayWishlistCount} size="small" offset={[-5, 5]}>
                            <Button type="text" icon={<HeartOutlined style={{ fontSize: '18px', color: '#1a3a2a' }} />} onClick={handleWishlistClick} />
                        </Badge>
                    </Tooltip>

                    {/* Notifications Dropdown (Desktop) */}
                    {isDesktop && isLoggedIn && (
                        <Dropdown overlay={notificationContent} trigger={['click']} placement="bottomRight" onOpenChange={(open) => open && refreshNotifications()}>
                            <Badge count={notificationCount} size="small" offset={[-5, 5]}>
                                <Button type="text" icon={<BellOutlined style={{ fontSize: '18px', color: '#1a3a2a' }} />} />
                            </Badge>
                        </Dropdown>
                    )}

                    {/* User Menu / Auth Buttons */}
                    {isDesktop ? (
                        isLoggedIn ? (
                            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
                                <Button type="text" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1a3a2a' }}>
                                    <Space>
                                        <Avatar size="small" src={getProfilePictureUrl() && !profileImageError ? getProfilePictureUrl() : null} icon={<UserOutlined />} onError={handleImageError}>{(!getProfilePictureUrl() || profileImageError) && getUserInitials()}</Avatar>
                                        <span style={{ fontSize: '14px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{getDisplayName()}</span>
                                        <DownOutlined style={{ fontSize: '12px' }} />
                                    </Space>
                                </Button>
                            </Dropdown>
                        ) : (
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <Button onClick={() => navigate('/login')} style={{ borderColor: '#1a3a2a', color: '#1a3a2a' }}>Login</Button>
                                <Button type="primary" onClick={() => navigate('/register/verify-email')} style={{ background: '#1a3a2a', borderColor: '#1a3a2a' }}>Join</Button>
                            </div>
                        )
                    ) : (
                        /* Mobile Menu Button */
                        <Button type="text" icon={drawerVisible ? <CloseOutlined /> : <MenuOutlined />} onClick={() => setDrawerVisible(!drawerVisible)} style={{ fontSize: '18px', color: '#1a3a2a' }} />
                    )}
                </div>
            </nav>

            {/* Property Type Bar - HORIZONTAL SCROLL */}
            <div className="type-bar-wrapper">
                <button className="scroll-btn left" onClick={() => scroll("left")}><ChevronLeftIcon /></button>
                <div className="type-bar" ref={scrollRef}>
                    {propertyTypes.map(({ label, icon }) => (
                        <button
                            key={label}
                            className={`type-btn ${activePropertyType === label ? "active" : ""}`}
                            onClick={() => handlePropertyTypeClick(label)}
                        >
                            <span className="type-icon">{icon}</span>
                            {label}
                        </button>
                    ))}
                </div>
                <button className="scroll-btn right" onClick={() => scroll("right")}><ChevronRightIcon /></button>
            </div>

            {/* Mobile Drawer */}
            <Drawer title="Menu" placement="right" onClose={() => setDrawerVisible(false)} open={drawerVisible} width={280} bodyStyle={{ padding: '16px 0' }}>
                <div style={{ padding: '0 20px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}><PhoneOutlined /> <Text>{companyContact.phone}</Text></div>
                    <div style={{ display: 'flex', gap: '8px' }}><MailOutlined /> <Text>{companyContact.email}</Text></div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 20px' }}>
                    <Button type="text" onClick={() => handleMenuClick('/')}>Home</Button>
                    <Button type="text" onClick={() => handleMenuClick('/properties')}>Properties</Button>
                    <Button type="text" onClick={() => handleMenuClick('/about')}>About Us</Button>
                    <Button type="text" onClick={() => handleMenuClick('/contact-us')}>Contact Us</Button>
                    {isLoggedIn && (
                        <>
                            <Button type="text" onClick={handleScheduleClick}>Schedule</Button>
                            <Button type="text" onClick={handleChatClick}>Chat</Button>
                            <Button type="text" onClick={handleWishlistClick}>Wishlist <Badge count={displayWishlistCount} /></Button>
                            <Button type="text" onClick={handleNotificationsClick}>Notifications <Badge count={notificationCount} /></Button>
                            <Button type="text" onClick={handleProfileClick}>Profile</Button>
                            <Button type="text" danger onClick={handleLogout}>Logout</Button>
                        </>
                    )}
                    {!isLoggedIn && (
                        <>
                            <Button type="primary" onClick={() => navigate('/login')}>Login</Button>
                            <Button onClick={() => navigate('/register/verify-email')}>Register</Button>
                        </>
                    )}
                </div>
            </Drawer>
        </div>
    );
};

export default GlobalNavigation;