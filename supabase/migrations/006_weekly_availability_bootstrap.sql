-- Bootstrap: public.weekly_availability_intervals anlegen (PostgREST PGRST205),
-- Daten von weekly_slot_rules übernehmen, alte Tabelle entfernen.
-- Idempotent; Enum public.booking_type muss existieren (Migration 001).
-- Nach Ausführung im SQL Editor: PostgREST-Schema-Reload unten.

CREATE TABLE IF NOT EXISTS public.weekly_availability_intervals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_type public.booking_type NOT NULL,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes SMALLINT NOT NULL DEFAULT 60 CHECK (slot_duration_minutes > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weekly_avail_type_dow_start
  ON public.weekly_availability_intervals (booking_type, day_of_week, start_time);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname = 'update_updated_at_column'
      AND n.nspname = 'public'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger WHERE tgname = 'trg_weekly_availability_intervals_updated_at'
    ) THEN
      CREATE TRIGGER trg_weekly_availability_intervals_updated_at
        BEFORE UPDATE ON public.weekly_availability_intervals
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
  END IF;
END $$;

ALTER TABLE public.weekly_availability_intervals ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.weekly_availability_intervals IS
  'Wöchentliche Buchungsfenster; Zugriff über Service Role / Server (RLS bypass).';

GRANT ALL ON TABLE public.weekly_availability_intervals TO postgres;
GRANT ALL ON TABLE public.weekly_availability_intervals TO service_role;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'weekly_slot_rules'
  ) THEN
    INSERT INTO public.weekly_availability_intervals (
      booking_type,
      day_of_week,
      start_time,
      end_time,
      slot_duration_minutes
    )
    SELECT
      w.booking_type,
      (w.weekday % 7)::SMALLINT,
      w.start_time,
      w.end_time,
      60::SMALLINT
    FROM public.weekly_slot_rules w
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.weekly_availability_intervals x
      WHERE x.booking_type = w.booking_type
        AND x.day_of_week = (w.weekday % 7)::SMALLINT
        AND x.start_time = w.start_time
        AND x.end_time = w.end_time
    );
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'weekly_slot_rules'
  ) THEN
    DROP TRIGGER IF EXISTS trg_weekly_slot_rules_updated_at ON public.weekly_slot_rules;
    DROP TABLE public.weekly_slot_rules;
  END IF;
END $$;

SELECT pg_notify('pgrst', 'reload schema');
