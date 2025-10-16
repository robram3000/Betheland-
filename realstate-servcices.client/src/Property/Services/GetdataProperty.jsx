import React, { createContext, useContext, useState, useCallback } from 'react';
import propertyService from '../../Employeesportal/AdminPortal/Creation_Property/services/propertyService';
import agentService from '../../Employeesportal/AdminPortal/Creation_Agent/Services/AgentService';

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
    const [agentCache, setAgentCache] = useState({});

    // Function to fetch agent data for a property
    const fetchAgentForProperty = useCallback(async (property) => {
        if (!property?.agentId) {
            console.log('No agent ID provided for property:', property?.id);
            return property;
        }

        // Check cache first
        if (agentCache[property.agentId]) {
            console.log('Using cached agent data for:', property.agentId);
            return {
                ...property,
                agent: agentCache[property.agentId]
            };
        }

        try {
            const agentData = await agentService.getAgentWithFallback(property.agentId);

            if (agentData) {
                const updatedProperty = {
                    ...property,
                    agent: agentData
                };

                // Update cache
                setAgentCache(prev => ({
                    ...prev,
                    [property.agentId]: agentData
                }));

                console.log('Agent data fetched successfully for property:', property.id);
                return updatedProperty;
            }
        } catch (error) {
            console.error('Error fetching agent for property:', property.id, error);
        }

        return property;
    }, [agentCache]);

    // FIXED: Enhanced loadProperties function with agent data
    const loadProperties = async (options = {}) => {
        const { includeAgents = true } = options;

        setLoading(true);
        setError(null);
        try {
            console.log('Loading properties with agent data...');
            const data = await propertyService.getAllProperties();
            console.log('DEBUG - Raw properties data:', data);

            // Process properties
            let processedProperties = Array.isArray(data)
                ? data.map(property => processPropertyData(property)).filter(Boolean)
                : [];

            // Fetch agent data if requested
            if (includeAgents) {
                console.log('Fetching agent data for properties...');
                processedProperties = await Promise.all(
                    processedProperties.map(async (property) => {
                        if (property.agentId) {
                            return await fetchAgentForProperty(property);
                        }
                        return property;
                    })
                );
            }

            console.log('DEBUG - Processed properties with agents:', processedProperties);
            setProperties(processedProperties);
            return processedProperties;
        } catch (err) {
            setError(err.message);
            console.error('Error loading properties:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // FIXED: Enhanced property data processing with complete address fields
    const processPropertyData = (property) => {
        if (!property) return null;

        try {
            // Parse amenities if it's a string
            let amenities = [];
            if (property.amenities) {
                if (typeof property.amenities === 'string') {
                    try {
                        amenities = JSON.parse(property.amenities);
                    } catch (e) {
                        console.warn('Failed to parse amenities:', property.amenities);
                        amenities = [];
                    }
                } else if (Array.isArray(property.amenities)) {
                    amenities = property.amenities;
                }
            }

            // Process images
            let propertyImages = [];
            let mainImage = '';

            if (property.propertyImages && Array.isArray(property.propertyImages)) {
                propertyImages = property.propertyImages.map(img => ({
                    ...img,
                    imageUrl: processImageUrl(img.imageUrl)
                }));
                mainImage = propertyImages[0]?.imageUrl || '';
            } else if (property.imageUrls && Array.isArray(property.imageUrls)) {
                propertyImages = property.imageUrls.map(url => ({
                    imageUrl: processImageUrl(url)
                }));
                mainImage = processImageUrl(property.imageUrls[0]) || '';
            }

            // Process main image separately
            if (property.mainImage) {
                mainImage = processImageUrl(property.mainImage);
            }

            // Calculate area in square feet if not provided
            const areaSqft = property.areaSqft || property.squareFeet || (property.areaSqm ? Math.round(property.areaSqm * 10.7639) : 0);

            // UPDATED: Ensure all address fields are included
            return {
                id: property.id || property.propertyId || 0,
                propertyNo: property.propertyNo || '',
                title: property.title || property.propertyName || 'Untitled Property',
                description: property.description || '',
                type: property.type || property.propertyType || 'residential',
                price: parseFloat(property.price) || 0,
                status: property.status || 'available',
                propertyAge: parseInt(property.propertyAge) || 0,
                propertyFloor: parseInt(property.propertyFloor) || 1,
                bedrooms: parseInt(property.bedrooms) || 0,
                bathrooms: parseFloat(property.bathrooms) || 0,
                areaSqm: parseInt(property.areaSqm) || 0,
                areaSqft: areaSqft,
                // UPDATED: Include garage and kitchen
                garage: parseInt(property.garage) || 0,
                kitchen: parseInt(property.kitchen) || 0,
                // Complete address fields
                address: property.address || '',
                city: property.city || '',
                state: property.state || property.province || '',
                zipCode: property.zipCode || property.postalCode || '',
                country: property.country || '',
                location: property.location || [property.city, property.state, property.country].filter(Boolean).join(', '),
                latitude: parseFloat(property.latitude) || 0,
                longitude: parseFloat(property.longitude) || 0,
                ownerId: property.ownerId || null,
                agentId: property.agentId || null,
                agent: property.agent || null, // Include agent data if already present
                amenities: amenities,
                listedDate: property.listedDate,
                createdAt: property.createdAt,
                updatedAt: property.updatedAt,
                propertyImages: propertyImages,
                propertyVideos: property.propertyVideos || [],
                imageUrls: property.imageUrls || propertyImages.map(img => img.imageUrl),
                videoUrls: property.videoUrls || [],
                mainImage: mainImage,
                mainVideo: property.mainVideo || '',
                propertyType: property.propertyType || property.type || 'residential',
                // Additional fields for compatibility
                squareFeet: areaSqft,
                pricePerSqft: property.pricePerSqft || (property.price && areaSqft ? property.price / areaSqft : 0)
            };
        } catch (error) {
            console.error('Error processing property data:', error, property);
            return null;
        }
    };

    // FIXED: Enhanced image URL processing
    const processImageUrl = (url) => {
        if (!url || typeof url !== 'string' || url.trim() === '') {
            return '/default-property.jpg';
        }

        // Already full URL
        if (url.startsWith('http') || url.startsWith('//') || url.startsWith('blob:') || url.startsWith('data:')) {
            return url;
        }

        // Server path - prepend base URL
        if (url.startsWith('/uploads/')) {
            return `https://localhost:7075${url}`;
        }

        // Relative path without leading slash
        if (url.includes('.') && !url.startsWith('/')) {
            return `https://localhost:7075/uploads/properties/${url}`;
        }

        // uploads/ path
        if (url.startsWith('uploads/')) {
            return `https://localhost:7075/${url}`;
        }

        return '/default-property.jpg';
    };

    // FIXED: Enhanced getPropertyById with agent data
    const getPropertyById = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const property = await propertyService.getProperty(id);
            const processedProperty = processPropertyData(property);

            if (processedProperty && processedProperty.agentId) {
                const propertyWithAgent = await fetchAgentForProperty(processedProperty);
                setSelectedProperty(propertyWithAgent);
                return propertyWithAgent;
            }

            setSelectedProperty(processedProperty);
            return processedProperty;
        } catch (err) {
            setError(err.message);
            console.error('Error loading property:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Function to get agent by ID
    const getAgentById = async (agentId) => {
        try {
            // Check cache first
            if (agentCache[agentId]) {
                return agentCache[agentId];
            }

            const agent = await agentService.getAgentWithFallback(agentId);
            if (agent) {
                // Update cache
                setAgentCache(prev => ({
                    ...prev,
                    [agentId]: agent
                }));
            }
            return agent;
        } catch (error) {
            console.error('Error fetching agent by ID:', error);
            return null;
        }
    };

    // Function to refresh agent data for all properties
    const refreshAgentsForProperties = async () => {
        setLoading(true);
        try {
            console.log('Refreshing agent data for all properties...');
            const updatedProperties = await Promise.all(
                properties.map(async (property) => {
                    if (property.agentId) {
                        return await fetchAgentForProperty(property);
                    }
                    return property;
                })
            );
            setProperties(updatedProperties);
            console.log('Agent data refreshed successfully');
        } catch (error) {
            console.error('Error refreshing agents:', error);
            setError('Failed to refresh agent data');
        } finally {
            setLoading(false);
        }
    };

    // FIXED: Enhanced searchProperties function
    const searchProperties = async (filters = {}) => {
        setLoading(true);
        setError(null);
        try {
            console.log('DEBUG - Applying filters:', filters);
            console.log('DEBUG - Available properties:', properties);

            let filtered = [...properties].filter(property => property !== null);

            // Apply search query filter
            if (filters.searchQuery) {
                const query = filters.searchQuery.toLowerCase().trim();
                filtered = filtered.filter(property => {
                    const searchFields = [
                        property.title,
                        property.location,
                        property.city,
                        property.address,
                        property.state,
                        property.zipCode,
                        property.country,
                        property.description,
                        property.propertyType
                    ].filter(field => field && typeof field === 'string');

                    return searchFields.some(field =>
                        field.toLowerCase().includes(query)
                    );
                });
            }

            // Apply price range filter
            if (filters.priceRange && Array.isArray(filters.priceRange)) {
                const [minPrice, maxPrice] = filters.priceRange;
                filtered = filtered.filter(property => {
                    const price = property.price || 0;
                    return price >= minPrice && price <= maxPrice;
                });
            }

            // Apply bedrooms filter
            if (filters.bedrooms) {
                filtered = filtered.filter(property => {
                    const bedrooms = property.bedrooms || 0;
                    return bedrooms >= filters.bedrooms;
                });
            }

            // Apply bathrooms filter
            if (filters.bathrooms) {
                filtered = filtered.filter(property => {
                    const bathrooms = property.bathrooms || 0;
                    return bathrooms >= filters.bathrooms;
                });
            }

            // Apply property type filter
            if (filters.propertyType && filters.propertyType.length > 0) {
                filtered = filtered.filter(property => {
                    const propertyType = property.propertyType || property.type || '';
                    return filters.propertyType.includes(propertyType);
                });
            }

            // Apply square feet filter
            if (filters.squareFeet && Array.isArray(filters.squareFeet)) {
                const [minSqft, maxSqft] = filters.squareFeet;
                filtered = filtered.filter(property => {
                    const sqft = property.areaSqft || property.squareFeet || 0;
                    return sqft >= minSqft && sqft <= maxSqft;
                });
            }

            // Apply amenities filter
            if (filters.amenities && filters.amenities.length > 0) {
                filtered = filtered.filter(property => {
                    if (!property.amenities || !Array.isArray(property.amenities)) return false;
                    return filters.amenities.some(amenity =>
                        property.amenities.includes(amenity)
                    );
                });
            }

            // Apply agent filter
            if (filters.agentId) {
                filtered = filtered.filter(property =>
                    property.agentId === filters.agentId
                );
            }

            console.log('DEBUG - Filtered results:', filtered);
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

    // Get properties by agent ID
    const getPropertiesByAgentId = async (agentId) => {
        setLoading(true);
        setError(null);
        try {
            const data = await propertyService.getPropertiesByAgent(agentId);
            const processedProperties = Array.isArray(data)
                ? data.map(property => processPropertyData(property)).filter(Boolean)
                : [];

            // Add agent data to properties
            const agent = await getAgentById(agentId);
            const propertiesWithAgent = processedProperties.map(property => ({
                ...property,
                agent: agent
            }));

            return propertiesWithAgent;
        } catch (err) {
            setError(err.message);
            console.error('Error getting properties by agent:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Get agent statistics
    const getAgentStatistics = () => {
        const agentStats = {};

        properties.forEach(property => {
            if (property.agentId) {
                if (!agentStats[property.agentId]) {
                    agentStats[property.agentId] = {
                        agent: property.agent,
                        propertyCount: 0,
                        totalValue: 0,
                        properties: []
                    };
                }

                agentStats[property.agentId].propertyCount++;
                agentStats[property.agentId].totalValue += property.price || 0;
                agentStats[property.agentId].properties.push(property);
            }
        });

        return agentStats;
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
        agentCache,

        // Actions
        loadProperties,
        getPropertyById,
        getAgentById,
        searchProperties,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        getWishlistProperties,
        clearSelectedProperty,
        refreshAgentsForProperties,
        getPropertiesByAgentId,
        getAgentStatistics,

        // Utility functions
        processImageUrl,
        processPropertyData,
        refreshProperties: loadProperties,

        // Agent-related functions
        fetchAgentForProperty,
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