import { weeklyAvailabilityPayloadSchema } from "../src/lib/validations";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

const t1 = weeklyAvailabilityPayloadSchema.safeParse({
  "1": [
    { start: "08:00", end: "11:00", slotMinutes: 60 },
    { start: "13:00", end: "17:00", slotMinutes: 60 },
  ],
});
assert(t1.success, "TEST1 Montag zwei Intervalle");

const t2 = weeklyAvailabilityPayloadSchema.safeParse({
  "1": [
    { start: "08:00", end: "11:00", slotMinutes: 60 },
    { start: "14:00", end: "18:00", slotMinutes: 60 },
  ],
});
assert(t2.success, "TEST2 geändertes Intervall gültig");

const t5 = weeklyAvailabilityPayloadSchema.safeParse({
  "1": [
    { start: "10:00", end: "12:00", slotMinutes: 60 },
    { start: "11:00", end: "13:00", slotMinutes: 60 },
  ],
});
assert(!t5.success, "TEST5 Überlappung abgelehnt");

const t7 = weeklyAvailabilityPayloadSchema.safeParse({
  "1": [{ start: "08:00", end: "11:00", slotMinutes: 60 }],
  "3": [
    { start: "10:00", end: "12:00", slotMinutes: 60 },
    { start: "11:00", end: "13:00", slotMinutes: 60 },
  ],
});
assert(!t7.success, "TEST7 Überlappung auf anderem Wochentag wird geprüft");

console.log("verify-weekly-validation: OK");
