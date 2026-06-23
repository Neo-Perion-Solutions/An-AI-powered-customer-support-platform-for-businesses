'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationService } from '@/services/conversation.service';
import type { Conversation } from '@/types/api';

export function useConversations(params?: { status?: string; channel?: string; q?: string }) {
  return useQuery({
    queryKey: ['conversations', params],
    queryFn: () => conversationService.list(params),
  });
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: ['conversation', id],
    queryFn: () => conversationService.get(id),
    enabled: !!id,
  });
}

export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => conversationService.messages(conversationId),
    enabled: !!conversationId,
    refetchInterval: 5000,
  });
}

export function useSendMessage(conversationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => conversationService.send(conversationId, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['messages', conversationId] }),
  });
}

export function useUpdateConversation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Conversation>) => conversationService.updateStatus(id, payload.status as Conversation['status']).then(() => payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['conversations'] }),
  });
}