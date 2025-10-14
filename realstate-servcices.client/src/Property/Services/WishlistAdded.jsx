// WishlistAdded.jsx - Complete Fixed Version with Real-time Sync
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../../Authpage/Services/Api';

const WishlistDataContext = createContext();

// Custom hook to use wishlist data
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
        // Clear any stale clientId
        localStorage.removeItem('clientId');
        return { isAuthenticated: false, userId: null };
    }

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = payload.exp * 1000 < Date.now();

        if (isExpired) {
            // Clear everything on expiration
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
        // Clear invalid tokens
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

// Wishlist Data Provider Component
export const WishlistDataProvider = ({ children, clientId }) => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [authInfo, setAuthInfo] = useState(getAuthInfo());
    const [initialized, setInitialized] = useState(false);
    const [updateTrigger, setUpdateTrigger] = useState(0);

    // Global reference for external access
    useEffect(() => {
        window.wishlistContextRef = {
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

        return () => {
            delete window.wishlistContextRef;
        };
    }, []);

    // Update auth info when storage changes
    useEffect(() => {
        const handleStorageChange = () => {
            const newAuthInfo = getAuthInfo();
            setAuthInfo(newAuthInfo);
        };

        window.addEventListener('storage', handleStorageChange);
        // Also check auth periodically
        const authCheckInterval = setInterval(handleStorageChange, 30000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(authCheckInterval);
        };
    }, []);

    // Always keep wishlistCount in sync with wishlistItems
    useEffect(() => {
        const count = Array.isArray(wishlistItems) ? wishlistItems.length : 0;
        if (count !== wishlistCount) {
            setWishlistCount(count);
        }
    }, [wishlistItems, wishlistCount]);

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
        // Use provided clientId first
        if (clientId) return clientId;

        // Check localStorage for cached clientId
        const storedClientId = localStorage.getItem('clientId');
        if (storedClientId) {
            const clientIdNum = parseInt(storedClientId);
            if (!isNaN(clientIdNum)) return clientIdNum;
        }

        // If authenticated but no clientId, try to get from server
        if (authInfo.isAuthenticated) {
            try {
                const serverClientId = await getClientIdFromServer();
                if (serverClientId) {
                    // Store for future use
                    localStorage.setItem('clientId', serverClientId.toString());
                    return serverClientId;
                }
            } catch (error) {
                console.error('Error getting client ID from server:', error);
            }
        }

        return null;
    };

    // Check if user is authenticated
    const isAuthenticated = () => {
        return authInfo.isAuthenticated;
    };

    // Set client ID
    const setClientId = (id) => {
        localStorage.setItem('clientId', id.toString());
    };

    // Clear client ID
    const clearClientId = () => {
        localStorage.removeItem('clientId');
    };

    // Load client's wishlist
    const loadWishlist = async () => {
        if (!authInfo.isAuthenticated) {
            setError('Authentication required');
            setWishlistCount(0);
            return [];
        }

        const currentClientId = await getCurrentClientId();
        if (!currentClientId) {
            setError('Unable to determine client ID. Please log in again.');
            setWishlistCount(0);
            return [];
        }

        setLoading(true);
        setError(null);
        try {
            const data = await wishlistService.getClientWishlist(currentClientId);
            const items = data || [];
            setWishlistItems(items);
            setWishlistCount(items.length);
            triggerUpdate(); // Notify all components
            return items;
        } catch (err) {
            const errorMessage = err?.message || 'Failed to load wishlist';
            setError(errorMessage);
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

    // Add property to wishlist
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

            // Update local state
            setWishlistItems(prev => [...prev, newItem]);
            triggerUpdate(); // Notify all components

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

    // Remove property from wishlist by ID
    const removeFromWishlist = async (wishlistItemId) => {
        if (!authInfo.isAuthenticated) {
            throw new Error('Authentication required');
        }

        setLoading(true);
        setError(null);
        try {
            await wishlistService.removeFromWishlist(wishlistItemId);
            setWishlistItems(prev => prev.filter(item => item.id !== wishlistItemId));
            triggerUpdate(); // Notify all components
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

    // Remove from wishlist by property ID
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
            // Use the working endpoint that doesn't require wishlist ID
            await wishlistService.removeFromWishlistByProperty(currentClientId, propertyId);

            setWishlistItems(prev => prev.filter(item => item.propertyId !== propertyId));
            triggerUpdate(); // Notify all components
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
            // First check locally
            const localCheck = wishlistItems.some(item => item.propertyId === propertyId);
            if (localCheck) return true;

            // Then check with server for certainty
            const serverCheck = await wishlistService.checkPropertyInWishlist(currentClientId, propertyId);
            return serverCheck;
        } catch (err) {
            console.error('Error checking wishlist status:', err);
            // Fallback to local check
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
                // Use property-based removal instead of ID-based
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
        triggerUpdate(); // Notify all components
    };

    // Get wishlist property IDs
    const getWishlistPropertyIds = () => {
        return wishlistItems.map(item => item.propertyId);
    };

    // Refresh auth info
    const refreshAuth = () => {
        const newAuthInfo = getAuthInfo();
        setAuthInfo(newAuthInfo);
        return newAuthInfo;
    };

    // Force refresh wishlist
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

    // Context value
    const value = {
        // State
        wishlistItems,
        loading,
        error,
        wishlistCount,
        wishlistPropertyIds: getWishlistPropertyIds(),
        isAuthenticated: authInfo.isAuthenticated,
        currentUserId: authInfo.userId,
        clientId: authInfo.isAuthenticated ? getCurrentClientId() : null,
        updateTrigger,

        // Actions
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

        // Aliases for convenience
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

// HOC for components that need wishlist data
export const withWishlistData = (Component) => {
    return (props) => (
        <WishlistDataProvider>
            <Component {...props} />
        </WishlistDataProvider>
    );
};

// Utility function to refresh wishlist from anywhere
export const refreshWishlistGlobal = async () => {
    if (window.wishlistContextRef) {
        return await window.wishlistContextRef.loadWishlist();
    }
    return null;
};

// Utility function to get current wishlist state
export const getWishlistState = () => {
    if (window.wishlistContextRef) {
        return {
            isAuthenticated: window.wishlistContextRef.refreshAuth().isAuthenticated,
            clientId: localStorage.getItem('clientId')
        };
    }
    return { isAuthenticated: false, clientId: null };
};

export default useWishlistData;