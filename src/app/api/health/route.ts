import { NextResponse } from "next/server";

/** Schnelltest, ob die Next.js-App (Port 3001) läuft — ohne Datenbank. */
export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "ladyfitness-studio-booking",
    ts: new Date().toISOString(),
  });
}
