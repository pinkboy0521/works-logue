# NFR Design Plan — Unit 1: backend

## 実行チェックリスト

- [x] Step 1: NFR Requirements 分析
- [x] Step 2: NFR Design Plan 作成
- [x] Step 3: 質問収集（Q1: BackgroundTask方式 → A: FastAPI組み込み）
- [x] Step 4: プラン保存
- [x] Step 5: 回答確認（曖昧さなし）
- [x] Step 6: NFR Design アーティファクト生成
- [x] Step 7: 完了メッセージ・承認取得

## 設計方針サマリー

| NFR | 採用パターン |
|---|---|
| Vertex AI 同時呼び出し制御 | asyncio.Semaphore（上限 VERTEX_AI_MAX_CONCURRENT=5） |
| Louge 生成リトライ | tenacity（指数バックオフ、最大3回） |
| Vertex AI タイムアウト | asyncio.wait_for（flash: 8s / pro: 120s） |
| BackgroundTask | FastAPI 組み込み BackgroundTasks + Cloud Run timeout 300s |
| JWT 検証 | FastAPI Depends + PyJWT オフライン検証 |
| 設定管理 | pydantic-settings BaseSettings |
| 構造化ログ | python-json-logger（JSON stdout → Cloud Logging） |
| テスト | pytest-asyncio + pytest-mock（AI モック） |
