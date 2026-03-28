from typing import Any, Dict, List, Optional
from uuid import UUID

from supabase import Client


class ProfileRepository:
    def __init__(self, supabase: Client):
        self._db = supabase

    def get_by_id(self, user_id: UUID) -> Optional[Dict[str, Any]]:
        res = (
            self._db.table("profiles")
            .select("*")
            .eq("id", str(user_id))
            .single()
            .execute()
        )
        return res.data

    def get_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        res = (
            self._db.table("profiles")
            .select("*")
            .eq("username", username)
            .single()
            .execute()
        )
        return res.data

    def update(self, user_id: UUID, data: Dict[str, Any]) -> Dict[str, Any]:
        res = (
            self._db.table("profiles")
            .update(data)
            .eq("id", str(user_id))
            .execute()
        )
        return res.data[0]

    def increment_score(self, user_id: UUID, points: int) -> int:
        res = self._db.table("profiles").select("total_score").eq("id", str(user_id)).single().execute()
        current = (res.data or {}).get("total_score", 0)
        new_score = current + points
        self._db.table("profiles").update({"total_score": new_score}).eq("id", str(user_id)).execute()
        return new_score

    def get_user_tags(self, user_id: UUID) -> List[Dict[str, Any]]:
        res = (
            self._db.table("user_tags")
            .select("tag_id, tags(id, name, taxonomy_type_id, taxonomy_types(code))")
            .eq("user_id", str(user_id))
            .execute()
        )
        return res.data or []

    def set_user_tags(self, user_id: UUID, tag_ids: List[UUID]) -> None:
        self._db.table("user_tags").delete().eq("user_id", str(user_id)).execute()
        rows = [{"user_id": str(user_id), "tag_id": str(t)} for t in tag_ids]
        if rows:
            self._db.table("user_tags").insert(rows).execute()
