import uuid
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from supabase import Client

from app.dependencies import (
    AuthUser,
    get_ai_service,
    get_current_user,
    get_growth_engine,
    get_score_engine,
    get_supabase_client,
)
from app.models.enums import GrowthStage, ScoreAction, SeedStatus
from app.models.pagination import PaginatedResponse, PaginationParams
from app.models.seed import SeedCreate, SeedResponse, SeedUpdate, WisdomCleanseRequest
from app.repositories.seed_repository import SeedRepository
from app.services.ai_service import AIService
from app.services.growth_engine import GrowthEngine
from app.services.score_engine import ScoreEngine

router = APIRouter(prefix="/seeds", tags=["seeds"])


def _to_seed_response(data: dict) -> SeedResponse:
    return SeedResponse(**data)


# ---- GET /seeds ----
@router.get("", response_model=PaginatedResponse[SeedResponse])
async def list_seeds(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    user_id: Optional[UUID] = Query(None),
    tag_id: Optional[UUID] = Query(None),
    supabase: Client = Depends(get_supabase_client),
):
    params = PaginationParams(page=page, per_page=per_page)
    repo = SeedRepository(supabase)
    items, total = repo.list_seeds(
        offset=params.offset,
        limit=params.per_page,
        user_id=user_id,
        tag_id=tag_id,
    )
    return PaginatedResponse.create(
        items=[SeedResponse(**s) for s in items],
        total=total,
        page=page,
        per_page=per_page,
    )


# ---- POST /seeds/cleanse ----
@router.post("/cleanse")
async def cleanse_wisdom(
    body: WisdomCleanseRequest,
    _: AuthUser = Depends(get_current_user),
    ai_service: AIService = Depends(get_ai_service),
):
    return await ai_service.cleanse_wisdom(body.text)


# ---- GET /seeds/{seed_id} ----
@router.get("/{seed_id}", response_model=SeedResponse)
async def get_seed(
    seed_id: UUID,
    supabase: Client = Depends(get_supabase_client),
):
    repo = SeedRepository(supabase)
    seed = repo.get_by_id(seed_id)
    if seed is None:
        raise HTTPException(status_code=404, detail="Seed not found")
    return SeedResponse(**seed)


# ---- POST /seeds ----
@router.post("", response_model=SeedResponse, status_code=201)
async def create_seed(
    body: SeedCreate,
    current_user: AuthUser = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
    score_engine: ScoreEngine = Depends(get_score_engine),
):
    repo = SeedRepository(supabase)
    now = datetime.now(timezone.utc).isoformat()
    seed_id = str(uuid.uuid4())
    seed_data = {
        "id": seed_id,
        "user_id": str(current_user.id),
        "type": body.type.value,
        "title": body.title,
        "content": body.content,
        "stage": GrowthStage.SEED.value,
        "status": SeedStatus.ACTIVE.value,
        "structural_completeness": 0.0,
        "quality_score": None,
        "pattern_analysis": None,
        "parent_louge_id": None,
        "created_at": now,
        "updated_at": now,
    }
    created = repo.create(seed_data)

    # Attach tags
    if body.tag_ids:
        repo.add_seed_tags(UUID(seed_id), body.tag_ids)

    # Score
    await score_engine.add_score(current_user.id, ScoreAction.SEED_POST, UUID(seed_id))

    return SeedResponse(**created)


# ---- PATCH /seeds/{seed_id} ----
@router.patch("/{seed_id}", response_model=SeedResponse)
async def update_seed(
    seed_id: UUID,
    body: SeedUpdate,
    current_user: AuthUser = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    repo = SeedRepository(supabase)
    seed = repo.get_by_id(seed_id)
    if seed is None:
        raise HTTPException(status_code=404, detail="Seed not found")
    if seed["user_id"] != str(current_user.id):
        raise HTTPException(status_code=403, detail="Forbidden")

    updates = body.model_dump(exclude_none=True)
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    res = supabase.table("seeds").update(updates).eq("id", str(seed_id)).execute()
    return SeedResponse(**res.data[0])
