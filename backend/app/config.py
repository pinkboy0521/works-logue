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
    SYSTEM_USER_ID: str  # AI ファシリテーション Log 投稿者 UUID

    # 開花閾値（環境変数で上書き可能）
    BLOOM_STRUCTURAL_THRESHOLD: float = 0.8
    BLOOM_LOG_COUNT: int = 10
    BLOOM_PARTICIPANT_COUNT: int = 5
    BLOOM_QUALITY_SCORE: float = 0.7

    # タイムアウト（秒）
    VERTEX_AI_TIMEOUT_FLASH: float = 8.0
    VERTEX_AI_TIMEOUT_SCORING: float = 60.0
    VERTEX_AI_TIMEOUT_LOUGE: float = 120.0
    VERTEX_AI_TIMEOUT_CLEANSE: float = 30.0

    # スコアポイント
    SCORE_SEED_POST: int = 10
    SCORE_LOG_POST: int = 5
    SCORE_REACTION_RECEIVED: int = 2
    SCORE_LOUGE_BLOOM_AUTHOR: int = 50
    SCORE_LOUGE_BLOOM_CONTRIBUTOR: int = 30

    class Config:
        env_file = ".env"


settings = Settings()
