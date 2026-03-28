"""Integration tests for Louges API."""
from unittest.mock import MagicMock
from uuid import uuid4

import pytest


def _louge_row(louge_id=None, seed_id=None):
    return {
        "id": str(louge_id or uuid4()),
        "seed_id": str(seed_id or uuid4()),
        "pattern_name": "Test Pattern",
        "title": "Test Louge Title",
        "content": "Full louge content here",
        "pattern_context": "Context description",
        "pattern_problem": "Problem description",
        "pattern_solution": "Solution description",
        "status": "published",
        "quality_score": 0.85,
        "fork_count": 0,
        "created_at": "2026-03-28T00:00:00+00:00",
        "published_at": "2026-03-28T00:00:00+00:00",
    }


class TestListLouges:
    def test_list_louges_public(self, client, mock_supabase):
        mock_supabase.table.return_value.select.return_value.eq.return_value.order.return_value.range.return_value.execute.return_value = MagicMock(
            data=[_louge_row()], count=1
        )
        resp = client.get("/louges")
        assert resp.status_code == 200
        assert resp.json()["total"] == 1


class TestGetLouge:
    def test_get_published_louge(self, client, mock_supabase):
        louge = _louge_row()
        mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = MagicMock(
            data=louge
        )
        resp = client.get(f"/louges/{louge['id']}")
        assert resp.status_code == 200
        assert resp.json()["status"] == "published"

    def test_get_nonexistent_louge(self, client, mock_supabase):
        mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = MagicMock(
            data=None
        )
        resp = client.get(f"/louges/{uuid4()}")
        assert resp.status_code == 404


class TestForkLouge:
    def test_fork_published_louge(self, client, mock_supabase, auth_user):
        louge_id = uuid4()
        louge = _louge_row(louge_id=louge_id)
        louge["seeds"] = {"type": "query"}

        # Louge lookup
        mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = MagicMock(
            data=louge
        )
        # New seed insert
        new_seed_id = uuid4()
        mock_supabase.table.return_value.insert.return_value.execute.return_value = MagicMock(
            data=[{
                "id": str(new_seed_id),
                "user_id": str(auth_user.id),
                "type": "query",
                "title": "Fork Title",
                "content": "Fork content",
                "stage": "seed",
                "status": "active",
                "structural_completeness": 0.0,
                "quality_score": None,
                "pattern_analysis": None,
                "parent_louge_id": str(louge_id),
                "created_at": "2026-03-28T00:00:00+00:00",
                "updated_at": "2026-03-28T00:00:00+00:00",
            }]
        )
        mock_supabase.table.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock(data=[{}])
        mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = MagicMock(
            data={"total_score": 0, "fork_count": 0}
        )

        resp = client.post(
            f"/louges/{louge_id}/fork",
            json={"title": "Fork Title", "initial_content": "Fork content"},
        )
        assert resp.status_code == 201
