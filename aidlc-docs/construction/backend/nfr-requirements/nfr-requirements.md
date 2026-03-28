# NFR Requirements — Unit 1: backend

## スコープ・前提

| 項目 | 内容 |
|---|---|
| ユニット | Unit 1: backend（FastAPI + Supabase + Vertex AI） |
| フェーズ | Phase 1（MVP） |
| 想定ユーザー規模 | 〜100ユーザー、同時接続10名以下 |
| 想定 Log 頻度 | 1 Seed あたり 10〜50 Log/日（中頻度） |

---

## NFR-01: パフォーマンス

### Log POST レスポンスタイム

| 指標 | 目標値 | 根拠 |
|---|---|---|
| P95 レスポンスタイム | 5秒以内 | Q3: B — ユーザー許容範囲 |
| P99 レスポンスタイム | 10秒以内 | P95 の 2x を上限として設定 |

**制約事項**:
- Log POST は同期で Vertex AI 軽量チェック（`gemini-1.5-flash`）を呼び出す
- Vertex AI のコールドスタートが主なボトルネックになりうる
- タイムアウト設定: Vertex AI 呼び出しに 8 秒タイムアウトを設定（5秒目標に対してバッファ込み）

### Louge 生成 BackgroundTask

| 指標 | 目標値 | 根拠 |
|---|---|---|
| 完了時間目標 | 特に設定しない | Q4: D — 完了すれば問題なし |
| 最大リトライ時間 | 3回×指数バックオフ（上限 10 分程度） | Q6: A — 既存設計を踏襲 |

**制約事項**:
- 非同期実行のため UX への影響は最小限
- Supabase Realtime 経由でフロントエンドに完了通知が届く設計

### その他の API エンドポイント

| エンドポイント | 目標（P95） |
|---|---|
| GET /seeds, GET /louges | 1秒以内（DB クエリのみ） |
| POST /seeds, POST /logs/{id}/reactions | 2秒以内 |
| POST /seeds/cleanse | 10秒以内（Vertex AI 呼び出し含む） |

---

## NFR-02: スケーラビリティ

### Phase 1 容量設計

| 指標 | 想定値 |
|---|---|
| 登録ユーザー総数 | 〜100名 |
| 同時接続数 | 最大10名 |
| Log 投稿ピーク | 50 Log/日/Seed × アクティブ Seed 数 |
| near_bloom 通知対象 | 最大100名（全登録ユーザー） |

**スケーリング方針**:
- Phase 1 は Google Cloud Run の最小インスタンス設定（0〜2インスタンス）で十分
- Supabase Free プランで収まる想定（DB 500MB, 2GB ファイルストレージ）
- Phase 2 以降はユーザー増加に応じて Cloud Run オートスケール設定を調整

---

## NFR-03: 可用性・信頼性

### 稼働率目標

| コンポーネント | 目標 | 根拠 |
|---|---|---|
| 全体サービス | ベストエフォート | Q5: C — Phase 1 は特に設定しない |
| Supabase SLA | 99.9%（プロバイダー提供） | 外部依存 |
| Vertex AI SLA | 99.9%（プロバイダー提供） | 外部依存 |
| Cloud Run | 99.95%（プロバイダー提供） | 外部依存 |

**Phase 1 方針**: 外部プロバイダーのデフォルト SLA に依存。独自の冗長化・フェイルオーバーは実装しない。

### エラーハンドリング方針

| シナリオ | 対応 | 根拠 |
|---|---|---|
| 軽量チェック失敗（Vertex AI） | 前回値維持、更新スキップ | Q6: A — 設計通り |
| Louge 生成失敗（Vertex AI） | 最大3回リトライ（指数バックオフ）、seeds.status を "active" に戻す | Q6: A — 設計通り |
| Louge 生成全リトライ失敗 | seeds.stage を "flowering" のまま維持（手動介入可能な状態） | 設計踏襲 |
| DB 接続失敗 | HTTP 503 を返し、Supabase の自動リカバリに委任 | Phase 1 方針 |

---

## NFR-04: セキュリティ

### 認証・認可

| レイヤー | 方針 | 根拠 |
|---|---|---|
| アプリ層 JWT 検証 | 必須（Supabase JWT、全 mutate エンドポイント） | BR-13 |
| Supabase RLS | 未定、Phase 1 は最小限 → Phase 2 で整備 | Q7: D |

**RLS Phase 1 方針**:
- バックエンドはサービスロールキー（`SUPABASE_SERVICE_ROLE_KEY`）を使用
- JWT 検証はアプリ層で実施（`Authorization: Bearer <token>`）
- RLS は Phase 2 でセキュリティ強化時に追加

### API レートリミット

| 方針 | 内容 | 根拠 |
|---|---|---|
| Phase 1 | Cloud Run のデフォルト同時リクエスト制限（80 req/instance）を活用 | Q8: B |
| Vertex AI コスト保護 | 環境変数 `VERTEX_AI_MAX_CONCURRENT` で同時呼び出し数を制限（デフォルト: 5） | コスト管理 |

---

## NFR-05: モニタリング・オブザービリティ

### ログ方針

| 方針 | 内容 | 根拠 |
|---|---|---|
| ログ出力 | Cloud Run の組み込みログ（stdout/stderr → Cloud Logging 自動連携） | Q12: B |
| ログ形式 | 構造化 JSON ログ（`python-json-logger` または標準 logging） | 可視性向上 |
| ログレベル | INFO（通常操作）/ ERROR（例外・リトライ）/ WARNING（AI スコア境界値） |  |

**必須ログエントリ**:
- BackgroundTask 開始・完了・失敗
- Vertex AI 呼び出し結果（成功/失敗/リトライ）
- GrowthEngine ステージ遷移
- 開花トリガー（quality_score, structural_completeness の値付き）

### アラート

Phase 1 では専用アラートは設定しない。Cloud Run エラーログを手動確認。

---

## NFR-06: 保守性・テスト戦略

### テスト優先度

| 優先度 | 内容 | 根拠 |
|---|---|---|
| 高 | GrowthEngine（2段階ロック解除）— 単体テスト + 統合テスト | Q13: A |
| 高 | AIService（Louge 生成フロー）— モック使用単体テスト | Q13: A |
| 高 | ScoreEngine（スコア計算・重複防止）— 単体テスト | Q13: A |
| 中 | NotificationService — 単体テスト | Q13: A |
| 中 | 全 API エンドポイント — 統合テスト（TestClient） | Q13: A |

### カバレッジ目標

| 種別 | 目標 |
|---|---|
| 全体カバレッジ | 80% 以上 |
| GrowthEngine コアロジック | 95% 以上（ステージ遷移の全パターン） |
| AI 呼び出し部分 | モックで 100% のパス網羅 |

### テストフレームワーク

| 用途 | ツール |
|---|---|
| 単体テスト | pytest |
| 非同期テスト | pytest-asyncio |
| API 統合テスト | FastAPI TestClient |
| AI モック | pytest-mock / unittest.mock |
| カバレッジ計測 | pytest-cov |
