import { api } from './api';
import type { Ticket, TicketComment, ApiResponse, Paginated } from '@/types/api';

export const ticketService = {
  async list(params?: { status?: string; assigneeId?: string; q?: string; page?: number }) {
    const { data } = await api.get<ApiResponse<Paginated<Ticket>>>('/tickets', { params });
    return data.data;
  },
  async get(id: string) {
    const { data } = await api.get<ApiResponse<Ticket>>(`/tickets/${id}`);
    return data.data;
  },
  async create(payload: Partial<Ticket>) {
    const { data } = await api.post<ApiResponse<Ticket>>('/tickets', payload);
    return data.data;
  },
  async update(id: string, payload: Partial<Ticket>) {
    const { data } = await api.patch<ApiResponse<Ticket>>(`/tickets/${id}`, payload);
    return data.data;
  },
  async remove(id: string) {
    await api.delete(`/tickets/${id}`);
  },
  async comments(id: string) {
    const { data } = await api.get<ApiResponse<TicketComment[]>>(`/tickets/${id}/comments`);
    return data.data;
  },
  async addComment(id: string, content: string, internal = false) {
    const { data } = await api.post<ApiResponse<TicketComment>>(`/tickets/${id}/comments`, { content, internal });
    return data.data;
  },
};