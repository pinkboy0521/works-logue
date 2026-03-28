from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from app.dependencies import AuthUser, get_current_user, get_supabase_client
from app.models.follow import FollowResponse, SeedFollowResponse
from app.repositories.follow_repository import FollowRepository

router = APIRouter(tags=["follows"])


# ---- POST /profiles/{user_id}/follow ----
@router.post("/profiles/{user_id}/follow", response_model=FollowResponse, status_code=201)
async def follow_user(
    user_id: UUID,
    current_user: AuthUser = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")
    repo = FollowRepository(supabase)
    result = repo.create_follow(current_user.id, user_id)
    return FollowResponse(**result)


# ---- DELETE /profiles/{user_id}/follow ----
@router.delete("/profiles/{user_id}/follow", status_code=204)
async def unfollow_user(
    user_id: UUID,
    current_user: AuthUser = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    repo = FollowRepository(supabase)
    repo.delete_follow(current_user.id, user_id)


# ---- GET /profiles/{user_id}/followers ----
@router.get("/profiles/{user_id}/followers")
async def get_followers(
    user_id: UUID,
    supabase: Client = Depends(get_supabase_client),
):
    repo = FollowRepository(supabase)
    return repo.get_followers(user_id)


# ---- GET /profiles/{user_id}/following ----
@router.get("/profiles/{user_id}/following")
async def get_following(
    user_id: UUID,
    supabase: Client = Depends(get_supabase_client),
):
    repo = FollowRepository(supabase)
    return repo.get_following(user_id)


# ---- POST /seeds/{seed_id}/follow ----
@router.post("/seeds/{seed_id}/follow", response_model=SeedFollowResponse, status_code=201)
async def follow_seed(
    seed_id: UUID,
    current_user: AuthUser = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    repo = FollowRepository(supabase)
    result = repo.create_seed_follow(current_user.id, seed_id)
    return SeedFollowResponse(**result)


# ---- DELETE /seeds/{seed_id}/follow ----
@router.delete("/seeds/{seed_id}/follow", status_code=204)
async def unfollow_seed(
    seed_id: UUID,
    current_user: AuthUser = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    repo = FollowRepository(supabase)
    repo.delete_seed_follow(current_user.id, seed_id)
