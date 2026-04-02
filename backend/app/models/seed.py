from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

from app.models.enums import GrowthStage, SeedStatus, SeedType


class AuthorResponse(BaseModel):
    id: UUID
    username: str
    display_name: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    total_score: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TagResponse(BaseModel):
    id: UUID
    name: str
    taxonomy_type_id: Optional[UUID] = None
    parent_id: Optional[UUID] = None
    level: int = 0
    sort_order: int = 0

    class Config:
        from_attributes = True


class LogInSeedResponse(BaseModel):
    id: UUID
    seed_id: UUID
    user_id: UUID
    parent_log_id: Optional[UUID] = None
    content: str
    is_ai_facilitation: bool
    facilitation_type: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class SeedCreate(BaseModel):
    type: SeedType
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1, max_length=2000)
    tag_ids: List[UUID] = Field(default_factory=list)

    @field_validator("tag_ids")
    @classmethod
    def max_five_tags(cls, v: List[UUID]) -> List[UUID]:
        if len(v) > 5:
            raise ValueError("A seed can have at most 5 tags")
        return v


class SeedUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = Field(None, min_length=1, max_length=2000)


class SeedResponse(BaseModel):
    id: UUID
    user_id: UUID
    type: SeedType
    title: str
    content: str
    stage: GrowthStage
    status: SeedStatus
    structural_completeness: float
    quality_score: Optional[float] = None
    pattern_analysis: Optional[Dict[str, Any]] = None
    parent_louge_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime
    # Optional embedded fields (present when fetched via get_seed_with_details)
    logs: Optional[List[LogInSeedResponse]] = None
    author: Optional[AuthorResponse] = None
    tags: Optional[List[TagResponse]] = None

    class Config:
        from_attributes = True


class WisdomCleanseRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=2000)


class DetectedTerm(BaseModel):
    original: str
    suggestion: str
    category: str
    start_pos: int
    end_pos: int


class WisdomCleanseResult(BaseModel):
    detected_terms: List[DetectedTerm]
    cleansed_text: str
