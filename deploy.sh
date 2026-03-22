#!/bin/bash
set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_NAME="snooker-rankings"

export CLOUDFLARE_API_TOKEN="cfut_y3hzseKdVvubVCYloM4EmDuw58UKSeTXdrGpFJm28b351d69"
export CLOUDFLARE_ACCOUNT_ID="ee944530b70ebfe1e3824c41ee82afc2"

echo "[deploy] 开始构建 $PROJECT_NAME ..."
cd "$PROJECT_DIR"

echo "[deploy] 安装依赖..."
npm install --legacy-peer-deps --silent

echo "[deploy] OpenNext 构建..."
./node_modules/.bin/opennextjs-cloudflare build

echo "[deploy] 部署到 Cloudflare Pages..."
wrangler pages deploy .open-next/assets \
  --project-name="$PROJECT_NAME" \
  --commit-dirty=true

echo "[deploy] 完成！"
