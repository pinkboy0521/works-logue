from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class ProfileUpdate(BaseModel):
    display_name: Optional[str] = Field(None, min_length=1, max_length=100)
    bio: Optional[str] = Field(None, max_length=500)
    avatar_url: Optional[str] = None


class ProfileResponse(BaseModel):
    id: UUID
    username: str
    display_name: str
    avatar_url: Optional[str]
    bio: Optional[str]
    total_score: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
