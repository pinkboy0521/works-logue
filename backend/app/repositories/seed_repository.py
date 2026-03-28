from typing import Any, Dict, List, Optional
from uuid import UUID

from supabase import Client

from app.models.enums import GrowthStage, SeedStatus


class SeedRepository:
    def __init__(self, supabase: Client):
        self._db = supabase

    def get_by_id(self, seed_id: UUID) -> Optional[Dict[str, Any]]:
        res = (
            self._db.table("seeds")
            .select("*")
            .eq("id", str(seed_id))
            .single()
            .execute()
        )
        return res.data

    def get_seed_with_logs(self, seed_id: UUID) -> Optional[Dict[str, Any]]:
        seed = self.get_by_id(seed_id)
        if seed is None:
            return None
        logs_res = (
            self._db.table("logs")
            .select("*, profiles(id, display_name)")
            .eq("seed_id", str(seed_id))
            .eq("is_ai_facilitation", False)
            .order("created_at")
            .execute()
        )
        seed["user_logs"] = logs_res.data or []
        return seed

    def list_seeds(
        self,
        offset: int = 0,
        limit: int = 20,
        user_id: Optional[UUID] = None,
        tag_id: Optional[UUID] = None,
    ) -> tuple[List[Dict[str, Any]], int]:
        query = self._db.table("seeds").select("*, profiles(id, username, display_name)", count="exact")
        if user_id:
            query = query.eq("user_id", str(user_id))
        if tag_id:
            seed_ids_res = (
                self._db.table("seed_tags")
                .select("seed_id")
                .eq("tag_id", str(tag_id))
                .execute()
            )
            ids = [r["seed_id"] for r in (seed_ids_res.data or [])]
            if not ids:
                return [], 0
            query = query.in_("id", ids)
        res = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        return res.data or [], res.count or 0

    def create(self, data: Dict[str, Any]) -> Dict[str, Any]:
        res = self._db.table("seeds").insert(data).execute()
        return res.data[0]

    def update_stage(self, seed_id: UUID, stage: GrowthStage) -> None:
        self._db.table("seeds").update({"stage": stage.value}).eq("id", str(seed_id)).execute()

    def update_status(self, seed_id: UUID, status: SeedStatus) -> None:
        self._db.table("seeds").update({"status": status.value}).eq("id", str(seed_id)).execute()

    def update_structural_completeness(
        self,
        seed_id: UUID,
        structural_completeness: float,
        pattern_analysis: Optional[Dict[str, Any]] = None,
    ) -> None:
        payload: Dict[str, Any] = {"structural_completeness": structural_completeness}
        if pattern_analysis is not None:
            payload["pattern_analysis"] = pattern_analysis
        self._db.table("seeds").update(payload).eq("id", str(seed_id)).execute()

    def update_quality_score(self, seed_id: UUID, quality_score: float) -> None:
        self._db.table("seeds").update({"quality_score": quality_score}).eq("id", str(seed_id)).execute()

    def add_seed_tags(self, seed_id: UUID, tag_ids: List[UUID]) -> None:
        rows = [{"seed_id": str(seed_id), "tag_id": str(t)} for t in tag_ids]
        if rows:
            self._db.table("seed_tags").insert(rows).execute()

    def get_seed_tags(self, seed_id: UUID) -> List[Dict[str, Any]]:
        res = (
            self._db.table("seed_tags")
            .select("tag_id, tags(id, name, taxonomy_type_id)")
            .eq("seed_id", str(seed_id))
            .execute()
        )
        return res.data or []
