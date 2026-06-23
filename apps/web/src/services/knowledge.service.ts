import { api } from './api';
import type { KnowledgeSource, Faq, ApiResponse, Paginated } from '@/types/api';

export const knowledgeService = {
  async listSources(params?: { q?: string; status?: string; type?: string }) {
    const { data } = await api.get<ApiResponse<Paginated<KnowledgeSource>>>('/knowledge/sources', { params });
    return data.data;
  },
  async uploadFile(file: File, onProgress?: (p: number) => void) {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post<ApiResponse<KnowledgeSource>>('/knowledge/sources/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
      },
    });
    return data.data;
  },
  async scrapeUrl(url: string) {
    const { data } = await api.post<ApiResponse<KnowledgeSource>>('/knowledge/sources/scrape', { url });
    return data.data;
  },
  async deleteSource(id: string) {
    await api.delete(`/knowledge/sources/${id}`);
  },
  async listFaqs() {
    const { data } = await api.get<ApiResponse<Faq[]>>('/knowledge/faqs');
    return data.data;
  },
  async createFaq(payload: { question: string; answer: string; category?: string }) {
    const { data } = await api.post<ApiResponse<Faq>>('/knowledge/faqs', payload);
    return data.data;
  },
  async updateFaq(id: string, payload: Partial<Faq>) {
    const { data } = await api.patch<ApiResponse<Faq>>(`/knowledge/faqs/${id}`, payload);
    return data.data;
  },
  async deleteFaq(id: string) {
    await api.delete(`/knowledge/faqs/${id}`);
  },
};