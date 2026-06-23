export const PLAN_TIERS = ['FREE', 'STARTER', 'PRO', 'ENTERPRISE'] as const;
export type PlanTier = (typeof PLAN_TIERS)[number];

export const SUBSCRIPTION_STATUSES = [
  'TRIALING',
  'ACTIVE',
  'PAST_DUE',
  'CANCELED',
  'UNPAID',
] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export const INVOICE_STATUSES = ['DRAFT', 'OPEN', 'PAID', 'UNCOLLECTIBLE', 'VOID'] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const CONVERSATION_STATUSES = [
  'OPEN',
  'AI_HANDLING',
  'ESCALATED',
  'WAITING_AGENT',
  'RESOLVED',
  'CLOSED',
] as const;
export type ConversationStatus = (typeof CONVERSATION_STATUSES)[number];

export const MESSAGE_ROLES = ['CUSTOMER', 'AGENT', 'AI', 'SYSTEM'] as const;
export type MessageRole = (typeof MESSAGE_ROLES)[number];

export const MESSAGE_CHANNELS = ['WEB', 'WHATSAPP', 'EMAIL', 'API'] as const;
export type MessageChannel = (typeof MESSAGE_CHANNELS)[number];

export const TICKET_STATUSES = [
  'OPEN',
  'IN_PROGRESS',
  'WAITING_CUSTOMER',
  'WAITING_AGENT',
  'RESOLVED',
  'CLOSED',
] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const TICKET_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export const AGENT_STATUSES = ['ONLINE', 'AWAY', 'BUSY', 'OFFLINE'] as const;
export type AgentStatus = (typeof AGENT_STATUSES)[number];

export const CAMPAIGN_STATUSES = ['DRAFT', 'SCHEDULED', 'RUNNING', 'COMPLETED', 'FAILED'] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export const NOTIFICATION_TYPES = [
  'INFO',
  'SUCCESS',
  'WARNING',
  'ERROR',
  'TICKET_ASSIGNED',
  'TICKET_MENTION',
  'CONVERSATION_ESCALATED',
  'PAYMENT_FAILED',
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const AUDIT_ACTIONS = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'LOGIN',
  'LOGOUT',
  'EXPORT',
  'IMPORT',
  'PERMISSION_CHANGE',
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const KNOWLEDGE_SOURCE_TYPES = ['PDF', 'DOCX', 'TXT', 'URL', 'FAQ'] as const;
export type KnowledgeSourceType = (typeof KNOWLEDGE_SOURCE_TYPES)[number];

export const KNOWLEDGE_SOURCE_STATUSES = ['PENDING', 'PROCESSING', 'READY', 'FAILED'] as const;
export type KnowledgeSourceStatus = (typeof KNOWLEDGE_SOURCE_STATUSES)[number];

export const PAGINATION_DEFAULT_PAGE = 1;
export const PAGINATION_DEFAULT_LIMIT = 20;
export const PAGINATION_MAX_LIMIT = 100;

export const RAG_DEFAULTS = {
  CHUNK_SIZE: 800,
  CHUNK_OVERLAP: 100,
  TOP_K: 5,
  CONFIDENCE_THRESHOLD: 0.7,
  EMBEDDING_DIMENSIONS: 768,
  MAX_CONTEXT_TOKENS: 3000,
} as const;

export const PLAN_LIMITS = {
  FREE: {
    seats: 2,
    conversationsPerMonth: 200,
    knowledgeSources: 5,
    knowledgeChunks: 500,
    whatsappAccounts: 0,
    campaignsPerMonth: 0,
    retentionDays: 30,
  },
  STARTER: {
    seats: 5,
    conversationsPerMonth: 2000,
    knowledgeSources: 25,
    knowledgeChunks: 5000,
    whatsappAccounts: 1,
    campaignsPerMonth: 5,
    retentionDays: 90,
  },
  PRO: {
    seats: 20,
    conversationsPerMonth: 20000,
    knowledgeSources: 200,
    knowledgeChunks: 50000,
    whatsappAccounts: 5,
    campaignsPerMonth: 50,
    retentionDays: 180,
  },
  ENTERPRISE: {
    seats: 100,
    conversationsPerMonth: 200000,
    knowledgeSources: 2000,
    knowledgeChunks: 500000,
    whatsappAccounts: 25,
    campaignsPerMonth: 500,
    retentionDays: 365,
  },
} as const satisfies Record<PlanTier, PlanLimits>;

export type PlanLimits = {
  seats: number;
  conversationsPerMonth: number;
  knowledgeSources: number;
  knowledgeChunks: number;
  whatsappAccounts: number;
  campaignsPerMonth: number;
  retentionDays: number;
};

export const DEFAULT_SYSTEM_PROMPT =
  'You are a helpful customer support assistant. Use only the provided knowledge base context to answer. If you are unsure, say so and offer to escalate to a human agent.';

export const DEFAULT_WELCOME_MESSAGE = 'Hi! How can I help you today?';

export const DEFAULT_FALLBACK_MESSAGE =
  'I am not sure about that. Let me connect you with a human.';

export const APP_NAME = 'Neo Support AI';
export const APP_URL = process.env['APP_URL'] ?? 'http://localhost:3000';
export const API_URL = process.env['API_URL'] ?? 'http://localhost:4000';

export const DEFAULT_TIMEZONE = 'UTC';

export const ALLOWED_ATTACHMENT_CONTENT_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
] as const;

export const MAX_ATTACHMENT_SIZE_BYTES = 25 * 1024 * 1024;
