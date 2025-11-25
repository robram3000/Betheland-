// PartnershipMapper.js
class PartnershipMapper {
    // Map API response to frontend partner object
    static mapToPartner(apiResponse) {
        // Handle different response structures
        let partnerData = {};

        if (apiResponse && apiResponse.success && apiResponse.data) {
            partnerData = apiResponse.data;
        } else if (apiResponse && apiResponse.data) {
            partnerData = apiResponse.data;
        } else if (apiResponse && typeof apiResponse === 'object') {
            partnerData = apiResponse;
        }

        if (!partnerData || Object.keys(partnerData).length === 0) {
            return null;
        }

        // Process logo URL for frontend using enhanced logic
        const processedLogoUrl = this.processImageUrl(partnerData.logoUrl);

        return {
            id: partnerData.id || 0,
            name: partnerData.name || '',
            logoUrl: processedLogoUrl,
            category: partnerData.category || '',
            displayOrder: partnerData.displayOrder || 0,
            isActive: partnerData.isActive !== undefined ? partnerData.isActive : false,
            createdAt: partnerData.createdAt ? new Date(partnerData.createdAt) : null,
            updatedAt: partnerData.updatedAt ? new Date(partnerData.updatedAt) : null
        };
    }

    // Map multiple partners from API response
    static mapToPartnersList(apiResponse) {
        let partnersArray = [];

        if (apiResponse && apiResponse.success && Array.isArray(apiResponse.data)) {
            partnersArray = apiResponse.data;
        } else if (Array.isArray(apiResponse)) {
            partnersArray = apiResponse;
        } else if (apiResponse && Array.isArray(apiResponse.data)) {
            partnersArray = apiResponse.data;
        } else if (apiResponse && apiResponse.success && apiResponse.data && typeof apiResponse.data === 'object') {
            partnersArray = apiResponse.data.partners || [];
        } else {
            return [];
        }

        if (!Array.isArray(partnersArray)) {
            return [];
        }

        return partnersArray.map(partner => {
            // Process logo URL for frontend using enhanced logic
            const processedLogoUrl = this.processImageUrl(partner.logoUrl);

            return {
                id: partner.id || 0,
                name: partner.name || '',
                logoUrl: processedLogoUrl,
                category: partner.category || '',
                displayOrder: partner.displayOrder || 0,
                isActive: partner.isActive !== undefined ? partner.isActive : false,
                createdAt: partner.createdAt ? new Date(partner.createdAt) : null,
                updatedAt: partner.updatedAt ? new Date(partner.updatedAt) : null
            };
        });
    }

    // Map partnership content from API response
    static mapToPartnershipContent(apiResponse) {
        let contentData = apiResponse;

        if (apiResponse && apiResponse.success && apiResponse.data) {
            contentData = apiResponse.data;
        }

        // Process partner logos in content using enhanced logic
        const processedPartners = (contentData.partners || []).map(partner => ({
            name: partner.name || '',
            logo: this.processImageUrl(partner.logo || partner.logoUrl || ''),
            category: partner.category || ''
        }));

        return {
            title: contentData.title || 'Our Trusted Partners',
            description: contentData.description || 'Collaborating with the Philippines\' leading real estate developers and brokers to bring you the best properties.',
            partners: processedPartners
        };
    }

    // Map form values to partner object
    static mapFormToPartner(formValues, existingPartner = null) {
        return {
            id: existingPartner?.id || 0,
            name: formValues.name || '',
            category: formValues.category || '',
            displayOrder: formValues.displayOrder || 0,
            isActive: formValues.isActive !== undefined ? formValues.isActive : true,
            logoUrl: existingPartner?.logoUrl || '',
            // logoFile will be set separately
        };
    }

    // Map frontend partner object to create DTO
    static mapToCreatePartnerDto(partner) {
        const formData = new FormData();

        formData.append('Name', partner.name || '');
        formData.append('Category', partner.category || '');
        formData.append('DisplayOrder', partner.displayOrder?.toString() || '0');

        // Only append logoFile if it exists
        if (partner.logoFile) {
            formData.append('LogoFile', partner.logoFile);
        }

        return formData;
    }

    // Map frontend partner object to update DTO
    static mapToUpdatePartnerDto(partner) {
        const formData = new FormData();

        if (partner.name !== undefined) formData.append('Name', partner.name);
        if (partner.category !== undefined) formData.append('Category', partner.category);
        if (partner.displayOrder !== undefined) formData.append('DisplayOrder', partner.displayOrder.toString());
        if (partner.isActive !== undefined) formData.append('IsActive', partner.isActive.toString());

        // Only append logoFile if it exists
        if (partner.logoFile) {
            formData.append('LogoFile', partner.logoFile);
        }

        return formData;
    }

    // Map partner to form data
    static mapPartnerToForm(partner) {
        return {
            name: partner.name || '',
            category: partner.category || '',
            displayOrder: partner.displayOrder || 0,
            isActive: partner.isActive !== undefined ? partner.isActive : true
        };
    }

    // Validate partner data before submission
    static validatePartner(partner, isFileUpload = false) {
        const errors = {};

        if (!partner.name || partner.name.trim() === '') {
            errors.name = 'Partner name is required';
        } else if (partner.name.length > 100) {
            errors.name = 'Partner name must be less than 100 characters';
        }

        if (isFileUpload) {
            if (!partner.logoFile && !partner.logoUrl) {
                errors.logoFile = 'Logo file is required';
            } else if (partner.logoFile) {
                const fileError = this.getFileValidationError(partner.logoFile);
                if (fileError) {
                    errors.logoFile = fileError;
                }
            }
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

    // Helper method to validate file
    static getFileValidationError(file) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!allowedTypes.includes(file.type)) {
            return 'Invalid file type. Allowed types: JPEG, JPG, PNG, GIF, WEBP, BMP';
        }

        if (file.size > maxSize) {
            return 'File size too large. Maximum size is 10MB';
        }

        return null;
    }

    // Sort partners by display order and name
    static sortPartners(partners) {
        return [...partners].sort((a, b) => {
            if (a.displayOrder !== b.displayOrder) {
                return a.displayOrder - b.displayOrder;
            }
            return (a.name || '').localeCompare(b.name || '');
        });
    }

    // Filter active partners
    static filterActivePartners(partners) {
        return partners.filter(partner => partner.isActive);
    }

    // FIXED: Enhanced image URL processing
    static processImageUrl(url) {
        if (!url || typeof url !== 'string' || url.trim() === '') {
            return '/default-partner-logo.png';
        }

        // Already full URL (http, https, blob, data, etc.)
        if (url.startsWith('http') || url.startsWith('//') || url.startsWith('blob:') || url.startsWith('data:')) {
            return url;
        }

        // Server path - prepend appropriate base URL
        if (url.startsWith('/uploads/')) {
            const baseUrl = window.location.hostname === 'localhost'
                ? 'https://localhost:7080'
                : 'https://betheland.runasp.net'; // Use HTTPS for production
            return `${baseUrl}${url}`;
        }

        // Relative path without leading slash
        if (url.includes('.') && !url.startsWith('/')) {
            const baseUrl = window.location.hostname === 'localhost'
                ? 'https://localhost:7080'
                : 'https://betheland.runasp.net'; // Use HTTPS for production
            return `${baseUrl}/uploads/partners/${url}`;
        }

        // uploads/ path
        if (url.startsWith('uploads/')) {
            const baseUrl = window.location.hostname === 'localhost'
                ? 'https://localhost:7080'
                : 'https://betheland.runasp.net';
            return `${baseUrl}/${url}`;
        }

        return '/default-partner-logo.png';
    }

    // Get base URL for images (useful for other components)
    static getBaseUrl() {
        return window.location.hostname === 'localhost'
            ? 'https://localhost:7080'
            : 'https://betheland.runasp.net';
    }

    // Check if URL needs processing
    static needsUrlProcessing(url) {
        if (!url || typeof url !== 'string') return false;

        const baseUrl = this.getBaseUrl();
        return !(
            url.startsWith('http') ||
            url.startsWith('//') ||
            url.startsWith('blob:') ||
            url.startsWith('data:') ||
            url.startsWith(baseUrl)
        );
    }

    // Extract filename from URL
    static getFilenameFromUrl(url) {
        if (!url) return '';

        if (url.includes('/')) {
            return url.split('/').pop();
        }
        return url;
    }

    // Check if image exists (for error handling)
    static async checkImageExists(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    }
}

export default PartnershipMapper;