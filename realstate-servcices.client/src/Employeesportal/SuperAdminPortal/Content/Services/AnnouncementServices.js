// AnnouncementServices.js
import api from '../../../../Authpage/Services/Api';

class AnnouncementServices {
    // Get all announcements (including inactive) for admin management
    static async getAllAnnouncements() {
        try {
            console.log('🔍 Fetching announcements from API...');
            const response = await api.get('/Announcements');

            console.log('📊 FULL API Response:', response);
            console.log('📊 Response data:', response.data);
            console.log('📊 Response status:', response.status);
            console.log('📊 Response headers:', response.headers);

            // If response.data is the array, return it directly
            if (Array.isArray(response.data)) {
                console.log('✅ Direct array response received, count:', response.data.length);
                return response.data;
            }

            // If response itself is the array (unlikely but possible)
            if (Array.isArray(response)) {
                console.log('✅ Response is direct array, count:', response.length);
                return response;
            }

            // If no data found
            if (!response.data) {
                console.warn('⚠️ No data in response, returning empty array');
                return [];
            }

            console.warn('❌ Unexpected response structure:', response);
            return [];

        } catch (error) {
            console.error('💥 API Error:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                config: error.config
            });

            // Check if it's a CORS or network error
            if (error.message === 'Network Error') {
                throw new Error('Cannot connect to server. Please check your network connection.');
            }

            throw new Error(`Failed to fetch announcements: ${error.message}`);
        }
    }

    // Get active announcements only for running letter display
    // AnnouncementServices.js - Updated getActiveAnnouncements method
    static async getActiveAnnouncements() {
        try {
            console.log('🔍 Fetching active announcements from API...');
            const response = await api.get('/Announcements/active');

            console.log('📊 FULL API Response for active:', response);
            console.log('📊 Response data:', response.data);
            console.log('📊 Response status:', response.status);

            // Debug the response structure
            if (response.data) {
                console.log('📊 Response.data type:', typeof response.data);
                console.log('📊 Response.data is array:', Array.isArray(response.data));
                console.log('📊 Response.data length:', response.data.length);
                console.log('📊 Response.data contents:', response.data);
            }

            // Handle different response structures
            if (Array.isArray(response.data)) {
                console.log('✅ Using response.data array, count:', response.data.length);
                return response.data;
            }

            // If response itself is array (unlikely but possible)
            if (Array.isArray(response)) {
                console.log('✅ Response is direct array, count:', response.length);
                return response;
            }

            // If response has data property but it's not an array
            if (response.data && typeof response.data === 'object') {
                console.log('⚠️ Response.data is object but not array, converting to array');
                return [response.data];
            }

            console.warn('❌ No announcements found in response');
            return [];

        } catch (error) {
            console.error('💥 API Error in getActiveAnnouncements:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                config: error.config
            });

            if (error.message === 'Network Error') {
                throw new Error('Cannot connect to server. Please check your network connection.');
            }

            throw new Error(`Failed to fetch active announcements: ${error.message}`);
        }
    }
    // Get announcement by ID
    static async getAnnouncementById(id) {
        try {
            const response = await api.get(`/Announcements/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to fetch announcement: ${error.message}`);
        }
    }

    // Create new announcement
    static async createAnnouncement(announcementData) {
        try {
            const response = await api.post('/Announcements', announcementData);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to create announcement: ${error.message}`);
        }
    }

    // Update announcement
    static async updateAnnouncement(id, announcementData) {
        try {
            const response = await api.put(`/Announcements/${id}`, announcementData);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to update announcement: ${error.message}`);
        }
    }

    // Delete announcement
    static async deleteAnnouncement(id) {
        try {
            const response = await api.delete(`/Announcements/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to delete announcement: ${error.message}`);
        }
    }

    // Toggle announcement status (activate/deactivate)
    static async toggleAnnouncementStatus(id, isActive) {
        try {
            const response = await api.patch(`/Announcements/${id}/status`, isActive, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(`Failed to update announcement status: ${error.message}`);
        }
    }
}

export default AnnouncementServices;