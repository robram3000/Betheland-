// PropertyMapper.jsx
import moment from 'moment';

export const propertyMapper = {

    // In PropertyMapper.js - toCreateRequest function
    toCreateRequest: (formData) => {
        try {
            console.log('Mapping form data to create request:', formData);

            return {
                title: formData.title,
                type: formData.type,
                description: formData.description,
                price: formData.price,
                status: formData.status,
                // Handle both moment objects and Date objects
                listedDate: formData.listedDate ?
                    (typeof formData.listedDate.toISOString === 'function' ?
                        formData.listedDate.toISOString() :
                        new Date(formData.listedDate).toISOString()) :
                    new Date().toISOString(),
                address: formData.address,
                unit: formData.unit,
                city: formData.city,
                state: formData.state,
                zipCode: formData.zipCode,
                country: formData.country,
                neighborhood: formData.neighborhood,
                latitude: formData.latitude,
                longitude: formData.longitude,
                bedrooms: formData.bedrooms,
                bathrooms: formData.bathrooms,
                areaSqft: formData.areaSqft,
                propertyAge: formData.propertyAge,
                propertyFloor: formData.propertyFloor,
                amenities: formData.amenities || [],
                ownerId: formData.ownerId,
                agentId: formData.agentId
            };
        } catch (error) {
            console.error('Error in toCreateRequest:', error);
            throw new Error('Failed to map property data for creation');
        }
    }, 

    toUpdateRequest: (formData) => {
        try {
            const updateData = {
                property: {
                    propertyNo: formData.propertyNo || '',
                    title: formData.title?.trim() || '',
                    description: formData.description?.trim() || '',
                    type: formData.type || 'residential',
                    price: parseFloat(formData.price) || 0,
                    propertyAge: parseInt(formData.propertyAge) || 0,
                    propertyFloor: parseInt(formData.propertyFloor) || 1,
                    bedrooms: parseInt(formData.bedrooms) || 0,
                    bathrooms: parseFloat(formData.bathrooms) || 0,
                    areaSqft: parseInt(formData.areaSqft) || 0,
                    address: formData.address?.trim() || '',
                    city: formData.city?.trim() || '',
                    state: formData.state?.trim() || '',
                    zipCode: formData.zipCode?.trim() || '',
                    latitude: parseFloat(formData.latitude) || 0,
                    longitude: parseFloat(formData.longitude) || 0,
                    status: formData.status || 'draft',
                    ownerId: formData.ownerId ? parseInt(formData.ownerId) : null,
                    agentId: formData.agentId ? parseInt(formData.agentId) : null,
                    amenities: Array.isArray(formData.amenities)
                        ? JSON.stringify(formData.amenities)
                        : (formData.amenities || '[]'),
                    listedDate: formData.listedDate
                        ? formData.listedDate.toISOString()
                        : formData.listedDate,
                }
            };

            // Only include image/video URLs if they are provided
            if (formData.imageUrls && Array.isArray(formData.imageUrls)) {
                updateData.imageUrls = formData.imageUrls;
            }

            if (formData.videoUrls && Array.isArray(formData.videoUrls)) {
                updateData.videoUrls = formData.videoUrls;
            }

            return updateData;
        } catch (error) {
            console.error('Error in toUpdateRequest:', error);
            throw new Error('Failed to map property data for update');
        }
    },

    toFrontend: (backendData) => {
        try {
            if (!backendData) {
                console.warn('No backend data provided to toFrontend');
                return null;
            }

            const property = {
                id: backendData.id || 0,
                propertyNo: backendData.propertyNo || '',
                title: backendData.title || '',
                description: backendData.description || '',
                type: backendData.type || 'residential',
                price: parseFloat(backendData.price) || 0,
                propertyAge: parseInt(backendData.propertyAge) || 0,
                propertyFloor: parseInt(backendData.propertyFloor) || 1,
                bedrooms: parseInt(backendData.bedrooms) || 0,
                bathrooms: parseFloat(backendData.bathrooms) || 0,
                areaSqft: parseInt(backendData.areaSqft) || 0,
                address: backendData.address || '',
                city: backendData.city || '',
                state: backendData.state || '',
                zipCode: backendData.zipCode || '',
                latitude: parseFloat(backendData.latitude) || 0,
                longitude: parseFloat(backendData.longitude) || 0,
                status: backendData.status || 'draft',
                ownerId: backendData.ownerId || null,
                agentId: backendData.agentId || null,
                amenities: backendData.amenities || '[]',
                listedDate: backendData.listedDate ? moment(backendData.listedDate) : null,
                createdAt: backendData.createdAt ? moment(backendData.createdAt) : null,
                updatedAt: backendData.updatedAt ? moment(backendData.updatedAt) : null,

                // Handle property images
                propertyImages: [],

                // Handle property videos
                propertyVideos: [],

                // Convenience fields
                mainImage: '',
                mainVideo: '',

                // URL arrays
                imageUrls: [],
                videoUrls: []
            };

            // Process property images
            if (backendData.propertyImages) {
                const images = Array.isArray(backendData.propertyImages)
                    ? backendData.propertyImages
                    : [backendData.propertyImages];

                property.propertyImages = images.map(img => ({
                    id: img.id || 0,
                    propertyId: img.propertyId || property.id,
                    imageUrl: img.imageUrl || '',
                    createdAt: img.createdAt ? moment(img.createdAt) : null
                })).filter(img => img.imageUrl);

                property.imageUrls = property.propertyImages.map(img => img.imageUrl);
                property.mainImage = property.imageUrls[0] || '';
            }

            // Process property videos
            if (backendData.propertyVideos) {
                const videos = Array.isArray(backendData.propertyVideos)
                    ? backendData.propertyVideos
                    : [backendData.propertyVideos];

                property.propertyVideos = videos.map(video => ({
                    id: video.id || 0,
                    propertyId: video.propertyId || property.id,
                    videoUrl: video.videoUrl || '',
                    thumbnailUrl: video.thumbnailUrl || '',
                    duration: parseFloat(video.duration) || 0,
                    fileSize: parseFloat(video.fileSize) || 0,
                    videoName: video.videoName || '',
                    createdAt: video.createdAt ? moment(video.createdAt) : null
                })).filter(video => video.videoUrl);

                property.videoUrls = property.propertyVideos.map(video => video.videoUrl);
                property.mainVideo = property.videoUrls[0] || '';
            }

            // Parse amenities if it's a string
            if (typeof property.amenities === 'string') {
                try {
                    property.amenities = JSON.parse(property.amenities);
                } catch (e) {
                    console.warn('Failed to parse amenities:', property.amenities);
                    property.amenities = [];
                }
            }

            return property;
        } catch (error) {
            console.error('Error in toFrontend:', error, backendData);
            throw new Error('Failed to map backend data to frontend format');
        }
    },

    toFrontendList: (backendList) => {
        try {
            if (!Array.isArray(backendList)) {
                console.warn('Backend list is not an array:', backendList);
                return [];
            }

            return backendList
                .map(property => {
                    try {
                        return propertyMapper.toFrontend(property);
                    } catch (error) {
                        console.error('Error mapping property in list:', error, property);
                        return null;
                    }
                })
                .filter(property => property !== null);
        } catch (error) {
            console.error('Error in toFrontendList:', error);
            return [];
        }
    },

    // Form data preparation for file uploads
    toFormData: (propertyData, images = [], videos = []) => {
        try {
            const formData = new FormData();

            // Add property data as JSON string
            const createRequest = propertyMapper.toCreateRequest(propertyData);
            formData.append('propertyData', JSON.stringify(createRequest));

            // Add images
            if (Array.isArray(images)) {
                images.forEach((image, index) => {
                    if (image instanceof File) {
                        formData.append('images', image);
                    }
                });
            }

            // Add videos
            if (Array.isArray(videos)) {
                videos.forEach((video, index) => {
                    if (video instanceof File) {
                        formData.append('videos', video);
                    }
                });
            }

            return formData;
        } catch (error) {
            console.error('Error in toFormData:', error);
            throw new Error('Failed to create form data for property');
        }
    },

    // Update form data preparation
    toUpdateFormData: (propertyData, images = [], videos = []) => {
        try {
            const formData = new FormData();

            // Add property data as JSON string
            const updateRequest = propertyMapper.toUpdateRequest(propertyData);
            formData.append('propertyData', JSON.stringify(updateRequest));

            // Add new images
            if (Array.isArray(images)) {
                images.forEach((image, index) => {
                    if (image instanceof File) {
                        formData.append('images', image);
                    }
                });
            }

            // Add new videos
            if (Array.isArray(videos)) {
                videos.forEach((video, index) => {
                    if (video instanceof File) {
                        formData.append('videos', video);
                    }
                });
            }

            return formData;
        } catch (error) {
            console.error('Error in toUpdateFormData:', error);
            throw new Error('Failed to create update form data for property');
        }
    },

    // Search request mapper
    toSearchRequest: (searchCriteria) => {
        return {
            searchTerm: searchCriteria.searchTerm || '',
            status: searchCriteria.status || '',
            type: searchCriteria.type || '',
            minPrice: searchCriteria.minPrice ? parseFloat(searchCriteria.minPrice) : 0,
            maxPrice: searchCriteria.maxPrice ? parseFloat(searchCriteria.maxPrice) : 0,
            minBedrooms: searchCriteria.minBedrooms ? parseInt(searchCriteria.minBedrooms) : 0,
            maxBedrooms: searchCriteria.maxBedrooms ? parseInt(searchCriteria.maxBedrooms) : 0,
            city: searchCriteria.city || '',
            state: searchCriteria.state || '',
            page: searchCriteria.page || 1,
            pageSize: searchCriteria.pageSize || 10
        };
    },

    // Simplified property view
    toSimpleProperty: (property) => {
        try {
            const fullProperty = propertyMapper.toFrontend(property);
            if (!fullProperty) return null;

            return {
                id: fullProperty.id,
                title: fullProperty.title,
                type: fullProperty.type,
                price: fullProperty.price,
                bedrooms: fullProperty.bedrooms,
                bathrooms: fullProperty.bathrooms,
                areaSqft: fullProperty.areaSqft,
                address: fullProperty.address,
                city: fullProperty.city,
                state: fullProperty.state,
                status: fullProperty.status,
                mainImage: fullProperty.mainImage,
                listedDate: fullProperty.listedDate,
                propertyAge: fullProperty.propertyAge,
                amenities: fullProperty.amenities
            };
        } catch (error) {
            console.error('Error in toSimpleProperty:', error);
            return null;
        }
    },

    toSimplePropertyList: (backendList) => {
        try {
            if (!Array.isArray(backendList)) return [];

            return backendList
                .map(property => propertyMapper.toSimpleProperty(property))
                .filter(property => property !== null);
        } catch (error) {
            console.error('Error in toSimplePropertyList:', error);
            return [];
        }
    },

  
};

export default propertyMapper;