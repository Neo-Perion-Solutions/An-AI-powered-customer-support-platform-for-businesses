import { z } from 'zod';
import {
  PLAN_TIERS,
  CONVERSATION_STATUSES,
  MESSAGE_ROLES,
  MESSAGE_CHANNELS,
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  AGENT_STATUSES,
  CAMPAIGN_STATUSES,
  NOTIFICATION_TYPES,
  KNOWLEDGE_SOURCE_TYPES,
  KNOWLEDGE_SOURCE_STATUSES,
} from './constants';

const uuid = z.string().uuid();
const slug = z
  .string()
  .min(2)
  .max(64)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Must be lowercase letters, numbers, and dashes');

const strongPassword = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128)
  .refine((v) => /[A-Z]/.test(v), 'Password must contain an uppercase letter')
  .refine((v) => /[a-z]/.test(v), 'Password must contain a lowercase letter')
  .refine((v) => /[0-9]/.test(v), 'Password must contain a number');

export const signupSchema = z
  .object({
    email: z.string().email().max(255),
    password: strongPassword,
    name: z.string().min(1).max(120),
    organizationName: z.string().min(2).max(120),
    organizationSlug: slug.optional(),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().email().max(255),
    password: z.string().min(1).max(128),
    organizationSlug: slug.optional(),
  })
  .strict();

export const forgotPasswordSchema = z
  .object({
    email: z.string().email().max(255),
  })
  .strict();

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: strongPassword,
  })
  .strict();

export const createOrgSchema = z
  .object({
    name: z.string().min(2).max(120),
    slug,
    plan: z.enum(PLAN_TIERS).optional(),
  })
  .strict();

export const updateOrgSchema = z
  .object({
    name: z.string().min(2).max(120).optional(),
    settings: z.record(z.unknown()).optional(),
  })
  .strict();

export const inviteUserSchema = z
  .object({
    email: z.string().email().max(255),
    name: z.string().min(1).max(120),
    roleId: uuid,
  })
  .strict();

export const updateUserSchema = z
  .object({
    name: z.string().min(1).max(120).optional(),
    avatarUrl: z.string().url().max(2048).optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export const createRoleSchema = z
  .object({
    name: z.string().min(1).max(64),
    description: z.string().max(500).optional(),
    permissionKeys: z.array(z.string().min(1)).min(1),
  })
  .strict();

export const updateRoleSchema = z
  .object({
    name: z.string().min(1).max(64).optional(),
    description: z.string().max(500).nullable().optional(),
    permissionKeys: z.array(z.string().min(1)).min(1).optional(),
  })
  .strict();

export const createCustomerSchema = z
  .object({
    externalId: z.string().max(255).optional(),
    name: z.string().min(1).max(120).optional(),
    email: z.string().email().max(255).optional(),
    phone: z.string().max(32).optional(),
    avatarUrl: z.string().url().max(2048).optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .strict();

export const updateCustomerSchema = createCustomerSchema.partial();

export const createConversationSchema = z
  .object({
    customerId: uuid,
    channel: z.enum(MESSAGE_CHANNELS).default('WEB'),
    subject: z.string().max(200).optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .strict();

export const sendMessageSchema = z
  .object({
    conversationId: uuid,
    content: z.string().min(1).max(8000),
    role: z.enum(MESSAGE_ROLES).optional(),
    channel: z.enum(MESSAGE_CHANNELS).optional(),
    metadata: z.record(z.unknown()).optional(),
    attachmentIds: z.array(uuid).optional(),
  })
  .strict();

export const updateConversationSchema = z
  .object({
    status: z.enum(CONVERSATION_STATUSES).optional(),
    assignedAgentId: uuid.nullable().optional(),
    subject: z.string().max(200).nullable().optional(),
  })
  .strict();

export const createTicketSchema = z
  .object({
    title: z.string().min(3).max(200),
    description: z.string().min(1).max(8000),
    priority: z.enum(TICKET_PRIORITIES).default('MEDIUM'),
    status: z.enum(TICKET_STATUSES).default('OPEN'),
    assigneeId: uuid.optional(),
    customerName: z.string().max(120).optional(),
    customerEmail: z.string().email().max(255).optional(),
    conversationId: uuid.optional(),
    tags: z.array(z.string().min(1).max(40)).max(20).default([]),
    metadata: z.record(z.unknown()).optional(),
  })
  .strict();

export const updateTicketSchema = z
  .object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().min(1).max(8000).optional(),
    status: z.enum(TICKET_STATUSES).optional(),
    priority: z.enum(TICKET_PRIORITIES).optional(),
    assigneeId: uuid.nullable().optional(),
    tags: z.array(z.string().min(1).max(40)).max(20).optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .strict();

export const addCommentSchema = z
  .object({
    content: z.string().min(1).max(8000),
    isInternal: z.boolean().default(false),
  })
  .strict();

export const createKnowledgeSourceSchema = z
  .object({
    name: z.string().min(1).max(200),
    type: z.enum(KNOWLEDGE_SOURCE_TYPES),
    url: z.string().url().max(2048).optional(),
    fileKey: z.string().max(512).optional(),
    fileSize: z.number().int().nonnegative().optional(),
    contentType: z.string().max(200).optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .strict();

export const updateKnowledgeSourceSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    status: z.enum(KNOWLEDGE_SOURCE_STATUSES).optional(),
    errorMessage: z.string().max(2000).nullable().optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .strict();

export const createFaqSchema = z
  .object({
    question: z.string().min(3).max(500),
    answer: z.string().min(1).max(8000),
    category: z.string().max(80).optional(),
    sortOrder: z.number().int().min(0).max(100000).default(0),
    isPublished: z.boolean().default(true),
  })
  .strict();

export const updateFaqSchema = createFaqSchema.partial();

export const createCampaignSchema = z
  .object({
    accountId: uuid,
    name: z.string().min(1).max(200),
    templateName: z.string().min(1).max(120),
    messageBody: z.string().min(1).max(4000),
    recipients: z
      .array(
        z
          .object({
            phoneNumber: z.string().min(5).max(32),
            name: z.string().max(120).optional(),
            variables: z.record(z.string()).optional(),
          })
          .strict(),
      )
      .min(1)
      .max(10000),
    scheduledAt: z.string().datetime().optional(),
  })
  .strict();

export const updateCampaignSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    templateName: z.string().min(1).max(120).optional(),
    messageBody: z.string().min(1).max(4000).optional(),
    status: z.enum(CAMPAIGN_STATUSES).optional(),
    scheduledAt: z.string().datetime().nullable().optional(),
  })
  .strict();

export const updateAgentSchema = z
  .object({
    status: z.enum(AGENT_STATUSES).optional(),
    skills: z.array(z.string().min(1).max(60)).max(50).optional(),
    maxConcurrent: z.number().int().min(1).max(100).optional(),
  })
  .strict();

export const createWhatsappAccountSchema = z
  .object({
    phoneNumber: z.string().min(5).max(32),
    displayName: z.string().min(1).max(120),
    isMock: z.boolean().default(true),
    webhookUrl: z.string().url().max(2048).optional(),
  })
  .strict();

export const updateChatbotConfigSchema = z
  .object({
    name: z.string().min(1).max(120).optional(),
    systemPrompt: z.string().min(1).max(8000).optional(),
    welcomeMessage: z.string().min(1).max(500).optional(),
    fallbackMessage: z.string().min(1).max(500).optional(),
    escalationKeywords: z.array(z.string().min(1).max(60)).max(50).optional(),
    confidenceThreshold: z.number().min(0).max(1).optional(),
    handoffEnabled: z.boolean().optional(),
    settings: z.record(z.unknown()).optional(),
  })
  .strict();

export const createNotificationSchema = z
  .object({
    userId: uuid,
    type: z.enum(NOTIFICATION_TYPES),
    title: z.string().min(1).max(200),
    body: z.string().min(1).max(2000),
    data: z.record(z.unknown()).optional(),
  })
  .strict();

export const paginationSchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export const idParamSchema = z
  .object({
    id: uuid,
  })
  .strict();

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type CreateOrgInput = z.infer<typeof createOrgSchema>;
export type UpdateOrgInput = z.infer<typeof updateOrgSchema>;
export type InviteUserInput = z.infer<typeof inviteUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type UpdateConversationInput = z.infer<typeof updateConversationSchema>;
export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type AddCommentInput = z.infer<typeof addCommentSchema>;
export type CreateKnowledgeSourceInput = z.infer<typeof createKnowledgeSourceSchema>;
export type UpdateKnowledgeSourceInput = z.infer<typeof updateKnowledgeSourceSchema>;
export type CreateFaqInput = z.infer<typeof createFaqSchema>;
export type UpdateFaqInput = z.infer<typeof updateFaqSchema>;
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
export type UpdateAgentInput = z.infer<typeof updateAgentSchema>;
export type CreateWhatsappAccountInput = z.infer<typeof createWhatsappAccountSchema>;
export type UpdateChatbotConfigInput = z.infer<typeof updateChatbotConfigSchema>;
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type PaginationInputParsed = z.infer<typeof paginationSchema>;
