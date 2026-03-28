# Components — Works Logue

## アーキテクチャ概要

```
[Frontend: Next.js / Vercel]
  UI Components
  Page Components
        ↕ React Query (REST)
[Backend: FastAPI / Google Cloud Run]
  Routers → Services → Repositories
        ↕                    ↕
  [Supabase DB]       [Vertex AI / Gemini]
        ↕
  [Supabase Auth]  ← JWT → [AuthMiddleware]
```

---

## Frontend Components（Next.js）

### FC-01: AuthProvider
**責務**: Supabase Auth のセッション管理・ユーザー状態のグローバル提供
- Supabase Auth クライアントの初期化
- JWT トークンの取得・リフレッシュ
- ログイン状態を Jotai atom で管理
- 未ログインユーザーの保護ルートからのリダイレクト

### FC-02: SeedFeedPage
**責務**: Seed 一覧フィードの表示
- 成長ステージ・タグ・業種によるフィルタリング UI
- React Query によるページネーション・無限スクロール
- 各 SeedCard コンポーネントの表示
- 非ログインユーザーも閲覧可能

### FC-03: SeedDetailPage
**責務**: Seed 詳細ページ — 成長状態・Log 一覧の表示
- GrowthIndicator コンポーネントの組み込み
- Log 一覧（LogThread コンポーネント）の表示
- Log 投稿フォームの表示（ログイン時のみ）
- Supabase Realtime による成長ステージのリアルタイム更新

### FC-04: SeedFormPage
**責務**: Seed 投稿フォーム — 8タイプ対応のステップ型 UI
- タイプ選択ステップ（8種類のアイコン付き選択）
- タイプ別ガイド付き入力フォーム
- タグ選択 UI
- 知恵洗浄プレビュー（AIサジェスト表示）

### FC-05: LogThread
**責務**: Log とスレッド返信の表示・投稿
- Log 一覧のフラット + ネスト表示
- 返信フォームの展開・収納
- リアクションボタン（共感・役立った）
- 投稿者アバター・タイムスタンプ

### FC-06: LougeListPage
**責務**: Louge 一覧・検索ページ
- キーワード・タグ・業種によるフィルタ検索
- Louge カードの一覧表示
- 生成中 Louge のステータス表示

### FC-07: LougeDetailPage
**責務**: Louge 記事の詳細表示
- AI 生成記事本文の表示（Markdown レンダリング）
- 開花貢献者一覧
- 元 Seed・Log 群へのリンク
- Fork ボタン（ログイン時のみ）
- 派生 Seed 一覧

### FC-08: ProfilePage
**責務**: ユーザープロフィール — スコア・バッジ・貢献履歴
- アバター・自己紹介・業種の表示・編集
- インサイト・スコア表示（総計 + 詳細ブレークダウン）
- 獲得バッジ一覧
- 貢献した Seed/Louge 履歴

### FC-09: GrowthIndicator
**責務**: 成長ステージの植物ビジュアル表示
- 6段階（Seed/Sprout1/Sprout2/Sprout3/Louge/Harvest）の進捗バー
- 現在のステージ名・Log 数・参加者数の表示
- 開花までの残り条件の表示

### FC-10: NotificationDropdown
**責務**: アプリ内通知の表示
- 未読通知バッジ数の表示
- 通知一覧のドロップダウン
- 通知クリックで対象ページへ遷移

---

## Backend Components（FastAPI）

### BC-01: AuthMiddleware
**責務**: Supabase JWT の検証・ユーザー ID の抽出
- Bearer トークンの検証（python-jose）
- 検証済みユーザー ID を Request state に注入
- 未認証リクエストへの 401 レスポンス

### BC-02: SeedRouter
**責務**: Seed の CRUD エンドポイント群
- Seed 投稿・取得・更新・削除
- 一覧フィード（フィルタ・ページネーション）
- 知恵洗浄リクエストのプロキシ（AIService へ委譲）
- Seed のフォロー / アンフォロー（低優先度、ログインユーザーのみ）

### BC-03: LogRouter
**責務**: Log の CRUD エンドポイント群
- Log 投稿・取得・削除
- 返信（スレッド）投稿
- リアクション付与
- 投稿後に GrowthEngine を呼び出し（同期チェック）

### BC-04: LougeRouter
**責務**: Louge の CRUD・検索エンドポイント群
- Louge 取得・一覧・検索
- ステータス管理（生成中/公開/アーカイブ）
- Fork 作成リクエストの受付

### BC-05: UserRouter
**責務**: ユーザープロフィール・スコア・バッジのエンドポイント群
- プロフィール取得・更新
- インサイト・スコア取得（総計・詳細）
- バッジ一覧取得

### BC-06: NotificationRouter
**責務**: 通知のエンドポイント群
- 未読通知一覧取得
- 通知既読マーク

### BC-07: GrowthEngine
**責務**: 開花条件の判定・ステージ進行処理
- Log 投稿後に呼び出される同期チェックロジック
- Log 数・参加者数・多様性スコアの集計
- ステージ進行の DB 更新
- 開花条件達成時に AIService へ Louge 生成を非同期委譲

### BC-08: AIService
**責務**: Vertex AI（Gemini）との統合
- Louge 生成プロンプトの構築・API 呼び出し
- 知恵洗浄（固有名詞検知・抽象化）API 呼び出し
- 生成完了後の DB 更新・通知トリガー
- バックグラウンドタスクとして実行（BackgroundTasks）

### BC-09: ScoreEngine
**責務**: インサイト・スコアの計算・付与
- アクション種別ごとのスコア加算ルール管理
- Seed 投稿・Log 投稿・Louge 開花貢献時のスコア更新
- バッジ付与条件の評価と付与処理

### BC-10: Repository Layer
**責務**: Supabase（PostgreSQL）へのデータアクセス抽象化
- SeedRepository / LogRepository / LougeRepository
- UserRepository / ScoreRepository / NotificationRepository
- supabase-py クライアントのラッパー
