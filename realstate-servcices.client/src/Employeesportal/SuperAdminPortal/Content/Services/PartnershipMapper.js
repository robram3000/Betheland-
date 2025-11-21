// PartnershipMapper.js
class PartnershipMapper {
    // Map API response to frontend partner object
    static mapToPartner(apiResponse) {
        console.log('Mapping single partner from API response:', apiResponse);

        // Handle different response structures
        let partnerData = {};

        if (apiResponse && apiResponse.success && apiResponse.data) {
            // Structure: { success: true, data: { ... } }
            partnerData = apiResponse.data;
        } else if (apiResponse && apiResponse.data) {
            // Structure: { data: { ... } }
            partnerData = apiResponse.data;
        } else if (apiResponse && typeof apiResponse === 'object') {
            // Structure: direct object
            partnerData = apiResponse;
        }

        if (!partnerData || Object.keys(partnerData).length === 0) {
            console.warn('No partner data found in API response');
            return null;
        }

        return {
            id: partnerData.id || partnerData.Id || 0,
            name: partnerData.name || partnerData.Name || '',
            logoUrl: partnerData.logoUrl || partnerData.LogoUrl || partnerData.logo || '',
            category: partnerData.category || partnerData.Category || '',
            displayOrder: partnerData.displayOrder || partnerData.DisplayOrder || 0,
            isActive: partnerData.isActive !== undefined ? partnerData.isActive :
                partnerData.IsActive !== undefined ? partnerData.IsActive : false,
            createdAt: partnerData.createdAt ? new Date(partnerData.createdAt) :
                partnerData.CreatedAt ? new Date(partnerData.CreatedAt) : null,
            updatedAt: partnerData.updatedAt ? new Date(partnerData.updatedAt) :
                partnerData.UpdatedAt ? new Date(partnerData.UpdatedAt) : null
        };
    }

    // Map multiple partners from API response
    static mapToPartnersList(apiResponse) {
        console.log('Mapping partners list from API response:', apiResponse);

        // Handle different response structures
        let partnersArray = [];

        if (apiResponse && apiResponse.success && Array.isArray(apiResponse.data)) {
            // Structure: { success: true, data: [...] }
            console.log('Using success.data structure');
            partnersArray = apiResponse.data;
        } else if (Array.isArray(apiResponse)) {
            // Structure: direct array
            console.log('Using direct array structure');
            partnersArray = apiResponse;
        } else if (apiResponse && Array.isArray(apiResponse.data)) {
            // Structure: { data: [...] }
            console.log('Using data array structure');
            partnersArray = apiResponse.data;
        } else if (apiResponse && apiResponse.success && apiResponse.data && typeof apiResponse.data === 'object') {
            // Structure: { success: true, data: { partners: [...] } }
            console.log('Using nested data structure');
            partnersArray = apiResponse.data.partners || [];
        } else {
            console.warn('Unknown API response structure:', apiResponse);
            // Return empty array to prevent UI breakage
            return [];
        }

        console.log('Partners array to map:', partnersArray);

        if (!Array.isArray(partnersArray)) {
            console.error('Expected array but got:', typeof partnersArray, partnersArray);
            return [];
        }

        return partnersArray.map(partner => ({
            id: partner.id || partner.Id || 0,
            name: partner.name || partner.Name || '',
            logoUrl: partner.logoUrl || partner.LogoUrl || partner.logo || '',
            category: partner.category || partner.Category || '',
            displayOrder: partner.displayOrder || partner.DisplayOrder || 0,
            isActive: partner.isActive !== undefined ? partner.isActive :
                partner.IsActive !== undefined ? partner.IsActive : false,
            createdAt: partner.createdAt ? new Date(partner.createdAt) :
                partner.CreatedAt ? new Date(partner.CreatedAt) : null,
            updatedAt: partner.updatedAt ? new Date(partner.updatedAt) :
                partner.UpdatedAt ? new Date(partner.UpdatedAt) : null
        }));
    }

    // Map partnership content from API response
    static mapToPartnershipContent(apiResponse) {
        console.log('Mapping partnership content from API response:', apiResponse);

        let contentData = apiResponse;

        // Handle different response structures
        if (apiResponse && apiResponse.success && apiResponse.data) {
            contentData = apiResponse.data;
        }

        return {
            title: contentData.title || contentData.Title || 'Our Trusted Partners',
            description: contentData.description || contentData.Description || 'Collaborating with the Philippines\' leading real estate developers and brokers to bring you the best properties.',
            partners: (contentData.partners || []).map(partner => ({
                name: partner.name || partner.Name || '',
                logo: partner.logo || partner.logoUrl || partner.LogoUrl || '',
                category: partner.category || partner.Category || ''
            }))
        };
    }

    // Map frontend partner object to create DTO
    static mapToCreatePartnerDto(partner) {
        console.log('Mapping to create partner DTO:', partner);

        return {
            name: partner.name || '',
            logoUrl: partner.logoUrl || '',
            category: partner.category || '',
            displayOrder: partner.displayOrder || 0
        };
    }

    // Map frontend partner object to update DTO
    static mapToUpdatePartnerDto(partner) {
        console.log('Mapping to update partner DTO:', partner);

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
        console.log('Mapping form to partner:', formData, existingPartner);

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
        console.log('Mapping partner to form:', partner);

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
        console.log('Validating partner:', partner);

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

        console.log('Validation result:', { isValid: Object.keys(errors).length === 0, errors });
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
        console.log('Sorting partners:', partners);

        return [...partners].sort((a, b) => {
            if (a.displayOrder !== b.displayOrder) {
                return a.displayOrder - b.displayOrder;
            }
            return a.name.localeCompare(b.name);
        });
    }

    // Filter active partners
    static filterActivePartners(partners) {
        console.log('Filtering active partners:', partners);

        return partners.filter(partner => partner.isActive);
    }

    // Group partners by category
    static groupPartnersByCategory(partners) {
        console.log('Grouping partners by category:', partners);

        return partners.reduce((groups, partner) => {
            const category = partner.category || 'Uncategorized';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(partner);
            return groups;
        }, {});
    }

    // Debug method to log API response structure
    static debugApiResponse(apiResponse, endpoint = 'Unknown') {
        console.log(`=== API Response Debug for ${endpoint} ===`);
        console.log('Full Response:', apiResponse);
        console.log('Type:', typeof apiResponse);

        if (apiResponse) {
            console.log('Keys:', Object.keys(apiResponse));
            console.log('Has success:', 'success' in apiResponse);
            console.log('Has data:', 'data' in apiResponse);
            console.log('Is Array:', Array.isArray(apiResponse));

            if (apiResponse.success !== undefined) {
                console.log('Success:', apiResponse.success);
            }
            if (apiResponse.data !== undefined) {
                console.log('Data Type:', typeof apiResponse.data);
                console.log('Is Data Array:', Array.isArray(apiResponse.data));
                if (Array.isArray(apiResponse.data)) {
                    console.log('Data Length:', apiResponse.data.length);
                    if (apiResponse.data.length > 0) {
                        console.log('First Item:', apiResponse.data[0]);
                    }
                }
            }
        }
        console.log(`=== End Debug for ${endpoint} ===`);
    }
}

export default PartnershipMapper;