from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.enums import FacilitationType, GrowthStage


class LogCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)
    parent_log_id: Optional[UUID] = None


class LogReactionCreate(BaseModel):
    reaction_type: str = Field(..., pattern="^(insight|agree|helpful)$")


class LogResponse(BaseModel):
    id: UUID
    seed_id: UUID
    user_id: UUID
    parent_log_id: Optional[UUID]
    content: str
    is_ai_facilitation: bool
    facilitation_type: Optional[FacilitationType]
    created_at: datetime

    class Config:
        from_attributes = True


class LogWithGrowthStage(BaseModel):
    log: LogResponse
    growth_stage: GrowthStage


class LogReactionResponse(BaseModel):
    id: UUID
    log_id: UUID
    user_id: UUID
    reaction_type: str
    created_at: datetime

    class Config:
        from_attributes = True
