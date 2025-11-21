// AnnouncementMapper.js
class AnnouncementMapper {
    // Map API response to frontend announcement object
    static mapToAnnouncement(apiResponse) {
        console.log('🔄 Mapping single announcement from API response:', apiResponse);

        // Handle different response structures
        let announcementData = {};

        if (apiResponse && apiResponse.success && apiResponse.data) {
            // Structure: { success: true, data: { ... } }
            announcementData = apiResponse.data;
        } else if (apiResponse && apiResponse.data) {
            // Structure: { data: { ... } }
            announcementData = apiResponse.data;
        } else if (apiResponse && typeof apiResponse === 'object') {
            // Structure: direct object
            announcementData = apiResponse;
        }

        if (!announcementData || Object.keys(announcementData).length === 0) {
            console.warn('❌ No announcement data found in API response');
            return null;
        }

        return {
            id: announcementData.id || announcementData.Id || 0,
            content: announcementData.content || announcementData.Content || '',
            category: announcementData.category || announcementData.Category || '',
            displayOrder: announcementData.displayOrder || announcementData.DisplayOrder || 0,
            isActive: announcementData.isActive !== undefined ? announcementData.isActive :
                announcementData.IsActive !== undefined ? announcementData.IsActive : false,
            createdAt: announcementData.createdAt ? new Date(announcementData.createdAt) :
                announcementData.CreatedAt ? new Date(announcementData.CreatedAt) : null,
            updatedAt: announcementData.updatedAt ? new Date(announcementData.updatedAt) :
                announcementData.UpdatedAt ? new Date(announcementData.UpdatedAt) : null
        };
    }

    // Map multiple announcements from API response - SIMPLIFIED VERSION
    static mapToAnnouncementsList(apiResponse) {
        console.log('🔄 Mapping announcements list from API response:', apiResponse);

        let announcementsArray = [];

        // Handle direct array response (most common case)
        if (Array.isArray(apiResponse)) {
            console.log('✅ Using direct array structure, count:', apiResponse.length);
            announcementsArray = apiResponse;
        }
        // Handle { data: array } structure
        else if (apiResponse && Array.isArray(apiResponse.data)) {
            console.log('✅ Using data array structure, count:', apiResponse.data.length);
            announcementsArray = apiResponse.data;
        }
        // Handle { success: true, data: array } structure
        else if (apiResponse && apiResponse.success && Array.isArray(apiResponse.data)) {
            console.log('✅ Using success.data array structure, count:', apiResponse.data.length);
            announcementsArray = apiResponse.data;
        }
        // Handle single object in data
        else if (apiResponse && apiResponse.data && typeof apiResponse.data === 'object') {
            console.log('✅ Using single object in data structure');
            announcementsArray = [apiResponse.data];
        }
        // Handle empty or unexpected response
        else {
            console.warn('❌ Unknown API response structure:', apiResponse);
            return [];
        }

        console.log('📋 Announcements array to map:', announcementsArray);

        if (!Array.isArray(announcementsArray)) {
            console.error('❌ Expected array but got:', typeof announcementsArray, announcementsArray);
            return [];
        }

        // Map each announcement item - prioritize PascalCase (C# properties)
        const mapped = announcementsArray.map(announcement => {
            if (!announcement) return null;

            // Your C# properties use PascalCase, so prioritize those
            const mappedItem = {
                id: announcement.Id || announcement.id || 0,
                content: announcement.Content || announcement.content || '',
                category: announcement.Category || announcement.category || '',
                displayOrder: announcement.DisplayOrder || announcement.displayOrder || 0,
                isActive: announcement.IsActive !== undefined ? announcement.IsActive :
                    announcement.isActive !== undefined ? announcement.isActive : false,
                createdAt: announcement.CreatedAt ? new Date(announcement.CreatedAt) :
                    announcement.createdAt ? new Date(announcement.createdAt) : null,
                updatedAt: announcement.UpdatedAt ? new Date(announcement.UpdatedAt) :
                    announcement.updatedAt ? new Date(announcement.updatedAt) : null
            };

            console.log('🔧 Mapped item:', mappedItem);
            return mappedItem;
        }).filter(announcement => announcement !== null);

        console.log('✅ Final mapped announcements:', mapped);
        return mapped;
    }

    // Ultra-simple mapper for direct array responses
    static mapDirectArray(apiResponse) {
        console.log('🚀 Ultra-simple direct array mapping:', apiResponse);

        if (!apiResponse) {
            console.log('❌ Response is null or undefined');
            return [];
        }

        if (Array.isArray(apiResponse)) {
            console.log('✅ Response is direct array, count:', apiResponse.length);
            return apiResponse.map(item => ({
                id: item.Id || item.id || 0,
                content: item.Content || item.content || '',
                category: item.Category || item.category || '',
                displayOrder: item.DisplayOrder || item.displayOrder || 0,
                isActive: item.IsActive !== undefined ? item.IsActive :
                    item.isActive !== undefined ? item.isActive : false,
                createdAt: item.CreatedAt ? new Date(item.CreatedAt) :
                    item.createdAt ? new Date(item.createdAt) : null,
                updatedAt: item.UpdatedAt ? new Date(item.UpdatedAt) :
                    item.updatedAt ? new Date(item.updatedAt) : null
            }));
        }

        console.log('❌ Response is not an array, type:', typeof apiResponse);
        return [];
    }

    // Map frontend announcement object to create DTO
    static mapToCreateAnnouncementDto(announcement) {
        console.log('📤 Mapping to create announcement DTO:', announcement);

        return {
            Content: announcement.content || '',
            Category: announcement.category || '',
            DisplayOrder: announcement.displayOrder || 0
        };
    }

    // Map frontend announcement object to update DTO
    static mapToUpdateAnnouncementDto(announcement) {
        console.log('📤 Mapping to update announcement DTO:', announcement);

        const dto = {};

        if (announcement.content !== undefined) dto.Content = announcement.content;
        if (announcement.category !== undefined) dto.Category = announcement.category;
        if (announcement.displayOrder !== undefined) dto.DisplayOrder = announcement.displayOrder;
        if (announcement.isActive !== undefined) dto.IsActive = announcement.isActive;

        return dto;
    }

    // Map form data to announcement object
    static mapFormToAnnouncement(formData, existingAnnouncement = null) {
        console.log('📝 Mapping form to announcement:', formData, existingAnnouncement);

        return {
            id: existingAnnouncement?.id || 0,
            content: formData.content || '',
            category: formData.category || '',
            displayOrder: formData.displayOrder || 0,
            isActive: formData.isActive !== undefined ? formData.isActive : true,
            createdAt: existingAnnouncement?.createdAt || null,
            updatedAt: existingAnnouncement?.updatedAt || null
        };
    }

    // Map announcement to form data
    static mapAnnouncementToForm(announcement) {
        console.log('📋 Mapping announcement to form:', announcement);

        return {
            content: announcement.content || '',
            category: announcement.category || '',
            displayOrder: announcement.displayOrder || 0,
            isActive: announcement.isActive !== undefined ? announcement.isActive : true
        };
    }

    // Validate announcement data before submission
    static validateAnnouncement(announcement) {
        console.log('🔍 Validating announcement:', announcement);

        const errors = {};

        if (!announcement.content || announcement.content.trim() === '') {
            errors.content = 'Announcement content is required';
        } else if (announcement.content.length > 500) {
            errors.content = 'Announcement content must be less than 500 characters';
        }

        if (!announcement.category || announcement.category.trim() === '') {
            errors.category = 'Category is required';
        } else if (announcement.category.length > 100) {
            errors.category = 'Category must be less than 100 characters';
        }

        if (announcement.displayOrder < 0) {
            errors.displayOrder = 'Display order cannot be negative';
        }

        console.log('✅ Validation result:', { isValid: Object.keys(errors).length === 0, errors });
        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    // Sort announcements by display order and creation date
    static sortAnnouncements(announcements) {
        console.log('🔢 Sorting announcements:', announcements);

        return [...announcements].sort((a, b) => {
            if (a.displayOrder !== b.displayOrder) {
                return a.displayOrder - b.displayOrder;
            }
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    }

    // Filter active announcements
    static filterActiveAnnouncements(announcements) {
        console.log('⚡ Filtering active announcements:', announcements);

        return announcements.filter(announcement => announcement.isActive);
    }

    // Group announcements by category
    static groupAnnouncementsByCategory(announcements) {
        console.log('📂 Grouping announcements by category:', announcements);

        return announcements.reduce((groups, announcement) => {
            const category = announcement.category || 'Uncategorized';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(announcement);
            return groups;
        }, {});
    }

    // Debug method to log API response structure
    static debugApiResponse(apiResponse, endpoint = 'Unknown') {
        console.log(`🔍 === API Response Debug for ${endpoint} ===`);
        console.log('Full Response:', apiResponse);
        console.log('Type:', typeof apiResponse);

        if (apiResponse) {
            console.log('Keys:', Object.keys(apiResponse));
            console.log('Has success:', 'success' in apiResponse);
            console.log('Has data:', 'data' in apiResponse);
            console.log('Is Array:', Array.isArray(apiResponse));

            if (Array.isArray(apiResponse)) {
                console.log('Array Length:', apiResponse.length);
                if (apiResponse.length > 0) {
                    console.log('First Item Keys:', Object.keys(apiResponse[0]));
                    console.log('First Item:', apiResponse[0]);
                }
            }

            if (apiResponse.success !== undefined) {
                console.log('Success:', apiResponse.success);
            }
            if (apiResponse.data !== undefined) {
                console.log('Data Type:', typeof apiResponse.data);
                console.log('Is Data Array:', Array.isArray(apiResponse.data));
            }
        }
        console.log(`🔍 === End Debug for ${endpoint} ===`);
    }
}

export default AnnouncementMapper;