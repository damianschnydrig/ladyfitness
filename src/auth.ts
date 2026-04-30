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

        const { getSupabaseServer } = await import("@/lib/supabase/server");
        const bcrypt = await import("bcryptjs");

        const email = parsed.data.email.toLowerCase();
        const supabase = getSupabaseServer();

        const { data: rawUser } = await supabase
          .from("admin_users")
          .select("id, email, password_hash, name")
          .eq("email", email)
          .single();

        const user = rawUser as {
          id: string;
          email: string;
          password_hash: string;
          name: string | null;
        } | null;

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
