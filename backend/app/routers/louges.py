from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from supabase import Client

from app.dependencies import (
    AuthUser,
    get_current_user,
    get_fork_service,
    get_supabase_client,
)
from app.models.louge import ForkSeedCreate, LougeResponse
from app.models.pagination import PaginatedResponse, PaginationParams
from app.models.seed import SeedResponse
from app.repositories.louge_repository import LougeRepository
from app.services.fork_service import ForkService

router = APIRouter(prefix="/louges", tags=["louges"])


# ---- GET /louges ----
@router.get("", response_model=PaginatedResponse[LougeResponse])
async def list_louges(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    supabase: Client = Depends(get_supabase_client),
):
    from app.models.enums import LougeStatus
    repo = LougeRepository(supabase)
    params = PaginationParams(page=page, per_page=per_page)
    items, total = repo.list_louges(
        offset=params.offset,
        limit=params.per_page,
        status=LougeStatus.PUBLISHED,
    )
    return PaginatedResponse.create(
        items=[LougeResponse(**l) for l in items],
        total=total,
        page=page,
        per_page=per_page,
    )


# ---- GET /louges/{louge_id} ----
@router.get("/{louge_id}", response_model=LougeResponse)
async def get_louge(
    louge_id: UUID,
    supabase: Client = Depends(get_supabase_client),
):
    repo = LougeRepository(supabase)
    louge = repo.get_by_id(louge_id)
    if louge is None:
        raise HTTPException(status_code=404, detail="Louge not found")
    return LougeResponse(**louge)


# ---- POST /louges/{louge_id}/fork ----
@router.post("/{louge_id}/fork", response_model=SeedResponse, status_code=201)
async def fork_louge(
    louge_id: UUID,
    body: ForkSeedCreate,
    current_user: AuthUser = Depends(get_current_user),
    fork_service: ForkService = Depends(get_fork_service),
):
    try:
        new_seed = await fork_service.create_fork(louge_id, body, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return SeedResponse(**new_seed)
