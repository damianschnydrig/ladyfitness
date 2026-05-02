import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";

export async function POST(req: Request) {
  let body: { email?: string; password?: string };
  try {
    body = (await req.json()) as { email?: string; password?: string };
  } catch {
    return NextResponse.json({ ok: false, message: "invalid json" }, { status: 400 });
  }
  const { email, password } = body || {};
  if (!email || !password)
    return NextResponse.json({ ok: false, message: "missing" }, { status: 400 });
  if (process.env.DEV_USE_LOCAL_ADMIN !== "true")
    return NextResponse.json({ ok: false, message: "dev login disabled" }, { status: 404 });
  const file = path.join(process.cwd(), "dev_data", "admins.json");
  if (!fs.existsSync(file))
    return NextResponse.json({ ok: false, message: "no dev admin" }, { status: 404 });
  const txt = fs.readFileSync(file, "utf8");
  const arr = JSON.parse(txt) as {
    id: string;
    email: string;
    password_hash: string;
  }[];
  const user = arr.find((r) => r.email === String(email).toLowerCase());
  if (!user) return NextResponse.json({ ok: false, message: "no user" }, { status: 401 });
  const ok = await bcrypt.compare(String(password), user.password_hash);
  if (!ok) return NextResponse.json({ ok: false, message: "bad password" }, { status: 401 });
  return NextResponse.json({ ok: true, id: user.id, email: user.email });
}
