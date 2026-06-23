'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatbotService } from '@/services/chatbot.service';
import type { Chatbot } from '@/types/api';

export function useChatbot() {
  return useQuery({
    queryKey: ['chatbot'],
    queryFn: () => chatbotService.get(),
  });
}

export function useUpdateChatbot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Chatbot>) => chatbotService.update(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chatbot'] }),
  });
}