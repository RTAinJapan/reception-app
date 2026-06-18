#!/usr/bin/env bash
# devcontainer 作成後にコンテナ内で実行される（postCreateCommand）。
set -euo pipefail

echo "[post-create] Installing dependencies (npm ci)..."
npm ci

# ローカル開発用 config.json（API をローカル appdata へ向け、Discord 認証をスキップ）。
# public/ に置くと vite/dev サーバが /config.json として配信する。config.json は .gitignore 済み。
if [ ! -f public/config.json ]; then
  cp .devcontainer/config.dev.json public/config.json
  echo "[post-create] Created public/config.json (local dev: appdata + discord.enable=false)"
else
  echo "[post-create] public/config.json already exists; left as-is"
fi

echo "[post-create] Done. Run 'npm run dev' and open http://localhost:8080"
