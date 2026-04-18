/**
 * Admin-Benutzer in Supabase anlegen
 * Aufruf: npm run db:seed-admin
 *
 * Voraussetzung: .env mit NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY,
 *                ADMIN_SEED_EMAIL, ADMIN_SEED_PASSWORD
 */
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;
const email = process.env.ADMIN_SEED_EMAIL;
const password = process.env.ADMIN_SEED_PASSWORD;
const name = process.env.ADMIN_SEED_NAME ?? "Admin";

if (!supabaseUrl || !serviceKey || !email || !password) {
  console.error(
    "❌ Fehlende Env-Variablen: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY, ADMIN_SEED_EMAIL, ADMIN_SEED_PASSWORD"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function run() {
  const passwordHash = await bcrypt.hash(password!, 12);

  const { data, error } = await supabase
    .from("admin_users")
    .upsert({ email: email!.toLowerCase(), password_hash: passwordHash, name }, { onConflict: "email" })
    .select("id, email, name")
    .single();

  if (error) {
    console.error("❌ Fehler beim Anlegen:", error.message);
    process.exit(1);
  }

  console.log("✅ Admin angelegt/aktualisiert:");
  console.log(`   ID:    ${data.id}`);
  console.log(`   Email: ${data.email}`);
  console.log(`   Name:  ${data.name}`);
}

run().catch((e) => { console.error(e); process.exit(1); });
