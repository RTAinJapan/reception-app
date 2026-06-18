# 開発用 devcontainer

reception-app のフロントエンド開発を、**実環境の API サーバーなしで**完結させるための設定です。
対向サーバ [RTAinJapan/reception-server](https://github.com/RTAinJapan/reception-server) を
ローカルに立ち上げ、フロントはそこに向けて動きます。

## 構成（docker-compose）

| サービス | 役割 | ポート(host) |
| --- | --- | --- |
| `app` | reception-app の開発コンテナ（VS Code がアタッチ） | 8080 (Vite) |
| `appdata` | データ取得＋受付登録（フロントが叩く本体）。`GET /visitor /badgeholder /accepted`, `POST /accepted` | 13001 |
| `db` | PostgREST（reception-server が参照する "db"）。本番は AWS RDS だがローカルは下の postgres を見る | - |
| `postgres` | 共有DB本体。初回に `db/init/*.sql` でスキーマ＋サンプルデータ投入 | - |
| `register` | 名簿登録＋メール送信。フロントは直接使わないため既定では起動しない（`profile: full`） | 13000 |

> reception-server の `appdata` / `register` は `.devcontainer/.cache/reception-server`（devcontainer 起動前に自動 clone）からビルドします。**初回ビルドはインターネット接続が必要**です。

## 使い方

1. VS Code で「Reopen in Container」。初回は clone＋イメージビルドで数分かかります。
2. コンテナ内で開発サーバを起動：
   ```
   npm run dev
   ```
3. ホストのブラウザで http://localhost:8080 を開く。
   - `npm run dev` がホストから繋がらない場合は `npm run start:remote`（0.0.0.0 で待受）を使う。

`postCreateCommand` が `npm ci` と、ローカル用 `public/config.json` の生成を行います。
この config は API をローカル `appdata`（13001）に向け、**Discord 認証をスキップ**（`discord.enable=false`）します。

## サンプルデータ / DB

- `db/init/00-schema.sql`：`receptiondb` スキーマと `visitor` / `badgeholder` / `accepted` テーブル
  （reception-server の `sql/01.table.sql` 相当＋`CREATE SCHEMA`）。
- `db/init/10-seed.sql`：サンプルの観客・名札持ち（QRの値は `CODE001` など）。
- 受付（`POST /accepted`）したデータは `postgres` のボリュームに残ります。
  **DBを初期状態へ戻す**には：
  ```
  docker compose -f .devcontainer/docker-compose.yml down -v
  ```

## register も動かしたい場合（任意）

フロント開発には不要ですが、名簿登録/メールの機能部も起動できます：
```
docker compose -f .devcontainer/docker-compose.yml --profile full up -d register
```
`AWS_*` はダミーです。実際のメール送信を試す場合のみ本物の値を設定してください。

## QR の動作確認

シードの `code`（`CODE001` 等）を QR 画像化して読み取ると受付できます。
ブラウザのカメラが無い/許可できない環境では、`入場者リスト` タブでデータ取得が動いていることを確認できます。
