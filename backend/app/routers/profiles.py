from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from supabase import Client

from app.dependencies import AuthUser, get_current_user, get_supabase_client
from app.models.profile import ProfileResponse, ProfileUpdate
from app.repositories.profile_repository import ProfileRepository

router = APIRouter(prefix="/profiles", tags=["profiles"])


# ---- GET /profiles/me ----
@router.get("/me", response_model=ProfileResponse)
async def get_my_profile(
    current_user: AuthUser = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    repo = ProfileRepository(supabase)
    profile = repo.get_by_id(current_user.id)
    if profile is None:
        raise HTTPException(status_code=404, detail="Profile not found")
    return ProfileResponse(**profile)


# ---- PATCH /profiles/me ----
@router.patch("/me", response_model=ProfileResponse)
async def update_my_profile(
    body: ProfileUpdate,
    current_user: AuthUser = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    repo = ProfileRepository(supabase)
    updates = body.model_dump(exclude_none=True)
    if not updates:
        profile = repo.get_by_id(current_user.id)
        if profile is None:
            raise HTTPException(status_code=404, detail="Profile not found")
        return ProfileResponse(**profile)
    updated = repo.update(current_user.id, updates)
    return ProfileResponse(**updated)


# ---- PUT /profiles/me/tags ----
@router.put("/me/tags")
async def update_my_tags(
    tag_ids: List[UUID],
    current_user: AuthUser = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    repo = ProfileRepository(supabase)
    repo.set_user_tags(current_user.id, tag_ids)
    return {"message": "Tags updated"}


# ---- GET /profiles/{username} ----
@router.get("/{username}", response_model=ProfileResponse)
async def get_profile(
    username: str,
    supabase: Client = Depends(get_supabase_client),
):
    repo = ProfileRepository(supabase)
    profile = repo.get_by_username(username)
    if profile is None:
        raise HTTPException(status_code=404, detail="Profile not found")
    return ProfileResponse(**profile)
