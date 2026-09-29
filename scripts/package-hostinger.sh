#!/usr/bin/env bash
set -e

echo "=================================================="
echo "📦 Packaging Research Publishing OS for Hostinger"
echo "=================================================="

# 1. Ensure build is fresh
echo "1. Compiling packages, services, and Next.js..."
pnpm build

# 2. Copy Next.js public & static files into web standalone folder
echo "2. Preparing Next.js standalone assets..."
mkdir -p apps/web/.next/standalone/apps/web/.next
cp -r apps/web/.next/static apps/web/.next/standalone/apps/web/.next/ 2>/dev/null || true
cp -r apps/web/public apps/web/.next/standalone/apps/web/ 2>/dev/null || true

# 3. Create deployment archive
BUNDLE_NAME="rpos-hostinger-deploy.zip"
echo "3. Creating $BUNDLE_NAME..."

# Remove old bundle if exists
rm -f "$BUNDLE_NAME"

zip -q -r "$BUNDLE_NAME" \
  server.js \
  package.json \
  pnpm-lock.yaml \
  pnpm-workspace.yaml \
  turbo.json \
  scripts/hostinger-server.mjs \
  packages/*/package.json \
  packages/*/dist \
  packages/database/prisma \
  services/*/package.json \
  services/*/dist \
  apps/web/package.json \
  apps/web/.next \
  apps/web/public \
  apps/web/next.config.ts \
  -x "*.git*" "*/node_modules/*" "*test*" "*.log"

echo "=================================================="
echo "✅ Packaging complete: $BUNDLE_NAME"
echo "👉 You can upload this zip file directly to your"
echo "   Hostinger hPanel File Manager (in public_html)!"
echo "=================================================="
