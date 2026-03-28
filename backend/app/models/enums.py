from enum import Enum


class SeedType(str, Enum):
    QUERY = "query"
    PAIN = "pain"
    FAILURE = "failure"
    HYPOTHESIS = "hypothesis"
    COMPARISON = "comparison"
    OBSERVATION = "observation"
    KNOWLEDGE = "knowledge"
    PRACTICE = "practice"


class GrowthStage(str, Enum):
    SEED = "seed"
    SPROUT = "sprout"
    GROWTH = "growth"
    NEAR_BLOOM = "near_bloom"
    FLOWERING = "flowering"
    BLOOMED = "bloomed"


class SeedStatus(str, Enum):
    ACTIVE = "active"
    BLOOMING = "blooming"
    ARCHIVED = "archived"


class LougeStatus(str, Enum):
    GENERATING = "generating"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class ScoreAction(str, Enum):
    SEED_POST = "seed_post"
    LOG_POST = "log_post"
    REACTION_RECEIVED = "reaction_received"
    LOUGE_BLOOM_AUTHOR = "louge_bloom_author"
    LOUGE_BLOOM_CONTRIBUTOR = "louge_bloom_contributor"


class BadgeType(str, Enum):
    BLOOM_CONTRIBUTOR = "bloom_contributor"


class NotificationType(str, Enum):
    NEW_LOG = "new_log"
    LOUGE_BLOOMED = "louge_bloomed"
    BLOOM_NEAR = "bloom_near"


class FacilitationType(str, Enum):
    NEED_COUNTERARGUMENT = "need_counterargument"
    NEED_SPECIFICITY = "need_specificity"
    NEED_COMPREHENSIVENESS = "need_comprehensiveness"
    NEED_DIVERSITY = "need_diversity"
