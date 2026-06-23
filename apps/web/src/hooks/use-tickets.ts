'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketService } from '@/services/ticket.service';
import type { Ticket } from '@/types/api';

export function useTickets(params?: { status?: string }) {
  return useQuery({
    queryKey: ['tickets', params],
    queryFn: () => ticketService.list(params),
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: () => ticketService.get(id),
    enabled: !!id,
  });
}

export function useTicketComments(id: string) {
  return useQuery({
    queryKey: ['ticket-comments', id],
    queryFn: () => ticketService.comments(id),
    enabled: !!id,
  });
}

export function useUpdateTicket(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Ticket>) => ticketService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ticket', id] });
      qc.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

export function useAddComment(ticketId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ content, internal }: { content: string; internal?: boolean }) =>
      ticketService.addComment(ticketId, content, internal),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ticket-comments', ticketId] }),
  });
}