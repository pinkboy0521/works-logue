"""Unit tests for AIService — mocks Vertex AI SDK calls."""
import asyncio
import json
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

from app.services.ai_service import AIService, PatternAnalysis, QualityBreakdown


class TestPatternAnalysis:
    def test_structural_completeness_formula(self):
        pa = PatternAnalysis(
            context_score=1.0,
            problem_score=1.0,
            solution_score=1.0,
            nameable_score=1.0,
        )
        assert abs(pa.structural_completeness - 1.0) < 1e-6

    def test_weighted_formula(self):
        pa = PatternAnalysis(
            context_score=0.0,
            problem_score=0.0,
            solution_score=1.0,
            nameable_score=0.0,
        )
        # solution weight is 0.35
        assert abs(pa.structural_completeness - 0.35) < 1e-6

    def test_to_dict_includes_evaluated_at(self):
        pa = PatternAnalysis(0.8, 0.9, 0.7, 0.6)
        d = pa.to_dict()
        assert "evaluated_at" in d


class TestQualityBreakdown:
    def test_quality_score_formula(self):
        qb = QualityBreakdown(
            comprehensiveness=1.0,
            diversity=1.0,
            counterarguments=1.0,
            specificity=1.0,
        )
        assert abs(qb.quality_score - 1.0) < 1e-6

    def test_counterargument_weight_is_dominant(self):
        qb = QualityBreakdown(
            comprehensiveness=0.0,
            diversity=0.0,
            counterarguments=1.0,
            specificity=0.0,
        )
        # counterarguments weight = 0.35
        assert abs(qb.quality_score - 0.35) < 1e-6


class TestAIServiceFallbacks:
    @pytest.mark.asyncio
    async def test_lightweight_check_fallback_on_error(self):
        service = AIService()
        service._call_vertex_ai = AsyncMock(side_effect=Exception("network error"))
        seed = {"id": str(uuid4()), "title": "T", "content": "C"}
        result = await service.lightweight_structural_check(seed, [])
        assert result is None

    @pytest.mark.asyncio
    async def test_cleanse_wisdom_fallback_on_error(self):
        service = AIService()
        service._call_vertex_ai = AsyncMock(side_effect=Exception("timeout"))
        result = await service.cleanse_wisdom("some text")
        assert result.detected_terms == []
        assert result.cleansed_text == "some text"

    @pytest.mark.asyncio
    async def test_contribution_scores_fallback_uniform(self):
        service = AIService()
        service._call_vertex_ai = AsyncMock(side_effect=Exception("error"))
        logs = [{"id": str(uuid4()), "content": "log 1"}, {"id": str(uuid4()), "content": "log 2"}]
        result = await service.calculate_contribution_scores("louge content", logs)
        assert len(result) == 2
        for cs in result:
            assert abs(cs.contribution_score - 0.5) < 1e-6


class TestExtractJson:
    def test_plain_json(self):
        text = '{"key": "value"}'
        assert AIService._extract_json(text) == '{"key": "value"}'

    def test_markdown_fenced_json(self):
        text = "```json\n{\"key\": \"value\"}\n```"
        result = AIService._extract_json(text)
        assert "key" in result

    def test_markdown_fenced_no_language(self):
        text = "```\n{\"a\": 1}\n```"
        result = AIService._extract_json(text)
        assert "a" in result
