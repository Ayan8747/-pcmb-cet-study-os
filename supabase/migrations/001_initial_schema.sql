-- =============================================================================
-- PCMB Interactive CET — Initial Database Schema + RLS (Idempotent Migration)
-- Migration: 001_initial_schema.sql
--
-- Safe to re-run multiple times in Supabase SQL Editor.
-- Does NOT drop tables or delete user data.
--
-- Tables created/preserved:
--   profiles           — user display info
--   chapter_progress   — per-chapter completion tracking
--   concept_progress   — per-concept mastery tracking
--   question_attempts  — individual MCQ attempt records
--   test_attempts      — full mock test completion records
--   bookmarks          — saved questions, concepts, formulas
--   revision_queue     — items queued for intelligent revision
--   study_sessions     — time-tracking study activity
--
-- Security: Row Level Security is enabled on all user-data tables.
--           Users can only read and write their own rows.
-- =============================================================================


-- =============================================================================
-- 0. EXTENSIONS
-- =============================================================================

-- Enable UUID generation (already available in Supabase by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- =============================================================================
-- 1. PROFILES
-- One row per authenticated user. id = auth.users.id (foreign key).
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name    TEXT,
  email        TEXT,
  avatar_url   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookup by email (display search)
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles: users can view own row" ON public.profiles;
CREATE POLICY "profiles: users can view own row"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles: users can insert own row" ON public.profiles;
CREATE POLICY "profiles: users can insert own row"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles: users can update own row" ON public.profiles;
CREATE POLICY "profiles: users can update own row"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles: users can delete own row" ON public.profiles;
CREATE POLICY "profiles: users can delete own row"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);


-- =============================================================================
-- 2. AUTO-CREATE PROFILE ON SIGN-UP (TRIGGER)
-- Creates a profiles row automatically when a new auth.users row appears.
-- This is a safety net — the frontend also upserts on sign-up.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop trigger if it already exists (safe to re-run)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();


-- =============================================================================
-- 3. CHAPTER PROGRESS
-- Tracks per-user, per-chapter completion state.
-- UNIQUE(user_id, chapter_id) — one row per chapter per user (upsert-safe).
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.chapter_progress (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject           TEXT NOT NULL,
  chapter_id        TEXT NOT NULL,
  completion_percent INTEGER NOT NULL DEFAULT 0 CHECK (completion_percent BETWEEN 0 AND 100),
  completed         BOOLEAN NOT NULL DEFAULT false,
  last_concept_id   TEXT,
  started_at        TIMESTAMPTZ DEFAULT now(),
  last_accessed_at  TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chapter_progress_user_chapter_unique UNIQUE (user_id, chapter_id)
);

CREATE INDEX IF NOT EXISTS idx_chapter_progress_user_id  ON public.chapter_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_chapter_progress_chapter  ON public.chapter_progress(chapter_id);
CREATE INDEX IF NOT EXISTS idx_chapter_progress_updated  ON public.chapter_progress(updated_at);

ALTER TABLE public.chapter_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chapter_progress: own rows only" ON public.chapter_progress;
CREATE POLICY "chapter_progress: own rows only"
  ON public.chapter_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- =============================================================================
-- 4. CONCEPT PROGRESS
-- Tracks per-user, per-concept mastery.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.concept_progress (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  concept_id    TEXT NOT NULL,
  completed     BOOLEAN NOT NULL DEFAULT true,
  mastery_score INTEGER DEFAULT 100 CHECK (mastery_score BETWEEN 0 AND 100),
  last_seen_at  TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT concept_progress_user_concept_unique UNIQUE (user_id, concept_id)
);

CREATE INDEX IF NOT EXISTS idx_concept_progress_user_id  ON public.concept_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_concept_progress_concept  ON public.concept_progress(concept_id);
CREATE INDEX IF NOT EXISTS idx_concept_progress_updated  ON public.concept_progress(updated_at);

ALTER TABLE public.concept_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "concept_progress: own rows only" ON public.concept_progress;
CREATE POLICY "concept_progress: own rows only"
  ON public.concept_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- =============================================================================
-- 5. QUESTION ATTEMPTS
-- Records every MCQ answer attempt. Not unique — a student can attempt the
-- same question multiple times (tracked history).
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.question_attempts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id     TEXT NOT NULL,
  subject         TEXT,
  chapter_id      TEXT,
  concept_id      TEXT,
  selected_answer INTEGER,
  correct         BOOLEAN NOT NULL DEFAULT false,
  time_taken_ms   INTEGER,
  attempted_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_question_attempts_user_id    ON public.question_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_question_attempts_question   ON public.question_attempts(question_id);
CREATE INDEX IF NOT EXISTS idx_question_attempts_chapter    ON public.question_attempts(chapter_id);
CREATE INDEX IF NOT EXISTS idx_question_attempts_attempted  ON public.question_attempts(attempted_at);

ALTER TABLE public.question_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "question_attempts: own rows only" ON public.question_attempts;
CREATE POLICY "question_attempts: own rows only"
  ON public.question_attempts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- =============================================================================
-- 6. TEST ATTEMPTS
-- Records completed mock test sessions.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.test_attempts (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id           TEXT NOT NULL,
  subject           TEXT,
  title             TEXT,
  score             INTEGER NOT NULL DEFAULT 0,
  total_questions   INTEGER NOT NULL DEFAULT 0,
  correct_answers   INTEGER NOT NULL DEFAULT 0,
  incorrect_answers INTEGER NOT NULL DEFAULT 0,
  unanswered        INTEGER NOT NULL DEFAULT 0,
  accuracy          INTEGER DEFAULT 0 CHECK (accuracy BETWEEN 0 AND 100),
  time_taken_ms     INTEGER,
  started_at        TIMESTAMPTZ DEFAULT now(),
  completed_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_test_attempts_user_id    ON public.test_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_test_id    ON public.test_attempts(test_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_completed  ON public.test_attempts(completed_at);

ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "test_attempts: own rows only" ON public.test_attempts;
CREATE POLICY "test_attempts: own rows only"
  ON public.test_attempts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- =============================================================================
-- 7. BOOKMARKS
-- Saved items: questions, concepts, formulas.
-- UNIQUE(user_id, item_type, item_id) — no duplicates.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.bookmarks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type   TEXT NOT NULL DEFAULT 'question', -- 'question' | 'concept' | 'formula' | 'revision-card'
  item_id     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT bookmarks_user_item_unique UNIQUE (user_id, item_type, item_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id  ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_item_id  ON public.bookmarks(item_id);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bookmarks: own rows only" ON public.bookmarks;
CREATE POLICY "bookmarks: own rows only"
  ON public.bookmarks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- =============================================================================
-- 8. REVISION QUEUE
-- Items flagged for intelligent revision (weak concepts, wrong questions, etc.)
-- UNIQUE(user_id, concept_id) — one queue entry per concept per user.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.revision_queue (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  concept_id      TEXT NOT NULL,
  priority        INTEGER NOT NULL DEFAULT 1 CHECK (priority BETWEEN 0 AND 10),
  reason          TEXT NOT NULL DEFAULT 'manual_revision',
  -- reason values: 'weak_concept' | 'incorrect_question' | 'manual_revision'
  --                'test_mistake' | 'low_mastery'
  next_review_at  TIMESTAMPTZ DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT revision_queue_user_concept_unique UNIQUE (user_id, concept_id)
);

CREATE INDEX IF NOT EXISTS idx_revision_queue_user_id       ON public.revision_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_revision_queue_next_review   ON public.revision_queue(next_review_at);
CREATE INDEX IF NOT EXISTS idx_revision_queue_priority      ON public.revision_queue(priority DESC);

ALTER TABLE public.revision_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "revision_queue: own rows only" ON public.revision_queue;
CREATE POLICY "revision_queue: own rows only"
  ON public.revision_queue FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- =============================================================================
-- 9. STUDY SESSIONS
-- Lightweight time-tracking for study activity.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.study_sessions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject          TEXT,
  chapter_id       TEXT,
  started_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at         TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id   ON public.study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_started   ON public.study_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_study_sessions_subject   ON public.study_sessions(subject);

ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "study_sessions: own rows only" ON public.study_sessions;
CREATE POLICY "study_sessions: own rows only"
  ON public.study_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- =============================================================================
-- 10. VERIFICATION QUERIES
-- Run these after the migration to confirm everything was created correctly.
-- =============================================================================

-- Check all tables exist:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- Check RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Check policies exist:
-- SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename;

-- Check trigger exists:
-- SELECT trigger_name FROM information_schema.triggers WHERE trigger_schema = 'public';
