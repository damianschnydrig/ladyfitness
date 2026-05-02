import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { authConfig } from "@/auth.config";
import { getSupabaseServer } from "@/lib/supabase/server";

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

        const bcrypt = await import("bcryptjs");

        const email = parsed.data.email.toLowerCase();

        let user: {
          id: string;
          email: string;
          password_hash: string;
          name: string | null;
        } | null = null;

        if (process.env.DEV_USE_LOCAL_ADMIN === "true") {
          try {
            const fsp = await import("fs/promises");
            const pathMod = require("path");
            const file = pathMod.join(process.cwd(), "dev_data", "admins.json");
            const txt = await fsp.readFile(file, "utf8").catch(() => null);
            if (txt) {
              const arr = JSON.parse(txt) as {
                id: string;
                email: string;
                password_hash: string;
                name?: string;
              }[];
              const found = arr.find(
                (r) => r.email.toLowerCase() === email.toLowerCase(),
              );
              console.log("DEV_AUTH_CHECK", email, !!found);
              if (found) {
                user = {
                  id: found.id,
                  email: found.email,
                  password_hash: found.password_hash,
                  name: found.name ?? null,
                };
              }
            }
          } catch {
            /* fall through */
          }
        }

        if (!user && process.env.DEV_USE_LOCAL_ADMIN !== "true") {
          const supabase = getSupabaseServer();

          const { data: rawUser } = await supabase
            .from("admin_users")
            .select("id, email, password_hash, name")
            .eq("email", email)
            .single();

          user = rawUser as {
            id: string;
            email: string;
            password_hash: string;
            name: string | null;
          } | null;
        }

        if (!user) return null;

        const ok = await bcrypt.compare(parsed.data.password, user.password_hash);
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
