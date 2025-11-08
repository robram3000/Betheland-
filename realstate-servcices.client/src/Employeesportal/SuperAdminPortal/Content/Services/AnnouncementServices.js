// AnnouncementServices.js
import api from '../../../../Authpage/Services/Api';

class AnnouncementServices {
    // Get all announcements (including inactive) for admin management
    static async getAllAnnouncements() {
        try {
            const response = await api.get('/api/Announcements');
            return response.data;
        } catch (error) {
            throw new Error(`Failed to fetch announcements: ${error.message}`);
        }
    }

    // Get active announcements only for running letter display
    static async getActiveAnnouncements() {
        try {
            const response = await api.get('/api/Announcements/active');
            return response.data;
        } catch (error) {
            throw new Error(`Failed to fetch active announcements: ${error.message}`);
        }
    }

    // Get announcement by ID
    static async getAnnouncementById(id) {
        try {
            const response = await api.get(`/api/Announcements/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to fetch announcement: ${error.message}`);
        }
    }

    // Create new announcement
    static async createAnnouncement(announcementData) {
        try {
            const response = await api.post('/api/Announcements', announcementData);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to create announcement: ${error.message}`);
        }
    }

    // Update announcement
    static async updateAnnouncement(id, announcementData) {
        try {
            const response = await api.put(`/api/Announcements/${id}`, announcementData);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to update announcement: ${error.message}`);
        }
    }

    // Delete announcement
    static async deleteAnnouncement(id) {
        try {
            const response = await api.delete(`/api/Announcements/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to delete announcement: ${error.message}`);
        }
    }

    // Toggle announcement status (activate/deactivate)
    static async toggleAnnouncementStatus(id, isActive) {
        try {
            const response = await api.patch(`/api/Announcements/${id}/status`, isActive);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to update announcement status: ${error.message}`);
        }
    }
}

export default AnnouncementServices;