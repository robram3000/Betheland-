// GetdataProperty.jsx - FIXED VERSION
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

    // FIXED: Enhanced agent image URL processing
    const processAgentImageUrl = (url) => {
        if (!url || typeof url !== 'string' || url.trim() === '') {
            return '/default-avatar.jpg';
        }

        // Already full URL
        if (url.startsWith('http') || url.startsWith('//') || url.startsWith('blob:') || url.startsWith('data:')) {
            return url;
        }

        // Server path - prepend appropriate base URL
        if (url.startsWith('/uploads/')) {
            const baseUrl = window.location.hostname === 'localhost'
                ? 'https://localhost:7080'
                : 'https://betheland.runasp.net';
            return `${baseUrl}${url}`;
        }

        if (url.includes('.') && !url.startsWith('/')) {
            const baseUrl = window.location.hostname === 'localhost'
                ? 'https://localhost:7080'
                : 'https://betheland.runasp.net';
            return `${baseUrl}/uploads/agents/${url}`;
        }

        // uploads/ path
        if (url.startsWith('uploads/')) {
            const baseUrl = window.location.hostname === 'localhost'
                ? 'https://localhost:7080'
                : 'https://betheland.runasp.net';
            return `${baseUrl}/${url}`;
        }

        return '/default-avatar.jpg';
    };

    // FIXED: Enhanced fetchAgentForProperty function
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
                // Process agent image URL to ensure it's valid
                const processedAgentData = {
                    ...agentData,
                    profilePictureUrl: processAgentImageUrl(agentData.profilePictureUrl)
                };

                const updatedProperty = {
                    ...property,
                    agent: processedAgentData
                };

                // Update cache
                setAgentCache(prev => ({
                    ...prev,
                    [property.agentId]: processedAgentData
                }));

                console.log('✅ Agent data fetched successfully for property:', property.id);
                return updatedProperty;
            } else {
                console.warn('⚠️ No agent data returned for ID:', property.agentId);
                return property;
            }
        } catch (error) {
            console.error('❌ Error fetching agent for property:', property.id, error);
            // Return property without agent data instead of failing
            return property;
        }
    }, [agentCache]);

    // FIXED: Enhanced loadProperties function
    const loadProperties = async (options = {}) => {
        const { includeAgents = true, forceRefresh = false } = options;


        if (properties.length > 0 && !forceRefresh && !loading) {
            console.log('📊 Using cached properties, count:', properties.length);    
            return properties;
        }

        setLoading(true);
        setError(null);
        try {
            console.log('🔍 Loading properties from API...');
            const data = await propertyService.getAllProperties();

            console.log('📦 COMPLETE API Response:', data);

            let processedProperties = [];

            if (Array.isArray(data)) {
                console.log(`🔄 Processing ${data.length} properties from array...`);

                processedProperties = data
                    .map((property, index) => {
                        try {
                            console.log(`🔧 Processing property ${index + 1}/${data.length}:`, {
                                id: property.id,
                                title: property.title
                            });

                            const processed = processPropertyDataForSearch(property);

                            if (processed) {
                                console.log(`✅ Successfully processed property ${index + 1}:`, {
                                    id: processed.id,
                                    title: processed.title,
                                    images: processed.propertyImages?.length || 0
                                });
                            } else {
                                console.log(`❌ Failed to process property ${index + 1}`);
                            }

                            return processed;
                        } catch (processError) {
                            console.error(`❌ Error processing property ${index + 1}:`, property, processError);
                            return null;
                        }
                    })
                    .filter(property => property !== null);

                console.log(`✅ Final processed properties: ${processedProperties.length} out of ${data.length} original`);

            } else {
                console.warn('⚠️ API did not return an array, trying to extract properties...', data);

                // Try to extract properties from different response structures
                if (data && data.properties && Array.isArray(data.properties)) {
                    console.log('🔄 Found properties in data.properties array');
                    processedProperties = data.properties
                        .map(property => {
                            try {
                                return processPropertyDataForSearch(property);
                            } catch (error) {
                                console.error('Error processing property from data.properties:', error);
                                return null;
                            }
                        })
                        .filter(property => property !== null);
                } else if (data && Array.isArray(data)) {
                    console.log('🔄 Data is array after all');
                    processedProperties = data
                        .map(property => processPropertyDataForSearch(property))
                        .filter(property => property !== null);
                } else {
                    console.warn('⚠️ Cannot extract properties from response:', data);
                    processedProperties = [];
                }
            }

            console.log(`🎯 FINAL: ${processedProperties.length} properties ready for display`);

            // Set properties immediately
            setProperties(processedProperties);

            // Fetch agent data if requested (in background) - FIXED: Better error handling
            if (includeAgents && processedProperties.length > 0) {
                console.log('👨‍💼 Fetching agent data for properties in background...');

                setTimeout(async () => {
                    try {
                        const propertiesWithAgents = await Promise.all(
                            processedProperties.map(async (property) => {
                                if (property.agentId) {
                                    try {
                                        return await fetchAgentForProperty(property);
                                    } catch (agentError) {
                                        console.warn(`❌ Failed to fetch agent for property ${property.id}:`, agentError);
                                        return property; // Return original property if agent fetch fails
                                    }
                                }
                                return property;
                            })
                        );
                        console.log('✅ Agent data loaded, updating properties...');
                        setProperties(propertiesWithAgents);
                    } catch (error) {
                        console.error('Error loading agents:', error);
                        // Keep the properties without agent data - don't break the app
                    }
                }, 0);
            }

            return processedProperties;
        } catch (err) {
            const errorMsg = err.message || 'Failed to load properties';
            console.error('❌ Error loading properties:', err);
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // FIXED: Enhanced property processing with better amenities handling
    const processPropertyDataForSearch = (property) => {
        if (!property) {
            console.warn('⚠️ processPropertyDataForSearch called with null/undefined property');
            return null;
        }

        try {
            console.log('🔧 Processing property for search:', {
                id: property.id,
                title: property.title
            });

        
            let amenities = [];
            if (property.amenities) {
                if (typeof property.amenities === 'string') {
                    try {
                        const parsed = JSON.parse(property.amenities);
                        if (Array.isArray(parsed)) {
                            amenities = parsed;
                        } else if (typeof parsed === 'string') {
                            amenities = parsed.split(',').map(item => item.trim()).filter(item => item);
                        } else if (parsed && typeof parsed === 'object') {
                            amenities = Object.values(parsed).filter(item => item && typeof item === 'string');
                        }
                    } catch (e) {
                        
                        amenities = property.amenities.split(',').map(item => item.trim()).filter(item => item);
                    }
                } else if (Array.isArray(property.amenities)) {
                    amenities = property.amenities;
                } else if (property.amenities && typeof property.amenities === 'object') {
                    amenities = Object.values(property.amenities).filter(item => item && typeof item === 'string');
                }
            }

            console.log('🔧 Processed amenities:', amenities);
            let propertyImages = [];
            let mainImage = '';

     
            if (property.propertyImages && Array.isArray(property.propertyImages)) {
                propertyImages = property.propertyImages
                    .map(img => ({
                        ...img,
                        imageUrl: processImageUrl(img.imageUrl)
                    }))
                    .filter(img => img.imageUrl && img.imageUrl !== '/default-property.jpg');
            }

      
            if (propertyImages.length === 0 && property.imageUrls && Array.isArray(property.imageUrls)) {
                propertyImages = property.imageUrls
                    .map(url => ({
                        imageUrl: processImageUrl(url)
                    }))
                    .filter(img => img.imageUrl && img.imageUrl !== '/default-property.jpg');
            }

         
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
                barangay: property.barangay || '',
                location: property.location || [property.city, property.state, property.country].filter(Boolean).join(', '),
                latitude: parseFloat(property.latitude) || 0,
                longitude: parseFloat(property.longitude) || 0,

                // Relationships
                ownerId: property.ownerId || null,
                agentId: property.agentId || null,
                agent: property.agent || null,

                // FIXED: Better amenities handling
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

            console.log('✅ Successfully processed property for search:', {
                id: processedProperty.id,
                title: processedProperty.title,
                images: processedProperty.propertyImages.length,
                amenities: processedProperty.amenities.length
            });

            return processedProperty;

        } catch (error) {
            console.error('❌ Error processing property data for search:', error, property);
            return null;
        }
    };

    // FIXED: Enhanced image URL processing
    const processImageUrl = (url) => {
        if (!url || typeof url !== 'string' || url.trim() === '') {
            return '/default-property.jpg';
        }

        // Already full URL (http, https, blob, data, etc.)
        if (url.startsWith('http') || url.startsWith('//') || url.startsWith('blob:') || url.startsWith('data:')) {
            return url;
        }

        // Server path - prepend appropriate base URL
        if (url.startsWith('/uploads/')) {
            const baseUrl = window.location.hostname === 'localhost'
                ? 'https://localhost:7080'
                : 'https://betheland.runasp.net';
            return `${baseUrl}${url}`;
        }
        if (url.includes('.') && !url.startsWith('/')) {
            const baseUrl = window.location.hostname === 'localhost'
                ? 'https://localhost:7080'
                : 'https://betheland.runasp.net';
            return `${baseUrl}/uploads/properties/${url}`;
        }

        // uploads/ path
        if (url.startsWith('uploads/')) {
            const baseUrl = window.location.hostname === 'localhost'
                ? 'https://localhost:7080'
                : 'https://betheland.runasp.net';
            return `${baseUrl}/${url}`;
        }

        return '/default-property.jpg';
    };

    // Keep other functions the same but add the new processAgentImageUrl function
    const processPropertyData = (property) => {
        return processPropertyDataForSearch(property);
    };

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

    const getAgentById = async (agentId) => {
        try {
            // Check cache first
            if (agentCache[agentId]) {
                return agentCache[agentId];
            }

            const agent = await agentService.getAgentWithFallback(agentId);
            if (agent) {
                // Process agent image
                const processedAgent = {
                    ...agent,
                    profilePictureUrl: processAgentImageUrl(agent.profilePictureUrl)
                };

                // Update cache
                setAgentCache(prev => ({
                    ...prev,
                    [agentId]: processedAgent
                }));
                return processedAgent;
            }
            return null;
        } catch (error) {
            console.error('Error fetching agent by ID:', error);
            return null;
        }
    };

    // Search properties function
    const searchProperties = async (filters = {}) => {
        setLoading(true);
        setError(null);
        try {
            console.log('🔍 Searching properties with filters:', filters);

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

            // Apply other filters...
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

    const getWishlistProperties = () => {
        return properties.filter(property => wishlist.has(property.id));
    };

    const clearSelectedProperty = () => {
        setSelectedProperty(null);
    };

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
        processAgentImageUrl,
        processPropertyData,
        processPropertyDataForSearch
    };

    return (
        <PropertyDataContext.Provider value={value}>
            {children}
        </PropertyDataContext.Provider>
    );
};

export default usePropertyData;