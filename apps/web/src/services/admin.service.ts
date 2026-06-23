import { api } from './api';
import type { User, Organization, ApiResponse, Paginated } from '@/types/api';

export const adminService = {
  async users(params?: { q?: string; role?: string; page?: number }) {
    const { data } = await api.get<ApiResponse<Paginated<User>>>('/admin/users', { params });
    return data.data;
  },
  async updateUser(id: string, payload: Partial<User>) {
    const { data } = await api.patch<ApiResponse<User>>(`/admin/users/${id}`, payload);
    return data.data;
  },
  async deleteUser(id: string) {
    await api.delete(`/admin/users/${id}`);
  },
  async organizations(params?: { q?: string; plan?: string; page?: number }) {
    const { data } = await api.get<ApiResponse<Paginated<Organization>>>('/admin/organizations', { params });
    return data.data;
  },
  async auditLog(params?: { page?: number; actorId?: string }) {
    const { data } = await api.get<ApiResponse<Paginated<{ id: string; actor: string; action: string; target: string; createdAt: string }>>>(
      '/admin/audit',
      { params }
    );
    return data.data;
  },
  async roles() {
    const { data } = await api.get<ApiResponse<{ id: string; name: string; permissions: string[] }[]>>('/admin/roles');
    return data.data;
  },
};