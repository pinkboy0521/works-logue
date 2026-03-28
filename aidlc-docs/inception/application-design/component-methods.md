# Component Methods — Works Logue

> **Note**: メソッドシグネチャと高レベルの目的を定義。詳細なビジネスロジックは CONSTRUCTION フェーズの Functional Design で設計する。

---

## Frontend Methods（TypeScript）

### FC-01: AuthProvider

```typescript
// Supabase Auth セッションの初期化・監視
initSession(): Promise<void>

// ログイン（メール + パスワード）
signInWithEmail(email: string, password: string): Promise<AuthResult>

// ソーシャルログイン（Google）
signInWithGoogle(): Promise<void>

// ログアウト
signOut(): Promise<void>

// 現在のセッション JWT 取得（React Query の Authorization ヘッダーに使用）
getAccessToken(): Promise<string | null>
```

### FC-02: SeedFeedPage

```typescript
// Seed 一覧取得（React Query hook）
// params: stage?, tags?, industry?, page?
useSeeds(params: SeedFilterParams): UseQueryResult<SeedListResponse>

// フィルタ状態の更新（Jotai atom）
setSeedFilter(filter: SeedFilterParams): void
```

### FC-03: SeedDetailPage

```typescript
// Seed 詳細取得（React Query hook）
useSeed(seedId: string): UseQueryResult<SeedDetail>

// Log 一覧取得
useLogs(seedId: string): UseQueryResult<LogListResponse>

// Supabase Realtime 購読（成長ステージ変化）
subscribeToGrowthStage(seedId: string, onUpdate: (stage: GrowthStage) => void): () => void
```

### FC-04: SeedFormPage

```typescript
// Seed 投稿（React Query mutation）
useCreateSeed(): UseMutationResult<Seed, Error, CreateSeedInput>

// 知恵洗浄リクエスト（入力テキストをAIに送信）
useWisdomCleanse(): UseMutationResult<WisdomCleanseResult, Error, string>
```

### FC-05: LogThread

```typescript
// Log 投稿
useCreateLog(): UseMutationResult<Log, Error, CreateLogInput>

// Log 返信投稿
useCreateLogReply(): UseMutationResult<Log, Error, CreateLogReplyInput>

// リアクション付与
useAddReaction(): UseMutationResult<void, Error, AddReactionInput>
```

### FC-07: LougeDetailPage

```typescript
// Louge 詳細取得
useLouge(lougeId: string): UseQueryResult<LougeDetail>

// Louge Realtime 購読（生成完了通知）
subscribeToLougeStatus(lougeId: string, onPublished: () => void): () => void

// Fork 作成
useCreateFork(): UseMutationResult<Seed, Error, CreateForkInput>
```

### FC-08: ProfilePage

```typescript
// プロフィール取得
useProfile(userId: string): UseQueryResult<UserProfile>

// プロフィール更新
useUpdateProfile(): UseMutationResult<UserProfile, Error, UpdateProfileInput>

// スコア詳細取得
useScoreBreakdown(userId: string): UseQueryResult<ScoreBreakdown>
```

---

## Backend Methods（Python / FastAPI）

### BC-01: AuthMiddleware

```python
# JWT 検証・ユーザーID 抽出
async def verify_token(token: str) -> str:  # returns user_id

# FastAPI Depends として使用
async def get_current_user(request: Request) -> str:  # returns user_id
```

### BC-02: SeedRouter

```python
# Seed フォロー（低優先度）
POST /seeds/{seed_id}/follow
async def follow_seed(seed_id: str, user_id: str) -> void

# Seed アンフォロー（低優先度）
DELETE /seeds/{seed_id}/follow
async def unfollow_seed(seed_id: str, user_id: str) -> void

# Seed 一覧取得（フィルタ・ページネーション）
GET /seeds
async def list_seeds(stage: str | None, tags: list[str], page: int) -> SeedListResponse

# Seed 詳細取得
GET /seeds/{seed_id}
async def get_seed(seed_id: str) -> SeedDetail

# Seed 作成
POST /seeds
async def create_seed(body: CreateSeedInput, user_id: str) -> Seed

# 知恵洗浄（AI テキスト処理）
POST /seeds/cleanse
async def cleanse_wisdom(body: CleanseInput, user_id: str) -> WisdomCleanseResult
```

### BC-03: LogRouter

```python
# Log 一覧取得（Seed に紐づく）
GET /seeds/{seed_id}/logs
async def list_logs(seed_id: str) -> LogListResponse

# Log 投稿（投稿後 GrowthEngine を同期呼び出し）
POST /seeds/{seed_id}/logs
async def create_log(seed_id: str, body: CreateLogInput, user_id: str) -> LogWithGrowthStage

# Log 返信投稿
POST /logs/{log_id}/replies
async def create_reply(log_id: str, body: CreateLogReplyInput, user_id: str) -> Log

# リアクション付与
POST /logs/{log_id}/reactions
async def add_reaction(log_id: str, body: AddReactionInput, user_id: str) -> void
```

### BC-04: LougeRouter

```python
# Louge 一覧・検索
GET /louges
async def list_louges(query: str | None, tags: list[str], page: int) -> LougeListResponse

# Louge 詳細取得
GET /louges/{louge_id}
async def get_louge(louge_id: str) -> LougeDetail

# Fork 作成（Louge → 新 Seed）
POST /louges/{louge_id}/fork
async def create_fork(louge_id: str, body: CreateForkInput, user_id: str) -> Seed
```

### BC-05: UserRouter

```python
# プロフィール取得
GET /users/{user_id}
async def get_user(user_id: str) -> UserProfile

# プロフィール更新
PATCH /users/me
async def update_profile(body: UpdateProfileInput, user_id: str) -> UserProfile

# スコア詳細取得
GET /users/{user_id}/score
async def get_score_breakdown(user_id: str) -> ScoreBreakdown
```

### BC-07: GrowthEngine

```python
# Log 投稿後の開花条件チェック（同期実行）
# Returns: 更新後の成長ステージ。開花条件達成時は AIService を BackgroundTask として起動
async def check_and_advance(seed_id: str, background_tasks: BackgroundTasks) -> GrowthStage

# 多様性スコアの計算
def calculate_diversity_score(seed_id: str, log_contributors: list[str]) -> float

# 現在のステージ判定
def determine_stage(log_count: int, participant_count: int, diversity_score: float) -> GrowthStage
```

### BC-08: AIService

```python
# Louge 生成（BackgroundTask として実行）
# Vertex AI Gemini を呼び出し、生成完了後 DB 更新 + 通知トリガー
async def generate_louge(seed_id: str) -> None

# 知恵洗浄（固有名詞の検知・抽象化提案）
async def cleanse_wisdom(text: str) -> WisdomCleanseResult

# Vertex AI クライアントの初期化（IAM 認証）
def _get_vertex_client() -> GenerativeModel
```

### BC-09: ScoreEngine

```python
# アクション発生時のスコア加算
async def add_score(user_id: str, action: ScoreAction, reference_id: str) -> int  # returns new total

# Louge 開花貢献者のスコア一括加算 + バッジ付与
async def award_bloom_contributors(seed_id: str, louge_id: str) -> None

# バッジ付与条件の評価と付与
async def evaluate_and_award_badges(user_id: str) -> list[Badge]
```
