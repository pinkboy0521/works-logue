"""Unit tests for ScoreEngine — mocks Supabase client."""
import pytest
from unittest.mock import MagicMock, AsyncMock, call
from uuid import uuid4

from app.models.enums import BadgeType, ScoreAction
from app.services.score_engine import ScoreEngine


def _make_supabase(total_score: int = 0):
    supabase = MagicMock()
    # Chain: table().insert().execute()
    supabase.table.return_value.insert.return_value.execute.return_value = MagicMock(data=[{}])
    # Chain: table().select().eq().single().execute() → for get score
    supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = MagicMock(
        data={"total_score": total_score}
    )
    # Chain: table().update().eq().execute()
    supabase.table.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock(data=[{}])
    # Chain for badge check (count)
    supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock(
        count=0
    )
    return supabase


@pytest.mark.asyncio
class TestAddScore:
    async def test_adds_correct_points_for_seed_post(self):
        supabase = _make_supabase(total_score=0)
        engine = ScoreEngine(supabase)
        new_score = await engine.add_score(uuid4(), ScoreAction.SEED_POST, uuid4())
        assert new_score == 10  # SCORE_SEED_POST default

    async def test_adds_correct_points_for_log_post(self):
        supabase = _make_supabase(total_score=10)
        engine = ScoreEngine(supabase)
        new_score = await engine.add_score(uuid4(), ScoreAction.LOG_POST, uuid4())
        assert new_score == 15  # 10 existing + 5

    async def test_bloom_author_points(self):
        supabase = _make_supabase(total_score=0)
        engine = ScoreEngine(supabase)
        new_score = await engine.add_score(uuid4(), ScoreAction.LOUGE_BLOOM_AUTHOR, uuid4())
        assert new_score == 50


@pytest.mark.asyncio
class TestAwardBloomContributors:
    async def test_author_gets_author_score_not_contributor(self):
        """Seed author gets LOUGE_BLOOM_AUTHOR (+50), not LOUGE_BLOOM_CONTRIBUTOR (+30)."""
        author_id = uuid4()
        louge_id = uuid4()
        seed_id = uuid4()

        supabase = MagicMock()
        # seed author query
        supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = MagicMock(
            data={"user_id": str(author_id)}
        )
        # contributors query
        supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = MagicMock(
            data=[{"user_id": str(author_id)}]
        )

        engine = ScoreEngine(supabase)
        engine.add_score = AsyncMock(return_value=50)
        engine._award_badge = AsyncMock()

        await engine.award_bloom_contributors(seed_id, louge_id)

        engine.add_score.assert_called_once_with(
            author_id, ScoreAction.LOUGE_BLOOM_AUTHOR, louge_id
        )
