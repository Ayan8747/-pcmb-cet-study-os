-- =============================================================================
-- Migration: 002_add_resource_bookmarks.sql
-- PCMB Interactive CET — Free Study Materials Resource Bookmarks
--
-- Reuses the idempotent public.bookmarks table created in 001_initial_schema.sql.
-- Supports item_type = 'resource' and item_id = stable resource ID.
-- =============================================================================

-- Document resource bookmark item_type
COMMENT ON COLUMN public.bookmarks.item_type IS 'Type of bookmarked item: question, concept, formula, revision-card, resource';

-- Create index specifically for fast resource bookmark lookups
CREATE INDEX IF NOT EXISTS idx_bookmarks_resource ON public.bookmarks(user_id, item_type) WHERE item_type = 'resource';
