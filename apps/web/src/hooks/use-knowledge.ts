'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { knowledgeService } from '@/services/knowledge.service';
import type { Faq } from '@/types/api';

export function useKnowledgeSources(params?: { q?: string; type?: string }) {
  return useQuery({
    queryKey: ['knowledge-sources', params],
    queryFn: () => knowledgeService.listSources(params),
  });
}

export function useUploadSource() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress?: (p: number) => void }) =>
      knowledgeService.uploadFile(file, onProgress),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['knowledge-sources'] }),
  });
}

export function useScrapeUrl() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (url: string) => knowledgeService.scrapeUrl(url),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['knowledge-sources'] }),
  });
}

export function useFaqs() {
  return useQuery({
    queryKey: ['faqs'],
    queryFn: () => knowledgeService.listFaqs(),
  });
}

export function useCreateFaq() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Faq, 'id' | 'createdAt'>) => knowledgeService.createFaq(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['faqs'] }),
  });
}

export function useUpdateFaq() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Faq> }) => knowledgeService.updateFaq(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['faqs'] }),
  });
}

export function useDeleteFaq() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => knowledgeService.deleteFaq(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['faqs'] }),
  });
}