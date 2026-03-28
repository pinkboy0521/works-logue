# NFR Design Patterns — Unit 1: backend

## パターン概要

| ID | パターン | 対象 NFR | 適用箇所 |
|---|---|---|---|
| P-01 | Semaphore 同時実行制御 | コスト保護・安定性 | AIService（全 Vertex AI 呼び出し） |
| P-02 | タイムアウト制御 | パフォーマンス（P95 5秒） | AIService（モデル別タイムアウト） |
| P-03 | リトライ（指数バックオフ） | 信頼性 | AIService.generate_louge |
| P-04 | フォールバック | 信頼性 | lightweight_structural_check / cleanse_wisdom |
| P-05 | BackgroundTask ライフサイクル管理 | 信頼性 | GrowthEngine → AIService |
| P-06 | オフライン JWT 検証 | セキュリティ | 全 mutate エンドポイント |
| P-07 | 依存性注入（DI） | 保守性・テスト容易性 | 全サービス・全ルーター |
| P-08 | pydantic-settings 設定管理 | 保守性 | config.py |
| P-09 | 構造化ログ | オブザービリティ | 全サービス |

---

## P-01: Semaphore 同時実行制御

**目的**: Vertex AI への同時呼び出し数を制限し、コスト暴走とレート制限エラーを防ぐ。

```python
# app/services/ai_service.py
import asyncio

class AIService:
    def __init__(self):
        max_concurrent = int(settings.VERTEX_AI_MAX_CONCURRENT)  # default: 5
        self._semaphore = asyncio.Semaphore(max_concurrent)

    async def _call_vertex_ai(self, prompt: str, model: str, timeout: float):
        async with self._semaphore:
            return await asyncio.wait_for(
                self._generate(prompt, model),
                timeout=timeout
            )
```

**設定**:
- `VERTEX_AI_MAX_CONCURRENT=5`（環境変数）
- 同時呼び出し上限に達した場合、呼び出しはキュー待ちになる（エラーにならない）

---

## P-02: タイムアウト制御（モデル別）

**目的**: Log POST の P95 5秒目標を守るため、モデル別に適切なタイムアウトを設定。

| モデル | 用途 | タイムアウト | 根拠 |
|---|---|---|---|
| gemini-1.5-flash | lightweight_structural_check | 8秒 | P95 5秒目標 + バッファ3秒 |
| gemini-1.5-pro | quality_scoring_and_bloom | 60秒 | BackgroundTask（非同期） |
| gemini-1.5-pro | generate_louge | 120秒 | 長文生成。BackgroundTask（非同期） |
| gemini-1.5-pro | cleanse_wisdom | 30秒 | ユーザー待機あり（許容範囲内） |

```python
# タイムアウト定数（config.py）
VERTEX_AI_TIMEOUT_FLASH = 8.0      # lightweight_structural_check
VERTEX_AI_TIMEOUT_SCORING = 60.0   # quality_scoring_and_bloom
VERTEX_AI_TIMEOUT_LOUGE = 120.0    # generate_louge
VERTEX_AI_TIMEOUT_CLEANSE = 30.0   # cleanse_wisdom
```

**タイムアウト発生時の挙動**:
- `lightweight_structural_check`: `asyncio.TimeoutError` を捕捉 → 前回値維持、更新スキップ（P-04 フォールバック）
- `generate_louge`: P-03 リトライパターンに委譲

---

## P-03: リトライ（指数バックオフ）— tenacity

**目的**: Louge 生成失敗時の自動リトライ。一時的な Vertex AI エラーへの耐性を持たせる。

**適用箇所**: `AIService.generate_louge`（BackgroundTask 内）

```python
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
)
import google.api_core.exceptions as gcp_exceptions

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=4, max=60),
    retry=retry_if_exception_type((
        gcp_exceptions.ServiceUnavailable,
        gcp_exceptions.DeadlineExceeded,
        asyncio.TimeoutError,
    )),
    reraise=True,
)
async def _generate_louge_with_retry(self, seed_id: UUID) -> LougeData:
    ...
```

**リトライスケジュール例**:
| 試行 | 待機時間 |
|---|---|
| 1回目失敗 | 即時リトライ |
| 2回目失敗 | 4秒後 |
| 3回目失敗 | 8秒後 |
| 全失敗 | `reraise=True` で例外を上位に伝播 |

**全リトライ失敗時の処理**:
```python
# GrowthEngine.quality_scoring_and_bloom
try:
    await ai_service._generate_louge_with_retry(seed_id)
except Exception:
    # seeds.status を "active" に戻す（再試行可能状態）
    await seed_repo.update_status(seed_id, SeedStatus.ACTIVE)
    logger.error("Louge generation failed after retries", seed_id=str(seed_id))
```

---

## P-04: フォールバック

**目的**: AI 呼び出し失敗時にユーザー体験を損なわずサービスを継続する。

| 箇所 | フォールバック動作 |
|---|---|
| `lightweight_structural_check` 失敗 | 前回の `structural_completeness` 値を維持。`pattern_analysis` 更新をスキップ。Log POST 自体は正常レスポンス |
| `cleanse_wisdom` 失敗 | 空の `detected_terms: []` を返す。投稿ブロックしない |
| 貢献度スコア計算失敗 | `log_count / total_logs` の均等配分にフォールバック |

```python
async def lightweight_structural_check(self, seed_id: UUID) -> Optional[PatternAnalysis]:
    try:
        return await self._call_vertex_ai(prompt, "gemini-1.5-flash", timeout=8.0)
    except (asyncio.TimeoutError, Exception) as e:
        logger.warning("lightweight_structural_check failed, using fallback",
                       seed_id=str(seed_id), error=str(e))
        return None  # 呼び出し元で None チェック → 更新スキップ
```

---

## P-05: BackgroundTask ライフサイクル管理

**目的**: Cloud Run 上で FastAPI BackgroundTasks を安全に動作させる。

**Cloud Run 設定（必須）**:
```yaml
timeout: 300s  # リクエストタイムアウト。BackgroundTask はリクエスト完了後も実行継続
```

**設計方針**:
- `background_tasks.add_task()` は同期的に登録されるが、実行はレスポンス送信後
- Cloud Run の `timeout: 300s` 内に BackgroundTask が完了する前提
- Louge 生成（最大 ~120秒 × 3リトライ ≈ 最大 ~4分）は `timeout: 300s` 内に収まる

**二重起動防止**（既存設計を活用）:
```python
# seeds.status == "active" の場合のみ本格スコアリングを起動
if seed.status != SeedStatus.ACTIVE:
    return  # 既に blooming / 処理中 → スキップ
```

**ログによる追跡**:
```python
logger.info("BackgroundTask started", task="quality_scoring", seed_id=str(seed_id))
# ... 処理 ...
logger.info("BackgroundTask completed", task="quality_scoring", seed_id=str(seed_id))
```

---

## P-06: オフライン JWT 検証

**目的**: Supabase への追加リクエストなしに JWT を検証し、認証オーバーヘッドを最小化。

```python
# app/dependencies.py
import jwt  # PyJWT

async def get_current_user(
    authorization: str = Header(...),
    supabase: SupabaseClient = Depends(get_supabase_client),
) -> AuthUser:
    token = authorization.removeprefix("Bearer ")
    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
        user_id = UUID(payload["sub"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    return AuthUser(id=user_id)
```

**ルーターでの使用**:
```python
@router.post("/seeds/{seed_id}/logs")
async def create_log(
    seed_id: UUID,
    body: LogCreate,
    current_user: AuthUser = Depends(get_current_user),
    ...
):
```

---

## P-07: 依存性注入（DI）

**目的**: サービス間の疎結合を保ち、テスト時にモックへ差し替えやすくする。

```python
# app/dependencies.py

_supabase_client: Optional[SupabaseClient] = None

def get_supabase_client() -> SupabaseClient:
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY,
        )
    return _supabase_client

def get_ai_service() -> AIService:
    return AIService()  # Semaphore はクラス変数で共有

def get_growth_engine(
    ai_service: AIService = Depends(get_ai_service),
    supabase: SupabaseClient = Depends(get_supabase_client),
) -> GrowthEngine:
    return GrowthEngine(ai_service=ai_service, supabase=supabase)
```

**テスト時のオーバーライド**:
```python
# tests/conftest.py
app.dependency_overrides[get_ai_service] = lambda: MockAIService()
app.dependency_overrides[get_supabase_client] = lambda: MockSupabaseClient()
```

---

## P-08: pydantic-settings 設定管理

**目的**: 環境変数を型安全に管理し、デフォルト値を一元定義する。

```python
# app/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Supabase
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str
    SUPABASE_JWT_SECRET: str

    # Vertex AI
    VERTEX_AI_PROJECT_ID: str
    VERTEX_AI_LOCATION: str = "asia-northeast1"
    VERTEX_AI_MAX_CONCURRENT: int = 5

    # System
    SYSTEM_USER_ID: str  # AI ファシリテーション Log 投稿者

    # 開花閾値（環境変数で上書き可能）
    BLOOM_STRUCTURAL_THRESHOLD: float = 0.8
    BLOOM_LOG_COUNT: int = 10
    BLOOM_PARTICIPANT_COUNT: int = 5
    BLOOM_QUALITY_SCORE: float = 0.7

    # タイムアウト
    VERTEX_AI_TIMEOUT_FLASH: float = 8.0
    VERTEX_AI_TIMEOUT_SCORING: float = 60.0
    VERTEX_AI_TIMEOUT_LOUGE: float = 120.0
    VERTEX_AI_TIMEOUT_CLEANSE: float = 30.0

    class Config:
        env_file = ".env"

settings = Settings()
```

---

## P-09: 構造化ログ

**目的**: Cloud Logging でフィルタリング・検索しやすいよう JSON 形式で出力する。

```python
# app/utils/logging.py
import logging
import sys
from pythonjsonlogger import jsonlogger

def setup_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)
    handler = logging.StreamHandler(sys.stdout)
    formatter = jsonlogger.JsonFormatter(
        "%(asctime)s %(name)s %(levelname)s %(message)s"
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)
    return logger
```

**ログ出力例（BackgroundTask）**:
```json
{
  "asctime": "2026-03-28T10:00:00Z",
  "name": "growth_engine",
  "levelname": "INFO",
  "message": "BackgroundTask started",
  "task": "quality_scoring",
  "seed_id": "550e8400-e29b-41d4-a716-446655440000",
  "structural_completeness": 0.85,
  "user_log_count": 12
}
```

**必須ログエントリ**:
| イベント | レベル | 含めるフィールド |
|---|---|---|
| BackgroundTask 開始 | INFO | task, seed_id |
| BackgroundTask 完了 | INFO | task, seed_id, duration_ms |
| BackgroundTask 失敗 | ERROR | task, seed_id, error, attempt |
| ステージ遷移 | INFO | seed_id, from_stage, to_stage |
| 開花トリガー | INFO | seed_id, quality_score, structural_completeness |
| Vertex AI リトライ | WARNING | seed_id, attempt, error |
