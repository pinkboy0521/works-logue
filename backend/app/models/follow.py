from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class FollowResponse(BaseModel):
    follower_id: UUID
    followee_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class SeedFollowResponse(BaseModel):
    user_id: UUID
    seed_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
