import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { authConfig } from "@/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "E-Mail", type: "email" },
        password: { label: "Passwort", type: "password" },
      },
      authorize: async (credentials) => {
        const emailRaw =
          typeof credentials?.email === "string"
            ? credentials.email
            : String(credentials?.email ?? "");
        const passwordRaw =
          typeof credentials?.password === "string"
            ? credentials.password
            : String(credentials?.password ?? "");
        const schema = z.object({
          email: z.string().trim().min(3).email(),
          password: z.string().min(1),
        });
        const parsed = schema.safeParse({
          email: emailRaw,
          password: passwordRaw,
        });
        if (!parsed.success) return null;

        const { prisma } = await import("@/lib/prisma");
        const bcrypt = await import("bcryptjs");

        const email = parsed.data.email.toLowerCase();
        const user = await prisma.adminUser.findUnique({
          where: { email },
        });
        if (!user) return null;

        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
        };
      },
    }),
  ],
});
