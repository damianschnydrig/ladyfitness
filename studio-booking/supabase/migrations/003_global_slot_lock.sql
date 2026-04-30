-- Globale Sperre für Zeitfenster über beide Buchungstypen hinweg.
-- Ziel: Ein Zeitraum kann nur einmal gebucht werden (Kapazität = 1).

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
  v_slot   time_slots%ROWTYPE;
  v_new_id UUID;
BEGIN
  -- Ziel-Slot sperren.
  SELECT * INTO v_slot FROM time_slots WHERE id = p_slot_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::UUID, 'Dieser Termin ist nicht mehr verfügbar.'::TEXT;
    RETURN;
  END IF;

  -- Gegen gleichzeitige Buchungen im selben Zeitraum schützen.
  PERFORM pg_advisory_xact_lock(hashtext(v_slot.start_at::text || '|' || v_slot.end_at::text));

  -- Zeitraum bereits belegt? (unabhängig vom Buchungstyp)
  IF EXISTS (
    SELECT 1
    FROM bookings b
    JOIN time_slots ts ON ts.id = b.slot_id
    WHERE b.status <> 'CANCELLED'
      AND ts.start_at = v_slot.start_at
      AND ts.end_at = v_slot.end_at
  ) THEN
    RETURN QUERY SELECT NULL::UUID, 'Dieser Termin wurde soeben gebucht. Bitte wählen Sie einen anderen Slot.'::TEXT;
    RETURN;
  END IF;

  IF v_slot.start_at <= NOW() THEN
    RETURN QUERY SELECT NULL::UUID, 'Dieser Termin liegt in der Vergangenheit.'::TEXT;
    RETURN;
  END IF;

  INSERT INTO bookings (slot_id, type, first_name, last_name, email, phone, notes, status)
  VALUES (p_slot_id, p_type, p_first_name, p_last_name, p_email, p_phone, p_notes, 'CONFIRMED')
  RETURNING id INTO v_new_id;

  RETURN QUERY SELECT v_new_id, NULL::TEXT;
END;
$$;

CREATE OR REPLACE FUNCTION enforce_global_booking_window()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_new_start TIMESTAMPTZ;
  v_new_end   TIMESTAMPTZ;
BEGIN
  IF NEW.status = 'CANCELLED' THEN
    RETURN NEW;
  END IF;

  SELECT start_at, end_at INTO v_new_start, v_new_end
  FROM time_slots
  WHERE id = NEW.slot_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Slot nicht gefunden.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM bookings b
    JOIN time_slots ts ON ts.id = b.slot_id
    WHERE b.id <> NEW.id
      AND b.status <> 'CANCELLED'
      AND ts.start_at = v_new_start
      AND ts.end_at = v_new_end
  ) THEN
    RAISE EXCEPTION 'Dieses Zeitfenster ist bereits gebucht.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_bookings_global_window ON bookings;
CREATE TRIGGER trg_bookings_global_window
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION enforce_global_booking_window();
