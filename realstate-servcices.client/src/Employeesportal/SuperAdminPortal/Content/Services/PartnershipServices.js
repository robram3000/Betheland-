// PartnershipServices.js
import api from '../../../../Authpage/Services/Api';

class PartnershipServices {
    // Get partnership content
    static async getPartnershipContent() {
        try {
            console.log('Fetching partnership content from:', '/PartnershipContent/content');
            const response = await api.get('/PartnershipContent/content');
            console.log('Partnership Content API Response:', response);
            console.log('Partnership Content Response Data:', response.data);
            return response.data;
        } catch (error) {
            console.error('Partnership Content API Error:', error);
            console.error('Error Response:', error.response);
            throw new Error(`Failed to fetch partnership content: ${error.message}`);
        }
    }

    // Get all partners - ENHANCED WITH DEBUGGING
    static async getAllPartners() {
        try {
            console.log('Fetching all partners from:', '/PartnershipContent/partners');
            const response = await api.get('/PartnershipContent/partners');

            // COMPREHENSIVE DEBUGGING
            console.log('=== API RESPONSE DEBUGGING ===');
            console.log('Full Response:', response);
            console.log('Response Status:', response.status);
            console.log('Response Status Text:', response.statusText);
            console.log('Response Headers:', response.headers);
            console.log('Response Data:', response.data);
            console.log('Response Data Type:', typeof response.data);

            if (response.data) {
                console.log('Response Data Keys:', Object.keys(response.data));
                console.log('Has success property:', 'success' in response.data);
                console.log('Has data property:', 'data' in response.data);
                console.log('Is Array:', Array.isArray(response.data));

                if (response.data.success !== undefined) {
                    console.log('Success value:', response.data.success);
                }
                if (response.data.data !== undefined) {
                    console.log('Data type:', typeof response.data.data);
                    console.log('Is data array:', Array.isArray(response.data.data));
                    console.log('Data length:', response.data.data?.length);
                }
            }
            console.log('=== END DEBUGGING ===');

            return response.data;
        } catch (error) {
            console.error('=== API ERROR DETAILS ===');
            console.error('All Partners API Error:', error);
            console.error('Error Message:', error.message);
            console.error('Error Stack:', error.stack);
            console.error('Error Response:', error.response);

            if (error.response) {
                console.error('Error Status:', error.response.status);
                console.error('Error Status Text:', error.response.statusText);
                console.error('Error Headers:', error.response.headers);
                console.error('Error Data:', error.response.data);
            }
            console.error('=== END ERROR DETAILS ===');

            throw new Error(`Failed to fetch partners: ${error.message}`);
        }
    }

    // Get active partners only
    static async getActivePartners() {
        try {
            console.log('Fetching active partners from:', '/PartnershipContent/partners/active');
            const response = await api.get('/PartnershipContent/partners/active');
            console.log('Active Partners API Response:', response);
            console.log('Active Partners Response Data:', response.data);
            return response.data;
        } catch (error) {
            console.error('Active Partners API Error:', error);
            console.error('Error Response:', error.response);
            throw new Error(`Failed to fetch active partners: ${error.message}`);
        }
    }

    // Get partner by ID
    static async getPartnerById(id) {
        try {
            console.log('Fetching partner by ID:', id);
            const response = await api.get(`/PartnershipContent/partners/${id}`);
            console.log('Partner by ID Response:', response);
            console.log('Partner by ID Data:', response.data);
            return response.data;
        } catch (error) {
            console.error('Partner by ID API Error:', error);
            console.error('Error Response:', error.response);
            throw new Error(`Failed to fetch partner: ${error.message}`);
        }
    }

    // Create new partner - UPDATED FOR FORMDATA
    static async createPartner(partnerData) {
        try {
            console.log('Creating partner with FormData:', partnerData);

            // Set proper headers for FormData
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            };

            const response = await api.post('/PartnershipContent/partners', partnerData, config);
            console.log('Create Partner Response:', response);
            console.log('Create Partner Data:', response.data);
            return response.data;
        } catch (error) {
            console.error('Create Partner API Error:', error);
            console.error('Error Response:', error.response);
            throw new Error(`Failed to create partner: ${error.message}`);
        }
    }

    // Update partner - UPDATED FOR FORMDATA
    static async updatePartner(id, partnerData) {
        try {
            console.log('Updating partner:', id, partnerData);

            // Set proper headers for FormData
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            };

            const response = await api.put(`/PartnershipContent/partners/${id}`, partnerData, config);
            console.log('Update Partner Response:', response);
            console.log('Update Partner Data:', response.data);
            return response.data;
        } catch (error) {
            console.error('Update Partner API Error:', error);
            console.error('Error Response:', error.response);
            throw new Error(`Failed to update partner: ${error.message}`);
        }
    }

    // Delete partner
    static async deletePartner(id) {
        try {
            console.log('Deleting partner:', id);
            const response = await api.delete(`/PartnershipContent/partners/${id}`);
            console.log('Delete Partner Response:', response);
            console.log('Delete Partner Data:', response.data);
            return response.data;
        } catch (error) {
            console.error('Delete Partner API Error:', error);
            console.error('Error Response:', error.response);
            throw new Error(`Failed to delete partner: ${error.message}`);
        }
    }

    // Toggle partner status (activate/deactivate) - FIXED VERSION
    static async togglePartnerStatus(id, isActive) {
        try {
            console.log('=== TOGGLE PARTNER STATUS DEBUG ===');
            console.log('Partner ID:', id);
            console.log('New Status:', isActive);
            console.log('Endpoint:', `/PartnershipContent/partners/${id}/status`);

            // Use the correct payload structure that matches the backend DTO
            const payload = { IsActive: isActive };
            console.log('Request Payload:', payload);

            const response = await api.patch(`/PartnershipContent/partners/${id}/status`, payload);

            console.log('Toggle Partner Status Response:', response);
            console.log('Toggle Partner Status Data:', response.data);
            console.log('=== END DEBUG ===');

            return response.data;
        } catch (error) {
            console.error('=== TOGGLE STATUS ERROR DETAILS ===');
            console.error('Toggle Partner Status API Error:', error);
            console.error('Error Message:', error.message);

            if (error.response) {
                console.error('Error Response Status:', error.response.status);
                console.error('Error Response Data:', error.response.data);
                console.error('Error Response Headers:', error.response.headers);

                // Try alternative approach if 400 error
                if (error.response.status === 400) {
                    console.log('Attempting alternative payload structure...');
                    try {
                        // Try with different property names
                        const alternativePayload = {
                            isActive: isActive,
                            status: isActive,
                            active: isActive
                        };

                        console.log('Trying alternative payload:', alternativePayload);
                        const retryResponse = await api.patch(`/PartnershipContent/partners/${id}/status`, alternativePayload);
                        console.log('Alternative payload success:', retryResponse.data);
                        return retryResponse.data;
                    } catch (retryError) {
                        console.error('Alternative payload also failed:', retryError);
                    }
                }
            }
            console.error('=== END ERROR DETAILS ===');

            throw new Error(`Failed to update partner status: ${error.message}`);
        }
    }

    // Alternative method for updating status using PUT
    static async updatePartnerStatus(id, statusData) {
        try {
            console.log('Updating partner status via PUT:', id, statusData);
            const response = await api.put(`/PartnershipContent/partners/${id}/status`, statusData);
            console.log('Update Partner Status Response:', response);
            return response.data;
        } catch (error) {
            console.error('Update Partner Status API Error:', error);
            throw new Error(`Failed to update partner status: ${error.message}`);
        }
    }
}

export default PartnershipServices;