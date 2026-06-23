import { api } from './api';
import type { Invoice, ApiResponse } from '@/types/api';

export interface Plan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
}

export interface Subscription {
  plan: Plan;
  status: 'active' | 'past_due' | 'canceled';
  currentPeriodEnd: string;
  usage: { conversations: number; aiReplies: number; storageGb: number };
  limits: { conversations: number; aiReplies: number; storageGb: number };
}

export const billingService = {
  async subscription() {
    const { data } = await api.get<ApiResponse<Subscription>>('/billing/subscription');
    return data.data;
  },
  async invoices() {
    const { data } = await api.get<ApiResponse<Invoice[]>>('/billing/invoices');
    return data.data;
  },
  async checkout(planId: string) {
    const { data } = await api.post<ApiResponse<{ url: string }>>('/billing/checkout', { planId });
    return data.data;
  },
  async cancel() {
    await api.post('/billing/cancel');
  },
  async paymentMethods() {
    const { data } = await api.get<ApiResponse<{ id: string; brand: string; last4: string; exp: string }[]>>('/billing/payment-methods');
    return data.data;
  },
};