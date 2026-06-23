#!/usr/bin/env bash
set -e
echo "==> Resetting database"
pnpm db:reset
echo "==> Re-seeding"
pnpm db:seed
echo "==> Done"
