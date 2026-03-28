from typing import Any, Dict, List, Optional
from uuid import UUID

from supabase import Client

from app.models.enums import NotificationType


class NotificationRepository:
    def __init__(self, supabase: Client):
        self._db = supabase

    def create(self, data: Dict[str, Any]) -> Dict[str, Any]:
        res = self._db.table("notifications").insert(data).execute()
        return res.data[0]

    def create_bulk(self, rows: List[Dict[str, Any]]) -> None:
        if rows:
            self._db.table("notifications").insert(rows).execute()

    def get_by_user(
        self,
        user_id: UUID,
        offset: int = 0,
        limit: int = 20,
        unread_only: bool = False,
    ) -> tuple[List[Dict[str, Any]], int]:
        query = (
            self._db.table("notifications")
            .select("*", count="exact")
            .eq("user_id", str(user_id))
        )
        if unread_only:
            query = query.eq("is_read", False)
        res = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        return res.data or [], res.count or 0

    def mark_read(self, notification_id: UUID, user_id: UUID) -> Optional[Dict[str, Any]]:
        res = (
            self._db.table("notifications")
            .update({"is_read": True})
            .eq("id", str(notification_id))
            .eq("user_id", str(user_id))
            .execute()
        )
        return res.data[0] if res.data else None

    def mark_all_read(self, user_id: UUID) -> None:
        self._db.table("notifications").update({"is_read": True}).eq("user_id", str(user_id)).eq("is_read", False).execute()

    def get_bloom_near_targets(
        self, seed_id: UUID, seed_author_id: UUID
    ) -> List[UUID]:
        """Returns user IDs who follow the seed author or the seed itself (excl. author)."""
        followers_res = (
            self._db.table("follows")
            .select("follower_id")
            .eq("followee_id", str(seed_author_id))
            .execute()
        )
        seed_followers_res = (
            self._db.table("seed_follows")
            .select("user_id")
            .eq("seed_id", str(seed_id))
            .execute()
        )
        targets = set()
        for r in followers_res.data or []:
            targets.add(r["follower_id"])
        for r in seed_followers_res.data or []:
            targets.add(r["user_id"])
        targets.discard(str(seed_author_id))
        return [UUID(uid) for uid in targets]
