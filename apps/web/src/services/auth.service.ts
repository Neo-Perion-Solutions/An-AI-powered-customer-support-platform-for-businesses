import { api } from './api';
import type { User, Organization, ApiResponse } from '@/types/api';

export const authService = {
  async login(email: string, password: string) {
    const { data } = await api.post<ApiResponse<{ user: User; organization: Organization; accessToken: string; refreshToken: string }>>('/auth/login', { email, password });
    return data.data;
  },
  async register(payload: Record<string, unknown>) {
    const { data } = await api.post<ApiResponse<{ user: User; organization: Organization; accessToken: string; refreshToken: string }>>('/auth/register', payload);
    return data.data;
  },
  async forgotPassword(email: string) {
    await api.post('/auth/forgot-password', { email });
  },
  async resetPassword(token: string, password: string) {
    await api.post('/auth/reset-password', { token, password });
  },
  async me() {
    const { data } = await api.get<ApiResponse<User>>('/auth/me');
    return data.data;
  },
  async logout() {
    await api.post('/auth/logout');
  },
};