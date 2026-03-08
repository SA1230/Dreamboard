-- Analytics events table — lightweight event tracking for product decisions.
-- Stores timestamped user events (session_start, page_view, xp_earned, etc.)
-- to answer questions like "which features get used?" and "are users coming back?"

CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- google_sub if signed in, client-generated UUID if anonymous
  user_id TEXT NOT NULL,
  -- event type: session_start, page_view, xp_earned, habit_toggled, vision_added, feature_used
  event_type TEXT NOT NULL,
  -- flexible payload — different per event type
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for querying by user (retention analysis)
CREATE INDEX idx_events_user_id ON events (user_id);

-- Index for querying by event type (feature usage analysis)
CREATE INDEX idx_events_event_type ON events (event_type);

-- Index for time-range queries (trend analysis)
CREATE INDEX idx_events_created_at ON events (created_at);

-- Composite index for common query pattern: events by user in time range
CREATE INDEX idx_events_user_time ON events (user_id, created_at);

-- RLS: events table is write-only from the client perspective.
-- Reads happen server-side via service_role key (agent queries, /metrics skill).
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Allow inserts from authenticated and anonymous users via anon key
CREATE POLICY "Anyone can insert events"
  ON events FOR INSERT
  WITH CHECK (true);

-- Only service_role can read (for agent analysis via /metrics skill)
-- No SELECT policy for anon = client can't read events
