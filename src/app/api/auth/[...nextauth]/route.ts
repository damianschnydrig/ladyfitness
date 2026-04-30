import { handlers } from "@/auth";

/** NextAuth nutzt Node-APIs (z. B. bcrypt) — explizit Node.js-Runtime, kein Edge. */
export const runtime = "nodejs";

export const { GET, POST } = handlers;
