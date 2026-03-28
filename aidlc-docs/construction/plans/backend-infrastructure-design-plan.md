# Infrastructure Design Plan — Unit 1: backend

## 実行チェックリスト

- [x] Step 1: 設計成果物の分析
- [x] Step 2: インフラ設計プラン作成
- [x] Step 3: 質問収集（Q1: Supabase Tokyo / Q2: Cloud Build）
- [x] Step 4: プラン保存
- [x] Step 5: 回答確認（曖昧さなし）
- [x] Step 6: インフラ設計アーティファクト生成
- [x] Step 7: 完了メッセージ・承認取得

## インフラ決定サマリー

| コンポーネント | サービス | リージョン |
|---|---|---|
| バックエンド API | Google Cloud Run | asia-northeast1（東京） |
| AI 推論 | Vertex AI（Gemini） | asia-northeast1（東京） |
| DB / Auth / Realtime | Supabase | ap-northeast-1（東京） |
| ファイルストレージ | Supabase Storage | ap-northeast-1（東京） |
| フロントエンド | Vercel | Edge（自動） |
| コンテナレジストリ | Artifact Registry | asia-northeast1（東京） |
| CI/CD | Cloud Build | asia-northeast1（東京） |
| シークレット管理 | Secret Manager | asia-northeast1（東京） |
