#!/usr/bin/env bash
# devcontainer 起動前にホスト側で実行される（initializeCommand）。
# appdata/register のビルド元として対向サーバ reception-server を取得する。
set -euo pipefail

REPO_URL="https://github.com/RTAinJapan/reception-server.git"
DIR="$(cd "$(dirname "$0")" && pwd)/.cache/reception-server"

if [ -d "$DIR/.git" ]; then
  echo "[clone-server] reception-server is already present. Pulling latest..."
  git -C "$DIR" pull --ff-only || echo "[clone-server] pull skipped (continuing with existing copy)"
else
  echo "[clone-server] Cloning reception-server into $DIR ..."
  git clone --depth 1 "$REPO_URL" "$DIR"
fi
