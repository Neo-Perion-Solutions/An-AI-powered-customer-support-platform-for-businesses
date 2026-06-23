'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentService } from '@/services/agent.service';
import type { Agent } from '@/types/api';

export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: () => agentService.list(),
  });
}

export function useUpdateAgentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: Agent['status']) => agentService.updateStatus(status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['agents'] }),
  });
}