# Logical Components — Unit 1: backend

## コンポーネント構成図

```
[HTTP Request]
      |
      v
+------------------+
| FastAPI Router   |  routers/seeds.py, logs.py, louges.py,
|                  |  profiles.py, notifications.py, tags.py
+--------+---------+
         |
         | Depends()
         v
+------------------+     +------------------+
| Auth Dependency  |     | Supabase Client  |
| (P-06: JWT検証)  |     | (P-07: DI)       |
+------------------+     +--------+---------+
                                   |
         +-------------------------+
         |
         v
+------------------+     +------------------+     +------------------+
| GrowthEngine     |---->| AIService        |---->| Vertex AI        |
| (check_and_      |     | (P-01: Semaphore |     | gemini-1.5-flash |
|  advance)        |     |  P-02: Timeout   |     | gemini-1.5-pro   |
+--------+---------+     |  P-03: Retry     |     +------------------+
         |               |  P-04: Fallback) |
         |               +------------------+
         |
         +--------+--------+--------+
         |        |        |        |
         v        v        v        v
  +----------+ +-------+ +------+ +------------------+
  |ScoreEngine| |Notif- | |Fork  | |BackgroundTasks   |
  |           | |ication| |Serv- | |(P-05: Lifecycle) |
  |           | |Service| |ice   | +------------------+
  +----------+ +-------+ +------+
         |
         v
+------------------+
| Repository Layer |
| (Supabase REST)  |
+------------------+
         |
         v
+------------------+     +------------------+
| Supabase DB      |     | Supabase Realtime|
| (PostgreSQL)     |     | (通知配信)        |
+------------------+     +------------------+
```

---

## コンポーネント詳細

### 1. FastAPI Application（main.py）

**責務**: アプリ起動、ルーター登録、ミドルウェア設定

```
- ルーター登録: seeds, logs, louges, profiles, notifications, tags
- CORS 設定（Vercel フロントエンドドメインを許可）
- 構造化ログ初期化（P-09）
- lifespan イベント（起動時の設定検証）
```

---

### 2. Auth Dependency

**責務**: JWT 検証、認証ユーザー情報の取得

```
入力: Authorization ヘッダー
処理: PyJWT オフライン検証（P-06）
出力: AuthUser(id: UUID)

エラー:
  - トークンなし / 不正 → 401 Unauthorized
  - 他ユーザーリソース操作 → 403 Forbidden（各ルーターで検証）
```

---

### 3. Supabase Client

**責務**: DB 操作の単一窓口（サービスロールキー使用）

```
- シングルトン（P-07 DI で共有）
- 全テーブルへの CRUD 操作
- RLS バイパス（サービスロールキーのため）
- Phase 2 で RLS 有効化時は anon キー + JWT に切り替え
```

---

### 4. Repository Layer

**責務**: テーブルごとのデータアクセスロジックをカプセル化

| リポジトリ | 主要メソッド |
|---|---|
| SeedRepository | get_seed_with_logs, update_stage, update_status, update_structural_completeness |
| LogRepository | create_log, get_logs_by_seed, count_user_logs, count_participants |
| LougeRepository | create_louge, get_louge, update_status |
| ProfileRepository | get_profile, get_user_tags（industry/role） |
| NotificationRepository | create_notification, mark_read, get_bloom_near_targets |
| FollowRepository | get_followers, get_seed_followers, create_follow, delete_follow |

**near_bloom 通知対象取得（NotificationRepository）**:
```sql
-- Seed 投稿者のフォロワー OR Seed フォロワー の和集合
SELECT DISTINCT user_id FROM (
  SELECT follower_id AS user_id FROM follows WHERE followee_id = :seed_author_id
  UNION
  SELECT user_id FROM seed_follows WHERE seed_id = :seed_id
) AS targets
WHERE user_id != :seed_author_id
```

---

### 5. GrowthEngine

**責務**: Log 投稿後の成長判定・開花トリガー管理

```
パブリックメソッド:
  check_and_advance(seed_id, background_tasks) -> GrowthStage

内部フロー:
  1. lightweight_structural_check（AIService 経由）
  2. determine_stage（ローカル計算）
  3. 開花条件チェック → background_tasks.add_task()

依存:
  - AIService
  - SeedRepository
  - NotificationService（near_bloom 通知）
```

---

### 6. AIService

**責務**: Vertex AI（Gemini）呼び出しの抽象化レイヤー

```
パブリックメソッド:
  lightweight_structural_check(seed_id) -> Optional[PatternAnalysis]
  quality_scoring_and_bloom(seed_id, background_tasks)
  generate_louge(seed_id)
  cleanse_wisdom(text) -> WisdomCleanseResult
  calculate_contribution_scores(louge_content, logs) -> List[ContributionScore]

NFR パターン適用:
  P-01: asyncio.Semaphore（全メソッド共通）
  P-02: モデル別タイムアウト
  P-03: generate_louge にのみリトライ
  P-04: check / cleanse にフォールバック

モデル割り当て:
  gemini-1.5-flash: lightweight_structural_check
  gemini-1.5-pro:   quality_scoring, generate_louge, cleanse_wisdom, contribution_scores
```

---

### 7. ScoreEngine

**責務**: スコア計算・バッジ付与

```
パブリックメソッド:
  add_score(user_id, action, reference_id) -> int（更新後 total_score）
  award_bloom_contributors(seed_id, louge_id)
  evaluate_and_award_badges(user_id) -> List[Badge]

トランザクション考慮:
  - profiles.total_score の更新はアトミック（DB 側 UPDATE ... SET total_score = total_score + :points）
  - Supabase REST の upsert を使用
```

---

### 8. NotificationService

**責務**: 通知生成・配信

```
パブリックメソッド:
  notify_new_log(seed_id, log_user_id)
  notify_louge_bloomed(seed_id, louge_id)
  notify_bloom_near(seed_id)

near_bloom 通知対象:
  NotificationRepository.get_bloom_near_targets(seed_id, seed_author_id) で取得
  （follows + seed_follows の和集合 SQL）

配信メカニズム:
  notifications テーブルに INSERT
  → Supabase Realtime が自動ブロードキャスト
  → フロントエンドの Realtime 購読が受信
```

---

### 9. ForkService

**責務**: Louge からの Fork Seed 作成

```
パブリックメソッド:
  create_fork(louge_id, fork_input, user_id) -> Seed

バリデーション:
  - louge.status == "published" のみ Fork 可（BR-12）
  - Fork Seed の parent_louge_id を設定
  - ScoreEngine.add_score（SEED_POST）を呼び出し
```

---

### 10. Settings（config.py）

**責務**: 環境変数の一元管理（P-08）

```
pydantic-settings BaseSettings:
  - 全環境変数を型定義
  - .env ファイル対応
  - デフォルト値（開花閾値・タイムアウト等）を設定

シングルトン: モジュールレベルで settings = Settings() をインスタンス化
```

---

### 11. Structured Logger

**責務**: JSON 構造化ログの出力（P-09）

```
python-json-logger を使用
Cloud Run stdout → Cloud Logging に自動連携

各サービスで個別に logger を取得:
  logger = setup_logger("growth_engine")
  logger = setup_logger("ai_service")
  logger = setup_logger("score_engine")
```

---

## テスト構成（論理コンポーネント観点）

| テスト種別 | 対象 | モック対象 |
|---|---|---|
| 単体テスト | GrowthEngine | AIService（モック） + SeedRepository（モック） |
| 単体テスト | AIService | Vertex AI SDK（モック） |
| 単体テスト | ScoreEngine | SupabaseClient（モック） |
| 単体テスト | NotificationService | SupabaseClient（モック） |
| 統合テスト | 全ルーター | TestClient + dependency_overrides |

```python
# tests/conftest.py
@pytest.fixture
def mock_ai_service():
    with patch("app.services.ai_service.AIService") as mock:
        yield mock

@pytest.fixture
def client(mock_ai_service, mock_supabase):
    app.dependency_overrides[get_ai_service] = lambda: mock_ai_service
    app.dependency_overrides[get_supabase_client] = lambda: mock_supabase
    with TestClient(app) as c:
        yield c
```
