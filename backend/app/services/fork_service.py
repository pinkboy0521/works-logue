import uuid
from datetime import datetime, timezone
from typing import Any, Dict
from uuid import UUID

from supabase import Client

from app.models.enums import GrowthStage, LougeStatus, SeedStatus
from app.models.louge import ForkSeedCreate
from app.models.seed import SeedResponse
from app.services.score_engine import ScoreEngine
from app.models.enums import ScoreAction
from app.utils.logging import setup_logger

logger = setup_logger("fork_service")


class ForkService:
    def __init__(self, supabase: Client, score_engine: ScoreEngine):
        self._db = supabase
        self._score_engine = score_engine

    async def create_fork(
        self, louge_id: UUID, fork_input: ForkSeedCreate, user_id: UUID
    ) -> Dict[str, Any]:
        # Validate louge is published (BR-12)
        louge_res = (
            self._db.table("louges")
            .select("id, status, seed_id, seeds(type)")
            .eq("id", str(louge_id))
            .single()
            .execute()
        )
        if louge_res.data is None:
            raise ValueError("Louge not found")
        louge = louge_res.data
        if louge["status"] != LougeStatus.PUBLISHED.value:
            raise ValueError("Can only fork published louges")

        # Infer seed type from the original seed
        original_seed = louge.get("seeds", {}) or {}
        seed_type = original_seed.get("type", "knowledge")

        now = datetime.now(timezone.utc).isoformat()
        new_seed_id = str(uuid.uuid4())

        new_seed = {
            "id": new_seed_id,
            "user_id": str(user_id),
            "type": seed_type,
            "title": fork_input.title,
            "content": fork_input.initial_content,
            "stage": GrowthStage.SEED.value,
            "status": SeedStatus.ACTIVE.value,
            "structural_completeness": 0.0,
            "quality_score": None,
            "pattern_analysis": None,
            "parent_louge_id": str(louge_id),
            "created_at": now,
            "updated_at": now,
        }

        res = self._db.table("seeds").insert(new_seed).execute()

        # Increment fork count
        fork_count_res = (
            self._db.table("louges")
            .select("fork_count")
            .eq("id", str(louge_id))
            .single()
            .execute()
        )
        current_fork_count = (fork_count_res.data or {}).get("fork_count", 0)
        self._db.table("louges").update({"fork_count": current_fork_count + 1}).eq("id", str(louge_id)).execute()

        # Award score
        await self._score_engine.add_score(
            user_id, ScoreAction.SEED_POST, UUID(new_seed_id)
        )

        logger.info(
            "Fork seed created",
            extra={
                "louge_id": str(louge_id),
                "new_seed_id": new_seed_id,
                "user_id": str(user_id),
            },
        )
        return res.data[0]
