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

    // Create new partner
    static async createPartner(partnerData) {
        try {
            console.log('Creating partner:', partnerData);
            const response = await api.post('/PartnershipContent/partners', partnerData);
            console.log('Create Partner Response:', response);
            console.log('Create Partner Data:', response.data);
            return response.data;
        } catch (error) {
            console.error('Create Partner API Error:', error);
            console.error('Error Response:', error.response);
            throw new Error(`Failed to create partner: ${error.message}`);
        }
    }

    // Update partner
    static async updatePartner(id, partnerData) {
        try {
            console.log('Updating partner:', id, partnerData);
            const response = await api.put(`/PartnershipContent/partners/${id}`, partnerData);
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

    // Toggle partner status (activate/deactivate)
    static async togglePartnerStatus(id, isActive) {
        try {
            console.log('Toggling partner status:', id, isActive);
            const response = await api.patch(`/PartnershipContent/partners/${id}/status`, { isActive });
            console.log('Toggle Partner Status Response:', response);
            console.log('Toggle Partner Status Data:', response.data);
            return response.data;
        } catch (error) {
            console.error('Toggle Partner Status API Error:', error);
            console.error('Error Response:', error.response);
            throw new Error(`Failed to update partner status: ${error.message}`);
        }
    }
}

export default PartnershipServices;