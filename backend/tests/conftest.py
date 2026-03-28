from unittest.mock import MagicMock, AsyncMock
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.dependencies import get_ai_service, get_supabase_client, get_current_user
from app.dependencies import AuthUser


@pytest.fixture
def mock_supabase():
    return MagicMock()


@pytest.fixture
def mock_ai_service():
    service = MagicMock()
    service.lightweight_structural_check = AsyncMock(return_value=None)
    service.score_quality = AsyncMock()
    service.generate_louge = AsyncMock()
    service.cleanse_wisdom = AsyncMock()
    service.calculate_contribution_scores = AsyncMock(return_value=[])
    return service


@pytest.fixture
def auth_user():
    return AuthUser(id=uuid4())


@pytest.fixture
def client(mock_supabase, mock_ai_service, auth_user):
    app.dependency_overrides[get_supabase_client] = lambda: mock_supabase
    app.dependency_overrides[get_ai_service] = lambda: mock_ai_service
    app.dependency_overrides[get_current_user] = lambda: auth_user
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
