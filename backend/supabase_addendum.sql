-- ============================================================
-- LifeLane AI — Supabase Addendum
-- Run this in the SQL Editor AFTER running supabase_schema.sql
-- ============================================================

-- Analytics snapshot function (used by the n8n LiveAnalyticsUpdate workflow)
CREATE OR REPLACE FUNCTION get_analytics_snapshot()
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  SELECT jsonb_build_object(
    'active_ambulances',  COUNT(*) FILTER (WHERE status != 'Arrived'),
    'arrived_ambulances', COUNT(*) FILTER (WHERE status = 'Arrived'),
    'green_signals',      (SELECT COUNT(*) FROM signals WHERE status = 'green'),
    'total_signals',      (SELECT COUNT(*) FROM signals),
    'active_emergencies', (SELECT COUNT(*) FROM emergencies WHERE status IN ('active','routing','in_progress'))
  )
  FROM ambulances;
$$;

-- Index to speed up the signal distance query
CREATE INDEX IF NOT EXISTS idx_signals_status ON signals(status);
CREATE INDEX IF NOT EXISTS idx_ambulances_status ON ambulances(status);
CREATE INDEX IF NOT EXISTS idx_emergencies_status ON emergencies(status);
CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts(timestamp DESC);
