import { api } from './api';
import type { Chatbot, ApiResponse } from '@/types/api';

export const chatbotService = {
  async get() {
    const { data } = await api.get<ApiResponse<Chatbot>>('/chatbot');
    return data.data;
  },
  async update(payload: Partial<Chatbot>) {
    const { data } = await api.put<ApiResponse<Chatbot>>('/chatbot', payload);
    return data.data;
  },
  async test(message: string) {
    const { data } = await api.post<ApiResponse<{ reply: string }>>('/chatbot/test', { message });
    return data.data;
  },
};