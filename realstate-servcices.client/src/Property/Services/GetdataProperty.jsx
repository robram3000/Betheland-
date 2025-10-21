// GetdataProperty.jsx - COMPLETELY FIXED VERSION
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
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
    const [initialized, setInitialized] = useState(false);

    // Auto-load properties on component mount
    useEffect(() => {
        if (!initialized) {
            console.log('🔄 PropertyDataProvider initializing...');
            loadProperties();
            setInitialized(true);
        }
    }, [initialized]);

    // FIXED: Enhanced loadProperties function
    const loadProperties = async (options = {}) => {
        const { includeAgents = true, forceRefresh = false } = options;

        // Don't reload if we already have properties and not forcing refresh
        if (properties.length > 0 && !forceRefresh && !loading) {
            console.log('📊 Using cached properties, count:', properties.length);
            return properties;
        }

        setLoading(true);
        setError(null);
        try {
            console.log('🔍 Loading properties from API...');
            const data = await propertyService.getAllProperties();

            console.log('📦 Raw API data received:', {
                dataType: typeof data,
                isArray: Array.isArray(data),
                length: Array.isArray(data) ? data.length : 'N/A',
                sample: Array.isArray(data) && data.length > 0 ? data[0] : 'no data'
            });

            let processedProperties = [];

            if (Array.isArray(data)) {
                processedProperties = data
                    .map(property => {
                        try {
                            const processed = processPropertyData(property);
                            console.log(`🏠 Processed property ${property.id}:`, {
                                id: processed?.id,
                                title: processed?.title,
                                hasImages: processed?.propertyImages?.length > 0
                            });
                            return processed;
                        } catch (processError) {
                            console.error('❌ Error processing property:', property, processError);
                            return null;
                        }
                    })
                    .filter(property => property !== null);
            } else {
                console.warn('⚠️ API did not return an array:', data);
                processedProperties = [];
            }

            console.log(`✅ Successfully processed ${processedProperties.length} properties`);

            // Fetch agent data if requested
            if (includeAgents && processedProperties.length > 0) {
                console.log('👨‍💼 Fetching agent data for properties...');
                const propertiesWithAgents = await Promise.all(
                    processedProperties.map(async (property) => {
                        if (property.agentId) {
                            try {
                                return await fetchAgentForProperty(property);
                            } catch (agentError) {
                                console.warn(`❌ Failed to fetch agent for property ${property.id}:`, agentError);
                                return property;
                            }
                        }
                        return property;
                    })
                );
                setProperties(propertiesWithAgents);
                return propertiesWithAgents;
            } else {
                setProperties(processedProperties);
                return processedProperties;
            }
        } catch (err) {
            const errorMsg = err.message || 'Failed to load properties';
            console.error('❌ Error loading properties:', err);
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Function to fetch agent data for a property
    const fetchAgentForProperty = useCallback(async (property) => {
        if (!property?.agentId) {
            console.log('ℹ️ No agent ID provided for property:', property?.id);
            return property;
        }

        // Check cache first
        if (agentCache[property.agentId]) {
            console.log('💾 Using cached agent data for:', property.agentId);
            return {
                ...property,
                agent: agentCache[property.agentId]
            };
        }

        try {
            console.log(`🔍 Fetching agent ${property.agentId} for property ${property.id}...`);
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

                console.log('✅ Agent data fetched successfully for property:', property.id);
                return updatedProperty;
            } else {
                console.warn('⚠️ No agent data returned for ID:', property.agentId);
                return property;
            }
        } catch (error) {
            console.error('❌ Error fetching agent for property:', property.id, error);
            return property;
        }
    }, [agentCache]);

    // FIXED: Enhanced property data processing
    const processPropertyData = (property) => {
        if (!property) {
            console.warn('⚠️ processPropertyData called with null/undefined property');
            return null;
        }

        try {
            console.log('🔧 Processing property data:', {
                id: property.id,
                title: property.title,
                rawData: property
            });

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

            // Process images - handle multiple image sources
            let propertyImages = [];
            let mainImage = '';

            // Check propertyImages array first
            if (property.propertyImages && Array.isArray(property.propertyImages)) {
                propertyImages = property.propertyImages
                    .map(img => ({
                        ...img,
                        imageUrl: processImageUrl(img.imageUrl)
                    }))
                    .filter(img => img.imageUrl && img.imageUrl !== '/default-property.jpg');
            }

            // Check imageUrls array as fallback
            if (propertyImages.length === 0 && property.imageUrls && Array.isArray(property.imageUrls)) {
                propertyImages = property.imageUrls
                    .map(url => ({
                        imageUrl: processImageUrl(url)
                    }))
                    .filter(img => img.imageUrl && img.imageUrl !== '/default-property.jpg');
            }

            // Set main image
            if (propertyImages.length > 0) {
                mainImage = propertyImages[0].imageUrl;
            } else if (property.mainImage) {
                mainImage = processImageUrl(property.mainImage);
            } else {
                mainImage = '/default-property.jpg';
            }

            // Calculate area in square feet if not provided
            const areaSqft = property.areaSqft || property.squareFeet || (property.areaSqm ? Math.round(property.areaSqm * 10.7639) : 0);

            // Build the complete property object
            const processedProperty = {
                // Basic identifiers
                id: property.id || property.propertyId || 0,
                propertyNo: property.propertyNo || `PROP-${property.id || '0000'}`,

                // Basic info
                title: property.title || property.propertyName || 'Untitled Property',
                description: property.description || '',
                type: property.type || property.propertyType || 'residential',
                price: parseFloat(property.price) || 0,
                status: property.status || 'available',

                // Property features
                propertyAge: parseInt(property.propertyAge) || 0,
                propertyFloor: parseInt(property.propertyFloor) || 1,
                bedrooms: parseInt(property.bedrooms) || 0,
                bathrooms: parseFloat(property.bathrooms) || 0,
                areaSqm: parseInt(property.areaSqm) || 0,
                areaSqft: areaSqft,
                garage: parseInt(property.garage) || 0,
                kitchen: parseInt(property.kitchen) || 0,

                // Location data
                address: property.address || '',
                city: property.city || '',
                state: property.state || property.province || '',
                zipCode: property.zipCode || property.postalCode || '',
                country: property.country || '',
                location: property.location || [property.city, property.state, property.country].filter(Boolean).join(', '),
                latitude: parseFloat(property.latitude) || 0,
                longitude: parseFloat(property.longitude) || 0,

                // Relationships
                ownerId: property.ownerId || null,
                agentId: property.agentId || null,
                agent: property.agent || null,

                // Additional data
                amenities: amenities,
                listedDate: property.listedDate,
                createdAt: property.createdAt,
                updatedAt: property.updatedAt,

                // Media
                propertyImages: propertyImages,
                propertyVideos: property.propertyVideos || [],
                imageUrls: propertyImages.map(img => img.imageUrl),
                videoUrls: property.videoUrls || [],
                mainImage: mainImage,
                mainVideo: property.mainVideo || '',

                // Compatibility fields
                propertyType: property.propertyType || property.type || 'residential',
                squareFeet: areaSqft,
                pricePerSqft: property.pricePerSqft || (property.price && areaSqft ? property.price / areaSqft : 0)
            };

            console.log('✅ Successfully processed property:', {
                id: processedProperty.id,
                title: processedProperty.title,
                images: processedProperty.propertyImages.length
            });

            return processedProperty;

        } catch (error) {
            console.error('❌ Error processing property data:', error, property);
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
            console.log(`🔍 Fetching property by ID: ${id}`);
            const property = await propertyService.getProperty(id);

            if (!property) {
                throw new Error(`Property with ID ${id} not found`);
            }

            const processedProperty = processPropertyData(property);

            if (!processedProperty) {
                throw new Error('Failed to process property data');
            }

            // Fetch agent data if needed
            if (processedProperty.agentId) {
                const propertyWithAgent = await fetchAgentForProperty(processedProperty);
                setSelectedProperty(propertyWithAgent);
                return propertyWithAgent;
            }

            setSelectedProperty(processedProperty);
            return processedProperty;
        } catch (err) {
            const errorMsg = `Failed to load property ${id}: ${err.message}`;
            console.error('❌ Error loading property:', err);
            setError(errorMsg);
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

    // FIXED: Enhanced searchProperties function
    const searchProperties = async (filters = {}) => {
        setLoading(true);
        setError(null);
        try {
            console.log('🔍 Searching properties with filters:', filters);
            console.log('📊 Available properties count:', properties.length);

            // If no properties loaded yet, load them first
            if (properties.length === 0) {
                console.log('🔄 No properties loaded, loading first...');
                await loadProperties();
            }

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

            console.log(`✅ Search completed: ${filtered.length} properties found`);
            return filtered;
        } catch (err) {
            console.error('❌ Error searching properties:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Wishlist management functions
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

    // Refresh all properties
    const refreshProperties = async () => {
        return await loadProperties({ forceRefresh: true });
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
        refreshProperties,

        // Utility functions
        processImageUrl,
        processPropertyData
    };

    return (
        <PropertyDataContext.Provider value={value}>
            {children}
        </PropertyDataContext.Provider>
    );
};

export default usePropertyData;