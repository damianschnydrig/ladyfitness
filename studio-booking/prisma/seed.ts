import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const rawEmail = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;
  if (!rawEmail || !password) {
    console.error(
      "Setze ADMIN_SEED_EMAIL und ADMIN_SEED_PASSWORD in der Umgebung (oder .env), z. B.:\n" +
        "  ADMIN_SEED_EMAIL=admin@example.com ADMIN_SEED_PASSWORD='starkes-passwort' npx prisma db seed"
    );
    process.exit(1);
  }

  const email = rawEmail.toLowerCase().trim();

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.adminUser.upsert({
    where: { email },
    create: { email, passwordHash, name: "Administratorin" },
    update: { passwordHash },
  });
  console.log("Admin-Benutzer gesichert:", email);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
