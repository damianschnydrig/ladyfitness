/**
 * Diagnose: Zeigt Admin-E-Mails in der DB (ohne Passwort).
 * Aufruf: npm run db:list-admins
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.adminUser.findMany({
    select: { email: true },
    orderBy: { email: "asc" },
  });
  if (rows.length === 0) {
    console.error(
      "Kein Admin in der Datenbank. Im Ordner studio-booking ausführen:\n" +
        "  npx prisma migrate deploy\n" +
        "  npm run db:seed\n" +
        "Dann Login mit ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD aus .env"
    );
    process.exit(1);
  }
  console.log("Admin-Benutzer in der Datenbank:");
  for (const r of rows) console.log("  -", r.email);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
