// AnnouncementMapper.js
class AnnouncementMapper {
    // Map API response to frontend announcement object
    static mapToAnnouncement(apiResponse) {
        if (!apiResponse.success) {
            throw new Error(apiResponse.message || 'API response indicates failure');
        }

        return {
            id: apiResponse.data?.id || 0,
            content: apiResponse.data?.content || '',
            category: apiResponse.data?.category || '',
            displayOrder: apiResponse.data?.displayOrder || 0,
            isActive: apiResponse.data?.isActive || false,
            createdAt: apiResponse.data?.createdAt ? new Date(apiResponse.data.createdAt) : null,
            updatedAt: apiResponse.data?.updatedAt ? new Date(apiResponse.data.updatedAt) : null
        };
    }

    // Map multiple announcements from API response
    static mapToAnnouncementsList(apiResponse) {
        if (!apiResponse.success) {
            throw new Error(apiResponse.message || 'API response indicates failure');
        }

        return (apiResponse.data || []).map(announcement => ({
            id: announcement.id || 0,
            content: announcement.content || '',
            category: announcement.category || '',
            displayOrder: announcement.displayOrder || 0,
            isActive: announcement.isActive || false,
            createdAt: announcement.createdAt ? new Date(announcement.createdAt) : null,
            updatedAt: announcement.updatedAt ? new Date(announcement.updatedAt) : null
        }));
    }

    // Map frontend announcement object to create DTO
    static mapToCreateAnnouncementDto(announcement) {
        return {
            content: announcement.content || '',
            category: announcement.category || '',
            displayOrder: announcement.displayOrder || 0
        };
    }

    // Map frontend announcement object to update DTO
    static mapToUpdateAnnouncementDto(announcement) {
        const dto = {};

        if (announcement.content !== undefined) dto.content = announcement.content;
        if (announcement.category !== undefined) dto.category = announcement.category;
        if (announcement.displayOrder !== undefined) dto.displayOrder = announcement.displayOrder;
        if (announcement.isActive !== undefined) dto.isActive = announcement.isActive;

        return dto;
    }

    // Map form data to announcement object
    static mapFormToAnnouncement(formData, existingAnnouncement = null) {
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
        return {
            content: announcement.content || '',
            category: announcement.category || '',
            displayOrder: announcement.displayOrder || 0,
            isActive: announcement.isActive !== undefined ? announcement.isActive : true
        };
    }

    // Validate announcement data before submission
    static validateAnnouncement(announcement) {
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

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    // Sort announcements by display order and creation date
    static sortAnnouncements(announcements) {
        return [...announcements].sort((a, b) => {
            if (a.displayOrder !== b.displayOrder) {
                return a.displayOrder - b.displayOrder;
            }
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    }

    // Filter active announcements
    static filterActiveAnnouncements(announcements) {
        return announcements.filter(announcement => announcement.isActive);
    }

    // Group announcements by category
    static groupAnnouncementsByCategory(announcements) {
        return announcements.reduce((groups, announcement) => {
            const category = announcement.category || 'Uncategorized';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(announcement);
            return groups;
        }, {});
    }

    // Format announcement for display
    static formatAnnouncementForDisplay(announcement) {
        return {
            ...announcement,
            displayContent: announcement.content.length > 100
                ? announcement.content.substring(0, 100) + '...'
                : announcement.content
        };
    }
}

export default AnnouncementMapper;