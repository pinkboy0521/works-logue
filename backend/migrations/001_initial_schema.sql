-- Works Logue — Initial Schema Migration
-- Run this in Supabase SQL Editor

-- Enable UUID extension (already enabled in Supabase by default)
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- taxonomy_types: tag kind master (seed_topic / industry / role)
-- ============================================================
CREATE TABLE taxonomy_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO taxonomy_types (code, display_name, sort_order) VALUES
    ('seed_topic', 'Seedトピック', 1),
    ('industry',   '業界',        2),
    ('role',       '職種',        3);

-- ============================================================
-- tags: hierarchical tags (3 levels)
-- ============================================================
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    description TEXT,
    taxonomy_type_id UUID NOT NULL REFERENCES taxonomy_types(id),
    parent_id UUID REFERENCES tags(id),
    level INTEGER NOT NULL CHECK (level IN (1, 2, 3)),
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (parent_id, name)
);

CREATE INDEX idx_tags_taxonomy_level ON tags(taxonomy_type_id, level, sort_order);
CREATE INDEX idx_tags_parent ON tags(parent_id);

-- ============================================================
-- profiles: user profiles (mirrors auth.users)
-- ============================================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    username VARCHAR(30) NOT NULL UNIQUE CHECK (username ~ '^[a-z0-9_-]{3,30}$'),
    display_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    bio VARCHAR(500),
    total_score INTEGER NOT NULL DEFAULT 0 CHECK (total_score >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- user_tags: user ↔ tag (industry/role)
-- ============================================================
CREATE TABLE user_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, tag_id)
);

-- ============================================================
-- seeds
-- ============================================================
CREATE TYPE seed_type AS ENUM (
    'query', 'pain', 'failure', 'hypothesis',
    'comparison', 'observation', 'knowledge', 'practice'
);

CREATE TYPE growth_stage AS ENUM (
    'seed', 'sprout', 'growth', 'near_bloom', 'flowering', 'bloomed'
);

CREATE TYPE seed_status AS ENUM ('active', 'blooming', 'archived');

CREATE TABLE seeds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    type seed_type NOT NULL,
    title VARCHAR(200) NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
    content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
    stage growth_stage NOT NULL DEFAULT 'seed',
    status seed_status NOT NULL DEFAULT 'active',
    structural_completeness FLOAT NOT NULL DEFAULT 0.0 CHECK (structural_completeness BETWEEN 0.0 AND 1.0),
    quality_score FLOAT,
    pattern_analysis JSONB,
    parent_louge_id UUID,  -- FK added after louges table
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_seeds_user ON seeds(user_id, created_at DESC);
CREATE INDEX idx_seeds_stage ON seeds(stage);

-- ============================================================
-- seed_tags: seed ↔ tag (seed_topic only)
-- ============================================================
CREATE TABLE seed_tags (
    seed_id UUID NOT NULL REFERENCES seeds(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id),
    PRIMARY KEY (seed_id, tag_id)
);

-- ============================================================
-- logs
-- ============================================================
CREATE TABLE logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seed_id UUID NOT NULL REFERENCES seeds(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id),
    parent_log_id UUID REFERENCES logs(id),
    content VARCHAR(1000) NOT NULL CHECK (char_length(content) BETWEEN 1 AND 1000),
    is_ai_facilitation BOOLEAN NOT NULL DEFAULT FALSE,
    facilitation_type VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_logs_seed ON logs(seed_id, created_at);
CREATE INDEX idx_logs_user ON logs(user_id);

-- ============================================================
-- log_reactions
-- ============================================================
CREATE TABLE log_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    log_id UUID NOT NULL REFERENCES logs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id),
    reaction_type VARCHAR(20) NOT NULL CHECK (reaction_type IN ('insight', 'agree', 'helpful')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (log_id, user_id, reaction_type)
);

-- ============================================================
-- louges
-- ============================================================
CREATE TYPE louge_status AS ENUM ('generating', 'published', 'archived');

CREATE TABLE louges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seed_id UUID NOT NULL REFERENCES seeds(id),
    pattern_name TEXT NOT NULL,
    title VARCHAR(300) NOT NULL,
    content TEXT NOT NULL,
    pattern_context TEXT NOT NULL,
    pattern_problem TEXT NOT NULL,
    pattern_solution TEXT NOT NULL,
    status louge_status NOT NULL DEFAULT 'generating',
    quality_score FLOAT NOT NULL DEFAULT 0.0,
    fork_count INTEGER NOT NULL DEFAULT 0 CHECK (fork_count >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

CREATE INDEX idx_louges_status ON louges(status, published_at DESC);

-- Back-fill FK from seeds to louges
ALTER TABLE seeds ADD CONSTRAINT fk_seeds_parent_louge
    FOREIGN KEY (parent_louge_id) REFERENCES louges(id);

-- ============================================================
-- louge_contributors
-- ============================================================
CREATE TABLE louge_contributors (
    louge_id UUID NOT NULL REFERENCES louges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id),
    role VARCHAR(20) NOT NULL CHECK (role IN ('seed_author', 'log_contributor')),
    contribution_score FLOAT NOT NULL DEFAULT 0.0 CHECK (contribution_score BETWEEN 0.0 AND 1.0),
    log_count INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (louge_id, user_id)
);

-- ============================================================
-- score_events
-- ============================================================
CREATE TYPE score_action AS ENUM (
    'seed_post', 'log_post', 'reaction_received',
    'louge_bloom_author', 'louge_bloom_contributor'
);

CREATE TABLE score_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    action score_action NOT NULL,
    reference_id UUID NOT NULL,
    points INTEGER NOT NULL CHECK (points > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_score_events_user ON score_events(user_id, created_at DESC);

-- ============================================================
-- badges
-- ============================================================
CREATE TYPE badge_type AS ENUM ('bloom_contributor');

CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    badge_type badge_type NOT NULL,
    reference_id UUID,
    awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- notifications
-- ============================================================
CREATE TYPE notification_type AS ENUM ('new_log', 'louge_bloomed', 'bloom_near');

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    type notification_type NOT NULL,
    reference_id UUID NOT NULL,
    message VARCHAR(200) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

-- Enable Supabase Realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ============================================================
-- follows: user → user
-- ============================================================
CREATE TABLE follows (
    follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    followee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (follower_id, followee_id),
    CHECK (follower_id != followee_id)
);

-- ============================================================
-- seed_follows: user → seed
-- ============================================================
CREATE TABLE seed_follows (
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    seed_id UUID NOT NULL REFERENCES seeds(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, seed_id)
);
