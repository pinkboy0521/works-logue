# Unit of Work — Works Logue

## 分割方針

- **2ユニット構成**（Frontend + Backend）
- **開発順序**: Backend → Frontend（インフラ優先）
- **リポジトリ**: モノレポ（Next.js がルート、`backend/` に FastAPI）

---

## Unit 1: Backend

### 概要

| 項目 | 内容 |
|---|---|
| **ユニット名** | backend |
| **開発順序** | 1番目（先行開発） |
| **言語 / FW** | Python 3.11+ / FastAPI |
| **デプロイ先** | Google Cloud Run |
| **ディレクトリ** | `backend/` |

### ディレクトリ構成

```
backend/
├── app/
│   ├── main.py                  # FastAPI アプリエントリポイント
│   ├── core/
│   │   ├── config.py            # 環境変数・設定
│   │   ├── security.py          # JWT 検証（Supabase Auth）
│   │   └── database.py          # Supabase クライアント初期化
│   ├── routers/
│   │   ├── seeds.py             # Seed CRUD + 知恵洗浄
│   │   ├── logs.py              # Log CRUD + 開花チェック
│   │   ├── louges.py            # Louge 取得・検索・Fork
│   │   ├── users.py             # プロフィール・スコア
│   │   └── notifications.py     # 通知取得・既読
│   ├── services/
│   │   ├── growth_engine.py     # 開花条件判定・ステージ進行
│   │   ├── ai_service.py        # Vertex AI 統合（Louge生成・知恵洗浄）
│   │   ├── score_engine.py      # スコア計算・バッジ付与
│   │   └── notification_service.py  # 通知作成
│   ├── repositories/
│   │   ├── seed_repository.py
│   │   ├── log_repository.py
│   │   ├── louge_repository.py
│   │   ├── user_repository.py
│   │   └── notification_repository.py
│   └── models/
│       ├── seed.py              # Pydantic モデル
│       ├── log.py
│       ├── louge.py
│       ├── user.py
│       └── notification.py
├── migrations/
│   └── schema.sql               # Supabase PostgreSQL スキーマ定義
├── tests/
│   ├── unit/
│   └── integration/
├── Dockerfile
├── requirements.txt
└── .env.example
```

### 含まれるコンポーネント

| コンポーネント ID | 名称 | 主な責務 |
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

### 外部依存

| 外部サービス | 用途 |
|---|---|
| Supabase PostgreSQL | データ永続化（supabase-py） |
| Supabase Auth | JWT トークン検証（python-jose） |
| Supabase Storage | ファイルストレージ（将来拡張） |
| Vertex AI (Gemini) | Louge 生成・知恵洗浄（IAM 認証） |

---

## Unit 2: Frontend

### 概要

| 項目 | 内容 |
|---|---|
| **ユニット名** | frontend |
| **開発順序** | 2番目（Backend 完成後） |
| **言語 / FW** | TypeScript / Next.js 14+ (App Router) |
| **スタイリング** | Tailwind CSS |
| **状態管理** | Jotai（クライアント） + React Query（サーバー） |
| **デプロイ先** | Vercel |
| **ディレクトリ** | ルート（`/`） |

### ディレクトリ構成

```
src/
├── app/                         # Next.js App Router
│   ├── layout.tsx               # ルートレイアウト
│   ├── page.tsx                 # ホーム（Seed フィード）
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── seeds/
│   │   ├── page.tsx             # Seed 一覧フィード
│   │   ├── new/page.tsx         # Seed 投稿フォーム
│   │   └── [id]/page.tsx        # Seed 詳細
│   ├── louges/
│   │   ├── page.tsx             # Louge 一覧
│   │   └── [id]/page.tsx        # Louge 詳細
│   └── profile/
│       └── [userId]/page.tsx    # プロフィール
├── features/                    # Feature-based コンポーネント
│   ├── auth/
│   │   ├── components/          # AuthProvider, LoginForm 等
│   │   └── hooks/               # useAuth 等
│   ├── seed/
│   │   ├── components/          # SeedCard, SeedForm, GrowthIndicator 等
│   │   └── hooks/               # useSeeds, useSeedDetail 等
│   ├── log/
│   │   ├── components/          # LogThread, LogItem, LogForm 等
│   │   └── hooks/               # useLogs 等
│   ├── louge/
│   │   ├── components/          # LougeCard, LougeDetail, ForkButton 等
│   │   └── hooks/               # useLouges 等
│   ├── profile/
│   │   ├── components/          # ProfileHeader, ScoreCard, BadgeList 等
│   │   └── hooks/               # useProfile 等
│   └── notification/
│       ├── components/          # NotificationDropdown, NotificationItem 等
│       └── hooks/               # useNotifications 等
├── components/
│   └── ui/                      # 共通 UI コンポーネント（Button, Card 等）
├── lib/
│   ├── api.ts                   # React Query + FastAPI クライアント
│   ├── supabase.ts              # Supabase クライアント（Realtime 用）
│   └── atoms.ts                 # Jotai atoms
└── types/
    └── index.ts                 # 共通型定義
```

### 含まれるコンポーネント

| コンポーネント ID | 名称 | 主な責務 |
|---|---|---|
| FC-01 | AuthProvider | Supabase Auth セッション管理・Jotai atom |
| FC-02 | SeedFeedPage | ホーム兼 Seed 一覧フィード・フィルタ（非ログイン対応） |
| FC-03 | SeedDetailPage | Seed 詳細・Log 一覧・Realtime 成長更新 |
| FC-04 | SeedFormPage | 8タイプ対応ステップ型投稿フォーム |
| FC-05 | LogThread | Log・返信・リアクション表示 |
| FC-06 | LougeListPage | Louge 一覧・検索 |
| FC-07 | LougeDetailPage | Louge 記事・貢献者・Fork ボタン |
| FC-08 | ProfilePage | スコア・バッジ・貢献履歴 |
| FC-09 | GrowthIndicator | 6段階植物ビジュアル進捗 |
| FC-10 | NotificationDropdown | リアルタイム通知 |

### 外部依存

| 外部サービス / ライブラリ | 用途 |
|---|---|
| FastAPI (Cloud Run) | REST API（React Query 経由） |
| Supabase Auth | セッション管理・ソーシャルログイン |
| Supabase Realtime | 成長ステージ変化・通知のリアルタイム受信 |

---

## 開発シーケンス

```
Phase 1 — Backend 基盤
  1. DBスキーマ（migrations/schema.sql）
  2. 認証ミドルウェア（BC-01）
  3. Seed / Log / Louge リポジトリ層（BC-10）
  4. GrowthEngine + ScoreEngine（BC-07, BC-09）
  5. 全ルーター実装（BC-02〜06）
  6. AIService / Louge生成（BC-08）

Phase 2 — Frontend 実装
  1. プロジェクト初期設定（Next.js, Tailwind, Supabase クライアント）
  2. 認証フロー（FC-01, Auth pages）
  3. Seed フィード・詳細・投稿フォーム（FC-02, FC-03, FC-04）
  4. Log スレッド（FC-05）
  5. GrowthIndicator + Realtime 連携（FC-09）
  6. Louge 一覧・詳細・Fork（FC-06, FC-07）
  7. プロフィール・スコア・バッジ（FC-08）
  8. 通知（FC-10）
```
