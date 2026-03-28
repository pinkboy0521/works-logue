from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

from app.models.enums import GrowthStage, SeedStatus, SeedType


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
    quality_score: Optional[float]
    pattern_analysis: Optional[Dict[str, Any]]
    parent_louge_id: Optional[UUID]
    created_at: datetime
    updated_at: datetime

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
