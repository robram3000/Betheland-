import moment from 'moment';

// Your image processing algorithm
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

export const agentMapper = {
    toCreateRequest: (formData) => {
        console.log('DEBUG - Mapping to create request:', formData);

        const requestData = {
            firstName: formData.firstName,
            middleName: formData.middleName || '',
            lastName: formData.lastName,
            suffix: formData.suffix || '',
            cellPhoneNo: formData.cellPhoneNo,
            licenseNumber: formData.licenseNumber,
            bio: formData.bio || '',
            licenseExpiry: formData.licenseExpiry || null,
            experience: formData.experience || '',
            specialization: formData.specialization || '[]',
            officeAddress: formData.officeAddress || '',
            officePhone: formData.officePhone || '',
            website: formData.website || '',
            languages: formData.languages || '',
            education: formData.education || '',
            awards: formData.awards || '',
            yearsOfExperience: formData.yearsOfExperience || 0,
            brokerageName: formData.brokerageName || '',
            email: formData.email,
            username: formData.username,
            password: formData.password,
            photourl: formData.photourl || formData.profilePictureUrl || '',
            profilePictureUrl: formData.profilePictureUrl || formData.photourl || ''
        };

        console.log('DEBUG - Mapped create request:', requestData);
        return requestData;
    },
    toUpdateRequest: (formData) => {
        console.log('DEBUG - Mapping to update request:', formData);

        const updateData = {
            firstName: formData.firstName,
            middleName: formData.middleName || '',
            lastName: formData.lastName,
            suffix: formData.suffix || '',
            cellPhoneNo: formData.cellPhoneNo,
            licenseNumber: formData.licenseNumber,
            bio: formData.bio || '',
            licenseExpiry: formData.licenseExpiry
                ? (typeof formData.licenseExpiry === 'string'
                    ? formData.licenseExpiry
                    : formData.licenseExpiry.format('YYYY-MM-DD'))
                : null,
            experience: formData.experience || '',
            specialization: Array.isArray(formData.specialization)
                ? JSON.stringify(formData.specialization)
                : (formData.specialization || '[]'),
            officeAddress: formData.officeAddress || '',
            officePhone: formData.officePhone || '',
            website: formData.website || '',
            languages: Array.isArray(formData.languages)
                ? JSON.stringify(formData.languages)
                : (formData.languages || '[]'),
            education: formData.education || '',
            awards: formData.awards || '',
            yearsOfExperience: formData.yearsOfExperience || 0,
            brokerageName: formData.brokerageName || '',
            isVerified: formData.isVerified || false,
            profilePictureUrl: formData.profilePictureUrl || formData.photourl || ''
        };

        if (formData.password) {
            updateData.password = formData.password;
        }

        return updateData;
    },
    toFrontend: (backendData) => {
        // Process image URL using your algorithm
        let profilePictureUrl = processImageUrl(backendData.profilePictureUrl || backendData.photourl || '');

        // Parse specialization and languages
        let specialization = [];
        if (backendData.specialization) {
            if (typeof backendData.specialization === 'string') {
                try {
                    specialization = JSON.parse(backendData.specialization);
                } catch (e) {
                    specialization = backendData.specialization.split(',').map(s => s.trim());
                }
            } else {
                specialization = backendData.specialization;
            }
        }

        let languages = [];
        if (backendData.languages) {
            if (typeof backendData.languages === 'string') {
                try {
                    languages = JSON.parse(backendData.languages);
                } catch (e) {
                    languages = backendData.languages.split(',').map(l => l.trim());
                }
            } else {
                languages = backendData.languages;
            }
        }

        return {
            id: backendData.id,
            baseMemberId: backendData.baseMemberId,
            email: backendData.email,
            username: backendData.username,
            firstName: backendData.firstName,
            middleName: backendData.middleName,
            lastName: backendData.lastName,
            suffix: backendData.suffix,
            cellPhoneNo: backendData.cellPhoneNo,
            licenseNumber: backendData.licenseNumber,
            bio: backendData.bio,
            licenseExpiry: backendData.licenseExpiry ? moment(backendData.licenseExpiry) : null,
            experience: backendData.experience,
            specialization: specialization,
            officeAddress: backendData.officeAddress,
            officePhone: backendData.officePhone,
            website: backendData.website,
            languages: languages,
            education: backendData.education,
            awards: backendData.awards,
            yearsOfExperience: backendData.yearsOfExperience,
            brokerageName: backendData.brokerageName,
            isVerified: backendData.isVerified || false,
            verificationDate: backendData.verificationDate,
            status: backendData.status,
            createdAt: backendData.createdAt,
            dateRegistered: backendData.dateRegistered,
            profilePictureUrl: profilePictureUrl,
           
        };
    },

    toFrontendList: (backendList) => {
        return backendList.map(agent => agentMapper.toFrontend(agent));
    },
};

export default agentMapper;