import moment from 'moment';

// Image processing algorithm similar to ClientMapper
const processImageUrl = (url) => {
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

export const propertyMapper = {
    toCreateRequest: (formData) => {
        try {
            console.log('Raw formData for creation:', formData);

            // FIX: Better amenities handling
            let amenitiesValue = [];
            if (Array.isArray(formData.amenities)) {
                amenitiesValue = formData.amenities;
            } else if (typeof formData.amenities === 'string') {
                try {
                    // Try to parse as JSON first
                    amenitiesValue = JSON.parse(formData.amenities);
                } catch (e) {
                    // If it's a comma-separated string, split it
                    amenitiesValue = formData.amenities.split(',').map(item => item.trim()).filter(item => item);
                }
            }

            // Ensure it's always an array
            if (!Array.isArray(amenitiesValue)) {
                amenitiesValue = [];
            }

            // Handle listedDate with better fallbacks
            let listedDateValue;
            if (formData.listedDate) {
                if (typeof formData.listedDate.toISOString === 'function') {
                    listedDateValue = formData.listedDate.toISOString();
                } else if (typeof formData.listedDate === 'string') {
                    listedDateValue = formData.listedDate;
                } else {
                    listedDateValue = new Date(formData.listedDate).toISOString();
                }
            } else {
                listedDateValue = new Date().toISOString();
            }

            const createRequest = {
                property: {
                    title: formData.title?.trim() || '',
                    description: formData.description || '',
                    type: formData.type || 'residential',
                    price: parseFloat(formData.price) || 0,
                    status: formData.status || 'draft',
                    propertyAge: parseInt(formData.propertyAge) || 0,
                    propertyFloor: parseInt(formData.propertyFloor) || 1,
                    bedrooms: parseInt(formData.bedrooms) || 0,
                    bathrooms: parseFloat(formData.bathrooms) || 0,
                    areaSqm: parseInt(formData.areaSqm) || 0,
                    kitchen: parseInt(formData.kitchen) || 0,
                    garage: parseInt(formData.garage) || 0,
                    address: formData.address?.trim() || '',
                    city: formData.city?.trim() || '',
                    state: formData.state?.trim() || '',
                    zipCode: formData.zipCode?.trim() || '',
                    country: formData.country?.trim() || '',
                    barangay: formData.barangay?.trim() || '', // FIX: Ensure barangay is included
                    latitude: parseFloat(formData.latitude) || 0,
                    longitude: parseFloat(formData.longitude) || 0,
                    amenities: JSON.stringify(amenitiesValue),
                    ownerId: formData.ownerId ? parseInt(formData.ownerId) : null,
                    agentId: formData.agentId ? parseInt(formData.agentId) : null,
                    listedDate: listedDateValue,
                },
                imageUrls: Array.isArray(formData.imageUrls) ? formData.imageUrls.map(url => processImageUrl(url)) : [],
                videoUrls: Array.isArray(formData.videoUrls) ? formData.videoUrls : []
            };

            console.log('Mapped create request with barangay:', createRequest.property.barangay);
            console.log('Mapped create request with amenities:', createRequest.property.amenities);
            return createRequest;
        } catch (error) {
            console.error('Error in toCreateRequest:', error, formData);
            throw new Error('Failed to map property data for creation');
        }
    },

    toUpdateRequest: (formData) => {
        try {
            console.log('Raw formData for update:', formData);

            // FIX: Better amenities handling
            let amenitiesValue = [];
            if (Array.isArray(formData.amenities)) {
                amenitiesValue = formData.amenities;
            } else if (typeof formData.amenities === 'string') {
                try {
                    amenitiesValue = JSON.parse(formData.amenities);
                } catch (e) {
                    amenitiesValue = formData.amenities.split(',').map(item => item.trim()).filter(item => item);
                }
            }

            // Ensure it's always an array
            if (!Array.isArray(amenitiesValue)) {
                amenitiesValue = [];
            }

            // Handle listedDate with better fallbacks
            let listedDateValue;
            if (formData.listedDate) {
                if (typeof formData.listedDate.toISOString === 'function') {
                    listedDateValue = formData.listedDate.toISOString();
                } else if (typeof formData.listedDate === 'string') {
                    listedDateValue = formData.listedDate;
                } else {
                    listedDateValue = new Date(formData.listedDate).toISOString();
                }
            } else {
                listedDateValue = new Date().toISOString();
            }

            const updateData = {
                property: {
                    id: parseInt(formData.id) || 0,
                    title: formData.title?.trim() || '',
                    description: formData.description || '',
                    type: formData.type || 'residential',
                    price: parseFloat(formData.price) || 0,
                    status: formData.status || 'draft',
                    propertyAge: parseInt(formData.propertyAge) || 0,
                    propertyFloor: parseInt(formData.propertyFloor) || 1,
                    bedrooms: parseInt(formData.bedrooms) || 0,
                    bathrooms: parseFloat(formData.bathrooms) || 0,
                    areaSqm: parseInt(formData.areaSqm) || 0,
                    kitchen: parseInt(formData.kitchen) || 0,
                    garage: parseInt(formData.garage) || 0,
                    address: formData.address?.trim() || '',
                    city: formData.city?.trim() || '',
                    state: formData.state?.trim() || '',
                    zipCode: formData.zipCode?.trim() || '',
                    country: formData.country?.trim() || '',
                    barangay: formData.barangay?.trim() || '', // FIX: Ensure barangay is included
                    latitude: parseFloat(formData.latitude) || 0,
                    longitude: parseFloat(formData.longitude) || 0,
                    amenities: JSON.stringify(amenitiesValue),
                    ownerId: formData.ownerId ? parseInt(formData.ownerId) : null,
                    agentId: formData.agentId ? parseInt(formData.agentId) : null,
                    listedDate: listedDateValue,
                }
            };

            if (formData.imageUrls && Array.isArray(formData.imageUrls)) {
                updateData.imageUrls = formData.imageUrls.map(url => processImageUrl(url));
            }

            if (formData.videoUrls && Array.isArray(formData.videoUrls)) {
                updateData.videoUrls = formData.videoUrls;
            }

            console.log('Mapped update request with barangay:', updateData.property.barangay);
            console.log('Mapped update request with amenities:', updateData.property.amenities);
            return updateData;
        } catch (error) {
            console.error('Error in toUpdateRequest:', error, formData);
            throw new Error('Failed to map property data for update');
        }
    },

    toFrontend: (backendData) => {
        try {
            if (!backendData) {
                console.warn('No backend data provided to toFrontend');
                return null;
            }

            console.log('Raw backend data for mapping:', backendData);

            // FIX: Enhanced amenities parsing with multiple fallbacks
            let amenitiesValue = [];
            if (backendData.amenities) {
                if (Array.isArray(backendData.amenities)) {
                    amenitiesValue = backendData.amenities;
                } else if (typeof backendData.amenities === 'string') {
                    try {
                        // Try to parse as JSON
                        const parsed = JSON.parse(backendData.amenities);
                        if (Array.isArray(parsed)) {
                            amenitiesValue = parsed;
                        } else if (typeof parsed === 'string') {
                            // If it's a string inside JSON, try to split it
                            amenitiesValue = parsed.split(',').map(item => item.trim()).filter(item => item);
                        }
                    } catch (e) {
                        // If JSON parsing fails, try comma separation
                        amenitiesValue = backendData.amenities.split(',').map(item => item.trim()).filter(item => item);
                    }
                }
            }

            const property = {
                id: backendData.id || 0,
                propertyNo: backendData.propertyNo || '',
                title: backendData.title || '',
                description: backendData.description || '',
                type: backendData.type || 'residential',
                price: parseFloat(backendData.price) || 0,
                status: backendData.status || 'draft',
                propertyAge: parseInt(backendData.propertyAge) || 0,
                propertyFloor: parseInt(backendData.propertyFloor) || 1,
                bedrooms: parseInt(backendData.bedrooms) || 0,
                bathrooms: parseFloat(backendData.bathrooms) || 0,
                areaSqm: parseInt(backendData.areaSqm) || 0,
                kitchen: parseInt(backendData.kitchen) || 0,
                garage: parseInt(backendData.garage) || 0,
                address: backendData.address || '',
                city: backendData.city || '',
                state: backendData.state || '',
                zipCode: backendData.zipCode || '',
                barangay: backendData.barangay || '', // FIX: Ensure barangay is mapped
                country: backendData.country || '',
                latitude: parseFloat(backendData.latitude) || 0,
                longitude: parseFloat(backendData.longitude) || 0,
                amenities: amenitiesValue, // FIX: Now properly parsed as array
                ownerId: backendData.ownerId || null,
                agentId: backendData.agentId || null,
                listedDate: backendData.listedDate ? moment(backendData.listedDate) : null,
                createdAt: backendData.createdAt ? moment(backendData.createdAt) : null,
                updatedAt: backendData.updatedAt ? moment(backendData.updatedAt) : null,
                propertyImages: [],
                propertyVideos: [],
                imageUrls: [],
                videoUrls: [],
                mainImage: '',
                mainVideo: '',
                agent: null
            };

            // Map agent data if available
            if (backendData.agent) {
                property.agent = {
                    id: backendData.agent.id,
                    firstName: backendData.agent.firstName || '',
                    lastName: backendData.agent.lastName || '',
                    email: backendData.agent.email || '',
                    profilePictureUrl: processImageUrl(backendData.agent.profilePictureUrl || ''),
                    cellPhoneNo: backendData.agent.cellPhoneNo || '',
                    licenseNumber: backendData.agent.licenseNumber || ''
                };
            } else if (backendData.agentId) {
                property.agent = {
                    id: backendData.agentId,
                    firstName: 'Unknown',
                    lastName: 'Agent',
                    email: '',
                    profilePictureUrl: processImageUrl('')
                };
            }

            if (backendData.propertyImages) {
                const images = Array.isArray(backendData.propertyImages)
                    ? backendData.propertyImages
                    : [backendData.propertyImages];

                property.propertyImages = images.map(img => ({
                    id: img.id || 0,
                    propertyId: img.propertyId || property.id,
                    imageUrl: processImageUrl(img.imageUrl || ''),
                    createdAt: img.createdAt ? moment(img.createdAt) : null
                })).filter(img => img.imageUrl);

                property.imageUrls = property.propertyImages.map(img => img.imageUrl);
                property.mainImage = property.imageUrls[0] || '';
            }

            if (backendData.propertyVideos) {
                const videos = Array.isArray(backendData.propertyVideos)
                    ? backendData.propertyVideos
                    : [backendData.propertyVideos];

                property.propertyVideos = videos.map(video => ({
                    id: video.id || 0,
                    propertyId: video.propertyId || property.id,
                    videoUrl: video.videoUrl || '',
                    thumbnailUrl: processImageUrl(video.thumbnailUrl || ''),
                    duration: video.duration || '0',
                    fileSize: parseFloat(video.fileSize) || 0,
                    videoName: video.videoName || '',
                    createdAt: video.createdAt ? moment(video.createdAt) : null
                })).filter(video => video.videoUrl);

                property.videoUrls = property.propertyVideos.map(video => video.videoUrl);
                property.mainVideo = property.videoUrls[0] || '';
            }

            console.log('Mapped frontend property with barangay:', property.barangay);
            console.log('Mapped frontend property with amenities:', property.amenities);
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

    toFormData: (propertyData, images = [], videos = []) => {
        try {
            const formData = new FormData();

            // FIX: Better amenities handling
            let amenitiesValue = [];
            if (Array.isArray(propertyData.amenities)) {
                amenitiesValue = propertyData.amenities;
            } else if (typeof propertyData.amenities === 'string') {
                try {
                    amenitiesValue = JSON.parse(propertyData.amenities);
                } catch (e) {
                    amenitiesValue = propertyData.amenities.split(',').map(item => item.trim()).filter(item => item);
                }
            }

            // Ensure it's always an array
            if (!Array.isArray(amenitiesValue)) {
                amenitiesValue = [];
            }

            let listedDateValue;
            if (propertyData.listedDate) {
                if (typeof propertyData.listedDate.toISOString === 'function') {
                    listedDateValue = propertyData.listedDate.toISOString();
                } else if (typeof propertyData.listedDate === 'string') {
                    listedDateValue = propertyData.listedDate;
                } else {
                    listedDateValue = new Date(propertyData.listedDate).toISOString();
                }
            } else {
                listedDateValue = new Date().toISOString();
            }

            const createRequest = {
                property: {
                    title: propertyData.title?.trim() || '',
                    description: propertyData.description || '',
                    type: propertyData.type || 'residential',
                    price: parseFloat(propertyData.price) || 0,
                    status: propertyData.status || 'draft',
                    propertyAge: parseInt(propertyData.propertyAge) || 0,
                    propertyFloor: parseInt(propertyData.propertyFloor) || 1,
                    bedrooms: parseInt(propertyData.bedrooms) || 0,
                    bathrooms: parseFloat(propertyData.bathrooms) || 0,
                    areaSqm: parseInt(propertyData.areaSqm) || 0,
                    kitchen: parseInt(propertyData.kitchen) || 0,
                    garage: parseInt(propertyData.garage) || 0,
                    address: propertyData.address?.trim() || '',
                    city: propertyData.city?.trim() || '',
                    state: propertyData.state?.trim() || '',
                    zipCode: propertyData.zipCode?.trim() || '',
                    country: propertyData.country?.trim() || '',
                    barangay: propertyData.barangay?.trim() || '', // FIX: Include barangay
                    latitude: parseFloat(propertyData.latitude) || 0,
                    longitude: parseFloat(propertyData.longitude) || 0,
                    amenities: JSON.stringify(amenitiesValue),
                    ownerId: propertyData.ownerId ? parseInt(propertyData.ownerId) : null,
                    agentId: propertyData.agentId ? parseInt(propertyData.agentId) : null,
                    listedDate: listedDateValue,
                },
                imageUrls: Array.isArray(propertyData.imageUrls) ? propertyData.imageUrls.map(url => processImageUrl(url)) : [],
                videoUrls: Array.isArray(propertyData.videoUrls) ? propertyData.videoUrls : []
            };

            formData.append('propertyData', JSON.stringify(createRequest));

            if (Array.isArray(images)) {
                images.forEach((image, index) => {
                    if (image instanceof File) {
                        formData.append('images', image);
                    }
                });
            }

            if (Array.isArray(videos)) {
                videos.forEach((video, index) => {
                    if (video instanceof File) {
                        formData.append('videos', video);
                    }
                });
            }

            console.log('FormData created with barangay:', createRequest.property.barangay);
            console.log('FormData created with amenities:', createRequest.property.amenities);
            return formData;
        } catch (error) {
            console.error('Error in toFormData:', error);
            throw new Error('Failed to create form data for property');
        }
    },

    toUpdateFormData: (propertyData, images = [], videos = []) => {
        try {
            const formData = new FormData();

            // FIX: Better amenities handling
            let amenitiesValue = [];
            if (Array.isArray(propertyData.amenities)) {
                amenitiesValue = propertyData.amenities;
            } else if (typeof propertyData.amenities === 'string') {
                try {
                    amenitiesValue = JSON.parse(propertyData.amenities);
                } catch (e) {
                    amenitiesValue = propertyData.amenities.split(',').map(item => item.trim()).filter(item => item);
                }
            }

            // Ensure it's always an array
            if (!Array.isArray(amenitiesValue)) {
                amenitiesValue = [];
            }

            let listedDateValue;
            if (propertyData.listedDate) {
                if (typeof propertyData.listedDate.toISOString === 'function') {
                    listedDateValue = propertyData.listedDate.toISOString();
                } else if (typeof propertyData.listedDate === 'string') {
                    listedDateValue = propertyData.listedDate;
                } else {
                    listedDateValue = new Date(propertyData.listedDate).toISOString();
                }
            } else {
                listedDateValue = new Date().toISOString();
            }

            const updateRequest = {
                property: {
                    id: parseInt(propertyData.id) || 0,
                    title: propertyData.title?.trim() || '',
                    description: propertyData.description || '',
                    type: propertyData.type || 'residential',
                    price: parseFloat(propertyData.price) || 0,
                    status: propertyData.status || 'draft',
                    propertyAge: parseInt(propertyData.propertyAge) || 0,
                    propertyFloor: parseInt(propertyData.propertyFloor) || 1,
                    bedrooms: parseInt(propertyData.bedrooms) || 0,
                    bathrooms: parseFloat(propertyData.bathrooms) || 0,
                    areaSqm: parseInt(propertyData.areaSqm) || 0,
                    kitchen: parseInt(propertyData.kitchen) || 0,
                    garage: parseInt(propertyData.garage) || 0,
                    address: propertyData.address?.trim() || '',
                    city: propertyData.city?.trim() || '',
                    state: propertyData.state?.trim() || '',
                    zipCode: propertyData.zipCode?.trim() || '',
                    country: propertyData.country?.trim() || '',
                    barangay: propertyData.barangay?.trim() || '', // FIX: Include barangay
                    latitude: parseFloat(propertyData.latitude) || 0,
                    longitude: parseFloat(propertyData.longitude) || 0,
                    amenities: JSON.stringify(amenitiesValue),
                    ownerId: propertyData.ownerId ? parseInt(propertyData.ownerId) : null,
                    agentId: propertyData.agentId ? parseInt(propertyData.agentId) : null,
                    listedDate: listedDateValue,
                },
                imageUrls: Array.isArray(propertyData.imageUrls) ? propertyData.imageUrls.map(url => processImageUrl(url)) : [],
                videoUrls: Array.isArray(propertyData.videoUrls) ? propertyData.videoUrls : []
            };

            formData.append('propertyData', JSON.stringify(updateRequest));

            if (Array.isArray(images)) {
                images.forEach((image) => {
                    if (image instanceof File) {
                        formData.append('images', image);
                    }
                });
            }

            if (Array.isArray(videos)) {
                videos.forEach((video) => {
                    if (video instanceof File) {
                        formData.append('videos', video);
                    }
                });
            }

            console.log('Update FormData created with barangay:', updateRequest.property.barangay);
            console.log('Update FormData created with amenities:', updateRequest.property.amenities);
            return formData;
        } catch (error) {
            console.error('Error in toUpdateFormData:', error);
            throw new Error('Failed to create update form data for property');
        }
    },

    toSearchRequest: (searchCriteria) => {
        try {
            console.log('Mapping search criteria:', searchCriteria);

            if (typeof searchCriteria === 'string') {
                return { q: searchCriteria };
            }

            if (typeof searchCriteria === 'object') {
                return searchCriteria;
            }

            return { q: searchCriteria || '' };
        } catch (error) {
            console.error('Error in toSearchRequest:', error);
            return { q: '' };
        }
    }
};

export default propertyMapper;