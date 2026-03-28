from typing import Any, Dict, List, Optional
from uuid import UUID

from supabase import Client


class TagRepository:
    def __init__(self, supabase: Client):
        self._db = supabase

    def get_taxonomy_types(self) -> List[Dict[str, Any]]:
        res = (
            self._db.table("taxonomy_types")
            .select("*")
            .order("sort_order")
            .execute()
        )
        return res.data or []

    def get_tags_by_taxonomy(
        self,
        taxonomy_code: str,
        parent_id: Optional[UUID] = None,
    ) -> List[Dict[str, Any]]:
        query = (
            self._db.table("tags")
            .select("*, taxonomy_types!inner(code)")
            .eq("taxonomy_types.code", taxonomy_code)
        )
        if parent_id is None:
            query = query.is_("parent_id", "null")
        else:
            query = query.eq("parent_id", str(parent_id))
        res = query.order("sort_order").execute()
        return res.data or []

    def get_by_id(self, tag_id: UUID) -> Optional[Dict[str, Any]]:
        res = (
            self._db.table("tags")
            .select("*")
            .eq("id", str(tag_id))
            .single()
            .execute()
        )
        return res.data

    def get_by_ids(self, tag_ids: List[UUID]) -> List[Dict[str, Any]]:
        if not tag_ids:
            return []
        res = (
            self._db.table("tags")
            .select("*")
            .in_("id", [str(t) for t in tag_ids])
            .execute()
        )
        return res.data or []
