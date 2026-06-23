# Neo Support AI — Deployment Guide (DEPLOY)

**Version:** 1.0
**Audience:** Engineers, SRE, DevOps
**Last updated:** 2026-06-23

---

## 1. Architecture Recap

| Component | Host | Notes |
|---|---|---|
| Web (Next.js 15) | Vercel | Edge SSR + static |
| API (NestJS 10) | Fly.io | Multi-region, sticky WS |
| Worker (Python 3.12) | Fly.io | BullMQ consumer |
| Database | Supabase | Postgres 15 + pgvector |
| Cache/Queue | Upstash Redis | REST + TCP |
| Storage | Cloudflare R2 | S3-compatible |
| Email | Resend | Transactional |
| Billing | Stripe | Subscriptions |
| WhatsApp | Meta Cloud | Embedded signup |

---

## 2. Local Development Setup

### 2.1 Prerequisites

| Tool | Version |
|---|---|
| Node.js | 20 LTS |
| pnpm | 9+ |
| Python | 3.12+ |
| Docker | 24+ |
| Postgres | 15+ (via Docker) |
| Redis | 7+ (via Docker) |
| Git | 2.40+ |

### 2.2 Initial Setup

```bash
# Clone repo
git clone https://github.com/neo-perion/neo-support-ai.git
cd neo-support-ai

# Install Node deps
pnpm install

# Install Python deps for worker
cd apps/worker
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cd ../..

# Start local services
docker compose up -d postgres redis

# Copy env files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp apps/worker/.env.example apps/worker/.env

# Generate secrets
openssl rand -hex 32  # JWT secret
openssl rand -hex 32  # JWT refresh secret

# Run migrations
pnpm --filter @neo/api db:migrate

# Seed dev data
pnpm --filter @neo/api db:seed

# Start all apps
pnpm dev
```

### 2.3 URLs After `pnpm dev`

| Service | URL |
|---|---|
| Web (Next.js) | http://localhost:3000 |
| API (NestJS) | http://localhost:4000 |
| API docs (Swagger) | http://localhost:4000/docs |
| Worker logs | terminal stdout |
| Postgres | localhost:5432 |
| Redis | localhost:6379 |

### 2.4 Common Dev Commands

```bash
# Run tests
pnpm test                    # All
pnpm --filter @neo/api test  # API only

# Lint
pnpm lint

# Type-check
pnpm typecheck

# Reset DB
pnpm --filter @neo/api db:reset

# Open Prisma Studio
pnpm --filter @neo/api db:studio

# Format
pnpm format
```

---

## 3. Environment Variables Reference

### 3.1 Shared

| Variable | Description | Default | Example |
|---|---|---|---|
| `NODE_ENV` | Runtime mode | `development` | `production` |
| `LOG_LEVEL` | Pino log level | `info` | `debug` |
| `SENTRY_DSN` | Error tracking | (empty in dev) | `https://...@sentry.io/...` |
| `DATADOG_API_KEY` | Metrics API key | (empty) | `...` |

### 3.2 apps/api

| Variable | Description | Default | Example |
|---|---|---|---|
| `PORT` | HTTP port | `4000` | `8080` |
| `DATABASE_URL` | Postgres connection | `postgresql://postgres:postgres@localhost:5432/neo` | Supabase pooler URL |
| `DIRECT_URL` | Direct PG (migrations) | same | Supabase direct |
| `REDIS_URL` | Redis URL | `redis://localhost:6379` | Upstash URL |
| `JWT_ACCESS_SECRET` | RS256 private key | (required) | (PEM) |
| `JWT_ACCESS_PUBLIC_KEY` | RS256 public key | (required) | (PEM) |
| `JWT_REFRESH_SECRET` | HMAC for refresh | (required) | (hex) |
| `ACCESS_TOKEN_TTL` | Access TTL | `900` | `900` (15m) |
| `REFRESH_TOKEN_TTL` | Refresh TTL | `2592000` | `2592000` (30d) |
| `GEMINI_API_KEY` | Google AI key | (required in prod) | `AIza...` |
| `GEMINI_MODEL` | Model name | `gemini-2.5-flash` | `gemini-2.5-pro` |
| `STRIPE_SECRET_KEY` | Stripe API | (required in prod) | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing | (required in prod) | `whsec_...` |
| `STRIPE_PRICE_STARTER` | Starter plan price | `price_...` | `price_1ABC...` |
| `STRIPE_PRICE_PRO` | Pro plan price | `price_...` | `price_1DEF...` |
| `META_APP_ID` | WhatsApp app | (required in prod) | `1234567890` |
| `META_APP_SECRET` | WhatsApp secret | (required in prod) | `...` |
| `META_WEBHOOK_VERIFY_TOKEN` | Verification | `random-string` | `verify_token_xyz` |
| `R2_ACCOUNT_ID` | R2 account | (required in prod) | `...` |
| `R2_ACCESS_KEY_ID` | R2 key | (required in prod) | `...` |
| `R2_SECRET_ACCESS_KEY` | R2 secret | (required in prod) | `...` |
| `R2_BUCKET_UPLOADS` | Uploads bucket | `neo-support-uploads` | `neo-prod-uploads` |
| `R2_BUCKET_EXPORTS` | Exports bucket | `neo-support-exports` | `neo-prod-exports` |
| `RESEND_API_KEY` | Email API | (required in prod) | `re_...` |
| `CORS_ORIGINS` | Allowed origins | `http://localhost:3000` | `https://app.neo-support.ai` |
| `WIDGET_CSP_ORIGINS` | Widget CSP allowlist | `*` | `https://anjali-clinic.com` |
| `RATE_LIMIT_DEFAULT` | Default rate | `100` | `100` |

### 3.3 apps/web

| Variable | Description | Default | Example |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | API base URL | `http://localhost:4000` | `https://api.neo-support.ai` |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL | `ws://localhost:4000` | `wss://api.neo-support.ai` |
| `NEXT_PUBLIC_APP_URL` | App URL | `http://localhost:3000` | `https://app.neo-support.ai` |
| `NEXTAUTH_SECRET` | NextAuth | (required) | (hex) |

### 3.4 apps/worker

| Variable | Description | Default | Example |
|---|---|---|---|
| `DATABASE_URL` | Same as API | (required) | |
| `REDIS_URL` | Same as API | (required) | |
| `GEMINI_API_KEY` | For embeddings | (required) | |
| `EMBEDDING_MODEL` | Embedding model | `text-embedding-004` | |
| `SCRAPE_MAX_PAGES` | URL crawl limit | `500` | |
| `SCRAPE_MAX_DEPTH` | Crawl depth | `4` | |
| `CHUNK_SIZE_TOKENS` | Chunk size | `600` | |
| `CHUNK_OVERLAP_TOKENS` | Chunk overlap | `100` | |
| `R2_*` | Same as API | | |

---

## 4. Production Deployment

### 4.1 Deploy Order

1. Database (Supabase)
2. Object storage (R2)
3. Secrets manager / Doppler
4. API + Worker (Fly.io)
5. Web (Vercel)
6. DNS / SSL
7. Monitoring

### 4.2 Database: Supabase

```bash
# Install CLI
brew install supabase/tap/supabase

# Login
supabase login

# Link to project
supabase link --project-ref <ref>

# Push migrations
supabase db push

# Enable extensions
psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS vector;"
psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS uuid-ossp;"
psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"
psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"
psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS citext;"

# Enable RLS on critical tables
psql $DATABASE_URL -c "ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;"
psql $DATABASE_URL -c "ALTER TABLE messages ENABLE ROW LEVEL SECURITY;"
# ... etc.
```

**Free tier limits:**

| Resource | Limit |
|---|---|
| Database size | 500 MB |
| Bandwidth | 5 GB |
| Direct connections | 60 (pooled 200) |
| Pause after | 7 days inactivity |

For production: Supabase Pro plan at $25/month.

### 4.3 Object Storage: Cloudflare R2

```bash
# Create buckets via Wrangler
npx wrangler r2 bucket create neo-support-uploads
npx wrangler r2 bucket create neo-support-exports

# Create API token
# (via Cloudflare dashboard -> R2 -> Manage R2 API Tokens)
# Save access key + secret in Doppler
```

**Free tier limits:**

| Resource | Limit |
|---|---|
| Storage | 10 GB-month |
| Class A ops | 1M/month |
| Class B ops | 10M/month |
| Egress | FREE |

### 4.4 Secrets: Doppler

```bash
# Install
brew install dopplerhq/cli/doppler

# Login
doppler login

# Setup project
doppler projects create neo-support-ai
doppler setup

# Set secrets
doppler secrets set JWT_ACCESS_SECRET="$(cat jwt_private.pem)"
doppler secrets set STRIPE_SECRET_KEY="sk_live_..."
# ... etc
```

### 4.5 API + Worker: Fly.io

```bash
# Install
brew install flyctl

# Login
fly auth login

# Create app
fly apps create neo-support-api
fly apps create neo-support-worker

# Set secrets (sync from Doppler)
doppler secrets download --no-file | fly secrets import

# First deploy
fly deploy --config infra/fly.api.toml
fly deploy --config infra/fly.worker.toml

# Scale
fly scale count 3 --region sin,iad,fra
fly scale vm shared-cpu-1x --memory 1024

# Regions
fly regions add sin iad fra
```

**Free tier limits:**

| Resource | Allowance |
|---|---|
| Shared-cpu-1x VMs | 3 (full allowances) |
| Outbound data | 160 GB/month |
| SSL | Included |
| IPv6 | Included |

For production: scale to dedicated-cpu-1x at $5-15/month per instance.

### 4.6 Web: Vercel

```bash
# Install
npm i -g vercel

# Login
vercel login

# Link
vercel link

# Set env vars
vercel env add NEXT_PUBLIC_API_URL production
# ... etc

# Deploy
vercel --prod
```

**Free tier (Hobby):**

| Resource | Limit |
|---|---|
| Bandwidth | 100 GB |
| Build minutes | 6,000/month |
| Serverless executions | 100 GB-hours |
| Edge functions | 500K invocations |

For production: Vercel Pro at $20/month per seat.

---

## 5. CI/CD with GitHub Actions

### 5.1 Workflows

| Workflow | Trigger | Steps |
|---|---|---|
| `ci.yml` | Pull request | Lint, typecheck, unit tests, e2e tests |
| `deploy-staging.yml` | Push to main | Build, deploy to staging, smoke tests |
| `deploy-prod.yml` | Tag v*.*.* | Build, deploy to prod, smoke tests |
| `db-migrate.yml` | Manual dispatch | Apply migrations to staging/prod |

### 5.2 Required Secrets

```
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
FLY_API_TOKEN
SUPABASE_ACCESS_TOKEN
SUPABASE_PROJECT_ID
DOPPLER_TOKEN
SENTRY_AUTH_TOKEN
```

### 5.3 Example deploy-prod.yml

```yaml
name: Deploy Production
on:
  push:
    tags: ['v*.*.*']
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --config infra/fly.api.toml --strategy bluegreen
      - run: flyctl deploy --config infra/fly.worker.toml --strategy bluegreen
      - uses: actions/checkout@v4
      - run: vercel deploy --prod --token=${{ secrets.VERCEL_TOKEN }}
      - run: ./scripts/smoke-prod.sh
```

---

## 6. SSL/TLS Setup

### 6.1 Fly.io

Automatic via Fly.io edge. Wildcard cert `*.neo-support.app` provisioned.

```toml
# fly.toml
[[services.tls]]
  ports = [443]
  handlers = ["http"]
  http_redirect = true
```

### 6.2 Vercel

Automatic. Custom domain added via dashboard or:

```bash
vercel domains add app.neo-support.ai
```

### 6.3 Custom Domains

DNS records:

```
app.neo-support.ai     CNAME  cname.vercel-dns.com
api.neo-support.ai     A      66.241.124.0 (Fly.io IP)
```

HSTS preload:

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

---

## 7. Monitoring and Alerting

### 7.1 Sentry (Error Tracking)

```typescript
// apps/api/src/main.ts
import * as Sentry from "@sentry/nestjs";
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

### 7.2 Datadog (Metrics + APM)

```typescript
import tracer from "dd-trace";
tracer.init({
  service: "neo-api",
  env: process.env.NODE_ENV,
});
```

### 7.3 BetterStack (Logs)

```typescript
import pino from "pino";
const transport = pino.transport({
  target: "@logtail/pino",
  options: { sourceToken: process.env.LOGTAIL_TOKEN },
});
```

### 7.4 Alerts

| Alert | Source | Condition |
|---|---|---|
| API error rate > 1% | Datadog | 5-min window |
| API p95 > 2s | Datadog | 10-min window |
| Queue lag > 5 min | Datadog | BullMQ metric |
| Worker down | BetterStack | Heartbeat |
| DB connections > 80% | Supabase | Built-in |
| Gemini errors > 5% | Custom metric | 5-min window |

---

## 8. Backup Strategy

### 8.1 Automated

| Type | Frequency | Retention | Tool |
|---|---|---|---|
| DB snapshot | Daily 02:00 UTC | 30 days | Supabase |
| WAL archive | Continuous | 7 days | Supabase |
| R2 lifecycle | Auto | 90 days | R2 rule |
| Code | Continuous | Forever | GitHub |

### 8.2 Manual Procedure

```bash
# Trigger manual backup
supabase db dump --project-ref <ref> > backup-$(date +%Y%m%d).sql

# Encrypt and upload to R2
gpg --symmetric --cipher-algo AES256 backup-20260623.sql
aws s3 cp backup-20260623.sql.gpg s3://neo-backups/manual/
```

### 8.3 Restore

See `docs/SCHEMA.md` section 6.2.

---

## 9. Scaling Playbook

### 9.1 Triggers

| Symptom | Action |
|---|---|
| API CPU > 70% | Scale API to +1 instance |
| Queue lag > 2 min | Scale workers +2 |
| DB CPU > 60% | Investigate queries; add index; read replica |
| Redis memory > 75% | Cluster mode |
| WS connection drop | Check Fly.io instance health |
| R2 throttling | Verify burst allowance |

### 9.2 Procedure

```bash
# Scale API
fly scale count +1 --region iad

# Scale worker
fly scale count +2 --region iad --app neo-support-worker

# Verify
fly status
fly logs

# Add DB read replica
supabase branches create v2-read-replica
```

### 9.3 Cost Projections

| Scale | Users | API | Workers | DB | Monthly |
|---|---|---|---|---|---|
| Free tier | < 100 | 1 shared | 1 shared | Supabase free | $0 |
| Starter | < 1,000 | 1 shared-cpu-1x | 1 shared | Supabase Pro | $80 |
| Growth | < 10,000 | 3 dedicated-cpu-1x | 3 shared | Supabase Pro + replica | $400 |
| Scale | < 50,000 | 6 dedicated + autoscale | 8 dedicated | Supabase Team + multi-region | $1,800 |
| Enterprise | 50,000+ | Custom | Custom | Custom | $5,000+ |

---

## 10. Rollback Procedures

### 10.1 API / Worker

```bash
# View history
fly releases --app neo-support-api

# Rollback to previous
fly releases rollback --app neo-support-api

# Rollback to specific version
fly releases rollback v123 --app neo-support-api
```

### 10.2 Web

```bash
vercel rollback
```

### 10.3 Database

```bash
# Restore from snapshot (creates new project)
supabase db restore --target-project neo-restore-<timestamp>

# For in-place revert: apply down migration
psql $DATABASE_URL -f infra/supabase/migrations/<timestamp>_revert.sql
```

### 10.4 Feature Flags

For risky features, use Unleash or custom flag system:

```typescript
if (await flags.isEnabled("new-rag-pipeline", { orgId })) {
  return newPipeline(query);
}
return legacyPipeline(query);
```

This allows disabling features without redeploying.

---

## 11. Post-Launch Checklist

- [ ] All env vars set in production
- [ ] Database migrations applied
- [ ] Extensions enabled
- [ ] RLS policies installed
- [ ] Backups tested (manual restore drill)
- [ ] SSL certs valid (check at sslabs.com)
- [ ] Custom domain live with HSTS
- [ ] DNS propagated globally (check at dnschecker.org)
- [ ] Stripe webhook receiving events (test in dashboard)
- [ ] WhatsApp webhook verified (Meta dashboard)
- [ ] Resend sending email (test signup)
- [ ] R2 buckets created and writable
- [ ] Health check endpoint returns 200
- [ ] Monitoring dashboards live
- [ ] Alerts configured with PagerDuty
- [ ] Error tracking (Sentry) receiving events
- [ ] Log aggregation (BetterStack) receiving events
- [ ] Load test passed (k6 1,000 RPS for 5 min)
- [ ] Status page (status.neo-support.ai) live
- [ ] Privacy policy + Terms of Service published
- [ ] Cookie consent banner live
- [ ] GDPR data export tested
- [ ] GDPR data erasure tested
- [ ] Backup restore drill completed

---

## 12. Cost Projections

### 12.1 Free Tier (0-100 customers)

| Service | Plan | Cost/month |
|---|---|---|
| Vercel | Hobby | $0 |
| Fly.io | Free allowance | $0 |
| Supabase | Free | $0 |
| Upstash Redis | Free | $0 |
| R2 | Free allowance | $0 |
| Resend | Free | $0 |
| Sentry | Developer | $0 |
| **Total** | | **$0** |

### 12.2 Starter Tier (100-1,000 customers)

| Service | Plan | Cost/month |
|---|---|---|
| Vercel | Pro | $20 |
| Fly.io | Pay-as-you-go | $40 |
| Supabase | Pro | $25 |
| Upstash Redis | Pay-as-you-go | $15 |
| R2 | Pay-as-you-go | $10 |
| Resend | Pro | $20 |
| Datadog | Pro | $35 |
| Sentry | Team | $26 |
| **Total** | | **~$191** |

### 12.3 Growth Tier (1,000-10,000 customers)

| Service | Plan | Cost/month |
|---|---|---|
| Vercel | Pro | $20 |
| Fly.io | Launch plan | $200 |
| Supabase | Pro + replicas | $225 |
| Upstash Redis | Pro | $80 |
| R2 | Pay-as-you-go | $60 |
| Resend | Scale | $90 |
| Datadog | Pro + APM | $310 |
| Sentry | Business | $80 |
| **Total** | | **~$1,065** |

### 12.4 Revenue vs. Cost

At 1,000 paying customers averaging $147/month = $147K MRR / $1.76M ARR.

- Free tier: 100 customers × $0 = $0
- Starter: 600 customers × $49 = $29,400
- Pro: 280 customers × $199 = $55,720
- Enterprise: 20 customers × custom (avg $500) = $10,000

**Total MRR: ~$95,120** — well above infrastructure costs at any tier.

---

**Last updated:** 2026-06-23
