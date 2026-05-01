-- ============================================================
-- Multi-Interval Verfügbarkeit (Supabase SQL Editor / Migration)
-- Ersetzt weekly_slot_rules durch weekly_availability_intervals.
-- day_of_week: 0 = Sonntag … 6 = Samstag (wie JavaScript Date.getDay())
-- ============================================================

CREATE TABLE weekly_availability_intervals (
  id                     UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_type           booking_type NOT NULL,
  day_of_week            SMALLINT     NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time             TIME         NOT NULL,
  end_time               TIME         NOT NULL,
  slot_duration_minutes  SMALLINT     NOT NULL DEFAULT 60 CHECK (slot_duration_minutes > 0),
  created_at             TIMESTAMPTZ  DEFAULT NOW(),
  updated_at             TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weekly_avail_type_dow_start
  ON weekly_availability_intervals (booking_type, day_of_week, start_time);

CREATE TRIGGER trg_weekly_availability_intervals_updated_at
  BEFORE UPDATE ON weekly_availability_intervals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Daten aus alter Struktur (weekday 1=Mo … 7=So → day_of_week 0=So … 6=Sa)
INSERT INTO weekly_availability_intervals (
  booking_type,
  day_of_week,
  start_time,
  end_time,
  slot_duration_minutes
)
SELECT
  booking_type,
  (weekday % 7)::SMALLINT AS day_of_week,
  start_time,
  end_time,
  60::SMALLINT
FROM weekly_slot_rules;

DROP TRIGGER IF EXISTS trg_weekly_slot_rules_updated_at ON weekly_slot_rules;
DROP TABLE weekly_slot_rules;
