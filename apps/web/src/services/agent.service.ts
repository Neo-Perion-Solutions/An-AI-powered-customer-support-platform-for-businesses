import { api } from './api';
import type { Agent, ApiResponse } from '@/types/api';

export const agentService = {
  async list() {
    const { data } = await api.get<ApiResponse<Agent[]>>('/agents');
    return data.data;
  },
  async get(id: string) {
    const { data } = await api.get<ApiResponse<Agent>>(`/agents/${id}`);
    return data.data;
  },
  async updateStatus(status: Agent['status']) {
    await api.patch('/agents/me/status', { status });
  },
};