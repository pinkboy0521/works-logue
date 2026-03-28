# NFR Requirements Plan — Unit 1: backend

## 計画概要
Functional Design（GrowthEngine / AIService / ScoreEngine / NotificationService / ForkService）の分析に基づき、
非機能要件（NFR）とテックスタック決定に必要な情報を収集する。

## 実行チェックリスト

- [x] Step 1: Functional Design 分析（完了）
- [x] Step 2: NFR 質問リスト作成（本ファイル）
- [x] Step 3: ユーザー回答収集
- [x] Step 4: 回答の曖昧性チェック・追加質問（全回答明確、追加質問なし）
- [x] Step 5: NFR 要件アーティファクト生成
- [x] Step 6: テックスタック決定ドキュメント生成
- [ ] Step 7: 完了メッセージ提示・承認取得

---

## NFR 質問リスト

### 【スケーラビリティ】

**Q1. Phase 1 の想定ユーザー規模**
GrowthEngine の near_bloom 通知は Phase 1 では「全登録ユーザー」に送信されます。
想定する最大同時接続ユーザー数と登録ユーザー総数を教えてください。

A) 小規模MVP（〜100ユーザー、同時接続10名以下）
B) 中規模（〜1,000ユーザー、同時接続100名以下）
C) 大規模（〜10,000ユーザー以上、同時接続1,000名以上）
D) 未定／できるだけスモールスタート

[Answer]:A

---

**Q2. Log 投稿頻度の想定**
Log POST のたびに Vertex AI 軽量チェック（同期）が走ります。
アクティブな Seed への同時 Log 投稿のピーク頻度はどの程度を想定しますか？

A) 低頻度（1 Seed に対し 1〜5 Log/日）
B) 中頻度（1 Seed に対し 10〜50 Log/日）
C) 高頻度（1 Seed に対し 100 Log/日以上）
D) 未定

[Answer]:B

---

### 【パフォーマンス】

**Q3. Log POST API のレスポンスタイム目標**
Log POST は同期で Vertex AI 軽量チェックを実行します。
ユーザーが許容できるレスポンスタイム（P95）はどの程度ですか？

A) 厳格（2秒以内）
B) 標準（5秒以内）
C) 緩やか（10秒以内）
D) 特に要件なし

[Answer]:B

---

**Q4. Louge 生成 BackgroundTask の完了時間目標**
Louge 生成（Vertex AI Gemini 呼び出し + DB 更新）は非同期 BackgroundTask で実行されます。
生成完了通知までの目標時間を教えてください。

A) 高速（30秒以内）
B) 標準（2〜5分以内）
C) 緩やか（10〜30分以内）
D) 特に要件なし（完了すれば問題なし）

[Answer]:D

---

### 【可用性・信頼性】

**Q5. ターゲット稼働率**
Vercel（フロントエンド）+ Supabase（DB / Auth / Realtime）+ Vertex AI 構成での
目標サービス稼働率を教えてください。

A) 99.9%（月間ダウンタイム 43 分以内）
B) 99%（月間ダウンタイム 7.2 時間以内）
C) ベストエフォート（Phase 1 は特に設定しない）
D) その他（具体的に記入）

[Answer]:C

---

**Q6. Vertex AI 呼び出し失敗時の許容ポリシー**
現在の設計では:
- 軽量チェック失敗 → 前回値維持（更新スキップ）
- Louge 生成失敗 → 最大3回リトライ（指数バックオフ）

この方針でよいですか？または要件として変更したい点はありますか？

A) そのままでよい（設計通り）
B) リトライ回数を変更したい（回数:　　）
C) 失敗時にアラートや管理者通知が必要
D) その他の変更（具体的に記入）

[Answer]:A

---

### 【セキュリティ】

**Q7. Supabase Row Level Security（RLS）の使用方針**
DB レベルのアクセス制御として Supabase RLS を使用しますか？
（Security Extension は無効のため NFR として確認します）

A) RLS を必須で使用する（全テーブルにポリシー設定）
B) アプリケーション層の認証（JWT検証）のみで十分
C) 重要なテーブル（profiles, score_events 等）のみ RLS 設定
D) 未定（Phase 1 は最小限で後から追加）

[Answer]:D

---

**Q8. API レートリミット**
知恵洗浄エンドポイント（`POST /seeds/cleanse`）や Log POST は、悪用によるコスト増大リスクがあります。
API レートリミットを設けますか？

A) 必要（1ユーザーあたり X リクエスト/分：具体的に記入）
B) Vercel の標準制限のみで十分
C) Phase 1 は設定しない
D) 未定

[Answer]:B

---

### 【テックスタック選定】

**Q9. Python バックエンドフレームワーク**
BackgroundTask を BackgroundTasks として設計していますが、フレームワーク選定を確認します。

A) FastAPI（非同期対応、BackgroundTasks 組み込み）← 設計想定
B) Django REST Framework（成熟度・Admin 機能重視）
C) Flask（シンプルさ優先）
D) その他（具体的に記入）

[Answer]:A

---

**Q10. Vertex AI / Gemini モデルの選定**
現在の設計では `gemini-1.5-pro` を使用しています。
軽量チェック（毎Log POST に実行）と本格スコアリング／Louge 生成でモデルを分けますか？

A) 全処理で gemini-1.5-pro 統一（品質優先）
B) 軽量チェックは gemini-1.5-flash（コスト最適化）、本格処理は gemini-1.5-pro
C) 最新モデル（gemini-2.0-flash / gemini-2.0-pro）を使用したい
D) 未定（コストを見ながら判断）

[Answer]:B

---

**Q11. バックエンドのデプロイ環境**
FastAPI バックエンドをどこにデプロイしますか？

A) Vercel（Serverless Functions）
B) Google Cloud Run（コンテナ、Vertex AI と同一プロジェクト）
C) Railway / Render（シンプルな PaaS）
D) その他（具体的に記入）

[Answer]:B

---

### 【モニタリング・保守性】

**Q12. ログ・モニタリングの要件**
BackgroundTask（Louge 生成、品質スコアリング）のエラー検知のため
モニタリングツールの導入を検討しますか？

A) Sentry（エラートレース）を導入する
B) Vercel / Cloud Run の組み込みログで十分
C) 構造化ログ（stdout）のみで Phase 1 は対応
D) 未定

[Answer]:B

---

**Q13. テスト戦略の要件**
GrowthEngine の2段階ロック解除ロジックはコア機能です。
テストの優先度とカバレッジ目標を教えてください。

A) 高優先度（単体テスト + 統合テスト、カバレッジ 80% 以上）
B) 中優先度（コアロジックのみ単体テスト、カバレッジ 60% 以上）
C) 最低限（ハッピーパスのみ）
D) テスト要件は Code Generation フェーズで決定

[Answer]:A

---
