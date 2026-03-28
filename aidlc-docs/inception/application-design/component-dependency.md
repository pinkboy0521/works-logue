# Component Dependency — Works Logue

## 依存関係マトリクス

### Frontend（Next.js）

| コンポーネント | 依存先 | 通信方式 |
|---|---|---|
| AuthProvider | Supabase Auth JS SDK | SDK直接 |
| SeedFeedPage | FastAPI `/seeds` | React Query (GET) |
| SeedDetailPage | FastAPI `/seeds/{id}`, `/seeds/{id}/logs` | React Query (GET) |
| SeedDetailPage | Supabase Realtime | WS Subscription |
| SeedFormPage | FastAPI `/seeds`, `/seeds/cleanse` | React Query Mutation |
| LogThread | FastAPI `/seeds/{id}/logs`, `/logs/{id}/replies`, `/logs/{id}/reactions` | React Query Mutation |
| LougeDetailPage | FastAPI `/louges/{id}` | React Query (GET) |
| LougeDetailPage | Supabase Realtime | WS Subscription |
| ProfilePage | FastAPI `/users/{id}`, `/users/{id}/score` | React Query (GET/PATCH) |
| NotificationDropdown | Supabase Realtime (notifications) | WS Subscription |

### Backend（FastAPI）

| コンポーネント | 依存先 | 通信方式 |
|---|---|---|
| SeedRouter | SeedService | 同期呼び出し |
| LogRouter | LogService | 同期呼び出し |
| LougeRouter | LougeService, ForkService | 同期呼び出し |
| UserRouter | UserRepository, ScoreEngine | 同期呼び出し |
| LogService | GrowthEngine | 同期呼び出し |
| GrowthEngine | AIService | BackgroundTask（非同期） |
| AIService | Vertex AI API | HTTP (IAM認証) |
| AIService | ScoreEngine, NotificationService | 同期呼び出し |
| ScoreEngine | UserRepository, ScoreRepository | 同期呼び出し |
| NotificationService | NotificationRepository | 同期呼び出し |
| All Repositories | Supabase DB (supabase-py) | SQL / REST |

---

## データフロー図

### フロー 1: Log 投稿 → 成長ステージ進行

```
[Browser]
    | POST /seeds/{id}/logs (JWT)
    v
[LogRouter]
    | LogService.create_log()
    v
[LogService]
    | 1. LogRepository.create()  →  [Supabase DB]
    | 2. ScoreEngine.add_score() →  [Supabase DB]
    | 3. NotificationService.notify_seed_owner() → [Supabase DB]
    | 4. GrowthEngine.check_and_advance()
    v
[GrowthEngine]
    | 条件チェック（Log数・参加者数・多様性スコア）
    | [開花条件未達] → SeedRepository.update_stage() → [Supabase DB]
    | [開花条件達成] → SeedRepository.update_status("blooming")
    |                 → background_tasks.add_task(AIService.generate_louge)
    v
[Response: 200 + 更新後 GrowthStage]
```

### フロー 2: Louge 生成（バックグラウンド）

```
[BackgroundTask: AIService.generate_louge(seed_id)]
    |
    | 1. SeedRepository.get() + LogRepository.list()
    | 2. プロンプト構築
    | 3. Vertex AI Gemini API 呼び出し（IAM認証）
    v
[Vertex AI / Gemini]
    | 生成結果返却
    v
[AIService]
    | 4. LougeRepository.create(content)
    | 5. SeedRepository.update_status("louge")
    | 6. ScoreEngine.award_bloom_contributors()
    | 7. NotificationService.notify_bloom_contributors()
    |    → [Supabase DB INSERT into notifications]
    v
[Supabase Realtime]
    | notifications テーブル変更を検知
    v
[Browser: NotificationDropdown]  ← WS で即時受信
[Browser: LougeDetailPage]       ← Louge status 購読 → 自動更新
```

### フロー 3: Fork（再播種）

```
[Browser]
    | POST /louges/{id}/fork (JWT)
    v
[LougeRouter]
    | ForkService.create_fork()
    v
[ForkService]
    | 1. SeedService.create_seed(parent_louge_id=louge_id)
    | 2. LougeRepository.increment_fork_count()
    | 3. ScoreEngine.add_score(action="seed_post")
    v
[Response: 201 + 新 Seed]
```

---

## 認証フロー

```
[Browser]
    | 1. Supabase Auth でログイン（Google OAuth / Email）
    v
[Supabase Auth]
    | JWT 発行（access_token）
    v
[Browser]
    | 2. React Query の全リクエストに Authorization: Bearer {token} を付与
    v
[FastAPI: AuthMiddleware]
    | 3. JWT を Supabase の公開鍵で検証（python-jose）
    | 4. user_id を Request.state に注入
    v
[Router / Service]
    | 5. user_id を使って DB 操作
```

---

## Supabase Realtime 購読一覧

| テーブル | イベント | 購読箇所 | 目的 |
|---|---|---|---|
| `seeds` | UPDATE (stage) | SeedDetailPage | 成長ステージのリアルタイム更新 |
| `louges` | INSERT / UPDATE (status) | LougeDetailPage | Louge 生成完了の通知 |
| `notifications` | INSERT | NotificationDropdown | 新着通知のリアルタイム表示 |
