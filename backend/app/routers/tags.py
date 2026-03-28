from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from supabase import Client

from app.dependencies import get_supabase_client
from app.models.tag import TagResponse, TaxonomyTypeResponse
from app.repositories.tag_repository import TagRepository

router = APIRouter(prefix="/tags", tags=["tags"])


# ---- GET /tags/taxonomy-types ----
@router.get("/taxonomy-types", response_model=List[TaxonomyTypeResponse])
async def list_taxonomy_types(
    supabase: Client = Depends(get_supabase_client),
):
    repo = TagRepository(supabase)
    items = repo.get_taxonomy_types()
    return [TaxonomyTypeResponse(**t) for t in items]


# ---- GET /tags ----
@router.get("", response_model=List[TagResponse])
async def list_tags(
    taxonomy: str = Query(..., description="taxonomy_type code: seed_topic | industry | role"),
    parent_id: Optional[UUID] = Query(None),
    supabase: Client = Depends(get_supabase_client),
):
    repo = TagRepository(supabase)
    items = repo.get_tags_by_taxonomy(taxonomy, parent_id)
    return [TagResponse(**t) for t in items]
