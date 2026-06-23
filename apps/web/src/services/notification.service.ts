import { api } from './api';
import type { Notification, ApiResponse } from '@/types/api';

export const notificationService = {
  async list() {
    const { data } = await api.get<ApiResponse<Notification[]>>('/notifications');
    return data.data;
  },
  async markRead(id: string) {
    await api.post(`/notifications/${id}/read`);
  },
  async markAllRead() {
    await api.post('/notifications/read-all');
  },
  async updatePreferences(prefs: Record<string, boolean>) {
    await api.put('/notifications/preferences', prefs);
  },
};