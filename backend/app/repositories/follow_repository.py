from typing import Any, Dict, List
from uuid import UUID

from supabase import Client


class FollowRepository:
    def __init__(self, supabase: Client):
        self._db = supabase

    # ---- User follows ----

    def create_follow(self, follower_id: UUID, followee_id: UUID) -> Dict[str, Any]:
        res = (
            self._db.table("follows")
            .upsert(
                {"follower_id": str(follower_id), "followee_id": str(followee_id)},
                on_conflict="follower_id,followee_id",
            )
            .execute()
        )
        return res.data[0]

    def delete_follow(self, follower_id: UUID, followee_id: UUID) -> None:
        self._db.table("follows").delete().eq("follower_id", str(follower_id)).eq("followee_id", str(followee_id)).execute()

    def get_following(self, user_id: UUID) -> List[Dict[str, Any]]:
        res = (
            self._db.table("follows")
            .select("followee_id, profiles!followee_id(id, username, display_name, avatar_url)")
            .eq("follower_id", str(user_id))
            .execute()
        )
        return res.data or []

    def get_followers(self, user_id: UUID) -> List[Dict[str, Any]]:
        res = (
            self._db.table("follows")
            .select("follower_id, profiles!follower_id(id, username, display_name, avatar_url)")
            .eq("followee_id", str(user_id))
            .execute()
        )
        return res.data or []

    def is_following(self, follower_id: UUID, followee_id: UUID) -> bool:
        res = (
            self._db.table("follows")
            .select("follower_id", count="exact")
            .eq("follower_id", str(follower_id))
            .eq("followee_id", str(followee_id))
            .execute()
        )
        return (res.count or 0) > 0

    # ---- Seed follows ----

    def create_seed_follow(self, user_id: UUID, seed_id: UUID) -> Dict[str, Any]:
        res = (
            self._db.table("seed_follows")
            .upsert(
                {"user_id": str(user_id), "seed_id": str(seed_id)},
                on_conflict="user_id,seed_id",
            )
            .execute()
        )
        return res.data[0]

    def delete_seed_follow(self, user_id: UUID, seed_id: UUID) -> None:
        self._db.table("seed_follows").delete().eq("user_id", str(user_id)).eq("seed_id", str(seed_id)).execute()

    def is_seed_following(self, user_id: UUID, seed_id: UUID) -> bool:
        res = (
            self._db.table("seed_follows")
            .select("user_id", count="exact")
            .eq("user_id", str(user_id))
            .eq("seed_id", str(seed_id))
            .execute()
        )
        return (res.count or 0) > 0
