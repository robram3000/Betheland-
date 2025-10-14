import React from 'react';
import PropertyForm from './PropertyForm';

const PropertyUpdate = ({
    property,
    onSubmit,
    onCancel,
    loading,
    currentUser
}) => {
    return (
        <PropertyForm
            initialValues={property}
            onSubmit={onSubmit}
            onCancel={onCancel}
            loading={loading}
            isEdit={true}
        />
    );
};

export default PropertyUpdate;