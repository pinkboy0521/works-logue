from typing import Any, Dict, List, Optional
from uuid import UUID

from supabase import Client

from app.models.enums import LougeStatus


class LougeRepository:
    def __init__(self, supabase: Client):
        self._db = supabase

    def get_by_id(self, louge_id: UUID) -> Optional[Dict[str, Any]]:
        res = (
            self._db.table("louges")
            .select("*")
            .eq("id", str(louge_id))
            .single()
            .execute()
        )
        return res.data

    def list_louges(
        self,
        offset: int = 0,
        limit: int = 20,
        status: Optional[LougeStatus] = None,
    ) -> tuple[List[Dict[str, Any]], int]:
        query = self._db.table("louges").select("*", count="exact")
        if status:
            query = query.eq("status", status.value)
        res = query.order("published_at", desc=True).range(offset, offset + limit - 1).execute()
        return res.data or [], res.count or 0

    def create(self, data: Dict[str, Any]) -> Dict[str, Any]:
        res = self._db.table("louges").insert(data).execute()
        return res.data[0]

    def update_status(self, louge_id: UUID, status: LougeStatus) -> None:
        self._db.table("louges").update({"status": status.value}).eq("id", str(louge_id)).execute()

    def increment_fork_count(self, louge_id: UUID) -> None:
        res = self._db.table("louges").select("fork_count").eq("id", str(louge_id)).single().execute()
        current = (res.data or {}).get("fork_count", 0)
        self._db.table("louges").update({"fork_count": current + 1}).eq("id", str(louge_id)).execute()

    def insert_contributors(self, rows: List[Dict[str, Any]]) -> None:
        if rows:
            self._db.table("louge_contributors").insert(rows).execute()

    def get_contributors(self, louge_id: UUID) -> List[Dict[str, Any]]:
        res = (
            self._db.table("louge_contributors")
            .select("*, profiles!louge_contributors_user_id_fkey(id, username, display_name)")
            .eq("louge_id", str(louge_id))
            .execute()
        )
        return res.data or []
