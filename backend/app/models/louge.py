from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.enums import LougeStatus


class LougeResponse(BaseModel):
    id: UUID
    seed_id: UUID
    pattern_name: str
    title: str
    content: str
    pattern_context: str
    pattern_problem: str
    pattern_solution: str
    status: LougeStatus
    quality_score: float
    fork_count: int
    created_at: datetime
    published_at: Optional[datetime]

    class Config:
        from_attributes = True


class ForkSeedCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    initial_content: str = Field(..., min_length=1, max_length=2000)
