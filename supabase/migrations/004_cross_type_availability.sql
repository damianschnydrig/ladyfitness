-- ============================================================
-- Migration 004: Cross-Type Slot Availability & Blocking
-- Ausführen in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Availability-Spalten zu time_slots hinzufügen
ALTER TABLE time_slots
  ADD COLUMN IF NOT EXISTS available              BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS blocked_by_booking_id  UUID;

-- Alle bestehenden Slots als verfügbar markieren
UPDATE time_slots SET available = TRUE WHERE available IS NULL;

-- FK-Constraint (ON DELETE SET NULL: Slot wird wieder frei wenn Buchung gelöscht)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'time_slots'
      AND constraint_name = 'fk_time_slots_blocked_by'
  ) THEN
    ALTER TABLE time_slots
      ADD CONSTRAINT fk_time_slots_blocked_by
        FOREIGN KEY (blocked_by_booking_id) REFERENCES bookings(id)
        ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED;
  END IF;
END$$;

-- Index für Verfügbarkeits-Lookups
CREATE INDEX IF NOT EXISTS idx_time_slots_avail_type_start
  ON time_slots (booking_type, start_at, available)
  WHERE available = TRUE;

-- 2. RLS-Policy aktualisieren (available=TRUE + nicht gebucht)
DROP POLICY IF EXISTS "public_read_available_slots" ON time_slots;
CREATE POLICY "public_read_available_slots"
  ON time_slots FOR SELECT
  USING (
    start_at > NOW()
    AND available = TRUE
    AND id NOT IN (
      SELECT slot_id FROM bookings WHERE status <> 'CANCELLED'
    )
  );

-- 3. Alten Trigger entfernen (Logik wandert in create_booking_atomic)
DROP TRIGGER IF EXISTS trg_bookings_global_window ON bookings;
DROP FUNCTION IF EXISTS enforce_global_booking_window();

-- 4. Neues create_booking_atomic mit Cross-Type-Blockierung
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
  v_slot      time_slots%ROWTYPE;
  v_new_id    UUID;
  v_blocked   INT := 0;
BEGIN
  -- Slot sperren (verhindert Race Conditions via SELECT FOR UPDATE)
  SELECT * INTO v_slot
  FROM time_slots
  WHERE id = p_slot_id
    AND available = TRUE
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::UUID, 'Dieser Termin ist nicht mehr verfügbar.'::TEXT;
    RETURN;
  END IF;

  -- Bereits gebucht?
  IF EXISTS (
    SELECT 1 FROM bookings
    WHERE slot_id = p_slot_id AND status <> 'CANCELLED'
  ) THEN
    RETURN QUERY SELECT NULL::UUID, 'Dieser Termin wurde soeben gebucht. Bitte wählen Sie einen anderen Slot.'::TEXT;
    RETURN;
  END IF;

  -- Selber Zeitraum bereits durch anderen Typ belegt?
  IF EXISTS (
    SELECT 1
    FROM bookings b
    JOIN time_slots ts ON ts.id = b.slot_id
    WHERE b.status <> 'CANCELLED'
      AND ts.start_at = v_slot.start_at
      AND ts.end_at   = v_slot.end_at
  ) THEN
    RETURN QUERY SELECT NULL::UUID, 'Dieses Zeitfenster ist bereits für einen anderen Termin vergeben.'::TEXT;
    RETURN;
  END IF;

  -- In der Vergangenheit?
  IF v_slot.start_at <= NOW() THEN
    RETURN QUERY SELECT NULL::UUID, 'Dieser Termin liegt in der Vergangenheit.'::TEXT;
    RETURN;
  END IF;

  -- Buchungstyp passt?
  IF v_slot.booking_type <> p_type THEN
    RETURN QUERY SELECT NULL::UUID, 'Termin passt nicht zur gewählten Buchungsart.'::TEXT;
    RETURN;
  END IF;

  -- Buchung anlegen
  INSERT INTO bookings (slot_id, type, first_name, last_name, email, phone, notes, status)
  VALUES (p_slot_id, p_type, p_first_name, p_last_name, p_email, p_phone, p_notes, 'CONFIRMED')
  RETURNING id INTO v_new_id;

  -- Andere Typen am selben Zeitfenster blockieren (Cross-Type-Exklusivität)
  UPDATE time_slots
  SET
    available             = FALSE,
    blocked_by_booking_id = v_new_id
  WHERE
    start_at       = v_slot.start_at
    AND end_at     = v_slot.end_at
    AND booking_type <> v_slot.booking_type
    AND available  = TRUE
    AND id NOT IN (
      SELECT slot_id FROM bookings WHERE status <> 'CANCELLED'
    );

  GET DIAGNOSTICS v_blocked = ROW_COUNT;

  RETURN QUERY SELECT v_new_id, NULL::TEXT;
END;
$$;

-- 5. Hilfsfunktion: Slots eines Zeitfensters nach Buchungs-Cancel wieder freigeben
CREATE OR REPLACE FUNCTION unblock_slots_for_booking(p_booking_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INT;
BEGIN
  UPDATE time_slots
  SET
    available             = TRUE,
    blocked_by_booking_id = NULL
  WHERE blocked_by_booking_id = p_booking_id;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;
