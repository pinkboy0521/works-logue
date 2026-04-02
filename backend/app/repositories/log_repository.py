from typing import Any, Dict, List, Optional, Set
from uuid import UUID

from supabase import Client

from app.models.enums import FacilitationType


class LogRepository:
    def __init__(self, supabase: Client):
        self._db = supabase

    def create(self, data: Dict[str, Any]) -> Dict[str, Any]:
        res = self._db.table("logs").insert(data).execute()
        return res.data[0]

    def get_by_id(self, log_id: UUID) -> Optional[Dict[str, Any]]:
        res = self._db.table("logs").select("*").eq("id", str(log_id)).single().execute()
        return res.data

    def get_logs_by_seed(
        self,
        seed_id: UUID,
        include_ai: bool = True,
        offset: int = 0,
        limit: int = 20,
    ) -> tuple[List[Dict[str, Any]], int]:
        query = (
            self._db.table("logs")
            .select("*, profiles!logs_user_id_fkey(id, username, display_name, avatar_url)", count="exact")
            .eq("seed_id", str(seed_id))
        )
        if not include_ai:
            query = query.eq("is_ai_facilitation", False)
        res = query.order("created_at").range(offset, offset + limit - 1).execute()
        return res.data or [], res.count or 0

    def count_user_logs(self, seed_id: UUID) -> int:
        res = (
            self._db.table("logs")
            .select("id", count="exact")
            .eq("seed_id", str(seed_id))
            .eq("is_ai_facilitation", False)
            .execute()
        )
        return res.count or 0

    def count_participants(self, seed_id: UUID) -> int:
        res = (
            self._db.table("logs")
            .select("user_id")
            .eq("seed_id", str(seed_id))
            .eq("is_ai_facilitation", False)
            .execute()
        )
        participants: Set[str] = {r["user_id"] for r in (res.data or [])}
        return len(participants)

    def has_facilitation_log(self, seed_id: UUID, facilitation_type: FacilitationType) -> bool:
        res = (
            self._db.table("logs")
            .select("id", count="exact")
            .eq("seed_id", str(seed_id))
            .eq("is_ai_facilitation", True)
            .eq("facilitation_type", facilitation_type.value)
            .execute()
        )
        return (res.count or 0) > 0

    def add_reaction(self, data: Dict[str, Any]) -> Dict[str, Any]:
        res = self._db.table("log_reactions").upsert(data, on_conflict="log_id,user_id,reaction_type").execute()
        return res.data[0]

    def get_reactions(self, log_id: UUID) -> List[Dict[str, Any]]:
        res = (
            self._db.table("log_reactions")
            .select("*")
            .eq("log_id", str(log_id))
            .execute()
        )
        return res.data or []

    def get_log_owner_id(self, log_id: UUID) -> Optional[UUID]:
        res = self._db.table("logs").select("user_id").eq("id", str(log_id)).single().execute()
        if res.data:
            return UUID(res.data["user_id"])
        return None
