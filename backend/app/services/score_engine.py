import uuid
from datetime import datetime, timezone
from typing import List
from uuid import UUID

from supabase import Client

from app.models.enums import BadgeType, ScoreAction
from app.config import settings
from app.utils.logging import setup_logger

logger = setup_logger("score_engine")

SCORE_POINTS = {
    ScoreAction.SEED_POST: settings.SCORE_SEED_POST,
    ScoreAction.LOG_POST: settings.SCORE_LOG_POST,
    ScoreAction.REACTION_RECEIVED: settings.SCORE_REACTION_RECEIVED,
    ScoreAction.LOUGE_BLOOM_AUTHOR: settings.SCORE_LOUGE_BLOOM_AUTHOR,
    ScoreAction.LOUGE_BLOOM_CONTRIBUTOR: settings.SCORE_LOUGE_BLOOM_CONTRIBUTOR,
}


class ScoreEngine:
    def __init__(self, supabase: Client):
        self._db = supabase

    async def add_score(
        self, user_id: UUID, action: ScoreAction, reference_id: UUID
    ) -> int:
        points = SCORE_POINTS[action]

        # Insert score event
        self._db.table("score_events").insert(
            {
                "id": str(uuid.uuid4()),
                "user_id": str(user_id),
                "action": action.value,
                "reference_id": str(reference_id),
                "points": points,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
        ).execute()

        # Atomic score increment
        res = self._db.table("profiles").select("total_score").eq("id", str(user_id)).single().execute()
        current = (res.data or {}).get("total_score", 0)
        new_score = current + points
        self._db.table("profiles").update({"total_score": new_score}).eq("id", str(user_id)).execute()

        logger.info(
            "Score added",
            extra={
                "user_id": str(user_id),
                "action": action.value,
                "points": points,
                "new_total": new_score,
            },
        )
        return new_score

    async def award_bloom_contributors(self, seed_id: UUID, louge_id: UUID) -> None:
        # Get seed author
        seed_res = self._db.table("seeds").select("user_id").eq("id", str(seed_id)).single().execute()
        if not seed_res.data:
            return
        seed_author_id = UUID(seed_res.data["user_id"])

        # Get contributors
        contributors_res = (
            self._db.table("louge_contributors")
            .select("user_id")
            .eq("louge_id", str(louge_id))
            .execute()
        )

        author_awarded = False
        for c in contributors_res.data or []:
            uid = UUID(c["user_id"])
            if uid == seed_author_id and not author_awarded:
                await self.add_score(uid, ScoreAction.LOUGE_BLOOM_AUTHOR, louge_id)
                author_awarded = True
            elif uid != seed_author_id:
                await self.add_score(uid, ScoreAction.LOUGE_BLOOM_CONTRIBUTOR, louge_id)

        # Award author if not in contributors (had no logs)
        if not author_awarded:
            await self.add_score(seed_author_id, ScoreAction.LOUGE_BLOOM_AUTHOR, louge_id)

        # Award badges to all contributors
        all_user_ids = {UUID(c["user_id"]) for c in (contributors_res.data or [])}
        all_user_ids.add(seed_author_id)
        for uid in all_user_ids:
            await self._award_badge(uid, BadgeType.BLOOM_CONTRIBUTOR, louge_id)

    async def _award_badge(
        self, user_id: UUID, badge_type: BadgeType, reference_id: UUID
    ) -> None:
        # Check for existing badge for this louge
        existing = (
            self._db.table("badges")
            .select("id", count="exact")
            .eq("user_id", str(user_id))
            .eq("badge_type", badge_type.value)
            .eq("reference_id", str(reference_id))
            .execute()
        )
        if (existing.count or 0) > 0:
            return

        self._db.table("badges").insert(
            {
                "id": str(uuid.uuid4()),
                "user_id": str(user_id),
                "badge_type": badge_type.value,
                "reference_id": str(reference_id),
                "awarded_at": datetime.now(timezone.utc).isoformat(),
            }
        ).execute()
        logger.info(
            "Badge awarded",
            extra={
                "user_id": str(user_id),
                "badge_type": badge_type.value,
                "reference_id": str(reference_id),
            },
        )
