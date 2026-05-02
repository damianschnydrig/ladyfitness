"use server";

import path from "node:path";
import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";

export type AdminLoginState = { ok: false; message: string } | null;

export async function adminLogin(
  _prev: AdminLoginState,
  formData: FormData
): Promise<AdminLoginState> {
  const emailRaw = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const email = emailRaw.toLowerCase();

  if (!email || !password) {
    return { ok: false, message: "Bitte E-Mail und Passwort eingeben." };
  }

  let user: { id: string; email: string; password_hash: string } | null = null;
  if (process.env.DEV_USE_LOCAL_ADMIN === "true") {
    try {
      const fsp = await import("fs/promises");
      const file = path.join(process.cwd(), "dev_data", "admins.json");
      const txt = await fsp.readFile(file, "utf8").catch(() => null);
      if (txt) {
        const arr = JSON.parse(txt) as { id: string; email: string; password_hash: string }[];
        const found = arr.find(
          (r) => r.email.toLowerCase() === email.toLowerCase(),
        );
        console.log("DEV_AUTH_CHECK", email, !!found);
        if (found)
          user = {
            id: found.id,
            email: found.email,
            password_hash: found.password_hash,
          };
      }
    } catch {
      /* fall through */
    }
  }
  if (!user && process.env.DEV_USE_LOCAL_ADMIN !== "true") {
    try {
      const supabase = getSupabaseServer();
      const { data, error } = await supabase
        .from("admin_users")
        .select("id, email, password_hash")
        .eq("email", email)
        .maybeSingle();
      if (error) {
        return {
          ok: false,
          message:
            "Datenbankfehler beim Admin-Lookup. Prüfen Sie NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_KEY in .env.",
        };
      }
      user = data as { id: string; email: string; password_hash: string } | null;
    } catch {
      return {
        ok: false,
        message:
          "Keine Verbindung zur Datenbank. Prüfen Sie NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_KEY in .env.",
      };
    }
  }

  if (!user) {
    return {
      ok: false,
      message:
        "Es gibt keinen Admin-Eintrag für diese E-Mail. Führen Sie npm run db:seed-admin aus.",
    };
  }

  const passwordOk = await bcrypt.compare(password, user.password_hash);
  if (!passwordOk) {
    return {
      ok: false,
      message:
        "Das Passwort ist falsch. Passwort muss exakt dem Eintrag ADMIN_SEED_PASSWORD in .env entsprechen.",
    };
  }

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (
      result &&
      typeof result === "object" &&
      "error" in result &&
      result.error
    ) {
      return {
        ok: false,
        message:
          "Anmeldung ist technisch fehlgeschlagen (Session). Bitte Dev-Server neu starten.",
      };
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        ok: false,
        message:
          "Anmeldung ist technisch fehlgeschlagen (Auth). Prüfen Sie AUTH_SECRET in .env und starten Sie den Server neu.",
      };
    }
    throw error;
  }

  redirect("/admin");
}

export async function adminLogout() {
  await signOut({ redirectTo: "/admin/login" });
}
