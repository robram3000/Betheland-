import moment from 'moment';

// Your image processing algorithm
const processImageUrl = (url) => {
    if (!url || typeof url !== 'string' || url.trim() === '') {
        return '/default-client.jpg';
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
        return `https://localhost:7075/uploads/clients/${url}`;
    }

    // uploads/ path
    if (url.startsWith('uploads/')) {
        return `https://localhost:7075/${url}`;
    }

    return '/default-client.jpg';
};

export const clientMapper = {
    toCreateRequest: (formData) => {
        console.log('DEBUG - Mapping to create request:', formData);

        const requestData = {
            firstName: formData.firstName,
            middleName: formData.middleName || '',
            lastName: formData.lastName,
            suffix: formData.suffix || '',
            cellPhoneNo: formData.cellPhoneNo,
            gender: formData.gender,
            country: formData.country || '',
            city: formData.city || '',
            street: formData.street || '',
            zipCode: formData.zipCode || '',
            email: formData.email,
            username: formData.username,
            password: formData.password,
            profilePictureUrl: formData.profilePictureUrl || ''
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
            gender: formData.gender,
            country: formData.country || '',
            city: formData.city || '',
            street: formData.street || '',
            zipCode: formData.zipCode || '',
            address: formData.address || ''
        };

        if (formData.password) {
            updateData.password = formData.password;
        }

        return updateData;
    },

    toFrontend: (backendData) => {
        // Process image URL using your algorithm
        let profilePictureUrl = processImageUrl(backendData.profilePictureUrl || '');

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
            gender: backendData.gender,
            country: backendData.country,
            city: backendData.city,
            street: backendData.street,
            zipCode: backendData.zipCode,
            address: backendData.address,
            status: backendData.status,
            role: backendData.role,
            createdAt: backendData.createdAt,
            updatedAt: backendData.updatedAt,
            dateRegistered: backendData.dateRegistered,
            profilePictureUrl: profilePictureUrl
        };
    },

    toFrontendList: (backendList) => {
        return backendList.map(client => clientMapper.toFrontend(client));
    },
};

export default clientMapper;