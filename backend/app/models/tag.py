from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel


class TaxonomyTypeResponse(BaseModel):
    id: UUID
    code: str
    display_name: str
    description: Optional[str]
    sort_order: int

    class Config:
        from_attributes = True


class TagResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    taxonomy_type_id: UUID
    parent_id: Optional[UUID]
    level: int
    sort_order: int
    children: List["TagResponse"] = []

    class Config:
        from_attributes = True


TagResponse.model_rebuild()
