export const RoleName = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  AGENT: 'AGENT',
  VIEWER: 'VIEWER',
} as const;
export type RoleName = (typeof RoleName)[keyof typeof RoleName];

export const PermissionKey = {
  ORG_READ: 'org:read',
  ORG_UPDATE: 'org:update',
  ORG_DELETE: 'org:delete',
  ORG_BILLING: 'org:billing',
  USER_INVITE: 'user:invite',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_REMOVE: 'user:remove',
  ROLE_MANAGE: 'role:manage',
  CUSTOMER_READ: 'customer:read',
  CUSTOMER_UPDATE: 'customer:update',
  CUSTOMER_DELETE: 'customer:delete',
  CONVERSATION_READ: 'conversation:read',
  CONVERSATION_REPLY: 'conversation:reply',
  CONVERSATION_ASSIGN: 'conversation:assign',
  CONVERSATION_CLOSE: 'conversation:close',
  TICKET_READ: 'ticket:read',
  TICKET_CREATE: 'ticket:create',
  TICKET_UPDATE: 'ticket:update',
  TICKET_ASSIGN: 'ticket:assign',
  TICKET_DELETE: 'ticket:delete',
  TICKET_COMMENT: 'ticket:comment',
  KNOWLEDGE_READ: 'knowledge:read',
  KNOWLEDGE_CREATE: 'knowledge:create',
  KNOWLEDGE_UPDATE: 'knowledge:update',
  KNOWLEDGE_DELETE: 'knowledge:delete',
  FAQ_MANAGE: 'faq:manage',
  CHATBOT_UPDATE: 'chatbot:update',
  ANALYTICS_READ: 'analytics:read',
  AUDIT_READ: 'audit:read',
  WHATSAPP_MANAGE: 'whatsapp:manage',
  CAMPAIGN_CREATE: 'campaign:create',
  CAMPAIGN_SEND: 'campaign:send',
} as const;
export type PermissionKey = (typeof PermissionKey)[keyof typeof PermissionKey];

const ALL_PERMISSIONS: readonly PermissionKey[] = Object.values(PermissionKey);

const ROLE_PERMISSIONS: Record<RoleName, readonly PermissionKey[]> = {
  [RoleName.OWNER]: ALL_PERMISSIONS,
  [RoleName.ADMIN]: [
    PermissionKey.ORG_READ,
    PermissionKey.ORG_UPDATE,
    PermissionKey.USER_INVITE,
    PermissionKey.USER_READ,
    PermissionKey.USER_UPDATE,
    PermissionKey.USER_REMOVE,
    PermissionKey.ROLE_MANAGE,
    PermissionKey.CUSTOMER_READ,
    PermissionKey.CUSTOMER_UPDATE,
    PermissionKey.CUSTOMER_DELETE,
    PermissionKey.CONVERSATION_READ,
    PermissionKey.CONVERSATION_REPLY,
    PermissionKey.CONVERSATION_ASSIGN,
    PermissionKey.CONVERSATION_CLOSE,
    PermissionKey.TICKET_READ,
    PermissionKey.TICKET_CREATE,
    PermissionKey.TICKET_UPDATE,
    PermissionKey.TICKET_ASSIGN,
    PermissionKey.TICKET_DELETE,
    PermissionKey.TICKET_COMMENT,
    PermissionKey.KNOWLEDGE_READ,
    PermissionKey.KNOWLEDGE_CREATE,
    PermissionKey.KNOWLEDGE_UPDATE,
    PermissionKey.KNOWLEDGE_DELETE,
    PermissionKey.FAQ_MANAGE,
    PermissionKey.CHATBOT_UPDATE,
    PermissionKey.ANALYTICS_READ,
    PermissionKey.AUDIT_READ,
    PermissionKey.WHATSAPP_MANAGE,
    PermissionKey.CAMPAIGN_CREATE,
    PermissionKey.CAMPAIGN_SEND,
  ],
  [RoleName.AGENT]: [
    PermissionKey.ORG_READ,
    PermissionKey.USER_READ,
    PermissionKey.CUSTOMER_READ,
    PermissionKey.CUSTOMER_UPDATE,
    PermissionKey.CONVERSATION_READ,
    PermissionKey.CONVERSATION_REPLY,
    PermissionKey.CONVERSATION_ASSIGN,
    PermissionKey.CONVERSATION_CLOSE,
    PermissionKey.TICKET_READ,
    PermissionKey.TICKET_CREATE,
    PermissionKey.TICKET_UPDATE,
    PermissionKey.TICKET_COMMENT,
    PermissionKey.KNOWLEDGE_READ,
    PermissionKey.FAQ_MANAGE,
    PermissionKey.ANALYTICS_READ,
    PermissionKey.CAMPAIGN_CREATE,
  ],
  [RoleName.VIEWER]: [
    PermissionKey.ORG_READ,
    PermissionKey.USER_READ,
    PermissionKey.CUSTOMER_READ,
    PermissionKey.CONVERSATION_READ,
    PermissionKey.TICKET_READ,
    PermissionKey.KNOWLEDGE_READ,
    PermissionKey.ANALYTICS_READ,
  ],
};

/** Returns the set of permission keys granted to a given system role. */
export function getPermissionsForRole(role: RoleName): readonly PermissionKey[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

/** Checks whether a role has a specific permission key. */
export function roleHasPermission(role: RoleName, permission: PermissionKey): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/** Returns true if the role string corresponds to a privileged system role. */
export function isPrivilegedRole(role: string): boolean {
  return role === RoleName.OWNER || role === RoleName.ADMIN;
}
