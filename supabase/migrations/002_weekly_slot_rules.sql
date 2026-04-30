-- Markierung für automatisch erzeugte Slots
ALTER TABLE time_slots
  ADD COLUMN IF NOT EXISTS generated_by_schedule BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_time_slots_generated_type_start
  ON time_slots (generated_by_schedule, booking_type, start_at);

-- Wöchentliche Verfügbarkeitsregeln für automatische Slot-Generierung
CREATE TABLE weekly_slot_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_type booking_type NOT NULL,
  weekday SMALLINT NOT NULL CHECK (weekday BETWEEN 1 AND 7), -- 1=Montag ... 7=Sonntag
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (booking_type, weekday)
);

CREATE TRIGGER trg_weekly_slot_rules_updated_at
  BEFORE UPDATE ON weekly_slot_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
