from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from supabase import Client

from app.dependencies import AuthUser, get_current_user, get_supabase_client
from app.models.notification import NotificationResponse
from app.models.pagination import PaginatedResponse, PaginationParams
from app.repositories.notification_repository import NotificationRepository

router = APIRouter(prefix="/notifications", tags=["notifications"])


# ---- GET /notifications ----
@router.get("", response_model=PaginatedResponse[NotificationResponse])
async def list_notifications(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    unread_only: bool = Query(False),
    current_user: AuthUser = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    repo = NotificationRepository(supabase)
    params = PaginationParams(page=page, per_page=per_page)
    items, total = repo.get_by_user(
        current_user.id,
        offset=params.offset,
        limit=params.per_page,
        unread_only=unread_only,
    )
    return PaginatedResponse.create(
        items=[NotificationResponse(**n) for n in items],
        total=total,
        page=page,
        per_page=per_page,
    )


# ---- PUT /notifications/{notification_id}/read ----
@router.put("/{notification_id}/read", response_model=NotificationResponse)
async def mark_read(
    notification_id: UUID,
    current_user: AuthUser = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    repo = NotificationRepository(supabase)
    updated = repo.mark_read(notification_id, current_user.id)
    if updated is None:
        raise HTTPException(status_code=404, detail="Notification not found")
    return NotificationResponse(**updated)


# ---- PUT /notifications/read-all ----
@router.put("/read-all")
async def mark_all_read(
    current_user: AuthUser = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client),
):
    repo = NotificationRepository(supabase)
    repo.mark_all_read(current_user.id)
    return {"message": "All notifications marked as read"}
