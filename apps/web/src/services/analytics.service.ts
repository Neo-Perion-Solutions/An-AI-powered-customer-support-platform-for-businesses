import { api } from './api';
import type { ApiResponse } from '@/types/api';

export interface AnalyticsOverview {
  conversations: number;
  aiResolutionRate: number;
  csat: number;
  roi: number;
  trends: { conversations: number[]; csat: number[] };
}

export interface AnalyticsPoint {
  date: string;
  value: number;
}

export const analyticsService = {
  async overview(range = '7d') {
    const { data } = await api.get<ApiResponse<AnalyticsOverview>>('/analytics/overview', { params: { range } });
    return data.data;
  },
  async conversationsOverTime(range = '7d') {
    const { data } = await api.get<ApiResponse<AnalyticsPoint[]>>('/analytics/conversations', { params: { range } });
    return data.data;
  },
  async ticketsByStatus() {
    const { data } = await api.get<ApiResponse<{ status: string; count: number }[]>>('/analytics/tickets-by-status');
    return data.data;
  },
  async conversationsByChannel() {
    const { data } = await api.get<ApiResponse<{ channel: string; count: number }[]>>('/analytics/conversations-by-channel');
    return data.data;
  },
  async responseTimeTrend(range = '7d') {
    const { data } = await api.get<ApiResponse<AnalyticsPoint[]>>('/analytics/response-time', { params: { range } });
    return data.data;
  },
  async exportCsv(type: string) {
    const { data } = await api.get(`/analytics/export/${type}`, { responseType: 'blob' });
    return data;
  },
};