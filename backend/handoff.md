# Handoff

## タスク
CR-03・ME-05 のルート順序修正（FastAPI profiles.py の GET /me、seeds.py の POST /cleanse をパラメータルートより前に移動する）

## 変更ファイル
- backend/app/routers/profiles.py: GET /me、PATCH /me、PUT /me/tags を GET /{username} より前に移動
- backend/app/routers/seeds.py: POST /cleanse を GET /{seed_id} より前（GET "" の直後）に移動

## 変更内容
- profiles.py: ルート定義順序を変更。旧順序は GET /{username} → PATCH /me → GET /me → PUT /me/tags。新順序は GET /me → PATCH /me → PUT /me/tags → GET /{username}
- seeds.py: ルート定義順序を変更。旧順序は GET "" → GET /{seed_id} → POST "" → PATCH /{seed_id} → POST /cleanse。新順序は GET "" → POST /cleanse → GET /{seed_id} → POST "" → PATCH /{seed_id}
- 動作ロジック・コメント・型・依存関係は一切変更していない

## 注意事項
- profiles.py: GET /me が GET /{username} より前に定義されていることを確認すること（username="me" でパラメータルートにマッチするバグの修正）
- seeds.py: POST /cleanse が GET /{seed_id} より前に定義されていることを確認すること（seed_id="cleanse" でパラメータルートにマッチするバグの修正）
- PATCH /me は元のファイルで既に GET /{username} の後・GET /me の前に定義されていたが、今回の修正で GET /me・PATCH /me・PUT /me/tags の 3 ルートをまとめてパラメータルートより前に移動している
