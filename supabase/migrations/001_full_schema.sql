-- Full Dreamboard database schema.
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query → paste → Run).
-- Creates both tables from scratch with all indexes and constraints.

-- ═══════════════════════════════════════════════════════════════════
-- PROFILES TABLE — user accounts from Google OAuth sign-in
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS profiles (
  google_sub TEXT PRIMARY KEY,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ
);

-- RLS: profiles are read/write only via service_role key (API routes).
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════
-- EVENTS TABLE — lightweight analytics event tracking
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- google_sub if signed in, client-generated UUID if anonymous
  user_id TEXT NOT NULL,
  -- event type (constrained to allowed values below)
  event_type TEXT NOT NULL,
  -- flexible payload — different shape per event type
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ─── Indexes ──────────────────────────────────────────────────────

-- Single-column indexes for common filters
CREATE INDEX idx_events_user_id ON events (user_id);
CREATE INDEX idx_events_event_type ON events (event_type);
CREATE INDEX idx_events_created_at ON events (created_at);

-- Composite: events by user in time range (retention analysis)
CREATE INDEX idx_events_user_time ON events (user_id, created_at);

-- Composite: filter by event_type then range-scan created_at (admin dashboard queries)
CREATE INDEX idx_events_type_time ON events (event_type, created_at);

-- Expression index: admin queries exclude event_data->>'page' = '/admin'
CREATE INDEX idx_events_page ON events ((event_data ->> 'page'));

-- ─── Constraints ──────────────────────────────────────────────────

-- Enforce allowed event types at the DB level.
-- Update this constraint when adding new event types.
ALTER TABLE events
  ADD CONSTRAINT chk_event_type CHECK (
    event_type IN (
      'session_start',
      'page_view',
      'xp_earned',
      'habit_toggled',
      'damage_toggled',
      'vision_added',
      'challenge_completed',
      'shop_purchase',
      'feature_used',
      'user_identified'
    )
  );

-- ─── RLS ──────────────────────────────────────────────────────────

-- Events are write-only from the client (anon key).
-- Reads happen server-side via service_role key (admin dashboard, /metrics skill).
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Allow inserts from authenticated and anonymous users via anon key
CREATE POLICY "Anyone can insert events"
  ON events FOR INSERT
  WITH CHECK (true);

-- No SELECT policy for anon = client can't read events
