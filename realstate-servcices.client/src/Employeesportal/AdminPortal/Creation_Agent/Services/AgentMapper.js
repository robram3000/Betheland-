import moment from 'moment';

export const agentMapper = {
    toCreateRequest: (formData) => {
        console.log('DEBUG - Mapping to create request:', formData);

        // Simple license expiry handling - just pass through whatever value we have
        const requestData = {
            firstName: formData.firstName,
            middleName: formData.middleName || '',
            lastName: formData.lastName,
            suffix: formData.suffix || '',
            cellPhoneNo: formData.cellPhoneNo,
            licenseNumber: formData.licenseNumber,
            bio: formData.bio || '',
            licenseExpiry: formData.licenseExpiry || null, // Just pass through, let backend handle format
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
            isVerified: formData.isVerified || false,
        };

        if (formData.password) {
            updateData.password = formData.password;
        }

        console.log('DEBUG - Mapped update request:', updateData);
        return updateData;
    },
    toFrontend: (backendData) => {
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
            specialization: backendData.specialization ?
                (typeof backendData.specialization === 'string'
                    ? JSON.parse(backendData.specialization)
                    : backendData.specialization)
                : [],
            officeAddress: backendData.officeAddress,
            officePhone: backendData.officePhone,
            website: backendData.website,
            languages: backendData.languages,
            education: backendData.education,
            awards: backendData.awards,
            yearsOfExperience: backendData.yearsOfExperience,
            brokerageName: backendData.brokerageName,
            isVerified: backendData.isVerified || false,
            verificationDate: backendData.verificationDate,
            status: backendData.status,
            createdAt: backendData.createdAt,
            dateRegistered: backendData.dateRegistered,
            profilePictureUrl: backendData.profilePictureUrl,
        };
    },

    toFrontendList: (backendList) => {
        return backendList.map(agent => agentMapper.toFrontend(agent));
    },
};

export default agentMapper;