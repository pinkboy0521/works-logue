"""Integration tests for Seeds API — uses TestClient with dependency overrides."""
from unittest.mock import MagicMock
from uuid import uuid4

import pytest


def _seed_row(seed_id=None, user_id=None):
    sid = str(seed_id or uuid4())
    uid = str(user_id or uuid4())
    return {
        "id": sid,
        "user_id": uid,
        "type": "query",
        "title": "Test Seed",
        "content": "Test content body",
        "stage": "seed",
        "status": "active",
        "structural_completeness": 0.0,
        "quality_score": None,
        "pattern_analysis": None,
        "parent_louge_id": None,
        "created_at": "2026-03-28T00:00:00+00:00",
        "updated_at": "2026-03-28T00:00:00+00:00",
    }


class TestListSeeds:
    def test_list_seeds_no_auth(self, client, mock_supabase):
        mock_supabase.table.return_value.select.return_value.order.return_value.range.return_value.execute.return_value = MagicMock(
            data=[_seed_row()], count=1
        )
        resp = client.get("/seeds")
        assert resp.status_code == 200
        data = resp.json()
        assert "items" in data
        assert data["total"] == 1

    def test_list_seeds_pagination(self, client, mock_supabase):
        mock_supabase.table.return_value.select.return_value.order.return_value.range.return_value.execute.return_value = MagicMock(
            data=[], count=0
        )
        resp = client.get("/seeds?page=2&per_page=10")
        assert resp.status_code == 200


class TestGetSeed:
    def test_get_existing_seed(self, client, mock_supabase):
        seed = _seed_row()
        mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = MagicMock(
            data=seed
        )
        resp = client.get(f"/seeds/{seed['id']}")
        assert resp.status_code == 200
        assert resp.json()["id"] == seed["id"]

    def test_get_nonexistent_seed(self, client, mock_supabase):
        mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = MagicMock(
            data=None
        )
        resp = client.get(f"/seeds/{uuid4()}")
        assert resp.status_code == 404


class TestCreateSeed:
    def test_create_seed_requires_auth(self, client, mock_supabase, auth_user):
        seed = _seed_row(user_id=auth_user.id)
        mock_supabase.table.return_value.insert.return_value.execute.return_value = MagicMock(
            data=[seed]
        )
        # Score engine calls
        mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = MagicMock(
            data={"total_score": 0}
        )
        mock_supabase.table.return_value.update.return_value.eq.return_value.execute.return_value = MagicMock(
            data=[{}]
        )
        resp = client.post(
            "/seeds",
            json={"type": "query", "title": "My Seed", "content": "Detailed content here"},
        )
        assert resp.status_code == 201

    def test_create_seed_validates_title_length(self, client):
        resp = client.post(
            "/seeds",
            json={"type": "query", "title": "", "content": "Content"},
        )
        assert resp.status_code == 422

    def test_create_seed_max_tags(self, client):
        resp = client.post(
            "/seeds",
            json={
                "type": "query",
                "title": "Title",
                "content": "Content",
                "tag_ids": [str(uuid4()) for _ in range(6)],
            },
        )
        assert resp.status_code == 422
