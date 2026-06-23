export type ID = string;

export interface User {
  id: ID;
  email: string;
  name: string;
  avatarUrl?: string;
  role: 'owner' | 'admin' | 'agent' | 'viewer';
  organizationId: ID;
  createdAt: string;
}

export interface Organization {
  id: ID;
  name: string;
  slug: string;
  logoUrl?: string;
  plan: 'starter' | 'pro' | 'enterprise';
  createdAt: string;
}

export interface Conversation {
  id: ID;
  customerId: ID;
  customerName: string;
  customerEmail?: string;
  customerAvatar?: string;
  channel: 'web' | 'email' | 'whatsapp' | 'sms' | 'social';
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedAgentId?: ID;
  subject: string;
  preview: string;
  unread: number;
  lastMessageAt: string;
  tags?: string[];
}

export interface Message {
  id: ID;
  conversationId: ID;
  senderId: ID;
  senderType: 'customer' | 'agent' | 'bot';
  senderName: string;
  content: string;
  attachments?: Attachment[];
  createdAt: string;
}

export interface Attachment {
  id: ID;
  name: string;
  url: string;
  mimeType: string;
  size: number;
}

export interface Ticket {
  id: ID;
  number: number;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'waiting' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigneeId?: ID;
  assigneeName?: string;
  customerId: ID;
  customerName: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TicketComment {
  id: ID;
  ticketId: ID;
  authorId: ID;
  authorName: string;
  content: string;
  internal: boolean;
  createdAt: string;
}

export interface KnowledgeSource {
  id: ID;
  name: string;
  type: 'pdf' | 'url' | 'faq' | 'text';
  status: 'pending' | 'processing' | 'ready' | 'failed';
  size?: number;
  url?: string;
  chunks: number;
  createdAt: string;
}

export interface Faq {
  id: ID;
  question: string;
  answer: string;
  category?: string;
  createdAt: string;
}

export interface Chatbot {
  id: ID;
  name: string;
  systemPrompt: string;
  welcomeMessage: string;
  fallbackMessage: string;
  handoffEnabled: boolean;
  temperature: number;
  model: string;
  active: boolean;
}

export interface Agent {
  id: ID;
  name: string;
  email: string;
  avatarUrl?: string;
  status: 'online' | 'away' | 'offline';
  activeConversations: number;
  resolvedToday: number;
  avgResponseTime: number;
  csat: number;
}

export interface WhatsAppAccount {
  id: ID;
  phoneNumber: string;
  displayName: string;
  status: 'connected' | 'disconnected' | 'pending';
  messagesLast24h: number;
}

export interface Campaign {
  id: ID;
  name: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  audience: number;
  sent: number;
  delivered: number;
  read: number;
  replied: number;
  scheduledAt?: string;
}

export interface Notification {
  id: ID;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export interface Invoice {
  id: ID;
  number: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  date: string;
  pdfUrl?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  error?: { message: string; code?: string };
  meta?: { total?: number; page?: number; limit?: number };
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}