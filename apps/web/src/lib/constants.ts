export * from '@neo/shared';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';

export const CHANNELS = [
  { value: 'web', label: 'Web chat' },
  { value: 'email', label: 'Email' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'sms', label: 'SMS' },
  { value: 'social', label: 'Social' },
] as const;

export const TICKET_STATUSES = ['open', 'in_progress', 'waiting', 'resolved'] as const;
export const TICKET_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;

export const ROLES = ['owner', 'admin', 'agent', 'viewer'] as const;