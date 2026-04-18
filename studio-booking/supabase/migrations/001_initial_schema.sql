-- ============================================================
-- Lady Fitness Bremgarten – Supabase Initial Schema
-- Ausführen in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Enums
CREATE TYPE booking_type    AS ENUM ('PROBETRAINING', 'PERSONAL_TRAINING');
CREATE TYPE booking_status  AS ENUM ('CONFIRMED', 'CANCELLED', 'COMPLETED');
CREATE TYPE contact_status  AS ENUM ('NEW', 'IN_PROGRESS', 'DONE', 'ARCHIVED');
CREATE TYPE contact_category AS ENUM ('GENERAL', 'MEMBERSHIP', 'OTHER');

-- Trigger-Funktion für updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -------------------------------------------------------
-- Tabelle: admin_users
-- -------------------------------------------------------
CREATE TABLE admin_users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT        UNIQUE NOT NULL,
  password_hash TEXT        NOT NULL,
  name          TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -------------------------------------------------------
-- Tabelle: time_slots
-- -------------------------------------------------------
CREATE TABLE time_slots (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  start_at     TIMESTAMPTZ  NOT NULL,
  end_at       TIMESTAMPTZ  NOT NULL,
  booking_type booking_type NOT NULL,
  created_at   TIMESTAMPTZ  DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX idx_time_slots_type_start ON time_slots (booking_type, start_at);
CREATE INDEX idx_time_slots_start      ON time_slots (start_at);

CREATE TRIGGER trg_time_slots_updated_at
  BEFORE UPDATE ON time_slots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -------------------------------------------------------
-- Tabelle: bookings
-- -------------------------------------------------------
CREATE TABLE bookings (
  id         UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id    UUID           UNIQUE NOT NULL REFERENCES time_slots(id) ON DELETE CASCADE,
  type       booking_type   NOT NULL,
  first_name TEXT           NOT NULL,
  last_name  TEXT           NOT NULL,
  email      TEXT           NOT NULL,
  phone      TEXT           NOT NULL,
  notes      TEXT,
  status     booking_status DEFAULT 'CONFIRMED',
  created_at TIMESTAMPTZ    DEFAULT NOW(),
  updated_at TIMESTAMPTZ    DEFAULT NOW()
);

CREATE INDEX idx_bookings_type_status ON bookings (type, status, created_at);
CREATE INDEX idx_bookings_email       ON bookings (email);

CREATE TRIGGER trg_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -------------------------------------------------------
-- Tabelle: contact_inquiries
-- -------------------------------------------------------
CREATE TABLE contact_inquiries (
  id         UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT             NOT NULL,
  last_name  TEXT             NOT NULL,
  email      TEXT             NOT NULL,
  phone      TEXT             NOT NULL,
  subject    TEXT             NOT NULL,
  message    TEXT             NOT NULL,
  category   contact_category DEFAULT 'GENERAL',
  status     contact_status   DEFAULT 'NEW',
  created_at TIMESTAMPTZ      DEFAULT NOW(),
  updated_at TIMESTAMPTZ      DEFAULT NOW()
);

CREATE INDEX idx_contact_inquiries_status ON contact_inquiries (status, created_at);

CREATE TRIGGER trg_contact_inquiries_updated_at
  BEFORE UPDATE ON contact_inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -------------------------------------------------------
-- Row Level Security
-- -------------------------------------------------------
ALTER TABLE admin_users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots        ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;

-- Öffentlich: zukünftige Zeitslots ohne Buchung lesen (für Buchungsformular)
CREATE POLICY "public_read_available_slots"
  ON time_slots FOR SELECT
  USING (
    start_at > NOW()
    AND id NOT IN (SELECT slot_id FROM bookings)
  );

-- Service Role bypasses RLS automatisch (alle anderen Zugriffe)

-- -------------------------------------------------------
-- Funktion: Buchung atomar anlegen (verhindert Race Conditions)
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION create_booking_atomic(
  p_slot_id    UUID,
  p_type       booking_type,
  p_first_name TEXT,
  p_last_name  TEXT,
  p_email      TEXT,
  p_phone      TEXT,
  p_notes      TEXT DEFAULT NULL
)
RETURNS TABLE(booking_id UUID, error_message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_slot     time_slots%ROWTYPE;
  v_new_id   UUID;
BEGIN
  -- Zeile sperren (verhindert parallele Buchung desselben Slots)
  SELECT * INTO v_slot FROM time_slots WHERE id = p_slot_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::UUID, 'Dieser Termin ist nicht mehr verfügbar.'::TEXT;
    RETURN;
  END IF;

  -- Schon gebucht?
  IF EXISTS (SELECT 1 FROM bookings WHERE slot_id = p_slot_id) THEN
    RETURN QUERY SELECT NULL::UUID, 'Dieser Termin wurde soeben gebucht. Bitte wählen Sie einen anderen Slot.'::TEXT;
    RETURN;
  END IF;

  -- Typ passt nicht?
  IF v_slot.booking_type != p_type THEN
    RETURN QUERY SELECT NULL::UUID, 'Termin passt nicht zur gewählten Buchungsart.'::TEXT;
    RETURN;
  END IF;

  -- In der Vergangenheit?
  IF v_slot.start_at <= NOW() THEN
    RETURN QUERY SELECT NULL::UUID, 'Dieser Termin liegt in der Vergangenheit.'::TEXT;
    RETURN;
  END IF;

  -- Buchung anlegen
  INSERT INTO bookings (slot_id, type, first_name, last_name, email, phone, notes, status)
  VALUES (p_slot_id, p_type, p_first_name, p_last_name, p_email, p_phone, p_notes, 'CONFIRMED')
  RETURNING id INTO v_new_id;

  RETURN QUERY SELECT v_new_id, NULL::TEXT;
END;
$$;

-- -------------------------------------------------------
-- Admin-Seed: ersten Admin anlegen (Passwort-Hash mit bcrypt)
-- Nach dem Anlegen: ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD entfernen
-- Alternativ: per Skript scripts/seed-admin.ts ausführen
-- -------------------------------------------------------
-- INSERT INTO admin_users (email, password_hash, name)
-- VALUES ('admin@ladyfitness-bremgarten.ch', '$2b$12$...', 'Admin');
