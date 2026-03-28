import uuid
from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from supabase import Client

from app.dependencies import (
    AuthUser,
    get_current_user,
    get_growth_engine,
    get_notification_service,
    get_score_engine,
    get_supabase_client,
)
from app.models.enums import ScoreAction
from app.models.log import LogCreate, LogReactionCreate, LogReactionResponse, LogResponse, LogWithGrowthStage
from app.models.pagination import PaginatedResponse, PaginationParams
from app.repositories.log_repository import LogRepository
from app.repositories.seed_repository import SeedRepository
from app.services.growth_engine import GrowthEngine
from app.services.notification_service import NotificationService
from app.services.score_engine import ScoreEngine

router = APIRouter(prefix="/seeds/{seed_id}/logs", tags=["logs"])
reactions_router = APIRouter(prefix="/logs", tags=["log-reactions"])


# ---- GET /seeds/{seed_id}/logs ----
@router.get("", response_model=PaginatedResponse[LogResponse])
async def list_logs(
    seed_id: UUID,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    supabase: Client = Depends(get_supabase_client),
):
    repo = LogRepository(supabase)
    params = PaginationParams(page=page, per_page=per_page)
    items, total = repo.get_logs_by_seed(
        seed_id, include_ai=True, offset=params.offset, limit=params.per_page
    )
    return PaginatedResponse.create(
        items=[LogResponse(**log) for log in items],
        total=total,
        page=page,
        per_page=per_page,
    )


# ---- POST /seeds/{seed_id}/logs ----
@router.post("", response_model=LogWithGrowthStage, status_code=201)
async def create_log(
    seed_id: UUID,
    body: LogCreate,
    background_tasks: BackgroundTasks,
    current_user: AuthUser = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
    score_engine: ScoreEngine = Depends(get_score_engine),
    notification_service: NotificationService = Depends(get_notification_service),
    growth_engine: GrowthEngine = Depends(get_growth_engine),
):
    seed_repo = SeedRepository(supabase)
    seed = seed_repo.get_by_id(seed_id)
    if seed is None:
        raise HTTPException(status_code=404, detail="Seed not found")

    # Validate reply depth (max 2 levels)
    if body.parent_log_id:
        log_repo_check = LogRepository(supabase)
        parent = log_repo_check.get_by_id(body.parent_log_id)
        if parent is None:
            raise HTTPException(status_code=404, detail="Parent log not found")
        if parent.get("parent_log_id") is not None:
            raise HTTPException(status_code=400, detail="Reply depth exceeds maximum (2 levels)")

    log_repo = LogRepository(supabase)
    now = datetime.now(timezone.utc).isoformat()
    log_id = str(uuid.uuid4())
    log_data = {
        "id": log_id,
        "seed_id": str(seed_id),
        "user_id": str(current_user.id),
        "parent_log_id": str(body.parent_log_id) if body.parent_log_id else None,
        "content": body.content,
        "is_ai_facilitation": False,
        "facilitation_type": None,
        "created_at": now,
    }
    created = log_repo.create(log_data)

    # Score for log poster
    await score_engine.add_score(current_user.id, ScoreAction.LOG_POST, UUID(log_id))

    # Notify seed author
    await notification_service.notify_new_log(seed_id, current_user.id)

    # Growth check (may add background tasks)
    new_stage = await growth_engine.check_and_advance(seed_id, background_tasks)

    return LogWithGrowthStage(log=LogResponse(**created), growth_stage=new_stage)


# ---- POST /logs/{log_id}/reactions ----
@reactions_router.post("/{log_id}/reactions", response_model=LogReactionResponse, status_code=201)
async def add_reaction(
    log_id: UUID,
    body: LogReactionCreate,
    current_user: AuthUser = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
    score_engine: ScoreEngine = Depends(get_score_engine),
):
    log_repo = LogRepository(supabase)
    log = log_repo.get_by_id(log_id)
    if log is None:
        raise HTTPException(status_code=404, detail="Log not found")

    if log.get("is_ai_facilitation"):
        raise HTTPException(status_code=400, detail="Cannot react to AI facilitation logs")

    reaction_data = {
        "id": str(uuid.uuid4()),
        "log_id": str(log_id),
        "user_id": str(current_user.id),
        "reaction_type": body.reaction_type,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    created = log_repo.add_reaction(reaction_data)

    # Award score to log owner
    log_owner_id = log_repo.get_log_owner_id(log_id)
    if log_owner_id and log_owner_id != current_user.id:
        await score_engine.add_score(log_owner_id, ScoreAction.REACTION_RECEIVED, log_id)

    return LogReactionResponse(**created)
