from typing import Optional
from uuid import UUID

import jwt
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
) -> AuthUser:
    """Verify Supabase JWT offline and return the authenticated user."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    token = authorization.removeprefix("Bearer ").strip()
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
    except (jwt.InvalidTokenError, KeyError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid token")
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
