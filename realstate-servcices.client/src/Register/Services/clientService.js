import api from './api';

export const clientService = {
    register: async (clientData) => {
        const response = await api.post('/Client/register', clientData);
        return response;
    },

    getClient: async (id) => {
        const response = await api.get(`/Client/${id}`);
        return response;
    },

    updateClient: async (id, updateData) => {
        const response = await api.put(`/Client/${id}`, updateData);
        return response;
    },

    getAllClients: async () => {
        const response = await api.get('/Client');
        return response;
    },

    updateClientStatus: async (id, status) => {
        const response = await api.patch(`/Client/${id}/status`, { status });
        return response;
    },

    deleteClient: async (id) => {
        const response = await api.delete(`/Client/${id}`);
        return response;
    }
};