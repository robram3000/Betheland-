import React, { createContext, useContext, useState, useEffect } from 'react';
import propertyService from '../../Employeesportal/AgentPortal/Properties/Services/propertyService';

// Create context for property data
const PropertyDataContext = createContext();

// Custom hook to use property data
export const usePropertyData = () => {
    const context = useContext(PropertyDataContext);
    if (!context) {
        throw new Error('usePropertyData must be used within a PropertyDataProvider');
    }
    return context;
};

// Property Data Provider Component
export const PropertyDataProvider = ({ children }) => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [wishlist, setWishlist] = useState(new Set());

    // Load all properties
    const loadProperties = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await propertyService.getAllProperties();
            setProperties(data);
            return data;
        } catch (err) {
            setError(err.message);
            console.error('Error loading properties:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Get property by ID
    const getPropertyById = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const property = await propertyService.getPropertyById(id);
            setSelectedProperty(property);
            return property;
        } catch (err) {
            setError(err.message);
            console.error('Error loading property:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Search properties
    const searchProperties = async (filters = {}) => {
        setLoading(true);
        setError(null);
        try {
            let filtered = [...properties];

            // Apply filters
            if (filters.searchQuery) {
                const query = filters.searchQuery.toLowerCase();
                filtered = filtered.filter(property =>
                    property.title?.toLowerCase().includes(query) ||
                    property.location?.toLowerCase().includes(query) ||
                    property.description?.toLowerCase().includes(query)
                );
            }

            if (filters.priceRange) {
                filtered = filtered.filter(property =>
                    property.price >= filters.priceRange[0] &&
                    property.price <= filters.priceRange[1]
                );
            }

            if (filters.bedrooms) {
                filtered = filtered.filter(property =>
                    property.bedrooms >= filters.bedrooms
                );
            }

            if (filters.bathrooms) {
                filtered = filtered.filter(property =>
                    property.bathrooms >= filters.bathrooms
                );
            }

            if (filters.propertyType && filters.propertyType.length > 0) {
                filtered = filtered.filter(property =>
                    filters.propertyType.includes(property.propertyType)
                );
            }

            if (filters.squareFeet) {
                filtered = filtered.filter(property =>
                    property.areaSqft >= filters.squareFeet[0] &&
                    property.areaSqft <= filters.squareFeet[1]
                );
            }

            if (filters.amenities && filters.amenities.length > 0) {
                filtered = filtered.filter(property => {
                    if (!property.amenities) return false;
                    try {
                        const propertyAmenities = typeof property.amenities === 'string'
                            ? JSON.parse(property.amenities)
                            : property.amenities;
                        return filters.amenities.some(amenity =>
                            propertyAmenities.includes(amenity)
                        );
                    } catch {
                        return false;
                    }
                });
            }

            return filtered;
        } catch (err) {
            setError(err.message);
            console.error('Error searching properties:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Wishlist management
    const addToWishlist = (propertyId) => {
        setWishlist(prev => {
            const newWishlist = new Set(prev);
            newWishlist.add(propertyId);
            return newWishlist;
        });
    };

    const removeFromWishlist = (propertyId) => {
        setWishlist(prev => {
            const newWishlist = new Set(prev);
            newWishlist.delete(propertyId);
            return newWishlist;
        });
    };

    const toggleWishlist = (propertyId, isFavorite) => {
        if (isFavorite) {
            addToWishlist(propertyId);
        } else {
            removeFromWishlist(propertyId);
        }
    };

    const isInWishlist = (propertyId) => {
        return wishlist.has(propertyId);
    };

    // Get wishlist properties
    const getWishlistProperties = () => {
        return properties.filter(property => wishlist.has(property.id));
    };

    // Clear selected property
    const clearSelectedProperty = () => {
        setSelectedProperty(null);
    };

    // Process image URL for consistent display
    const processImageUrl = (url) => {
        if (!url || url === 'string') {
            return '/default-property.jpg';
        }

        if (url.startsWith('http') || url.startsWith('//') || url.startsWith('blob:')) {
            return url;
        }

        if (url.startsWith('/uploads/')) {
            return `https://localhost:7075${url}`;
        }

        if (url.includes('.') && !url.startsWith('/')) {
            return `/uploads/properties/${url}`;
        }

        if (url.startsWith('uploads/')) {
            return `${url}`;
        }

        return '/default-property.jpg';
    };

    // Process property images
    const processPropertyImages = (property) => {
        if (!property) return property;

        return {
            ...property,
            mainImage: processImageUrl(property.mainImage),
            propertyImages: Array.isArray(property.propertyImages)
                ? property.propertyImages.map(img => ({
                    ...img,
                    imageUrl: processImageUrl(img.imageUrl)
                }))
                : []
        };
    };

    // Context value
    const value = {
        // State
        properties,
        loading,
        error,
        selectedProperty,
        wishlist: Array.from(wishlist),
        wishlistCount: wishlist.size,

        // Actions
        loadProperties,
        getPropertyById,
        searchProperties,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        getWishlistProperties,
        clearSelectedProperty,

        // Utility functions
        processImageUrl,
        processPropertyImages,
        refreshProperties: loadProperties,
    };

    return (
        <PropertyDataContext.Provider value={value}>
            {children}
        </PropertyDataContext.Provider>
    );
};

// Higher Order Component for property data
export const withPropertyData = (Component) => {
    return (props) => (
        <PropertyDataProvider>
            <Component {...props} />
        </PropertyDataProvider>
    );
};

export default usePropertyData;