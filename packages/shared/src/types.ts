import type { RoleName } from './rbac';
import type {
  PlanTier,
  SubscriptionStatus,
  InvoiceStatus,
  ConversationStatus,
  MessageRole,
  MessageChannel,
  TicketStatus,
  TicketPriority,
  AgentStatus,
  CampaignStatus,
  NotificationType,
  AuditAction,
  KnowledgeSourceType,
  KnowledgeSourceStatus,
} from './constants';

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type JsonObject = { [key: string]: JsonValue };

export type Organization = {
  id: string;
  name: string;
  slug: string;
  plan: PlanTier;
  settings: JsonObject;
  createdAt: string;
  updatedAt: string;
};

export type OrganizationSettings = {
  timezone?: string;
  locale?: string;
  branding?: {
    primaryColor?: string;
    logoUrl?: string;
  };
  ai?: {
    enabled: boolean;
    confidenceThreshold: number;
  };
};

export type User = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  avatarUrl: string | null;
  emailVerified: boolean;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PublicUser = Omit<User, 'passwordHash'>;

export type Role = {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  createdAt: string;
};

export type SystemRoleName = RoleName;

export type Permission = {
  id: string;
  key: string;
  description: string | null;
};

export type UserOrganizationRole = {
  id: string;
  userId: string;
  organizationId: string;
  roleId: string;
  createdAt: string;
};

export type UserWithMembership = PublicUser & {
  memberships: Array<UserOrganizationRole & { role: Role; organization: Organization }>;
};

export type RefreshToken = {
  id: string;
  userId: string;
  organizationId: string | null;
  tokenHash: string;
  expiresAt: string;
  revokedAt: string | null;
  createdAt: string;
};

export type Customer = {
  id: string;
  organizationId: string;
  externalId: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  metadata: JsonObject;
  createdAt: string;
  updatedAt: string;
};

export type Conversation = {
  id: string;
  organizationId: string;
  customerId: string;
  assignedAgentId: string | null;
  status: ConversationStatus;
  channel: MessageChannel;
  subject: string | null;
  metadata: JsonObject;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
};

export type ConversationWithRelations = Conversation & {
  customer: Customer;
  assignedAgent: PublicUser | null;
  messages: Message[];
};

export type MessageCitation = {
  sourceId: string;
  sourceName: string;
  chunkId: string;
  score: number;
  excerpt: string;
};

export type Message = {
  id: string;
  organizationId: string;
  conversationId: string;
  role: MessageRole;
  channel: MessageChannel;
  content: string;
  metadata: JsonObject;
  confidence: number | null;
  citations: MessageCitation[];
  createdAt: string;
};

export type MessageWithAttachments = Message & {
  attachments: Attachment[];
};

export type Attachment = {
  id: string;
  organizationId: string;
  messageId: string | null;
  filename: string;
  contentType: string;
  size: number;
  url: string;
  key: string;
  createdAt: string;
};

export type KnowledgeSource = {
  id: string;
  organizationId: string;
  name: string;
  type: KnowledgeSourceType;
  status: KnowledgeSourceStatus;
  url: string | null;
  fileKey: string | null;
  fileSize: number | null;
  contentType: string | null;
  errorMessage: string | null;
  chunkCount: number;
  metadata: JsonObject;
  createdAt: string;
  updatedAt: string;
};

export type KnowledgeChunk = {
  id: string;
  organizationId: string;
  sourceId: string;
  content: string;
  chunkIndex: number;
  tokenCount: number;
  metadata: JsonObject;
  createdAt: string;
};

export type KnowledgeChunkWithScore = KnowledgeChunk & {
  score: number;
  source: Pick<KnowledgeSource, 'id' | 'name' | 'type'>;
};

export type Faq = {
  id: string;
  organizationId: string;
  question: string;
  answer: string;
  category: string | null;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Ticket = {
  id: string;
  organizationId: string;
  conversationId: string | null;
  number: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assigneeId: string | null;
  customerName: string | null;
  customerEmail: string | null;
  tags: string[];
  metadata: JsonObject;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TicketWithRelations = Ticket & {
  assignee: PublicUser | null;
  comments: TicketComment[];
};

export type TicketComment = {
  id: string;
  organizationId: string;
  ticketId: string;
  authorId: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
};

export type TicketCommentWithAuthor = TicketComment & {
  author: PublicUser;
};

export type Agent = {
  id: string;
  organizationId: string;
  userId: string;
  status: AgentStatus;
  skills: string[];
  maxConcurrent: number;
  metadata: JsonObject;
  createdAt: string;
  updatedAt: string;
};

export type AgentWithUser = Agent & {
  user: PublicUser;
};

export type AgentStatusHistory = {
  id: string;
  organizationId: string;
  agentId: string;
  status: AgentStatus;
  reason: string | null;
  createdAt: string;
};

export type WhatsappAccount = {
  id: string;
  organizationId: string;
  phoneNumber: string;
  displayName: string;
  isConnected: boolean;
  isMock: boolean;
  webhookUrl: string | null;
  metadata: JsonObject;
  createdAt: string;
  updatedAt: string;
};

export type WhatsappMessage = {
  id: string;
  organizationId: string;
  accountId: string;
  externalId: string;
  fromNumber: string;
  toNumber: string;
  direction: 'inbound' | 'outbound';
  content: string;
  status: string;
  metadata: JsonObject;
  createdAt: string;
};

export type CampaignRecipient = {
  phoneNumber: string;
  name?: string;
  variables?: Record<string, string>;
};

export type Campaign = {
  id: string;
  organizationId: string;
  accountId: string;
  name: string;
  status: CampaignStatus;
  templateName: string;
  messageBody: string;
  recipients: CampaignRecipient[];
  scheduledAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
  createdAt: string;
  updatedAt: string;
};

export type Notification = {
  id: string;
  organizationId: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data: JsonObject;
  readAt: string | null;
  createdAt: string;
};

export type ChatbotConfig = {
  id: string;
  organizationId: string;
  name: string;
  systemPrompt: string;
  welcomeMessage: string;
  fallbackMessage: string;
  escalationKeywords: string[];
  confidenceThreshold: number;
  handoffEnabled: boolean;
  settings: JsonObject;
  createdAt: string;
  updatedAt: string;
};

export type Subscription = {
  id: string;
  organizationId: string;
  stripeId: string | null;
  plan: PlanTier;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Invoice = {
  id: string;
  organizationId: string;
  subscriptionId: string | null;
  stripeId: string | null;
  number: string;
  status: InvoiceStatus;
  amountDue: number;
  amountPaid: number;
  currency: string;
  issuedAt: string | null;
  paidAt: string | null;
  createdAt: string;
};

export type AuditLog = {
  id: string;
  organizationId: string;
  userId: string | null;
  action: AuditAction;
  entity: string;
  entityId: string | null;
  changes: JsonObject | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
};

export type AuthSession = {
  user: PublicUser;
  organization: Organization;
  role: Role;
  permissions: readonly string[];
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
};

export type LoginResult = {
  user: PublicUser;
  organizations: Array<{
    organization: Organization;
    role: Role;
  }>;
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

export type PaginationInput = {
  page: number;
  limit: number;
};

export type ApiError = {
  code: string;
  message: string;
  details?: JsonObject;
};

export type ApiResponse<T> = {
  ok: boolean;
  data: T | null;
  error: ApiError | null;
};
