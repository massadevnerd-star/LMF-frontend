import api from '@/app/lib/api';

export interface MenuItem {
    id: number;
    label: string;
    route: string;
    icon?: string;
    order: number;
    roles: { id: number; name: string }[];
}

export interface StorySummary {
    id: number;
    story_subject: string;
    credits_used: number;
    status: string;
    created_at: string;
    user: {
        name: string;
        email: string;
        avatar?: string;
    };
}

export const adminService = {
    // Menu Management
    getMenus: async () => {
        const response = await api.get('/api/admin/menus');
        return response.data;
    },
    createMenu: async (data: any) => {
        const response = await api.post('/api/admin/menus', data);
        return response.data;
    },
    updateMenu: async (id: number, data: any) => {
        const response = await api.put(`/api/admin/menus/${id}`, data);
        return response.data;
    },
    deleteMenu: async (id: number) => {
        await api.delete(`/api/admin/menus/${id}`);
    },

    // Story Management
    getStories: async (params?: any) => {
        const response = await api.get('/api/admin/stories', { params });
        return response.data;
    },
    deleteStory: async (id: number) => {
        await api.delete(`/api/admin/stories/${id}`);
    },

    // User Management
    getUsers: async () => {
        const response = await api.get('/api/admin/users');
        return response.data;
    },

    assignRole: async (userId: number, roleName: string) => {
        await api.post(`/api/admin/users/${userId}/roles`, { role: roleName });
    }
};
