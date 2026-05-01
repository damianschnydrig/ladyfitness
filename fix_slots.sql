-- SQL-Cleanup und Slot-Regenerierung (Direkt für Supabase SQL Editor)
-- Nutzt weekly_availability_intervals (Multi-Intervalle, slot_duration_minutes).

-- 1. Lösche alle zukünftigen ungebuchten Slots
DELETE FROM time_slots
WHERE start_at > NOW()
AND id NOT IN (SELECT slot_id FROM bookings WHERE status != 'CANCELLED');

-- 2. Hilfsfunktion zur Generierung (PL/pgSQL Block)
DO $$
DECLARE
    v_start_date DATE := CURRENT_DATE;
    v_end_date DATE := CURRENT_DATE + INTERVAL '16 weeks';
    v_curr_date DATE;
    v_rule RECORD;
    v_slot_start TIMESTAMP WITH TIME ZONE;
    v_slot_end TIMESTAMP WITH TIME ZONE;
    v_start_time TIME;
    v_end_time TIME;
    v_dow SMALLINT;
    v_slot_dur INTERVAL;
BEGIN
    FOR v_curr_date IN SELECT i::date FROM generate_series(v_start_date, v_end_date, '1 day'::interval) i LOOP
        -- JS-Konvention 0=So … 6=Sa (entspricht MOD(ISODOW, 7))
        v_dow := (EXTRACT(ISODOW FROM v_curr_date)::int % 7);

        FOR v_rule IN
            SELECT *
            FROM weekly_availability_intervals
            WHERE day_of_week = v_dow
        LOOP
            v_start_time := v_rule.start_time;
            v_end_time := v_rule.end_time;
            v_slot_dur := make_interval(mins => v_rule.slot_duration_minutes);

            v_slot_start := v_curr_date + v_start_time;
            WHILE (v_slot_start + v_slot_dur) <= (v_curr_date + v_end_time) LOOP
                v_slot_end := v_slot_start + v_slot_dur;

                IF v_slot_start > NOW() THEN
                    INSERT INTO time_slots (start_at, end_at, booking_type, generated_by_schedule)
                    VALUES (v_slot_start, v_slot_end, v_rule.booking_type, true);
                END IF;

                v_slot_start := v_slot_start + v_slot_dur;
            END WHILE;
        END LOOP;
    END LOOP;
END $$;

-- 3. BEWEIS: Zeige die ersten 10 Slots ab dem 04.05.2026
SELECT start_at AT TIME ZONE 'Europe/Zurich' as start_zeit_lokal, booking_type
FROM time_slots
WHERE start_at >= '2026-05-04 00:00:00+00'
ORDER BY start_at ASC
LIMIT 10;
