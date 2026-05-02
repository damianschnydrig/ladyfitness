/**
 * Automatisierte Tests für /api/admin/availability und /api/slots.
 * Ausführung: npx tsx --env-file=.env scripts/run-api-availability-tests.ts
 * Optional: TEST_BASE_URL=http://localhost:3000
 */

import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { DateTime } from "luxon";

const ZONE = "Europe/Zurich";

function detectBase(): string {
  const env = process.env.TEST_BASE_URL?.trim();
  if (env) return env.replace(/\/$/, "");
  for (const port of ["3000", "3001"]) {
    try {
      const code = execFileSync(
        "curl.exe",
        ["-s", "-o", "NUL", "-w", "%{http_code}", `http://localhost:${port}/api/health`],
        { encoding: "utf8" },
      ).trim();
      if (code === "200") return `http://localhost:${port}`;
    } catch {
      /* next */
    }
  }
  return "http://localhost:3000";
}

function curl(args: string[]): { stdout: string; stderr: string } {
  try {
    const stdout = execFileSync("curl.exe", args, {
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024,
    });
    return { stdout, stderr: "" };
  } catch (e: unknown) {
    const err = e as { stdout?: string; stderr?: string; status?: number };
    return { stdout: err.stdout ?? "", stderr: err.stderr ?? String(e) };
  }
}

function upcomingMonday(): string {
  let d = DateTime.now().setZone(ZONE).startOf("day").plus({ days: 1 });
  while (d.weekday !== 1) d = d.plus({ days: 1 });
  return d.toFormat("yyyy-MM-dd");
}

type SlotRow = { startAt: string; endAt: string };

/** Prüft, dass jede erwartete Stunden-Startzeit (60-Min-Slots) im API-Ergebnis vorkommt; ignoriert Fremd-Slots. */
function slotsCoverHourlyGrid(
  slots: SlotRow[],
  dateStr: string,
  winA: { lo: string; hi: string },
  winB: { lo: string; hi: string },
): boolean {
  const toMin = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };
  const a0 = toMin(winA.lo);
  const a1 = toMin(winA.hi);
  const b0 = toMin(winB.lo);
  const b1 = toMin(winB.hi);

  const starts = new Set<number>();
  for (const s of slots) {
    const st = DateTime.fromISO(s.startAt, { zone: "utc" }).setZone(ZONE);
    if (st.toFormat("yyyy-MM-dd") !== dateStr) continue;
    const en = DateTime.fromISO(s.endAt, { zone: "utc" }).setZone(ZONE);
    const sm = st.hour * 60 + st.minute;
    const em = en.hour * 60 + en.minute;
    if (em - sm !== 60) continue;
    if (sm >= a0 && em <= a1) starts.add(sm);
    else if (sm >= b0 && em <= b1) starts.add(sm);
  }

  const wantM: number[] = [];
  for (let m = a0; m + 60 <= a1; m += 60) wantM.push(m);
  const wantP: number[] = [];
  for (let m = b0; m + 60 <= b1; m += 60) wantP.push(m);
  if (wantM.length === 0 && wantP.length === 0) return false;
  for (const w of wantM) if (!starts.has(w)) return false;
  for (const w of wantP) if (!starts.has(w)) return false;
  return true;
}

const BASE = detectBase();
const jar = path.join(os.tmpdir(), `lf-avail-${Date.now()}.txt`);

const email = process.env.ADMIN_SEED_EMAIL ?? "";
const password = process.env.ADMIN_SEED_PASSWORD ?? "";
if (!email || !password) {
  console.error("ADMIN_SEED_EMAIL und ADMIN_SEED_PASSWORD in .env erforderlich.");
  process.exit(1);
}

const monday = upcomingMonday();

// --- Login (Cookie-Jar) ---
let out = curl(["-s", "-c", jar, `${BASE}/api/auth/csrf`]);
let csrf: { csrfToken?: string };
try {
  csrf = JSON.parse(out.stdout) as { csrfToken?: string };
} catch {
  console.error("CSRF parse fail:", out.stdout);
  process.exit(1);
}
if (!csrf.csrfToken) {
  console.error("Kein csrfToken:", out.stdout);
  process.exit(1);
}

const form =
  `csrfToken=${encodeURIComponent(csrf.csrfToken)}` +
  `&email=${encodeURIComponent(email)}` +
  `&password=${encodeURIComponent(password)}` +
  `&callbackUrl=${encodeURIComponent(`${BASE}/admin`)}` +
  `&json=true&redirect=false`;

out = curl([
  "-s",
  "-b",
  jar,
  "-c",
  jar,
  "-X",
  "POST",
  `${BASE}/api/auth/callback/credentials`,
  "-H",
  "Content-Type: application/x-www-form-urlencoded",
  "-d",
  form,
]);

const loginHdr = `[LOGIN POST ${BASE}/api/auth/callback/credentials]\n${out.stdout}\n`;

function runCurl(args: string[]): string {
  const { stdout, stderr } = curl(args);
  const cmd = `curl.exe ${args.map((a) => JSON.stringify(a)).join(" ")}`;
  return `$ ${cmd}\n${stdout}${stderr ? `\n${stderr}` : ""}`;
}

function parseJsonFromCurlLog(log: string): unknown {
  const noCode = log.replace(/\r?\nHTTP_CODE:\d+\s*$/, "");
  const lines = noCode.split(/\r?\n/);
  const jsonIdx = lines.findIndex((l) => /^\s*[\[{]/.test(l));
  if (jsonIdx < 0) throw new Error("no json in curl log");
  return JSON.parse(lines.slice(jsonIdx).join("\n").trim()) as unknown;
}

const blocks: string[] = [];

// TEST 1
const post1 = JSON.stringify({
  type: "probetraining",
  schedule: {
    monday: [
      { start: "08:00", end: "11:00" },
      { start: "13:00", end: "17:00" },
    ],
  },
});
let t = runCurl([
  "-s",
  "-w",
  "\nHTTP_CODE:%{http_code}",
  "-b",
  jar,
  "-X",
  "POST",
  `${BASE}/api/admin/availability`,
  "-H",
  "Content-Type: application/json",
  "-d",
  post1,
]);
let code = (t.match(/HTTP_CODE:(\d+)/) ?? [, "0"])[1];
let get1 = runCurl(["-s", "-w", "\nHTTP_CODE:%{http_code}", "-b", jar, `${BASE}/api/admin/availability?type=probetraining`]);
let codeG = (get1.match(/HTTP_CODE:(\d+)/) ?? [, "0"])[1];
let j1: { schedule?: { monday?: { start: string; end: string }[] } };
try {
  j1 = parseJsonFromCurlLog(get1) as typeof j1;
} catch {
  j1 = {};
}
const pass1 =
  code === "200" &&
  codeG === "200" &&
  Array.isArray(j1.schedule?.monday) &&
  j1.schedule!.monday!.length === 2 &&
  j1.schedule!.monday!.some((x) => x.start === "08:00" && x.end === "11:00") &&
  j1.schedule!.monday!.some((x) => x.start === "13:00" && x.end === "17:00");
blocks.push(`[TEST1: ${pass1 ? "PASS" : "FAIL"}]\n${t}\n${get1}`);

// TEST 2
const post2 = JSON.stringify({
  type: "probetraining",
  schedule: {
    monday: [
      { start: "08:00", end: "11:00" },
      { start: "14:00", end: "18:00" },
    ],
  },
});
t = runCurl([
  "-s",
  "-w",
  "\nHTTP_CODE:%{http_code}",
  "-b",
  jar,
  "-X",
  "POST",
  `${BASE}/api/admin/availability`,
  "-H",
  "Content-Type: application/json",
  "-d",
  post2,
]);
code = (t.match(/HTTP_CODE:(\d+)/) ?? [, "0"])[1];
get1 = runCurl(["-s", "-w", "\nHTTP_CODE:%{http_code}", "-b", jar, `${BASE}/api/admin/availability?type=probetraining`]);
codeG = (get1.match(/HTTP_CODE:(\d+)/) ?? [, "0"])[1];
try {
  j1 = parseJsonFromCurlLog(get1) as typeof j1;
} catch {
  j1 = {};
}
const pass2 =
  code === "200" &&
  codeG === "200" &&
  Array.isArray(j1.schedule?.monday) &&
  j1.schedule!.monday!.length === 2 &&
  !j1.schedule!.monday!.some((x) => x.start === "13:00" && x.end === "17:00") &&
  j1.schedule!.monday!.some((x) => x.start === "14:00" && x.end === "18:00");
blocks.push(`[TEST2: ${pass2 ? "PASS" : "FAIL"}]\n${t}\n${get1}`);

// TEST 3
const slotUrl = `${BASE}/api/slots?type=probetraining&date=${encodeURIComponent(monday)}`;
const slotCurlOut = runCurl(["-s", "-w", "\nHTTP_CODE:%{http_code}", slotUrl]);
codeG = (slotCurlOut.match(/HTTP_CODE:(\d+)/) ?? [, "0"])[1];
let slots: SlotRow[] = [];
try {
  slots = parseJsonFromCurlLog(slotCurlOut) as SlotRow[];
} catch {
  slots = [];
}
const pass3 =
  codeG === "200" &&
  slotsCoverHourlyGrid(slots, monday, { lo: "08:00", hi: "11:00" }, { lo: "14:00", hi: "18:00" });
blocks.push(`[TEST3: ${pass3 ? "PASS" : "FAIL"}]\n${slotCurlOut}`);

// TEST 4 (Personal Training)
const post4a = JSON.stringify({
  type: "personal_training",
  schedule: {
    monday: [
      { start: "08:00", end: "11:00" },
      { start: "13:00", end: "17:00" },
    ],
  },
});
const r4post1 = runCurl([
  "-s",
  "-w",
  "\nHTTP_CODE:%{http_code}",
  "-b",
  jar,
  "-X",
  "POST",
  `${BASE}/api/admin/availability`,
  "-H",
  "Content-Type: application/json",
  "-d",
  post4a,
]);
const c4a = (r4post1.match(/HTTP_CODE:(\d+)/) ?? [, "0"])[1];
const g4init = runCurl([
  "-s",
  "-w",
  "\nHTTP_CODE:%{http_code}",
  "-b",
  jar,
  `${BASE}/api/admin/availability?type=personal_training`,
]);
const c4b = (g4init.match(/HTTP_CODE:(\d+)/) ?? [, "0"])[1];
let j4: { schedule?: { monday?: unknown[] } };
try {
  j4 = parseJsonFromCurlLog(g4init) as typeof j4;
} catch {
  j4 = {};
}
const pass4a = c4a === "200" && c4b === "200" && (j4.schedule?.monday?.length ?? 0) === 2;

const post4b = JSON.stringify({
  type: "personal_training",
  schedule: {
    monday: [
      { start: "08:00", end: "11:00" },
      { start: "14:00", end: "18:00" },
    ],
  },
});
const r4post2 = runCurl([
  "-s",
  "-w",
  "\nHTTP_CODE:%{http_code}",
  "-b",
  jar,
  "-X",
  "POST",
  `${BASE}/api/admin/availability`,
  "-H",
  "Content-Type: application/json",
  "-d",
  post4b,
]);
const c4c = (r4post2.match(/HTTP_CODE:(\d+)/) ?? [, "0"])[1];
const g4after = runCurl([
  "-s",
  "-w",
  "\nHTTP_CODE:%{http_code}",
  "-b",
  jar,
  `${BASE}/api/admin/availability?type=personal_training`,
]);
const c4d = (g4after.match(/HTTP_CODE:(\d+)/) ?? [, "0"])[1];
try {
  j4 = parseJsonFromCurlLog(g4after) as typeof j4;
} catch {
  j4 = {};
}
const pass4b =
  c4c === "200" &&
  c4d === "200" &&
  Array.isArray(j4.schedule?.monday) &&
  j4.schedule!.monday!.length === 2 &&
  !JSON.stringify(j4.schedule!.monday).includes("13:00") &&
  JSON.stringify(j4.schedule!.monday).includes("14:00");

const slotPtUrl = `${BASE}/api/slots?type=personal_training&date=${encodeURIComponent(monday)}`;
const r4slots = runCurl(["-s", "-w", "\nHTTP_CODE:%{http_code}", slotPtUrl]);
const c4e = (r4slots.match(/HTTP_CODE:(\d+)/) ?? [, "0"])[1];
try {
  slots = parseJsonFromCurlLog(r4slots) as SlotRow[];
} catch {
  slots = [];
}
const pass4c =
  c4e === "200" &&
  slotsCoverHourlyGrid(slots, monday, { lo: "08:00", hi: "11:00" }, { lo: "14:00", hi: "18:00" });

const pass4 = pass4a && pass4b && pass4c;
blocks.push(
  `[TEST4: ${pass4 ? "PASS" : "FAIL"}]\n--- POST initial ---\n${r4post1}\n--- GET ---\n${g4init}\n--- POST change ---\n${r4post2}\n--- GET ---\n${g4after}\n--- SLOTS ---\n${r4slots}`,
);

// TEST 5
const post5 = JSON.stringify({
  type: "probetraining",
  schedule: {
    monday: [
      { start: "10:00", end: "12:00" },
      { start: "11:00", end: "13:00" },
    ],
  },
});
const r5 = runCurl([
  "-s",
  "-w",
  "\nHTTP_CODE:%{http_code}",
  "-b",
  jar,
  "-X",
  "POST",
  `${BASE}/api/admin/availability`,
  "-H",
  "Content-Type: application/json",
  "-d",
  post5,
]);
const c5 = (r5.match(/HTTP_CODE:(\d+)/) ?? [, "0"])[1];
const pass5 = c5 === "400";
blocks.push(`[TEST5: ${pass5 ? "PASS" : "FAIL"}]\n${r5}`);

// Cleanup jar
try {
  fs.unlinkSync(jar);
} catch {
  /* ignore */
}

console.log(`BASE=${BASE} nextMonday=${monday}`);
console.log(loginHdr);
console.log(blocks.join("\n\n"));

const all = pass1 && pass2 && pass3 && pass4 && pass5;
if (all) {
  console.log("\nSTATUS: COMPLETE\nTESTS: ALL PASSED");
} else {
  process.exit(1);
}
