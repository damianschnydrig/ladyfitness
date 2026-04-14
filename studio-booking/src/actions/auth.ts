"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

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

  let user;
  try {
    user = await prisma.adminUser.findUnique({ where: { email } });
  } catch {
    return {
      ok: false,
      message:
        "Keine Verbindung zur Datenbank. Prüfen Sie DATABASE_URL in studio-booking/.env, Firewall/Remote-Zugriff (MariaDB: Port 3306) und ob der Datenbankserver läuft.",
    };
  }

  if (!user) {
    return {
      ok: false,
      message:
        "Es gibt keinen Admin-Eintrag für diese E-Mail. Im Ordner studio-booking nacheinander ausführen: npx prisma migrate deploy — dann npm run db:seed",
    };
  }

  const passwordOk = await bcrypt.compare(password, user.passwordHash);
  if (!passwordOk) {
    return {
      ok: false,
      message:
        "Das Passwort ist falsch. Passwort muss exakt dem Eintrag ADMIN_SEED_PASSWORD in .env entsprechen; nach Änderung der .env immer npm run db:seed ausführen.",
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
