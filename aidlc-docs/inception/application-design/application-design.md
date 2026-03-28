# Application Design — Works Logue

## アーキテクチャ概要

### 技術スタック

| 層 | 技術 | デプロイ先 |
|---|---|---|
| フロントエンド | Next.js 14+ / TypeScript / Tailwind CSS | Vercel |
| 状態管理 | Jotai（クライアント） + React Query（サーバー） | — |
| バックエンド API | Python 3.11+ / FastAPI | Google Cloud Run |
| データベース | PostgreSQL（Supabase） | Supabase |
| 認証 | Supabase Auth（JWT）/ Google OAuth | Supabase |
| AI | Vertex AI（Gemini） | GCP（Cloud Run と同一プロジェクト） |
| リアルタイム | Supabase Realtime（WebSocket） | Supabase |
| ストレージ | Supabase Storage | Supabase |

### システム構成図

```
[Browser]
    ↕ Next.js (Vercel)
    |  ├ Page Components (薄いUI層)
    |  ├ React Query → FastAPI REST
    |  └ Supabase Realtime WS
    ↕
[FastAPI / Google Cloud Run]
    |  ├ AuthMiddleware (JWT検証)
    |  ├ Routers (SeedRouter / LogRouter / LougeRouter / UserRouter)
    |  ├ Services (GrowthEngine / AIService / ScoreEngine / NotificationService)
    |  └ Repositories (supabase-py)
    ↕                      ↕
[Supabase]           [Vertex AI / Gemini]
    ├ PostgreSQL       IAM認証（APIキー不要）
    ├ Auth (JWT)
    ├ Realtime (WS)
    └ Storage
```

---

## コンポーネント一覧

### Frontend（Next.js）

| ID | コンポーネント | 主な責務 |
|---|---|---|
| FC-01 | AuthProvider | Supabase Auth セッション管理・Jotai atom |
| FC-02 | SeedFeedPage | ホーム兼Seed一覧フィード・フィルタ（非ログイン対応） |
| FC-03 | SeedDetailPage | Seed 詳細・Log 一覧・Realtime 成長更新 |
| FC-04 | SeedFormPage | 8タイプ対応ステップ型投稿フォーム |
| FC-05 | LogThread | Log・返信・リアクション表示 |
| FC-06 | LougeListPage | Louge 一覧・検索 |
| FC-07 | LougeDetailPage | Louge 記事・貢献者・Fork ボタン |
| FC-08 | ProfilePage | スコア・バッジ・貢献履歴 |
| FC-09 | GrowthIndicator | 6段階植物ビジュアル進捗 |
| FC-10 | NotificationDropdown | リアルタイム通知 |

### Backend（FastAPI）

| ID | コンポーネント | 主な責務 |
|---|---|---|
| BC-01 | AuthMiddleware | Supabase JWT 検証 |
| BC-02 | SeedRouter | Seed CRUD + 知恵洗浄エンドポイント |
| BC-03 | LogRouter | Log CRUD + 開花チェックトリガー |
| BC-04 | LougeRouter | Louge 取得・検索・Fork |
| BC-05 | UserRouter | プロフィール・スコア |
| BC-06 | NotificationRouter | 通知取得・既読 |
| BC-07 | GrowthEngine | 開花条件判定・ステージ進行 |
| BC-08 | AIService | Vertex AI 統合（Louge生成・知恵洗浄） |
| BC-09 | ScoreEngine | スコア計算・バッジ付与 |
| BC-10 | Repository Layer | Supabase DB アクセス抽象化 |

---

## 主要フロー

### Log 投稿 → 成長ステージ進行 → 開花

```
POST /seeds/{id}/logs
    → LogService: Log 保存 + Score 加算 + 通知
    → GrowthEngine: 同期で開花条件チェック
        [未達] → ステージ更新のみ
        [達成] → status = "blooming" + BackgroundTask 登録
            → AIService.generate_louge()（非同期）
                → Vertex AI Gemini 呼び出し
                → Louge 保存・公開
                → 貢献者スコア加算・バッジ付与
                → Supabase DB INSERT (notifications)
                    → Realtime WS → Browser 通知
```

### Fork（再播種）

```
POST /louges/{id}/fork
    → ForkService: Fork Seed 作成（parent_louge_id 自動付与）
    → ScoreEngine: Seed 投稿スコア加算
    → LougeRepository: fork_count 更新
```

---

## 設計判断サマリー

| 判断事項 | 決定 | 理由 |
|---|---|---|
| API 層 | FastAPI（Python）/ Cloud Run | AI処理のPythonエコシステム親和性 |
| AI モデル | Vertex AI（Gemini） | Cloud Run と同一GCP、IAM認証、マルチモデル対応 |
| 開花判定 | Log POST 時の同期チェック | PoC向けシンプル実装 |
| Louge 生成 | BackgroundTask + Supabase Realtime 通知 | 202即時返却、生成完了をWS通知 |
| リアルタイム | Supabase Realtime（重要イベント） | 開花・通知のみRealtime、通常はReact Queryポーリング |
| 認証フロー | Supabase Auth JWT → FastAPI 検証 | セッション管理はSupabaseに委任、APIはJWT検証のみ |

---

## 詳細ドキュメント参照

- [components.md](./components.md) — 各コンポーネントの詳細定義
- [component-methods.md](./component-methods.md) — メソッドシグネチャ一覧
- [services.md](./services.md) — サービス層の詳細設計
- [component-dependency.md](./component-dependency.md) — 依存関係・データフロー図
