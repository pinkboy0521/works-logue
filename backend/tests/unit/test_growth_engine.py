"""Unit tests for GrowthEngine — mocks AIService and SeedRepository."""
import pytest
from unittest.mock import MagicMock, AsyncMock, patch
from uuid import uuid4

from app.models.enums import GrowthStage, SeedStatus
from app.services.growth_engine import GrowthEngine


def _make_seed(
    stage: GrowthStage = GrowthStage.SEED,
    status: SeedStatus = SeedStatus.ACTIVE,
    structural_completeness: float = 0.0,
    quality_score=None,
):
    return {
        "id": str(uuid4()),
        "user_id": str(uuid4()),
        "type": "query",
        "title": "Test Seed",
        "content": "Test content",
        "stage": stage.value,
        "status": status.value,
        "structural_completeness": structural_completeness,
        "quality_score": quality_score,
        "pattern_analysis": None,
        "parent_louge_id": None,
    }


class TestDetermineStage:
    def test_seed_stage_no_logs(self):
        seed = _make_seed(structural_completeness=0.0)
        stage = GrowthEngine._determine_stage(seed, user_log_count=0, participant_count=0)
        assert stage == GrowthStage.SEED

    def test_sprout_stage_one_log(self):
        seed = _make_seed(structural_completeness=0.1)
        stage = GrowthEngine._determine_stage(seed, user_log_count=1, participant_count=1)
        assert stage == GrowthStage.SPROUT

    def test_growth_stage_structural_above_half(self):
        seed = _make_seed(structural_completeness=0.6)
        stage = GrowthEngine._determine_stage(seed, user_log_count=5, participant_count=3)
        assert stage == GrowthStage.GROWTH

    def test_near_bloom_all_conditions_met(self):
        seed = _make_seed(structural_completeness=0.85)
        stage = GrowthEngine._determine_stage(seed, user_log_count=10, participant_count=5)
        assert stage == GrowthStage.NEAR_BLOOM

    def test_near_bloom_requires_participant_count(self):
        seed = _make_seed(structural_completeness=0.85)
        # Only 4 participants — should be GROWTH not NEAR_BLOOM
        stage = GrowthEngine._determine_stage(seed, user_log_count=10, participant_count=4)
        assert stage == GrowthStage.GROWTH

    def test_flowering_when_blooming_status(self):
        seed = _make_seed(status=SeedStatus.BLOOMING)
        stage = GrowthEngine._determine_stage(seed, user_log_count=15, participant_count=8)
        assert stage == GrowthStage.FLOWERING

    def test_stage_not_regression(self):
        # structural drops after facilitation log but stage should not regress
        # near_bloom is maintained via status check outside _determine_stage
        seed = _make_seed(structural_completeness=0.85)
        stage = GrowthEngine._determine_stage(seed, user_log_count=10, participant_count=5)
        assert stage == GrowthStage.NEAR_BLOOM


@pytest.mark.asyncio
class TestCheckAndAdvance:
    async def test_fallback_when_ai_fails(self):
        supabase = MagicMock()
        ai_service = MagicMock()
        ai_service.lightweight_structural_check = AsyncMock(return_value=None)

        seed_id = uuid4()
        seed = _make_seed(structural_completeness=0.3)
        seed["id"] = str(seed_id)

        engine = GrowthEngine(ai_service=ai_service, supabase=supabase)

        engine._seed_repo.get_by_id = MagicMock(return_value=seed)
        engine._log_repo.count_user_logs = MagicMock(return_value=2)
        engine._log_repo.count_participants = MagicMock(return_value=2)
        engine._seed_repo._db = MagicMock()
        engine._seed_repo._db.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock(data=[])

        from unittest.mock import MagicMock as MM
        bg = MM()
        bg.add_task = MM()

        result = await engine.check_and_advance(seed_id, bg)
        # structural 0.3, user_log=2 → SPROUT
        assert result == GrowthStage.SPROUT

    async def test_bloom_trigger_not_fired_below_threshold(self):
        supabase = MagicMock()
        ai_service = MagicMock()
        ai_service.lightweight_structural_check = AsyncMock(return_value=None)

        seed_id = uuid4()
        seed = _make_seed(structural_completeness=0.5)
        seed["id"] = str(seed_id)

        engine = GrowthEngine(ai_service=ai_service, supabase=supabase)
        engine._seed_repo.get_by_id = MagicMock(return_value=seed)
        engine._log_repo.count_user_logs = MagicMock(return_value=3)
        engine._log_repo.count_participants = MagicMock(return_value=2)
        engine._seed_repo._db = MagicMock()
        engine._seed_repo._db.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock(data=[])
        engine._seed_repo.update_stage = MagicMock()

        bg = MagicMock()
        bg.add_task = MagicMock()

        await engine.check_and_advance(seed_id, bg)
        bg.add_task.assert_not_called()
