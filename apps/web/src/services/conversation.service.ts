import { api } from './api';
import type { Conversation, Message, ApiResponse, Paginated } from '@/types/api';

export const conversationService = {
  async list(params?: { status?: string; channel?: string; q?: string; page?: number; limit?: number }) {
    const { data } = await api.get<ApiResponse<Paginated<Conversation>>>('/conversations', { params });
    return data.data;
  },
  async get(id: string) {
    const { data } = await api.get<ApiResponse<Conversation>>(`/conversations/${id}`);
    return data.data;
  },
  async messages(id: string) {
    const { data } = await api.get<ApiResponse<Message[]>>(`/conversations/${id}/messages`);
    return data.data;
  },
  async send(conversationId: string, content: string) {
    const { data } = await api.post<ApiResponse<Message>>(`/conversations/${conversationId}/messages`, { content });
    return data.data;
  },
  async updateStatus(id: string, status: Conversation['status']) {
    const { data } = await api.patch<ApiResponse<Conversation>>(`/conversations/${id}`, { status });
    return data.data;
  },
  async assign(id: string, agentId: string) {
    const { data } = await api.patch<ApiResponse<Conversation>>(`/conversations/${id}`, { assignedAgentId: agentId });
    return data.data;
  },
};