"""Integration tests for Logs API."""
from unittest.mock import MagicMock, AsyncMock
from uuid import uuid4

import pytest


def _log_row(log_id=None, seed_id=None, user_id=None):
    return {
        "id": str(log_id or uuid4()),
        "seed_id": str(seed_id or uuid4()),
        "user_id": str(user_id or uuid4()),
        "parent_log_id": None,
        "content": "A log entry",
        "is_ai_facilitation": False,
        "facilitation_type": None,
        "created_at": "2026-03-28T00:00:00+00:00",
    }


def _seed_row(seed_id=None, user_id=None):
    return {
        "id": str(seed_id or uuid4()),
        "user_id": str(user_id or uuid4()),
        "type": "query",
        "title": "Test Seed",
        "content": "Test content",
        "stage": "seed",
        "status": "active",
        "structural_completeness": 0.0,
        "quality_score": None,
        "pattern_analysis": None,
        "parent_louge_id": None,
        "created_at": "2026-03-28T00:00:00+00:00",
        "updated_at": "2026-03-28T00:00:00+00:00",
    }


class TestListLogs:
    def test_list_logs(self, client, mock_supabase):
        seed_id = uuid4()
        mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.order.return_value.range.return_value.execute.return_value = MagicMock(
            data=[_log_row(seed_id=seed_id)], count=1
        )
        resp = client.get(f"/seeds/{seed_id}/logs")
        assert resp.status_code == 200
        assert resp.json()["total"] == 1


class TestCreateLog:
    def test_create_log_posts_and_returns_stage(
        self, client, mock_supabase, mock_ai_service, auth_user
    ):
        seed_id = uuid4()
        seed = _seed_row(seed_id=seed_id)
        log = _log_row(seed_id=seed_id, user_id=auth_user.id)

        # Seed lookup
        mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = MagicMock(
            data=seed
        )
        # Log insert
        mock_supabase.table.return_value.insert.return_value.execute.return_value = MagicMock(data=[log])
        # Growth engine internal calls
        mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock(
            data=[], count=0
        )
        mock_supabase.table.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock(data=[{}])

        resp = client.post(
            f"/seeds/{seed_id}/logs",
            json={"content": "This is a log"},
        )
        assert resp.status_code == 201
        body = resp.json()
        assert "log" in body
        assert "growth_stage" in body
