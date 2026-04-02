from typing import Optional
from uuid import UUID

from fastapi import Depends, Header, HTTPException
from supabase import Client, create_client

from app.config import settings


# ---------------------------------------------------------------------------
# Supabase client (singleton)
# ---------------------------------------------------------------------------

_supabase_client: Optional[Client] = None


def get_supabase_client() -> Client:
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY,
        )
    return _supabase_client


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------


class AuthUser:
    def __init__(self, id: UUID):
        self.id = id


async def get_current_user(
    authorization: str = Header(...),
    supabase: Client = Depends(get_supabase_client),
) -> AuthUser:
    """Verify Supabase JWT via Supabase Auth API and return the authenticated user."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    token = authorization.removeprefix("Bearer ").strip()
    try:
        response = supabase.auth.get_user(token)
        if not response.user:
            raise HTTPException(status_code=401, detail="Invalid token")
        user_id = UUID(response.user.id)
        auth_user = response.user
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    # プロファイルが存在しない場合は自動作成（初回ログイン時）
    existing = supabase.table("profiles").select("id").eq("id", str(user_id)).execute()
    if not existing.data:
        email = auth_user.email or ""
        username = email.split("@")[0]
        supabase.table("profiles").insert({
            "id": str(user_id),
            "username": username,
            "display_name": username,
        }).execute()

    return AuthUser(id=user_id)


# ---------------------------------------------------------------------------
# Service factory helpers (imported lazily to avoid circular imports)
# ---------------------------------------------------------------------------


def get_ai_service():
    from app.services.ai_service import AIService

    return AIService()


def get_growth_engine(
    supabase: Client = Depends(get_supabase_client),
    ai_service=Depends(get_ai_service),
):
    from app.services.growth_engine import GrowthEngine

    return GrowthEngine(ai_service=ai_service, supabase=supabase)


def get_score_engine(
    supabase: Client = Depends(get_supabase_client),
):
    from app.services.score_engine import ScoreEngine

    return ScoreEngine(supabase=supabase)


def get_notification_service(
    supabase: Client = Depends(get_supabase_client),
):
    from app.services.notification_service import NotificationService

    return NotificationService(supabase=supabase)


def get_fork_service(
    supabase: Client = Depends(get_supabase_client),
    score_engine=Depends(get_score_engine),
):
    from app.services.fork_service import ForkService

    return ForkService(supabase=supabase, score_engine=score_engine)
