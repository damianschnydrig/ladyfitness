/**
 * Prüft DB-Verbindung, ob ein Admin existiert und ob das Passwort aus .env passt.
 * Aufruf: npm run db:verify-admin
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_SEED_EMAIL ?? "").toLowerCase().trim();
  const password = process.env.ADMIN_SEED_PASSWORD ?? "";
  if (!email || !password) {
    console.error("ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD fehlen in .env");
    process.exit(1);
  }

  console.log("DATABASE_URL gesetzt:", Boolean(process.env.DATABASE_URL));
  console.log("Prüfe Admin:", email);

  let user;
  try {
    user = await prisma.adminUser.findUnique({ where: { email } });
  } catch (e) {
    console.error("DB-Fehler (Verbindung / Migration?):", e);
    process.exit(1);
  }

  if (!user) {
    console.error(
      "\n❌ Kein Benutzer mit dieser E-Mail in der Datenbank.\n" +
        "   Ausführen: npx prisma migrate deploy && npm run db:seed\n"
    );
    process.exit(1);
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    console.error(
      "\n❌ Passwort aus .env passt nicht zum Hash in der DB.\n" +
        "   Neu setzen: npm run db:seed (überschreibt den Hash)\n"
    );
    process.exit(1);
  }

  console.log("\n✅ Admin gefunden und Passwort stimmt mit .env überein.");
  console.log("   Login-URL: http://localhost:3001/admin/login");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
