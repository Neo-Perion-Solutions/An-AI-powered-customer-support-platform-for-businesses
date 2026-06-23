'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { whatsappService } from '@/services/whatsapp.service';

export function useWhatsappAccounts() {
  return useQuery({
    queryKey: ['whatsapp-accounts'],
    queryFn: () => whatsappService.accounts(),
  });
}

export function useConnectWhatsapp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { phoneNumber: string; displayName: string }) => whatsappService.connect(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['whatsapp-accounts'] }),
  });
}

export function useCampaigns() {
  return useQuery({
    queryKey: ['campaigns'],
    queryFn: () => whatsappService.campaigns(),
  });
}

export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; audience: string[]; template: string; scheduledAt?: string }) =>
      whatsappService.createCampaign(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  });
}