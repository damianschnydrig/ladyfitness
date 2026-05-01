import { NextRequest, NextResponse } from "next/server";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

/**
 * Interner Redeploy-Endpoint: berührt tmp/restart.txt damit Passenger
 * die Node.js-App neu startet. server.js erkennt beim Neustart automatisch
 * ob ein neuer Build nötig ist (FETCH_HEAD vs BUILD_ID).
 *
 * Aufruf: POST /api/internal/redeploy  { "secret": "<DEPLOY_SECRET>" }
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as { secret?: string };

  if (body.secret !== process.env.DEPLOY_SECRET || !process.env.DEPLOY_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tmpDir = join(process.cwd(), "tmp");
    mkdirSync(tmpDir, { recursive: true });
    writeFileSync(join(tmpDir, "restart.txt"), new Date().toISOString());
    return NextResponse.json({ ok: true, restarted: new Date().toISOString() });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
