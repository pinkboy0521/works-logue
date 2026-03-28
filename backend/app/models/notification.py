from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.models.enums import NotificationType


class NotificationResponse(BaseModel):
    id: UUID
    user_id: UUID
    type: NotificationType
    reference_id: UUID
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
