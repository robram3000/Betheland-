// PartnershipMapper.js
class PartnershipMapper {
    // Map API response to frontend partner object
    static mapToPartner(apiResponse) {
        if (!apiResponse.success) {
            throw new Error(apiResponse.message || 'API response indicates failure');
        }

        return {
            id: apiResponse.data?.id || 0,
            name: apiResponse.data?.name || '',
            logoUrl: apiResponse.data?.logoUrl || '',
            category: apiResponse.data?.category || '',
            displayOrder: apiResponse.data?.displayOrder || 0,
            isActive: apiResponse.data?.isActive || false,
            createdAt: apiResponse.data?.createdAt ? new Date(apiResponse.data.createdAt) : null,
            updatedAt: apiResponse.data?.updatedAt ? new Date(apiResponse.data.updatedAt) : null
        };
    }

    // Map multiple partners from API response
    static mapToPartnersList(apiResponse) {
        if (!apiResponse.success) {
            throw new Error(apiResponse.message || 'API response indicates failure');
        }

        return (apiResponse.data || []).map(partner => ({
            id: partner.id || 0,
            name: partner.name || '',
            logoUrl: partner.logoUrl || '',
            category: partner.category || '',
            displayOrder: partner.displayOrder || 0,
            isActive: partner.isActive || false,
            createdAt: partner.createdAt ? new Date(partner.createdAt) : null,
            updatedAt: partner.updatedAt ? new Date(partner.updatedAt) : null
        }));
    }

    // Map partnership content from API response
    static mapToPartnershipContent(apiResponse) {
        return {
            title: apiResponse.title || 'Our Trusted Partners',
            description: apiResponse.description || 'Collaborating with the Philippines\' leading real estate developers and brokers to bring you the best properties.',
            partners: (apiResponse.partners || []).map(partner => ({
                name: partner.name || '',
                logo: partner.logo || '',
                category: partner.category || ''
            }))
        };
    }

    // Map frontend partner object to create DTO
    static mapToCreatePartnerDto(partner) {
        return {
            name: partner.name || '',
            logoUrl: partner.logoUrl || '',
            category: partner.category || '',
            displayOrder: partner.displayOrder || 0
        };
    }

    // Map frontend partner object to update DTO
    static mapToUpdatePartnerDto(partner) {
        const dto = {};

        if (partner.name !== undefined) dto.name = partner.name;
        if (partner.logoUrl !== undefined) dto.logoUrl = partner.logoUrl;
        if (partner.category !== undefined) dto.category = partner.category;
        if (partner.displayOrder !== undefined) dto.displayOrder = partner.displayOrder;
        if (partner.isActive !== undefined) dto.isActive = partner.isActive;

        return dto;
    }

    // Map form data to partner object
    static mapFormToPartner(formData, existingPartner = null) {
        return {
            id: existingPartner?.id || 0,
            name: formData.name || '',
            logoUrl: formData.logoUrl || '',
            category: formData.category || '',
            displayOrder: formData.displayOrder || 0,
            isActive: formData.isActive !== undefined ? formData.isActive : true,
            createdAt: existingPartner?.createdAt || null,
            updatedAt: existingPartner?.updatedAt || null
        };
    }

    // Map partner to form data
    static mapPartnerToForm(partner) {
        return {
            name: partner.name || '',
            logoUrl: partner.logoUrl || '',
            category: partner.category || '',
            displayOrder: partner.displayOrder || 0,
            isActive: partner.isActive !== undefined ? partner.isActive : true
        };
    }

    // Validate partner data before submission
    static validatePartner(partner) {
        const errors = {};

        if (!partner.name || partner.name.trim() === '') {
            errors.name = 'Partner name is required';
        } else if (partner.name.length > 100) {
            errors.name = 'Partner name must be less than 100 characters';
        }

        if (!partner.logoUrl || partner.logoUrl.trim() === '') {
            errors.logoUrl = 'Logo URL is required';
        } else if (partner.logoUrl.length > 500) {
            errors.logoUrl = 'Logo URL must be less than 500 characters';
        } else if (!this.isValidUrl(partner.logoUrl)) {
            errors.logoUrl = 'Please enter a valid URL';
        }

        if (!partner.category || partner.category.trim() === '') {
            errors.category = 'Category is required';
        } else if (partner.category.length > 100) {
            errors.category = 'Category must be less than 100 characters';
        }

        if (partner.displayOrder < 0) {
            errors.displayOrder = 'Display order cannot be negative';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    // Helper method to validate URL
    static isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    // Sort partners by display order and name
    static sortPartners(partners) {
        return [...partners].sort((a, b) => {
            if (a.displayOrder !== b.displayOrder) {
                return a.displayOrder - b.displayOrder;
            }
            return a.name.localeCompare(b.name);
        });
    }

    // Filter active partners
    static filterActivePartners(partners) {
        return partners.filter(partner => partner.isActive);
    }

    // Group partners by category
    static groupPartnersByCategory(partners) {
        return partners.reduce((groups, partner) => {
            const category = partner.category || 'Uncategorized';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(partner);
            return groups;
        }, {});
    }
}

export default PartnershipMapper;