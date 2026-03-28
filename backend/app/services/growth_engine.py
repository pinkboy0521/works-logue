import asyncio
import time
from datetime import datetime, timezone
from typing import Any, Dict, List
from uuid import UUID

from fastapi import BackgroundTasks
from supabase import Client

from app.config import settings
from app.models.enums import FacilitationType, GrowthStage, SeedStatus
from app.repositories.log_repository import LogRepository
from app.repositories.notification_repository import NotificationRepository
from app.repositories.profile_repository import ProfileRepository
from app.repositories.seed_repository import SeedRepository
from app.services.ai_service import AIService, QualityBreakdown
from app.utils.logging import setup_logger

logger = setup_logger("growth_engine")

FACILITATION_MESSAGES = {
    FacilitationType.NEED_COUNTERARGUMENT: "素晴らしい解決策が集まっています。一方で、この手法を試して『逆効果だった』『うまくいかなかった』という経験をお持ちの方はいますか？",
    FacilitationType.NEED_SPECIFICITY: "実践的な知見が集まっています。具体的に現場で使うフォーマット・ツール・キラークエスチョンの文言などを共有いただけますか？",
    FacilitationType.NEED_COMPREHENSIVENESS: "この課題について、『再発防止策』や『そもそもこの状況を回避する方法』という視点での知見はありますか？",
    FacilitationType.NEED_DIVERSITY: "さまざまな業種・役割の方のLogが集まると、より普遍的な知恵になります。異なる業種・立場から見たこの課題への見解を歓迎します。",
}


class GrowthEngine:
    def __init__(self, ai_service: AIService, supabase: Client):
        self._ai = ai_service
        self._seed_repo = SeedRepository(supabase)
        self._log_repo = LogRepository(supabase)
        self._notification_repo = NotificationRepository(supabase)
        self._profile_repo = ProfileRepository(supabase)

    async def check_and_advance(
        self, seed_id: UUID, background_tasks: BackgroundTasks
    ) -> GrowthStage:
        start = time.monotonic()
        logger.info("GrowthEngine.check_and_advance started", extra={"seed_id": str(seed_id)})

        # Step 1: Load seed state
        seed = self._seed_repo.get_by_id(seed_id)
        if seed is None:
            logger.warning("Seed not found", extra={"seed_id": str(seed_id)})
            return GrowthStage.SEED

        user_log_count = self._log_repo.count_user_logs(seed_id)
        participant_count = self._log_repo.count_participants(seed_id)

        # Step 2: Lightweight structural check (Condition A)
        user_logs_res = (
            self._seed_repo._db.table("logs")
            .select("*")
            .eq("seed_id", str(seed_id))
            .eq("is_ai_facilitation", False)
            .execute()
        )
        user_logs = user_logs_res.data or []

        pattern_analysis = await self._ai.lightweight_structural_check(seed, user_logs)
        if pattern_analysis is not None:
            self._seed_repo.update_structural_completeness(
                seed_id,
                pattern_analysis.structural_completeness,
                pattern_analysis.to_dict(),
            )
            seed["structural_completeness"] = pattern_analysis.structural_completeness
        else:
            # Fallback: keep previous value
            pass

        structural = float(seed.get("structural_completeness", 0.0))

        # Step 3: Determine stage
        prev_stage = GrowthStage(seed["stage"])
        new_stage = self._determine_stage(seed, user_log_count, participant_count)

        if new_stage != prev_stage:
            self._seed_repo.update_stage(seed_id, new_stage)
            logger.info(
                "Stage transition",
                extra={
                    "seed_id": str(seed_id),
                    "from_stage": prev_stage.value,
                    "to_stage": new_stage.value,
                },
            )
            # near_bloom notification (BR-02)
            if prev_stage == GrowthStage.GROWTH and new_stage == GrowthStage.NEAR_BLOOM:
                await self._send_bloom_near_notification(seed)

        # Step 4: Bloom trigger check
        bloom_ready = (
            structural >= settings.BLOOM_STRUCTURAL_THRESHOLD
            and user_log_count >= settings.BLOOM_LOG_COUNT
            and participant_count >= settings.BLOOM_PARTICIPANT_COUNT
            and SeedStatus(seed["status"]) == SeedStatus.ACTIVE
        )

        if bloom_ready:
            logger.info(
                "Bloom trigger fired",
                extra={
                    "seed_id": str(seed_id),
                    "quality_score": seed.get("quality_score"),
                    "structural_completeness": structural,
                },
            )
            background_tasks.add_task(self.quality_scoring_and_bloom, seed_id)

        duration_ms = int((time.monotonic() - start) * 1000)
        logger.info(
            "GrowthEngine.check_and_advance completed",
            extra={"seed_id": str(seed_id), "duration_ms": duration_ms},
        )
        return new_stage

    @staticmethod
    def _determine_stage(
        seed: Dict[str, Any], user_log_count: int, participant_count: int
    ) -> GrowthStage:
        status = SeedStatus(seed["status"])
        if status == SeedStatus.BLOOMING:
            return GrowthStage.FLOWERING

        structural = float(seed.get("structural_completeness", 0.0))
        if (
            structural >= settings.BLOOM_STRUCTURAL_THRESHOLD
            and user_log_count >= settings.BLOOM_LOG_COUNT
            and participant_count >= settings.BLOOM_PARTICIPANT_COUNT
        ):
            return GrowthStage.NEAR_BLOOM
        if structural >= 0.5:
            return GrowthStage.GROWTH
        if user_log_count >= 1:
            return GrowthStage.SPROUT
        return GrowthStage.SEED

    async def quality_scoring_and_bloom(self, seed_id: UUID) -> None:
        start = time.monotonic()
        logger.info(
            "BackgroundTask started",
            extra={"task": "quality_scoring", "seed_id": str(seed_id)},
        )

        seed = self._seed_repo.get_by_id(seed_id)
        if seed is None:
            return

        user_logs_res = (
            self._seed_repo._db.table("logs")
            .select("*")
            .eq("seed_id", str(seed_id))
            .eq("is_ai_facilitation", False)
            .execute()
        )
        user_logs = user_logs_res.data or []

        # Gather participant tags for diversity scoring
        participant_ids = list({log["user_id"] for log in user_logs})
        participant_tags = self._build_participant_tags(participant_ids)

        try:
            breakdown: QualityBreakdown = await self._ai.score_quality(seed, user_logs, participant_tags)
        except Exception as e:
            logger.error(
                "quality_scoring failed",
                extra={"task": "quality_scoring", "seed_id": str(seed_id), "error": str(e)},
            )
            return

        self._seed_repo.update_quality_score(seed_id, breakdown.quality_score)

        if breakdown.quality_score >= settings.BLOOM_QUALITY_SCORE:
            # Trigger Louge generation
            self._seed_repo.update_status(seed_id, SeedStatus.BLOOMING)
            logger.info(
                "Quality score passed — triggering Louge generation",
                extra={"seed_id": str(seed_id), "quality_score": breakdown.quality_score},
            )
            # Note: cannot add_task here (outside request context); run directly
            await self._run_generate_louge(seed_id)
        else:
            # AI facilitation
            await self._post_facilitation_log(seed_id, breakdown)

        duration_ms = int((time.monotonic() - start) * 1000)
        logger.info(
            "BackgroundTask completed",
            extra={"task": "quality_scoring", "seed_id": str(seed_id), "duration_ms": duration_ms},
        )

    async def _run_generate_louge(self, seed_id: UUID) -> None:
        from app.services.score_engine import ScoreEngine
        from app.services.notification_service import NotificationService

        logger.info(
            "BackgroundTask started",
            extra={"task": "generate_louge", "seed_id": str(seed_id)},
        )

        seed = self._seed_repo.get_by_id(seed_id)
        if seed is None:
            return

        user_logs_res = (
            self._seed_repo._db.table("logs")
            .select("*")
            .eq("seed_id", str(seed_id))
            .eq("is_ai_facilitation", False)
            .execute()
        )
        user_logs = user_logs_res.data or []

        try:
            louge_data = await self._ai.generate_louge(seed, user_logs)
        except Exception as e:
            # Reset status to active for retry
            self._seed_repo.update_status(seed_id, SeedStatus.ACTIVE)
            logger.error(
                "Louge generation failed after retries",
                extra={"seed_id": str(seed_id), "error": str(e)},
            )
            return

        # Save Louge
        import uuid
        now = datetime.now(timezone.utc).isoformat()
        louge_row = {
            "id": str(uuid.uuid4()),
            "seed_id": str(seed_id),
            "pattern_name": louge_data.pattern_name,
            "title": louge_data.title,
            "content": louge_data.content,
            "pattern_context": louge_data.pattern_context,
            "pattern_problem": louge_data.pattern_problem,
            "pattern_solution": louge_data.pattern_solution,
            "status": "published",
            "quality_score": float(seed.get("quality_score") or 0.0),
            "fork_count": 0,
            "created_at": now,
            "published_at": now,
        }
        louge_res = self._seed_repo._db.table("louges").insert(louge_row).execute()
        louge_id = UUID(louge_res.data[0]["id"])

        # Update seed
        self._seed_repo.update_stage(seed_id, GrowthStage.BLOOMED)
        self._seed_repo.update_status(seed_id, SeedStatus.ACTIVE)

        # Contribution scores
        contribution_scores = await self._ai.calculate_contribution_scores(
            louge_data.content, user_logs
        )
        score_by_log = {cs.log_id: cs.contribution_score for cs in contribution_scores}

        # Aggregate by user
        user_contributions: Dict[str, float] = {}
        user_log_counts: Dict[str, int] = {}
        for log in user_logs:
            uid = log["user_id"]
            lid = UUID(str(log["id"]))
            user_contributions[uid] = user_contributions.get(uid, 0.0) + score_by_log.get(lid, 0.0)
            user_log_counts[uid] = user_log_counts.get(uid, 0) + 1

        seed_author_id = seed["user_id"]
        contributor_rows = []
        for uid, contrib in user_contributions.items():
            role = "seed_author" if uid == seed_author_id else "log_contributor"
            contributor_rows.append({
                "louge_id": str(louge_id),
                "user_id": uid,
                "role": role,
                "contribution_score": round(contrib, 4),
                "log_count": user_log_counts.get(uid, 0),
            })
        if seed_author_id not in user_contributions:
            contributor_rows.append({
                "louge_id": str(louge_id),
                "user_id": seed_author_id,
                "role": "seed_author",
                "contribution_score": 0.0,
                "log_count": 0,
            })

        if contributor_rows:
            self._seed_repo._db.table("louge_contributors").insert(contributor_rows).execute()

        # Scores & badges
        score_engine = ScoreEngine(self._seed_repo._db)
        await score_engine.award_bloom_contributors(seed_id, louge_id)

        # Notifications
        notification_service = NotificationService(self._seed_repo._db)
        await notification_service.notify_louge_bloomed(seed_id, louge_id)

        logger.info(
            "BackgroundTask completed",
            extra={"task": "generate_louge", "seed_id": str(seed_id)},
        )

    async def _post_facilitation_log(
        self, seed_id: UUID, breakdown: QualityBreakdown
    ) -> None:
        log_repo = LogRepository(self._seed_repo._db)

        # Identify the weakest dimension
        scores = {
            FacilitationType.NEED_COUNTERARGUMENT: breakdown.counterarguments,
            FacilitationType.NEED_SPECIFICITY: breakdown.specificity,
            FacilitationType.NEED_COMPREHENSIVENESS: breakdown.comprehensiveness,
            FacilitationType.NEED_DIVERSITY: breakdown.diversity,
        }
        weakest = min(scores, key=lambda k: scores[k])

        # Avoid duplicate facilitation logs of the same type
        if log_repo.has_facilitation_log(seed_id, weakest):
            logger.info(
                "Facilitation log already exists, skipping",
                extra={"seed_id": str(seed_id), "facilitation_type": weakest.value},
            )
            return

        import uuid
        log_row = {
            "id": str(uuid.uuid4()),
            "seed_id": str(seed_id),
            "user_id": settings.SYSTEM_USER_ID,
            "parent_log_id": None,
            "content": FACILITATION_MESSAGES[weakest],
            "is_ai_facilitation": True,
            "facilitation_type": weakest.value,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        log_repo.create(log_row)
        logger.info(
            "Facilitation log posted",
            extra={"seed_id": str(seed_id), "facilitation_type": weakest.value},
        )

    def _build_participant_tags(self, user_ids: List[str]) -> List[Dict[str, Any]]:
        result = []
        for uid in user_ids:
            tags = self._profile_repo.get_user_tags(UUID(uid))
            industry_tags = []
            role_tags = []
            for tag in tags:
                tag_info = tag.get("tags", {})
                taxonomy = tag_info.get("taxonomy_types", {}) if tag_info else {}
                code = taxonomy.get("code", "")
                name = tag_info.get("name", "") if tag_info else ""
                if code == "industry":
                    industry_tags.append(name)
                elif code == "role":
                    role_tags.append(name)
            result.append(
                {"user_id": uid, "industry_tags": industry_tags, "role_tags": role_tags}
            )
        return result

    async def _send_bloom_near_notification(self, seed: Dict[str, Any]) -> None:
        from app.services.notification_service import NotificationService
        notification_service = NotificationService(self._seed_repo._db)
        await notification_service.notify_bloom_near(UUID(seed["id"]))
