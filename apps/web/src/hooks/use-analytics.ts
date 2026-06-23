'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics.service';

export function useAnalyticsOverview(range = '7d') {
  return useQuery({
    queryKey: ['analytics-overview', range],
    queryFn: () => analyticsService.overview(range),
  });
}

export function useConversationsOverTime(range = '7d') {
  return useQuery({
    queryKey: ['conversations-over-time', range],
    queryFn: () => analyticsService.conversationsOverTime(range),
  });
}

export function useTicketsByStatus() {
  return useQuery({
    queryKey: ['tickets-by-status'],
    queryFn: () => analyticsService.ticketsByStatus(),
  });
}

export function useConversationsByChannel() {
  return useQuery({
    queryKey: ['conversations-by-channel'],
    queryFn: () => analyticsService.conversationsByChannel(),
  });
}

export function useResponseTimeTrend(range = '7d') {
  return useQuery({
    queryKey: ['response-time', range],
    queryFn: () => analyticsService.responseTimeTrend(range),
  });
}