# Neo Support AI — REST API Reference (API)

**Version:** 1.0
**Base URL:** `https://api.neo-support.ai/v1`
**WebSocket:** `wss://api.neo-support.ai/ws`
**Auth:** Bearer JWT in `Authorization` header
**Last updated:** 2026-06-23

---

## 1. Authentication

### 1.1 Token Lifecycle

- **Access token:** RS256 JWT, 15-minute TTL, payload `{ sub, orgId, role, jti }`
- **Refresh token:** Opaque, 30-day TTL, single-use with rotation
- **Storage:** httpOnly, Secure, SameSite=Lax cookies for web; localStorage for widget
- **Revocation:** Refresh token family invalidated on logout, password reset, or theft detection

### 1.2 Common Headers

| Header | Required | Description |
|---|---|---|
| `Authorization` | Yes (except /auth/*) | `Bearer <access_token>` |
| `Content-Type` | Yes for POST/PATCH | `application/json` |
| `X-Request-ID` | No | Correlation ID; auto-generated if absent |
| `Idempotency-Key` | Recommended for POST | Prevents duplicate writes |
| `Accept-Language` | No | Defaults to `en-US` |

### 1.3 Error Response Format

```json
{
  "statusCode": 422,
  "error": "VALIDATION_ERROR",
  "message": "Email is invalid",
  "details": [
    { "field": "email", "code": "invalid_format" }
  ],
  "timestamp": "2026-06-23T14:22:01.123Z",
  "requestId": "req_8f7a9b..."
}
```

| HTTP | Error Code | Meaning |
|---|---|---|
| 400 | BAD_REQUEST | Malformed body |
| 401 | UNAUTHORIZED | Missing or invalid token |
| 403 | FORBIDDEN | RBAC denied |
| 404 | NOT_FOUND | Resource missing |
| 409 | CONFLICT | Duplicate (e.g., email) |
| 422 | VALIDATION_ERROR | Schema failure |
| 429 | RATE_LIMITED | Throttled |
| 500 | INTERNAL_ERROR | Server fault |
| 503 | SERVICE_UNAVAILABLE | Dependency down |

### 1.4 Rate Limiting

| Scope | Default | Burst |
|---|---|---|
| Per IP, unauthenticated | 60 req/min | 100 |
| Per user, authenticated | 100 req/min | 200 |
| Per org, bot messages | 1,000 req/min | 2,000 |
| Per org, knowledge upload | 10 req/min | 20 |

Rate-limit headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.

### 1.5 Pagination

All list endpoints accept:

```
?page=1&pageSize=20&cursor=opaque
```

Response shape:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 1342,
    "hasMore": true,
    "nextCursor": "eyJpZCI6IjAx..."
  }
}
```

---

## 2. Auth Endpoints

### POST /auth/register

Create a new user and organization.

**Request:**
```json
{
  "email": "anjali@clinic.com",
  "password": "SecurePass123!",
  "name": "Anjali Rao",
  "organizationName": "Anjali Wellness Clinic"
}
```

**Response 201:**
```json
{
  "user": { "id": "...", "email": "anjali@clinic.com", "role": "owner" },
  "organization": { "id": "...", "slug": "anjali-clinic", "plan": "free" },
  "accessToken": "eyJ...",
  "refreshToken": "rt_..."
}
```

**Errors:** 409 (duplicate email), 422 (weak password).

---

### POST /auth/login

**Request:**
```json
{ "email": "anjali@clinic.com", "password": "SecurePass123!" }
```

**Response 200:** Same shape as register.

**Errors:** 401 (bad credentials), 429 (locked).

---

### POST /auth/refresh

**Request:**
```json
{ "refreshToken": "rt_..." }
```

**Response 200:** New access + refresh tokens. Old refresh token revoked.

---

### POST /auth/logout

**Request:** Empty body, refresh token in cookie or body.

**Response 204:** No content. Refresh token family invalidated.

---

### POST /auth/forgot-password

**Request:**
```json
{ "email": "anjali@clinic.com" }
```

**Response 204:** Always returns 204 to prevent email enumeration.

---

### POST /auth/reset-password

**Request:**
```json
{ "token": "rst_...", "newPassword": "NewSecure456!" }
```

**Response 204:** All existing sessions invalidated.

---

### GET /auth/me

Returns current user and organization.

**Response 200:**
```json
{
  "user": { "id": "...", "email": "...", "name": "...", "role": "owner" },
  "organization": { "id": "...", "name": "...", "plan": "pro" },
  "permissions": ["org:read", "org:write", "billing:write", ...]
}
```

---

## 3. Organizations

### GET /organizations/me

**Response 200:** Full organization document including chatbot config, plan limits.

### PATCH /organizations/me

**Request:**
```json
{ "name": "Anjali Wellness Clinic", "timezone": "America/Los_Angeles" }
```

**Response 200:** Updated organization.

---

## 4. Users

### GET /users

Query: `?role=agent&isActive=true&search=marco`

**Response 200:**
```json
{
  "data": [
    { "id": "...", "email": "marco@...", "name": "Marco Silva", "role": "agent", "lastSeenAt": "..." }
  ],
  "pagination": { "page": 1, "total": 12, "hasMore": false }
}
```

### POST /users

Invite a user to the organization.

**Request:**
```json
{
  "email": "newagent@clinic.com",
  "name": "New Agent",
  "role": "agent"
}
```

**Response 201:** User record with `invitationPending: true`.

### PATCH /users/{id}

**Request:**
```json
{ "role": "manager", "isActive": true }
```

### DELETE /users/{id}

Soft-delete user. **Permission:** Owner or Admin.

### POST /users/{id}/resend-invite

Resends invitation email. Rate limit: 3/hour per user.

---

## 5. Customers

### GET /customers

Query: `?search=priya&hasOpenConversation=true&page=1&pageSize=20`

### POST /customers

**Request:**
```json
{
  "externalId": "CUST-12345",
  "name": "Priya Kapoor",
  "email": "priya@example.com",
  "phone": "+14155551234",
  "metadata": { "plan": "gold", "joinedAt": "2025-03-15" }
}
```

### GET /customers/{id}

Returns customer + summary (open conversations, tickets, last message).

### PATCH /customers/{id}

Update fields. Idempotent.

### DELETE /customers/{id}

GDPR erasure: anonymizes PII, retains conversation skeleton.

---

## 6. Conversations

### GET /conversations

Query params:
- `status` — open, pending, resolved, closed
- `channel` — web, whatsapp
- `assigneeId` — UUID
- `customerId` — UUID
- `search` — full-text on subject + last message
- `from`, `to` — ISO timestamps
- `sort` — `lastMessageAt:desc` (default), `createdAt:asc`

**Response 200:** Paginated conversation list.

### GET /conversations/{id}

Returns conversation + first 50 messages + customer context.

### POST /conversations

Manually create a conversation (e.g., outbound sales).

**Request:**
```json
{
  "customerId": "...",
  "channel": "web",
  "subject": "Welcome conversation",
  "initialMessage": "Hi! How can we help?"
}
```

### POST /conversations/{id}/messages

Send a message as the current user (agent) or as the bot.

**Request:**
```json
{
  "content": "Hi, how can I help?",
  "contentType": "text",
  "isInternalNote": false
}
```

**Response 201:** Message object + WS event emitted.

### POST /conversations/{id}/close

Marks conversation as closed. Captures CSAT if not yet set.

### POST /conversations/{id}/reassign

**Request:**
```json
{ "assigneeId": "..." }
```

### POST /conversations/{id}/rate

Customer-only endpoint to provide CSAT.

**Request:**
```json
{ "score": 5, "comment": "Quick and helpful!" }
```

---

## 7. Messages

### GET /conversations/{id}/messages

Query: `?before=cursor&limit=50`

**Response 200:**
```json
{
  "data": [
    {
      "id": "...",
      "senderType": "customer",
      "content": "What are your hours?",
      "createdAt": "..."
    },
    {
      "id": "...",
      "senderType": "bot",
      "content": "We're open 9am-5pm weekdays.",
      "confidence": 0.92,
      "citations": [
        { "sourceId": "...", "title": "Hours & Location", "url": "..." }
      ]
    }
  ],
  "pagination": { "hasMore": true, "nextCursor": "..." }
}
```

### POST /messages/{id}/csat

Record CSAT for an existing message.

---

## 8. Knowledge

### GET /knowledge/sources

List sources for the current organization.

**Response 200:**
```json
{
  "data": [
    {
      "id": "...",
      "type": "url",
      "title": "Help Center",
      "status": "ready",
      "chunksCount": 1247,
      "lastProcessedAt": "..."
    }
  ]
}
```

### POST /knowledge/sources

Create a new source. Type-specific body:

**URL:**
```json
{ "type": "url", "url": "https://help.example.com", "crawlDepth": 3 }
```

**PDF:**
```json
{ "type": "pdf", "title": "Patient Handbook", "fileId": "..." }
```

**FAQ Set:**
```json
{ "type": "faq", "title": "Top Questions" }
```

**Response 201:** Source with status `pending`.

### GET /knowledge/sources/{id}

Returns source + processing progress.

### POST /knowledge/sources/{id}/scrape

Manually trigger URL crawl. Idempotent.

### POST /knowledge/sources/{id}/reprocess

Re-embed and re-index. Async.

### GET /knowledge/sources/{id}/chunks

Paginated list of chunks. For debugging.

**Query:** `?page=1&pageSize=50&search=hours`

### DELETE /knowledge/sources/{id}

Cascades to chunks. Soft delete with 30-day restore window.

### POST /knowledge/scrape-url

One-shot URL scrape (no source created). Returns chunks directly.

**Request:**
```json
{ "url": "https://example.com/specific-page" }
```

**Response 200:**
```json
{
  "chunks": [
    { "id": "tmp_...", "content": "...", "metadata": { "title": "...", "url": "..." } }
  ]
}
```

---

## 9. FAQs

### GET /faqs

Query: `?category=billing&isPublished=true`

### POST /faqs

**Request:**
```json
{
  "category": "billing",
  "question": "Do you accept insurance?",
  "answer": "Yes, we accept most major insurance including...",
  "isPublished": true
}
```

### PATCH /faqs/{id}

### DELETE /faqs/{id}

### POST /faqs/bulk-import

**Request:**
```json
{
  "category": "shipping",
  "items": [
    { "question": "...", "answer": "..." }
  ]
}
```

**Response 201:** `{ imported: 25, failed: 0 }`

---

## 10. Tickets

### GET /tickets

Query: `?status=open&priority=high&assigneeId=...&from=...&to=...`

### GET /tickets/{id}

Returns ticket + comments + linked conversation(s).

### POST /tickets

**Request:**
```json
{
  "subject": "Billing dispute",
  "description": "...",
  "customerId": "...",
  "priority": "high",
  "conversationId": "..." 
}
```

### PATCH /tickets/{id}

**Request:**
```json
{ "status": "in_progress", "assigneeId": "..." }
```

### POST /tickets/{id}/comments

**Request:**
```json
{ "body": "Looking into this now.", "isInternal": false }
```

### POST /tickets/{id}/resolve

Sets status to resolved, captures resolution time.

### POST /tickets/{id}/reopen

---

## 11. Agents

### GET /agents

Returns agents (subset of users with role in [agent, manager, admin, owner]).

### GET /agents/{id}

### PATCH /agents/{id}/status

**Request:**
```json
{ "status": "away" }
```

Possible: `online`, `away`, `busy`, `offline`.

---

## 12. WhatsApp

### GET /whatsapp/accounts

List connected WhatsApp Business accounts.

### GET /whatsapp/accounts/{id}

### POST /whatsapp/accounts

Initiates Meta embedded signup.

**Request:**
```json
{ "code": "oauth_code_from_meta" }
```

### DELETE /whatsapp/accounts/{id}

Disconnects account. Pending messages flushed.

### POST /whatsapp/accounts/{id}/send

**Request:**
```json
{
  "to": "+14155551234",
  "type": "template",
  "template": { "name": "welcome_v1", "language": "en", "components": [] }
}
```

Or for free-form reply within 24h window:

```json
{
  "to": "+14155551234",
  "type": "text",
  "text": { "body": "Thanks for reaching out!" }
}
```

### GET /whatsapp/accounts/{id}/messages

List messages on this account.

### GET /whatsapp/campaigns

### POST /whatsapp/campaigns

**Request:**
```json
{
  "whatsappAccountId": "...",
  "name": "Reactivation Q3",
  "templateName": "come_back_v1",
  "audienceFilter": { "lastSeenBefore": "2026-04-01" },
  "scheduledAt": "2026-07-01T15:00:00Z"
}
```

### POST /whatsapp/campaigns/{id}/send

Dispatches immediately, ignoring scheduledAt.

---

## 13. Analytics

### GET /analytics/overview

Query: `?from=2026-05-01&to=2026-06-23`

**Response 200:**
```json
{
  "totalConversations": 4321,
  "resolvedByBot": 3102,
  "resolvedByHuman": 998,
  "abandoned": 221,
  "resolutionRate": 0.79,
  "avgFirstResponseMs": 4200,
  "avgResolutionMs": 180000,
  "csatAvg": 4.6,
  "csatResponses": 1893,
  "comparison": {
    "totalConversations": { "delta": 0.18 },
    "resolutionRate": { "delta": 0.04 }
  }
}
```

### GET /analytics/conversations

Time-series for conversation volume.

### GET /analytics/agents

Leaderboard.

**Response 200:**
```json
{
  "data": [
    {
      "userId": "...",
      "name": "Marco Silva",
      "conversationsHandled": 412,
      "avgResponseMs": 38000,
      "csatAvg": 4.8,
      "resolutionRate": 0.88
    }
  ]
}
```

### GET /analytics/roi

**Response 200:**
```json
{
  "period": { "from": "...", "to": "..." },
  "agentHourlyCostCents": 2500,
  "botResolvedCount": 3102,
  "estimatedHoursSaved": 517,
  "estimatedSavingsCents": 1292500,
  "platformCostCents": 19900,
  "netSavingsCents": 1272600,
  "roiMultiple": 64.0
}
```

### GET /analytics/knowledge-gaps

List of top questions the bot could not answer.

**Response 200:**
```json
{
  "data": [
    { "query": "do you take walk-ins?", "occurrences": 47, "lastSeen": "..." }
  ]
}
```

### GET /analytics/export

Query: `?format=csv&from=...&to=...&type=overview`

Returns a signed R2 URL for download.

---

## 14. Billing

### GET /billing/plans

**Response 200:**
```json
{
  "plans": [
    {
      "id": "free",
      "name": "Free",
      "priceCents": 0,
      "features": { "seats": 2, "conversationsPerMonth": 100 }
    },
    {
      "id": "starter",
      "name": "Starter",
      "priceCents": 4900,
      "features": { "seats": 5, "conversationsPerMonth": 2500 }
    },
    {
      "id": "pro",
      "name": "Pro",
      "priceCents": 19900,
      "features": { "seats": 15, "conversationsPerMonth": 15000 }
    }
  ]
}
```

### GET /billing/subscription

Returns current subscription.

### POST /billing/checkout

**Request:**
```json
{ "planId": "pro", "successUrl": "...", "cancelUrl": "..." }
```

**Response 200:** `{ "checkoutUrl": "https://checkout.stripe.com/..." }`

### POST /billing/portal

Returns Stripe Customer Portal URL.

### POST /billing/webhook

Stripe webhook receiver. Signature-verified.

**Headers required:** `Stripe-Signature`

### GET /billing/invoices

Paginated list of invoices.

### GET /billing/invoices/{id}

Returns invoice + signed PDF URL.

### GET /billing/usage

Current month usage against plan limits.

---

## 15. Notifications

### GET /notifications

Query: `?unread=true&page=1&pageSize=20`

### POST /notifications/{id}/read

Marks a single notification read.

### POST /notifications/read-all

Marks all read for current user.

---

## 16. Audit

### GET /audit

Query: `?actorId=...&action=auth.login&from=...&to=...&page=1`

**Permission:** Owner or Admin only.

**Response 200:**
```json
{
  "data": [
    {
      "id": "...",
      "actor": { "id": "...", "email": "..." },
      "action": "user.role.update",
      "target": { "type": "user", "id": "..." },
      "ip": "73.14.22.5",
      "metadata": { "from": "agent", "to": "manager" },
      "createdAt": "..."
    }
  ]
}
```

### GET /audit/export

CSV export. Rate-limited to 1/day.

---

## 17. Chatbot

### GET /chatbot/config

**Response 200:**
```json
{
  "systemPrompt": "You are a helpful assistant for...",
  "confidenceThreshold": 0.6,
  "fallbackMessage": "I'm not sure. Let me connect you to a human.",
  "handoffMessage": "Connecting you now...",
  "widgetColor": "#0066FF",
  "widgetPosition": "bottom-right",
  "isActive": true
}
```

### PATCH /chatbot/config

Update any field. Triggers cache invalidation.

### POST /chatbot/test

**Request:**
```json
{ "message": "What are your hours?", "preview": true }
```

**Response 200:**
```json
{
  "answer": "We're open 9am-5pm weekdays.",
  "confidence": 0.92,
  "citations": [{ "title": "Hours", "url": "...", "score": 0.91 }],
  "handoffNeeded": false
}
```

`preview: true` does not persist or count toward usage.

---

## 18. Files

### POST /files/upload

Multipart upload. Returns file ID.

**Response 201:**
```json
{ "id": "...", "url": "https://...", "sizeBytes": 1048576, "mimeType": "application/pdf" }
```

### GET /files/{id}

Returns signed R2 URL with 1-hour expiry.

### DELETE /files/{id}

---

## 19. WebSocket Events

Connect to `wss://api.neo-support.ai/ws` with a valid JWT in handshake (cookie or `auth` field).

### 19.1 Client-to-Server Events

| Event | Payload | Description |
|---|---|---|
| `subscribe` | `{ channel: "org:{id}" \| "user:{id}" \| "conv:{id}" }` | Join channel |
| `unsubscribe` | `{ channel }` | Leave channel |
| `typing` | `{ conversationId }` | Notify typing indicator |
| `presence` | `{ status: "online"\|"away"\|"busy" }` | Update own presence |

### 19.2 Server-to-Client Events

| Event | Payload | Description |
|---|---|---|
| `conversation:new` | `{ conversation: {...} }` | New conversation in org |
| `conversation:assigned` | `{ conversationId, assigneeId }` | Assignment changed |
| `conversation:status` | `{ conversationId, status }` | Status changed |
| `message:new` | `{ message: {...} }` | New message in conversation |
| `message:updated` | `{ messageId, changes }` | Edit or CSAT added |
| `ticket:new` | `{ ticket: {...} }` | New ticket in org |
| `ticket:assigned` | `{ ticketId, assigneeId }` | Ticket assignment |
| `notification:new` | `{ notification: {...} }` | In-app notification |
| `typing` | `{ conversationId, userId, isTyping }` | Typing indicator |
| `presence` | `{ userId, status, lastSeenAt }` | User presence changed |
| `agent:status` | `{ userId, status }` | Agent availability |

### 19.3 Example Client Code

```typescript
import { io } from "socket.io-client";

const socket = io("wss://api.neo-support.ai/ws", {
  auth: { token: accessToken },
});

socket.on("connect", () => {
  socket.emit("subscribe", { channel: `org:${orgId}` });
  socket.emit("subscribe", { channel: `user:${userId}` });
});

socket.on("message:new", (payload) => {
  console.log("New message:", payload.message);
  // update UI
});

socket.on("typing", ({ conversationId, userId, isTyping }) => {
  // show typing indicator
});
```

---

## 20. SDK Examples

### 20.1 cURL

```bash
curl -X POST https://api.neo-support.ai/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"anjali@clinic.com","password":"..."}'
```

### 20.2 TypeScript

```typescript
const response = await fetch("https://api.neo-support.ai/v1/conversations", {
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
});
const { data } = await response.json();
```

### 20.3 Python

```python
import requests
response = requests.get(
    "https://api.neo-support.ai/v1/conversations",
    headers={"Authorization": f"Bearer {access_token}"},
)
data = response.json()["data"]
```

---

**Last updated:** 2026-06-23
