import React from 'react';
import PropertyForm from './PropertyForm';

const PropertyInsert = ({ onSubmit, onCancel, loading, currentUser }) => {
    return (
        <PropertyForm
            onSubmit={onSubmit}
            onCancel={onCancel}
            loading={loading}
            isEdit={false}
            initialValues={{
                agentId: currentUser?.userId
            }}
        />
    );
};

export default PropertyInsert;