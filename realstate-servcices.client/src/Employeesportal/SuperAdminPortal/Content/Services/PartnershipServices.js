import api from '../../../../Authpage/Services/Api';

class PartnershipServices {
    // Get partnership content
    static async getPartnershipContent() {
        try {
            const response = await api.get('/api/PartnershipContent/content');
            return response.data;
        } catch (error) {
            throw new Error(`Failed to fetch partnership content: ${error.message}`);
        }
    }

    // Get all partners
    static async getAllPartners() {
        try {
            const response = await api.get('/api/PartnershipContent/partners');
            return response.data;
        } catch (error) {
            throw new Error(`Failed to fetch partners: ${error.message}`);
        }
    }

    // Get active partners only
    static async getActivePartners() {
        try {
            const response = await api.get('/api/PartnershipContent/partners/active');
            return response.data;
        } catch (error) {
            throw new Error(`Failed to fetch active partners: ${error.message}`);
        }
    }

    // Get partner by ID
    static async getPartnerById(id) {
        try {
            const response = await api.get(`/api/PartnershipContent/partners/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to fetch partner: ${error.message}`);
        }
    }

    // Create new partner
    static async createPartner(partnerData) {
        try {
            const response = await api.post('/api/PartnershipContent/partners', partnerData);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to create partner: ${error.message}`);
        }
    }

    // Update partner
    static async updatePartner(id, partnerData) {
        try {
            const response = await api.put(`/api/PartnershipContent/partners/${id}`, partnerData);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to update partner: ${error.message}`);
        }
    }

    // Delete partner
    static async deletePartner(id) {
        try {
            const response = await api.delete(`/api/PartnershipContent/partners/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to delete partner: ${error.message}`);
        }
    }

    // Toggle partner status (activate/deactivate)
    static async togglePartnerStatus(id, isActive) {
        try {
            const response = await api.patch(`/api/PartnershipContent/partners/${id}/status`, { isActive });
            return response.data;
        } catch (error) {
            throw new Error(`Failed to update partner status: ${error.message}`);
        }
    }
}

export default PartnershipServices;