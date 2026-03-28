import asyncio
import json
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from uuid import UUID

from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from app.config import settings
from app.utils.logging import setup_logger

logger = setup_logger("ai_service")

# Lazy import to allow mocking in tests
_vertex_ai_initialized = False


def _init_vertex_ai():
    global _vertex_ai_initialized
    if not _vertex_ai_initialized:
        import vertexai

        vertexai.init(
            project=settings.VERTEX_AI_PROJECT_ID,
            location=settings.VERTEX_AI_LOCATION,
        )
        _vertex_ai_initialized = True


class PatternAnalysis:
    def __init__(
        self,
        context_score: float,
        problem_score: float,
        solution_score: float,
        nameable_score: float,
    ):
        self.context_score = context_score
        self.problem_score = problem_score
        self.solution_score = solution_score
        self.nameable_score = nameable_score
        self.evaluated_at = datetime.now(timezone.utc).isoformat()

    @property
    def structural_completeness(self) -> float:
        return (
            self.context_score * 0.20
            + self.problem_score * 0.25
            + self.solution_score * 0.35
            + self.nameable_score * 0.20
        )

    def to_dict(self) -> Dict[str, Any]:
        return {
            "context_score": self.context_score,
            "problem_score": self.problem_score,
            "solution_score": self.solution_score,
            "nameable_score": self.nameable_score,
            "evaluated_at": self.evaluated_at,
        }


class QualityBreakdown:
    def __init__(
        self,
        comprehensiveness: float,
        diversity: float,
        counterarguments: float,
        specificity: float,
    ):
        self.comprehensiveness = comprehensiveness
        self.diversity = diversity
        self.counterarguments = counterarguments
        self.specificity = specificity

    @property
    def quality_score(self) -> float:
        return (
            self.comprehensiveness * 0.20
            + self.diversity * 0.20
            + self.counterarguments * 0.35
            + self.specificity * 0.25
        )


class LougeData:
    def __init__(
        self,
        pattern_name: str,
        title: str,
        content: str,
        pattern_context: str,
        pattern_problem: str,
        pattern_solution: str,
    ):
        self.pattern_name = pattern_name
        self.title = title
        self.content = content
        self.pattern_context = pattern_context
        self.pattern_problem = pattern_problem
        self.pattern_solution = pattern_solution


class ContributionScore:
    def __init__(self, log_id: UUID, contribution_score: float):
        self.log_id = log_id
        self.contribution_score = contribution_score


class AIService:
    _semaphore: Optional[asyncio.Semaphore] = None

    @classmethod
    def _get_semaphore(cls) -> asyncio.Semaphore:
        if cls._semaphore is None:
            cls._semaphore = asyncio.Semaphore(settings.VERTEX_AI_MAX_CONCURRENT)
        return cls._semaphore

    async def _call_vertex_ai(self, prompt: str, model: str, timeout: float) -> str:
        """Core method: acquires semaphore, calls Vertex AI, returns text."""
        semaphore = self._get_semaphore()
        async with semaphore:
            return await asyncio.wait_for(
                self._generate_async(prompt, model),
                timeout=timeout,
            )

    async def _generate_async(self, prompt: str, model_name: str) -> str:
        _init_vertex_ai()
        from vertexai.generative_models import GenerativeModel

        loop = asyncio.get_event_loop()

        def _call():
            model = GenerativeModel(model_name)
            response = model.generate_content(prompt)
            return response.text

        return await loop.run_in_executor(None, _call)

    # ------------------------------------------------------------------
    # lightweight_structural_check (P-04 fallback on failure)
    # ------------------------------------------------------------------

    async def lightweight_structural_check(
        self, seed: Dict[str, Any], user_logs: List[Dict[str, Any]]
    ) -> Optional[PatternAnalysis]:
        logs_text = "\n".join(
            f"[Log {i+1}] {log['content']}" for i, log in enumerate(user_logs)
        )
        prompt = f"""以下のSeedと全Logを読み、ビジネスパターンとして必要な4要素がどれくらい揃っているかを0.0〜1.0で評価してください。

Seed タイトル: {seed['title']}
Seed 内容: {seed['content']}

Logs:
{logs_text}

JSON形式で回答してください:
{{
  "context_score": <float>,
  "problem_score": <float>,
  "solution_score": <float>,
  "nameable_score": <float>
}}

各スコアの意味:
- context_score: 状況（どのような環境・前提条件か）の充足度
- problem_score: 問題（どのジレンマ・障害が発生しているか）の充足度
- solution_score: 解決策（具体的な行動・仕組み）の充足度
- nameable_score: パターン名を付けられる状態か（抽象化可能か）"""

        try:
            text = await self._call_vertex_ai(
                prompt, "gemini-1.5-flash", settings.VERTEX_AI_TIMEOUT_FLASH
            )
            parsed = self._parse_json(text)
            return PatternAnalysis(
                context_score=float(parsed["context_score"]),
                problem_score=float(parsed["problem_score"]),
                solution_score=float(parsed["solution_score"]),
                nameable_score=float(parsed["nameable_score"]),
            )
        except Exception as e:
            logger.warning(
                "lightweight_structural_check failed, using fallback",
                extra={"seed_id": str(seed.get("id")), "error": str(e)},
            )
            return None

    # ------------------------------------------------------------------
    # quality_scoring (P-03 retry via quality_scoring_and_bloom caller)
    # ------------------------------------------------------------------

    async def score_quality(
        self,
        seed: Dict[str, Any],
        user_logs: List[Dict[str, Any]],
        participant_tags: List[Dict[str, Any]],
    ) -> QualityBreakdown:
        logs_text = "\n".join(
            f"[Log {i+1}] {log['content']}" for i, log in enumerate(user_logs)
        )
        tags_text = json.dumps(participant_tags, ensure_ascii=False)
        prompt = f"""以下のSeedとLogの集合を、品質の4観点で評価してください。

Seed タイトル: {seed['title']}
Seed 内容: {seed['content']}

参加者タグ情報:
{tags_text}

Logs:
{logs_text}

JSON形式で回答してください:
{{
  "comprehensiveness": <float>,
  "diversity": <float>,
  "counterarguments": <float>,
  "specificity": <float>
}}

各スコアの意味（0.0〜1.0）:
- comprehensiveness: 原因・対策・予防策など複数視点が網羅されているか
- diversity: 異なる背景・業種・役割のユーザーが参加しているか（Log内容 + タグデータを総合評価）
- counterarguments: 「このやり方は失敗した」「例外ケース」が含まれているか ★最重要
- specificity: 明日から実行できるアクションが具体的に抽出可能か"""

        text = await self._call_vertex_ai(
            prompt, "gemini-1.5-pro", settings.VERTEX_AI_TIMEOUT_SCORING
        )
        parsed = self._parse_json(text)
        return QualityBreakdown(
            comprehensiveness=float(parsed["comprehensiveness"]),
            diversity=float(parsed["diversity"]),
            counterarguments=float(parsed["counterarguments"]),
            specificity=float(parsed["specificity"]),
        )

    # ------------------------------------------------------------------
    # generate_louge (P-03 retry applied)
    # ------------------------------------------------------------------

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=4, max=60),
        retry=retry_if_exception_type((asyncio.TimeoutError, Exception)),
        reraise=True,
    )
    async def generate_louge(
        self,
        seed: Dict[str, Any],
        user_logs: List[Dict[str, Any]],
    ) -> LougeData:
        logs_text = "\n".join(
            f"[Log {i+1}] {log['content']}" for i, log in enumerate(user_logs)
        )
        prompt = f"""以下のSeedとLogを元に、パターンランゲージ形式のWikipedia型記事を生成してください。

Seed タイトル: {seed['title']}
Seed タイプ: {seed['type']}
Seed 内容: {seed['content']}

Logs:
{logs_text}

必ずJSON形式で回答してください:
{{
  "pattern_name": "<このノウハウを一言で表す固有名詞のパターン名>",
  "title": "<記事タイトル（最大300文字）>",
  "content": "<パターンランゲージ形式の全文>",
  "pattern_context": "<状況: どのような前提条件・環境で起きるか>",
  "pattern_problem": "<問題: どのジレンマ・障害が発生するか>",
  "pattern_solution": "<解決策: 具体的な行動・仕組み>"
}}

content フィールドには以下のセクションを必ず含めてください:
## パターン名
## 状況（Context）
## 問題（Problem）
## 解決策（Solution）
## 例外・反論
## 網羅的解説
## 明日から使えるアクション"""

        text = await self._call_vertex_ai(
            prompt, "gemini-1.5-pro", settings.VERTEX_AI_TIMEOUT_LOUGE
        )
        parsed = self._parse_json(text)
        return LougeData(
            pattern_name=parsed["pattern_name"],
            title=parsed["title"],
            content=parsed["content"],
            pattern_context=parsed["pattern_context"],
            pattern_problem=parsed["pattern_problem"],
            pattern_solution=parsed["pattern_solution"],
        )

    # ------------------------------------------------------------------
    # cleanse_wisdom (P-04 fallback on failure)
    # ------------------------------------------------------------------

    async def cleanse_wisdom(self, text: str):
        from app.models.seed import DetectedTerm, WisdomCleanseResult

        prompt = f"""以下のテキスト内の固有名詞（社名・人名・製品名・プロジェクト名）を検出し、各固有名詞に対して抽象化候補テキストを提案してください。

テキスト:
{text}

JSON形式で回答してください:
{{
  "detected_terms": [
    {{
      "original": "<元の固有名詞>",
      "suggestion": "<抽象化候補テキスト>",
      "category": "<company|person|product|project>",
      "start_pos": <開始位置>,
      "end_pos": <終了位置>
    }}
  ],
  "cleansed_text": "<全固有名詞を置換済みのテキスト>"
}}"""

        try:
            raw = await self._call_vertex_ai(
                prompt, "gemini-1.5-pro", settings.VERTEX_AI_TIMEOUT_CLEANSE
            )
            parsed = self._parse_json(raw)
            terms = [DetectedTerm(**t) for t in parsed.get("detected_terms", [])]
            return WisdomCleanseResult(
                detected_terms=terms,
                cleansed_text=parsed.get("cleansed_text", text),
            )
        except Exception as e:
            logger.warning("cleanse_wisdom failed, returning empty result", extra={"error": str(e)})
            from app.models.seed import WisdomCleanseResult
            return WisdomCleanseResult(detected_terms=[], cleansed_text=text)

    # ------------------------------------------------------------------
    # calculate_contribution_scores
    # ------------------------------------------------------------------

    async def calculate_contribution_scores(
        self, louge_content: str, logs: List[Dict[str, Any]]
    ) -> List[ContributionScore]:
        logs_text = json.dumps(
            [{"log_id": str(log["id"]), "content": log["content"]} for log in logs],
            ensure_ascii=False,
        )
        prompt = f"""以下のLouge記事と各Logを読み、各Logがこの記事の生成にどれだけ貢献したかを0.0〜1.0で評価してください。
スコアの合計が1.0になるよう正規化してください。

Louge記事:
{louge_content}

Logs（JSON）:
{logs_text}

JSON配列で回答してください:
[
  {{"log_id": "<UUID>", "contribution_score": <float>}},
  ...
]"""

        try:
            text = await self._call_vertex_ai(
                prompt, "gemini-1.5-pro", settings.VERTEX_AI_TIMEOUT_SCORING
            )
            parsed = json.loads(self._extract_json(text))
            return [
                ContributionScore(
                    log_id=UUID(item["log_id"]),
                    contribution_score=float(item["contribution_score"]),
                )
                for item in parsed
            ]
        except Exception as e:
            logger.warning(
                "calculate_contribution_scores failed, using fallback",
                extra={"error": str(e)},
            )
            # Fallback: uniform distribution
            if not logs:
                return []
            score = 1.0 / len(logs)
            return [ContributionScore(log_id=UUID(str(log["id"])), contribution_score=score) for log in logs]

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    def _parse_json(self, text: str) -> Dict[str, Any]:
        text = self._extract_json(text)
        return json.loads(text)

    @staticmethod
    def _extract_json(text: str) -> str:
        """Extract JSON block from Vertex AI response (may contain markdown fences)."""
        text = text.strip()
        if text.startswith("```"):
            lines = text.splitlines()
            start = 1
            end = len(lines)
            for i in range(len(lines) - 1, 0, -1):
                if lines[i].strip() == "```":
                    end = i
                    break
            text = "\n".join(lines[start:end])
        return text
