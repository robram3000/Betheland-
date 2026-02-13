// WishlistAdded.jsx - FIXED VERSION with Real-time Counting
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../../Authpage/Services/Api';

const WishlistDataContext = createContext();

export const useWishlistData = () => {
    const context = useContext(WishlistDataContext);
    if (!context) {
        throw new Error('useWishlistData must be used within a WishlistDataProvider');
    }
    return context;
};

// Enhanced authentication helper
const getAuthInfo = () => {
    const token = localStorage.getItem('authToken') ||
        sessionStorage.getItem('authToken') ||
        localStorage.getItem('sessionAuthToken');

    if (!token) {
        localStorage.removeItem('clientId');
        return { isAuthenticated: false, userId: null };
    }

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = payload.exp * 1000 < Date.now();

        if (isExpired) {
            localStorage.removeItem('authToken');
            sessionStorage.removeItem('authToken');
            localStorage.removeItem('sessionAuthToken');
            localStorage.removeItem('clientId');
            localStorage.removeItem('userData');
            sessionStorage.removeItem('userData');
            return { isAuthenticated: false, userId: null };
        }

        const userData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
        const user = userData ? JSON.parse(userData) : null;

        return {
            isAuthenticated: true,
            userId: user?.userId || payload.userId || payload.sub,
            userData: user
        };
    } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        localStorage.removeItem('sessionAuthToken');
        localStorage.removeItem('clientId');
        localStorage.removeItem('userData');
        sessionStorage.removeItem('userData');
        return { isAuthenticated: false, userId: null };
    }
};

// API service for wishlist
class WishlistService {
    async getClientWishlist(clientId) {
        const response = await api.get(`/wishlist/client/${clientId}`);
        return response;
    }

    async addToWishlist(wishlistData) {
        const response = await api.post('/wishlist', wishlistData);
        return response;
    }

    async removeFromWishlist(wishlistId) {
        const response = await api.delete(`/wishlist/${wishlistId}`);
        return response;
    }

    async removeFromWishlistByProperty(clientId, propertyId) {
        await api.delete(`/wishlist/client/${clientId}/property/${propertyId}`);
    }

    async checkPropertyInWishlist(clientId, propertyId) {
        const response = await api.get(`/wishlist/client/${clientId}/property/${propertyId}/exists`);
        return response;
    }

    async getWishlistCount(clientId) {
        const response = await api.get(`/wishlist/client/${clientId}/count`);
        return response;
    }

    async getMyClientId() {
        const response = await api.get('/wishlist/my-client-id');
        return response;
    }
}

const wishlistService = new WishlistService();

export const WishlistDataProvider = ({ children, clientId }) => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [authInfo, setAuthInfo] = useState(getAuthInfo());
    const [initialized, setInitialized] = useState(false);
    const [updateTrigger, setUpdateTrigger] = useState(0);

    // Global reference for external access - FIXED COUNT SYNC
    useEffect(() => {
        const updateGlobalRef = () => {
            window.wishlistContextRef = {
                wishlistCount: wishlistCount,
                isAuthenticated: authInfo.isAuthenticated,
                refreshAuth: () => {
                    const newAuthInfo = getAuthInfo();
                    setAuthInfo(newAuthInfo);
                    return newAuthInfo;
                },
                loadWishlist: loadWishlist,
                clearWishlist: clearWishlist,
                getClientId: getCurrentClientId,
                setClientId: (id) => {
                    localStorage.setItem('clientId', id.toString());
                },
                clearClientId: () => {
                    localStorage.removeItem('clientId');
                },
                triggerUpdate: () => setUpdateTrigger(prev => prev + 1)
            };
        };

        updateGlobalRef();

        return () => {
            delete window.wishlistContextRef;
        };
    }, [wishlistCount, authInfo.isAuthenticated]); // Add dependencies

    // Update auth info when storage changes
    useEffect(() => {
        const handleStorageChange = () => {
            const newAuthInfo = getAuthInfo();
            setAuthInfo(newAuthInfo);
        };

        window.addEventListener('storage', handleStorageChange);
        const authCheckInterval = setInterval(handleStorageChange, 30000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(authCheckInterval);
        };
    }, []);

    // FIXED: Always keep wishlistCount in sync with wishlistItems
    useEffect(() => {
        const count = Array.isArray(wishlistItems) ? wishlistItems.length : 0;
        setWishlistCount(count);

        // Update global reference immediately
        if (window.wishlistContextRef) {
            window.wishlistContextRef.wishlistCount = count;
        }
    }, [wishlistItems]);

    const triggerUpdate = () => {
        setUpdateTrigger(prev => prev + 1);
    };

    const getClientIdFromServer = async () => {
        try {
            const response = await wishlistService.getMyClientId();
            return response;
        } catch (error) {
            console.error('Error getting client ID from server:', error);
            return null;
        }
    };

    const getCurrentClientId = async () => {
        if (clientId) return clientId;

        const storedClientId = localStorage.getItem('clientId');
        if (storedClientId) {
            const clientIdNum = parseInt(storedClientId);
            if (!isNaN(clientIdNum)) return clientIdNum;
        }

        if (authInfo.isAuthenticated) {
            try {
                const serverClientId = await getClientIdFromServer();
                if (serverClientId) {
                    localStorage.setItem('clientId', serverClientId.toString());
                    return serverClientId;
                }
            } catch (error) {
                console.error('Error getting client ID from server:', error);
            }
        }

        return null;
    };

    const isAuthenticated = () => {
        return authInfo.isAuthenticated;
    };

    const setClientId = (id) => {
        localStorage.setItem('clientId', id.toString());
    };

    const clearClientId = () => {
        localStorage.removeItem('clientId');
    };

    // Load client's wishlist - FIXED COUNT UPDATE
    const loadWishlist = async () => {
        if (!authInfo.isAuthenticated) {
            setError('Authentication required');
            setWishlistItems([]);
            setWishlistCount(0);
            return [];
        }

        const currentClientId = await getCurrentClientId();
        if (!currentClientId) {
            setError('Unable to determine client ID. Please log in again.');
            setWishlistItems([]);
            setWishlistCount(0);
            return [];
        }

        setLoading(true);
        setError(null);
        try {
            const data = await wishlistService.getClientWishlist(currentClientId);
            const items = data || [];
            setWishlistItems(items);
            // Count will be updated automatically by the useEffect above
            triggerUpdate();
            return items;
        } catch (err) {
            const errorMessage = err?.message || 'Failed to load wishlist';
            setError(errorMessage);
            setWishlistItems([]);
            setWishlistCount(0);
            console.error('Error loading wishlist:', err);

            if (err?.status === 401) {
                const newAuthInfo = getAuthInfo();
                setAuthInfo(newAuthInfo);
            }

            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Add property to wishlist - FIXED COUNT UPDATE
    const addToWishlist = async (propertyId, notes = '') => {
        if (!authInfo.isAuthenticated) {
            throw new Error('Please log in to add to wishlist');
        }

        const currentClientId = await getCurrentClientId();
        if (!currentClientId) {
            throw new Error('Unable to determine client ID. Please log in again.');
        }

        setLoading(true);
        setError(null);
        try {
            const createDto = {
                clientId: currentClientId,
                propertyId: propertyId,
                notes: notes,
                addedDate: new Date().toISOString()
            };

            const newItem = await wishlistService.addToWishlist(createDto);

            // Update local state - count will auto-update
            setWishlistItems(prev => [...prev, newItem]);
            triggerUpdate();

            return newItem;
        } catch (err) {
            const errorMessage = err?.message || 'Failed to add to wishlist';
            setError(errorMessage);
            console.error('Error adding to wishlist:', err);

            if (err?.status === 401) {
                const newAuthInfo = getAuthInfo();
                setAuthInfo(newAuthInfo);
            }

            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Remove property from wishlist - FIXED COUNT UPDATE
    const removeFromWishlist = async (wishlistItemId) => {
        if (!authInfo.isAuthenticated) {
            throw new Error('Authentication required');
        }

        setLoading(true);
        setError(null);
        try {
            await wishlistService.removeFromWishlist(wishlistItemId);
            setWishlistItems(prev => prev.filter(item => item.id !== wishlistItemId));
            triggerUpdate();
            return true;
        } catch (err) {
            const errorMessage = err?.message || 'Failed to remove from wishlist';
            setError(errorMessage);
            console.error('Error removing from wishlist:', err);

            if (err?.status === 401) {
                const newAuthInfo = getAuthInfo();
                setAuthInfo(newAuthInfo);
            }

            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Remove from wishlist by property ID - FIXED COUNT UPDATE
    const removeFromWishlistByProperty = async (propertyId) => {
        if (!authInfo.isAuthenticated) {
            throw new Error('Authentication required');
        }

        const currentClientId = await getCurrentClientId();
        if (!currentClientId) {
            throw new Error('Unable to determine client ID. Please log in again.');
        }

        setLoading(true);
        setError(null);
        try {
            await wishlistService.removeFromWishlistByProperty(currentClientId, propertyId);
            setWishlistItems(prev => prev.filter(item => item.propertyId !== propertyId));
            triggerUpdate();
            return true;
        } catch (err) {
            const errorMessage = err?.message || 'Failed to remove from wishlist';
            setError(errorMessage);
            console.error('Error removing from wishlist:', err);

            if (err?.status === 401) {
                const newAuthInfo = getAuthInfo();
                setAuthInfo(newAuthInfo);
            }

            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Check if property is in wishlist
    const isPropertyInWishlist = async (propertyId) => {
        if (!authInfo.isAuthenticated) {
            return false;
        }

        const currentClientId = await getCurrentClientId();
        if (!currentClientId) {
            return false;
        }

        try {
            const localCheck = wishlistItems.some(item => item.propertyId === propertyId);
            if (localCheck) return true;

            const serverCheck = await wishlistService.checkPropertyInWishlist(currentClientId, propertyId);
            return serverCheck;
        } catch (err) {
            console.error('Error checking wishlist status:', err);
            return wishlistItems.some(item => item.propertyId === propertyId);
        }
    };

    // Toggle wishlist function
    const toggleWishlist = async (propertyId, isFavorite, notes = '') => {
        if (!authInfo.isAuthenticated) {
            throw new Error('Please log in to manage your wishlist');
        }

        try {
            if (isFavorite) {
                await addToWishlist(propertyId, notes);
            } else {
                await removeFromWishlistByProperty(propertyId);
            }
            return true;
        } catch (err) {
            console.error('Error toggling wishlist:', err);
            throw err;
        }
    };

    // Get wishlist count
    const getWishlistCount = async () => {
        if (!authInfo.isAuthenticated) {
            return 0;
        }

        const currentClientId = await getCurrentClientId();
        if (!currentClientId) {
            return 0;
        }

        try {
            const count = await wishlistService.getWishlistCount(currentClientId);
            setWishlistCount(count);
            return count;
        } catch (err) {
            console.error('Error getting wishlist count:', err);
            return wishlistCount;
        }
    };

    // Clear wishlist
    const clearWishlist = () => {
        setWishlistItems([]);
        setWishlistCount(0);
        setError(null);
        triggerUpdate();
    };

    const getWishlistPropertyIds = () => {
        return wishlistItems.map(item => item.propertyId);
    };

    const refreshAuth = () => {
        const newAuthInfo = getAuthInfo();
        setAuthInfo(newAuthInfo);
        return newAuthInfo;
    };

    const refreshWishlist = async () => {
        return await loadWishlist();
    };

    // Initialize wishlist on mount and auth changes
    useEffect(() => {
        const initializeWishlist = async () => {
            if (!initialized) {
                setInitialized(true);
            }

            if (authInfo.isAuthenticated) {
                try {
                    await loadWishlist();
                } catch (error) {
                    console.error('Failed to initialize wishlist:', error);
                }
            } else {
                clearWishlist();
                clearClientId();
            }
        };

        initializeWishlist();
    }, [authInfo.isAuthenticated, clientId]);

    const value = {
        wishlistItems,
        loading,
        error,
        wishlistCount,
        wishlistPropertyIds: getWishlistPropertyIds(),
        isAuthenticated: authInfo.isAuthenticated,
        currentUserId: authInfo.userId,
        clientId: authInfo.isAuthenticated ? getCurrentClientId() : null,
        updateTrigger,

        loadWishlist,
        addToWishlist,
        removeFromWishlist,
        removeFromWishlistByProperty,
        toggleWishlist,
        isPropertyInWishlist,
        getWishlistCount,
        clearWishlist,
        refreshAuth,
        refreshWishlist,
        setClientId,
        clearClientId,
        triggerUpdate,

        addItem: addToWishlist,
        removeItem: removeFromWishlist,
        removeItemByProperty: removeFromWishlistByProperty,
        toggleItem: toggleWishlist,
        checkItem: isPropertyInWishlist,
        getCount: getWishlistCount,
    };

    return (
        <WishlistDataContext.Provider value={value}>
            {children}
        </WishlistDataContext.Provider>
    );
};

export const withWishlistData = (Component) => {
    return (props) => (
        <WishlistDataProvider>
            <Component {...props} />
        </WishlistDataProvider>
    );
};

export const refreshWishlistGlobal = async () => {
    if (window.wishlistContextRef) {
        return await window.wishlistContextRef.loadWishlist();
    }
    return null;
};

export const getWishlistState = () => {
    if (window.wishlistContextRef) {
        return {
            isAuthenticated: window.wishlistContextRef.refreshAuth().isAuthenticated,
            clientId: localStorage.getItem('clientId'),
            wishlistCount: window.wishlistContextRef.wishlistCount || 0
        };
    }
    return { isAuthenticated: false, clientId: null, wishlistCount: 0 };
};

export default useWishlistData;