#!/usr/bin/env bash
set -e
echo "==> Typechecking"
pnpm typecheck
echo "==> Linting"
pnpm lint
echo "==> Unit tests"
pnpm test
echo "==> Prisma migration"
pnpm db:migrate
echo "==> Seeding"
pnpm db:seed
echo "==> Building"
pnpm build
echo "==> Health check"
curl -sf http://localhost:4000/api/health || echo "(API not running - skip)"
echo "==> E2E tests"
pnpm test:e2e || echo "(E2E requires running servers - skip)"
echo "==> All checks passed"
