# Neo Support AI — Software Requirements Specification (SRS)

**Version:** 1.0
**Standard:** IEEE 830-1998 adapted
**Status:** Approved for Engineering
**Last updated:** 2026-06-23

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) defines the complete functional and non-functional requirements for Neo Support AI MVP. It serves as the authoritative contract between Product, Engineering, QA, and Customer Success teams. Every feature in the MVP maps to a requirement ID (FR-NN) below.

### 1.2 Scope

Neo Support AI is a multi-tenant SaaS platform that provides:

- AI chatbot with retrieval-augmented generation over customer knowledge
- Omnichannel conversation inbox (web chat + WhatsApp Business)
- Ticketing with assignment and SLA tracking
- Knowledge base management (URL scraping, PDF upload, manual FAQ)
- Real-time analytics and ROI reporting
- Stripe-backed self-service billing
- Role-based access control and audit logging

Out of scope for MVP: voice, SMS, Instagram, mobile apps, custom AI training, on-premise deployment.

### 1.3 Definitions

| Term | Definition |
|---|---|
| Organization | A tenant — one paying customer account |
| Agent | A human user who handles conversations |
| Conversation | A continuous thread of messages between customer(s) and one or more agents/bot |
| Message | A single atomic entry in a conversation |
| Source | A discrete knowledge corpus (URL root, PDF, manual FAQ set) |
| Chunk | A 200-800 token segment of a source, the unit of RAG retrieval |
| Ticket | An escalation that spans multiple conversations or requires workflow |

---

## 2. Functional Requirements

### FR-1: User Registration

| Attribute | Detail |
|---|---|
| ID | FR-1 |
| Description | Anonymous visitors can register a new account with email + password or via Google OAuth |
| Priority | P0 (must-have) |
| Acceptance Criteria | (a) Email + 8+ char password accepted (b) Verification email sent within 30s (c) Click link activates account in <2s (d) Google OAuth roundtrip <5s (e) Duplicate email rejected with HTTP 409 |
| Dependencies | Email service (Resend), OAuth provider (Google) |

### FR-2: User Login

| Attribute | Detail |
|---|---|
| ID | FR-2 |
| Description | Verified users authenticate via email + password or OAuth |
| Priority | P0 |
| Acceptance Criteria | (a) Valid credentials return JWT access (15min TTL) + refresh (30d TTL) (b) Invalid credentials return HTTP 401 (c) Rate limit 5/min/IP (d) Account lockout after 10 failed attempts in 10 min |
| Dependencies | JWT signing, password hashing (bcrypt cost 12) |

### FR-3: Password Reset

| Attribute | Detail |
|---|---|
| ID | FR-3 |
| Description | User can request a password reset via email link |
| Priority | P0 |
| Acceptance Criteria | (a) Reset link valid 1 hour (b) Token single-use (c) New password meets complexity rules (d) All existing refresh tokens invalidated on reset |

### FR-4: Organization Management

| Attribute | Detail |
|---|---|
| ID | FR-4 |
| Description | First user creates an organization; subsequent users join via invite |
| Priority | P0 |
| Acceptance Criteria | (a) One organization per creator at signup (b) Plan tier initialized to Free (c) Owner role assigned automatically (d) Organization name and timezone editable |

### FR-5: User Invitations

| Attribute | Detail |
|---|---|
| ID | FR-5 |
| Description | Owners/admins invite users to their organization |
| Priority | P0 |
| Acceptance Criteria | (a) Invite emails sent with token (b) Token expires in 7 days (c) Resend available (d) Revocable before acceptance (e) Role assigned at invite (Owner/Admin/Agent/Viewer) |

### FR-6: Role-Based Access Control

| Attribute | Detail |
|---|---|
| ID | FR-6 |
| Description | Four-tier RBAC enforced server-side |
| Priority | P0 |
| Acceptance Criteria | (a) Owner: full org control (b) Admin: all except billing (c) Agent: conversations, tickets, knowledge (d) Viewer: read-only dashboards (e) Authorization enforced in NestJS guards, never client-only |

### FR-7: AI Chatbot Conversation

| Attribute | Detail |
|---|---|
| ID | FR-7 |
| Description | End customer initiates chat via widget; AI responds with RAG-grounded answer |
| Priority | P0 |
| Acceptance Criteria | (a) First response <8s p95 (b) Confidence score returned (c) Citations shown (d) Below-threshold confidence triggers handoff offer (e) Conversation persisted in DB |
| Dependencies | Gemini API, pgvector retrieval, Redis cache |

### FR-8: Human Agent Handoff

| Attribute | Detail |
|---|---|
| ID | FR-8 |
| Description | When bot cannot answer, route to human agent in same thread |
| Priority | P0 |
| Acceptance Criteria | (a) Handoff preserves full history (b) Agent sees handoff badge (c) Customer sees "connecting you to an agent" message (d) WebSocket pushes to available agents |

### FR-9: Conversation Inbox

| Attribute | Detail |
|---|---|
| ID | FR-9 |
| Description | Unified inbox of all conversations, sortable, filterable, searchable |
| Priority | P0 |
| Acceptance Criteria | (a) List view paginates 25 per page (b) Filter by status, channel, assignee, date (c) Search by customer name, message content (d) Real-time updates via WebSocket (e) Mark as read/unread |

### FR-10: Agent Messages

| Attribute | Detail |
|---|---|
| ID | FR-10 |
| Description | Agents send text, images, files within conversation |
| Priority | P0 |
| Acceptance Criteria | (a) Text up to 4,000 chars (b) Images up to 5 MB (c) Files up to 25 MB (d) Internal note flag (e) Canned response insertion |

### FR-11: WhatsApp Business Integration

| Attribute | Detail |
|---|---|
| ID | FR-11 |
| Description | Connect organization WhatsApp Business Cloud account via embedded signup |
| Priority | P0 |
| Acceptance Criteria | (a) OAuth-style Meta flow (b) Webhook receives messages within 2s of send (c) Outbound sends respect 24h window rule (d) Template messages for first outreach |
| Dependencies | Meta WhatsApp Cloud API |

### FR-12: Knowledge Source — URL Scraping

| Attribute | Detail |
|---|---|
| ID | FR-12 |
| Description | Recursive crawl of a URL up to 500 pages, 4 levels deep |
| Priority | P0 |
| Acceptance Criteria | (a) Job runs in BullMQ background worker (b) Progress visible in UI (c) Up to 500 pages (d) Skip robots.txt disallowed (e) Re-process on demand |

### FR-13: Knowledge Source — PDF Upload

| Attribute | Detail |
|---|---|
| ID | FR-13 |
| Description | Upload PDF up to 100 MB, extract text + tables |
| Priority | P0 |
| Acceptance Criteria | (a) Stored in R2 (b) Parsed via pdf-parse + Tesseract OCR fallback (c) Chunked to 600 tokens, 100 overlap (d) Status visible (Pending/Processing/Ready/Failed) |

### FR-14: Knowledge Source — Manual FAQ

| Attribute | Detail |
|---|---|
| ID | FR-14 |
| Description | Manually create Q&A entries with categories |
| Priority | P0 |
| Acceptance Criteria | (a) Markdown editor (b) Categories (c) Bulk import CSV (d) Each FAQ becomes one chunk |

### FR-15: Tickets

| Attribute | Detail |
|---|---|
| ID | FR-15 |
| Description | Create tickets from conversations or directly; assign, comment, resolve |
| Priority | P0 |
| Acceptance Criteria | (a) Auto-create on priority complaint (b) Status workflow enforced (c) Internal/public comments (d) Round-robin assignment (e) SLA timer per priority |

### FR-16: Analytics — Overview

| Attribute | Detail |
|---|---|
| ID | FR-16 |
| Description | Dashboard showing total conversations, resolution rate, CSAT, response time |
| Priority | P0 |
| Acceptance Criteria | (a) Aggregations cached in Redis (b) Date range picker (c) Comparison to prior period (d) Export to CSV/PDF |

### FR-17: Analytics — Agent Performance

| Attribute | Detail |
|---|---|
| ID | FR-17 |
| Description | Per-agent leaderboard with volume, CSAT, response time |
| Priority | P0 |
| Acceptance Criteria | (a) Sortable columns (b) Date range filter (c) Drill-down to conversations handled |

### FR-18: Analytics — ROI

| Attribute | Detail |
|---|---|
| ID | FR-18 |
| Description | Cost saved vs. human-only baseline |
| Priority | P1 |
| Acceptance Criteria | (a) Configurable hourly agent cost (b) Bot-resolution hours computed (c) Net savings displayed monthly and YTD |

### FR-19: Billing — Subscriptions

| Attribute | Detail |
|---|---|
| ID | FR-19 |
| Description | Self-service plan upgrade/downgrade/cancel via Stripe Customer Portal |
| Priority | P0 |
| Acceptance Criteria | (a) Plans: Free, Starter ($49), Pro ($199) (b) Stripe Checkout for new subs (c) Webhook updates DB on sub events (d) Plan limits enforced in-app |

### FR-20: Audit Log

| Attribute | Detail |
|---|---|
| ID | FR-20 |
| Description | Append-only log of all sensitive actions (auth, settings, billing, role changes) |
| Priority | P1 |
| Acceptance Criteria | (a) Captures actor, action, target, IP, timestamp (b) Retained 7 years (c) Searchable by Owner/Admin only |

---

## 3. Non-Functional Requirements

### 3.1 Performance

| ID | NFR-PERF-1 | NFR-PERF-2 | NFR-PERF-3 | NFR-PERF-4 |
|---|---|---|---|---|
| Metric | API response (p95) | Bot first response (p95) | Dashboard load (p95) | WebSocket latency |
| Target | < 500 ms | < 8 s | < 2 s | < 200 ms |
| Measurement | NestJS logger + Datadog | Custom timer around Gemini call | Lighthouse + Datadog RUM | Synthetic ping |

### 3.2 Availability

- **Uptime target:** 99.9% monthly (43.83 minutes allowed downtime)
- **Maintenance windows:** Sunday 02:00-04:00 UTC, announced 7 days ahead
- **Health checks:** `/api/health` returns 200 if DB, Redis, Gemini reachable
- **Status page:** status.neo-support.ai powered by BetterStack

### 3.3 Scalability

- **MAU target:** 10,000 in Year 1
- **Concurrent connections:** 5,000 WebSocket connections per API node
- **Horizontal scaling:** API stateless behind load balancer; WS uses sticky sessions via Fly.io
- **Database:** Read replicas enabled at >100 GB or >5,000 RPS
- **Queue throughput:** BullMQ handles 1,000 jobs/sec sustained

### 3.4 Security

| Control | Standard |
|---|---|
| Encryption in Transit | TLS 1.3 enforced, HSTS max-age=63072000 |
| Encryption at Rest | AES-256 (R2 default, Postgres pgcrypto for sensitive columns) |
| Password Storage | bcrypt cost 12, no plaintext logging |
| JWT | RS256, 15-min access + 30-day refresh with rotation |
| GDPR | Right to access, rectification, erasure, portability; DPO contact published |
| CCPA | "Do not sell" honored within 15 days |
| HIPAA-Ready Architecture | BAA-eligible infra, PHI isolation, audit log retention |
| SOC 2 | Type I targeted month 12; Type II month 18 |
| Penetration Test | Annual by external firm; critical findings remediated within 30 days |

### 3.5 Accessibility

- WCAG 2.1 AA compliance for web app
- Keyboard navigation for all flows
- ARIA labels on icon-only buttons
- Color contrast minimum 4.5:1 for normal text
- Screen reader testing with NVDA and VoiceOver quarterly

### 3.6 Internationalization

- All UI strings externalized to JSON dictionaries
- English-only at launch; 5 languages (Spanish, Portuguese, French, German, Hindi) by Month 9
- Dates/numbers formatted via Intl API
- RTL support deferred to post-MVP

### 3.7 Observability

- Structured JSON logs shipped to BetterStack
- Distributed tracing via OpenTelemetry + Honeycomb
- Metrics via Datadog (counters, gauges, histograms)
- Alerts: error rate >1% for 5 min, p95 latency >2x baseline for 10 min, queue lag >5 min

### 3.8 Maintainability

- Code coverage floor 80% on `apps/api` business logic
- Cyclomatic complexity cap 10 per function
- Linting: ESLint (TS), Ruff (Python) enforced in CI
- Pre-commit hooks: format, lint, test

---

## 4. External Interfaces

### 4.1 Google Gemini API

| Attribute | Detail |
|---|---|
| Provider | Google AI for Developers |
| Models | gemini-2.5-flash (default), gemini-2.5-pro (escalation) |
| Auth | API key in env var `GEMINI_API_KEY` |
| Quota | 1,500 requests/min, 1M tokens/min on paid tier |
| Endpoint Used | `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent` |
| Failure Handling | Exponential backoff 3 retries, fallback to Pro model on Flash 429 |

### 4.2 Stripe

| Attribute | Detail |
|---|---|
| Use | Subscription billing + invoicing |
| SDK | stripe-node ^14.x |
| Webhooks | checkout.session.completed, customer.subscription.updated, invoice.payment_failed |
| Signature Verification | `stripe.webhooks.constructEvent` with `STRIPE_WEBHOOK_SECRET` |
| Idempotency | All write calls include `Idempotency-Key` header |

### 4.3 Meta WhatsApp Cloud API

| Attribute | Detail |
|---|---|
| Use | Inbound and outbound WhatsApp messages |
| Endpoint | `https://graph.facebook.com/v20.0/{phone-number-id}/messages` |
| Auth | System User Access Token |
| Webhook | GET for verification, POST for events; signature via `X-Hub-Signature-256` |
| Templates | Pre-approved message templates stored in DB |

### 4.4 Cloudflare R2

| Attribute | Detail |
|---|---|
| Use | Object storage for PDFs, images, exports |
| SDK | AWS S3 compatible (`@aws-sdk/client-s3`) |
| Auth | Access Key + Secret in env |
| Buckets | `neo-support-uploads`, `neo-support-exports` |
| Lifecycle | uploads bucket expires after 90 days, exports after 7 days |

### 4.5 Resend (Email)

| Attribute | Detail |
|---|---|
| Use | Transactional email (verification, invites, password reset, weekly digest) |
| Auth | API key in env |
| Webhooks | delivery, bounce, complaint events |
| Quota | 50,000 emails/month free tier; 100k/month Pro |

### 4.6 Supabase (Postgres)

| Attribute | Detail |
|---|---|
| Use | Primary database |
| Extensions | pgvector, uuid-ossp, pgcrypto, pg_trgm |
| Connection | Pooled via PgBouncer; port 6543 for serverless, 5432 for migrations |

---

## 5. System Constraints

### 5.1 Browser Support

| Browser | Minimum Version |
|---|---|
| Chrome | 110+ |
| Firefox | 110+ |
| Safari | 16+ |
| Edge | 110+ |
| Mobile Safari | iOS 16+ |
| Chrome Android | 110+ |

IE 11, Opera Mini, and any browser older than 24 months are not supported.

### 5.2 Device Support

- Desktop: 1280x800 minimum
- Tablet: 768x1024, responsive layout
- Mobile: 375x667 minimum, customer widget optimized; agent dashboard read-only on mobile

### 5.3 Runtime

- Node.js 20 LTS
- PostgreSQL 15+
- Redis 7+
- pnpm 9+

### 5.4 Network

- TLS 1.3 required for all client connections
- HTTP/2 enabled at edge
- IPv4 and IPv6 dual-stack

### 5.5 Browser Storage Limits

- LocalStorage: 5 MB per origin (used for user prefs, drafts)
- IndexedDB: 50 MB per origin (used for offline chat draft)
- Cookies: SameSite=Lax by default; SameSite=None for third-party widget

---

## 6. Data Requirements

### 6.1 Data Retention

| Data Class | Retention | Justification |
|---|---|---|
| Conversation messages | 2 years | Customer support history, dispute resolution |
| Customer PII | Account lifetime + 30 days | GDPR right to erasure |
| Audit logs | 7 years | HIPAA, SOX compliance |
| Billing records | 7 years | Tax compliance, IRS |
| Bot training data (RAG sources) | Account lifetime | Required for live AI |
| Aggregated analytics | Indefinite | Anonymized, no PII |
| Error logs | 90 days | Operational debugging |

### 6.2 Data Classification

| Class | Examples | Controls |
|---|---|---|
| Public | Marketing site, pricing | None |
| Internal | Aggregated dashboards | Auth required |
| Confidential | Customer messages, PII | Encryption at rest + in transit, RBAC |
| Regulated (PHI) | Health records in messages | HIPAA controls, BAA required |

### 6.3 Data Backup

- Daily automated Postgres backup to R2 (encrypted)
- 30-day rolling backup retention
- Point-in-time recovery enabled (WAL archiving)
- Backup restore tested quarterly

### 6.4 Data Localization

- EU customer data stays in EU (Supabase EU region + R2 EU bucket)
- US customer data in US (default)
- Customer selects region at signup; cannot change later

---

## 7. Use Cases

### 7.1 UC-1: New Customer Onboards and Asks First Question

| Field | Detail |
|---|---|
| Actor | Dr. Anjali Rao (Practice Admin) |
| Precondition | Anjali has not used Neo Support AI before |
| Trigger | Marketing email link to /signup |
| Main Flow | 1. Anjali clicks signup link. 2. Submits email, password, org name. 3. Clicks verification link. 4. Lands on dashboard. 5. Adds a knowledge source URL. 6. Waits for "ready" status. 7. Opens test chat. 8. Asks "What are your hours?" 9. Bot answers with citations. |
| Alt Flow A | Knowledge scrape fails -> Anjali sees error, retries with smaller URL scope. |
| Alt Flow B | Bot confidence low -> Routes to "Create ticket" instead. |
| Postcondition | First conversation logged; metrics begin accumulating. |

### 7.2 UC-2: Agent Handles Incoming Conversation

| Field | Detail |
|---|---|
| Actor | Marco Silva (Support Agent) |
| Precondition | Marco is logged in, has Agent role |
| Trigger | WebSocket push: new conversation assigned |
| Main Flow | 1. Marco sees inbox badge +1. 2. Opens conversation. 3. Reads customer message + bot context. 4. Reads internal note from bot. 5. Sends reply via canned response. 6. Customer receives response on WhatsApp. 7. Marco marks conversation "Resolved". |
| Alt Flow | Customer asks for human -> conversation reassigned to Marco; bot context shown. |
| Postcondition | Conversation status updated; analytics counter incremented. |

### 7.3 UC-3: Manager Adds New Knowledge Source

| Field | Detail |
|---|---|
| Actor | Vikram Mehta (Support Manager) |
| Precondition | Vikram has Manager role |
| Trigger | Weekly review identifies knowledge gap |
| Main Flow | 1. Vikram opens Knowledge tab. 2. Clicks "Add Source". 3. Pastes URL. 4. Sets crawl depth = 3. 5. Submits. 6. Sees progress bar. 7. Status updates to "Ready" with chunk count. 8. Tests sample query. 9. Publishes to bot. |
| Alt Flow | Source too large -> Vikram limits to 50 pages or uses manual FAQ instead. |
| Postcondition | New chunks indexed; bot can answer new question types. |

### 7.4 UC-4: Customer Upgrades Plan

| Field | Detail |
|---|---|
| Actor | Dr. Anjali Rao |
| Precondition | On Starter plan, approaching conversation limit |
| Trigger | Email notification at 80% usage |
| Main Flow | 1. Anjali clicks "Upgrade" in email. 2. Lands on Stripe Checkout with Pro plan. 3. Enters payment details. 4. Confirms. 5. Webhook fires to update DB. 6. Anjali returns to app, sees new limits. |
| Alt Flow | Payment fails -> Anjali sees banner, retries via Customer Portal. |
| Postcondition | Plan upgraded; access enabled; invoice emailed. |

### 7.5 UC-5: Compliance Audit Review

| Field | Detail |
|---|---|
| Actor | External Auditor |
| Precondition | Auditor has read-only access via Owner invitation with Viewer role |
| Trigger | Quarterly compliance review |
| Main Flow | 1. Auditor logs in. 2. Opens Audit Log tab. 3. Filters by action type (auth, settings). 4. Exports CSV. 5. Reviews entries. |
| Alt Flow | Auditor requests additional data -> Owner generates one-time report. |
| Postcondition | Audit log reviewed; no system state changed. |

---

## 8. Acceptance Criteria (Aggregate)

The MVP is considered complete when:

- All FR-1 through FR-20 acceptance criteria pass automated tests
- Performance: p95 API <500ms over 24h soak test
- Availability: 99.9% over 30-day window
- Security: External penetration test reports zero critical findings
- Accessibility: WCAG 2.1 AA verified via axe + manual NVDA test
- Coverage: 80% on `apps/api` business logic

---

**Last updated:** 2026-06-23
