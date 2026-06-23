import { api } from './api';
import type { WhatsAppAccount, Campaign, ApiResponse } from '@/types/api';

export const whatsappService = {
  async accounts() {
    const { data } = await api.get<ApiResponse<WhatsAppAccount[]>>('/whatsapp/accounts');
    return data.data;
  },
  async connect(payload: { phoneNumber: string; displayName: string }) {
    const { data } = await api.post<ApiResponse<WhatsAppAccount>>('/whatsapp/accounts', payload);
    return data.data;
  },
  async disconnect(id: string) {
    await api.post(`/whatsapp/accounts/${id}/disconnect`);
  },
  async campaigns() {
    const { data } = await api.get<ApiResponse<Campaign[]>>('/whatsapp/campaigns');
    return data.data;
  },
  async createCampaign(payload: { name: string; audience: string[]; template: string; scheduledAt?: string }) {
    const { data } = await api.post<ApiResponse<Campaign>>('/whatsapp/campaigns', payload);
    return data.data;
  },
  async sendCampaign(id: string) {
    await api.post(`/whatsapp/campaigns/${id}/send`);
  },
};