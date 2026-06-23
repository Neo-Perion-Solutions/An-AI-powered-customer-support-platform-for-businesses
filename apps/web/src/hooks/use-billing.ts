'use client';

import { useQuery } from '@tanstack/react-query';
import { billingService } from '@/services/billing.service';

export function useSubscription() {
  return useQuery({
    queryKey: ['subscription'],
    queryFn: () => billingService.subscription(),
  });
}

export function useInvoices() {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: () => billingService.invoices(),
  });
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: ['payment-methods'],
    queryFn: () => billingService.paymentMethods(),
  });
}