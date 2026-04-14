import type { NextAuthConfig } from "next-auth";

/**
 * Nur für Middleware (Edge): keine DB/bcrypt. Volle Config inkl. Login in auth.ts.
 */
export const authConfig = {
  trustHost: true,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8,
  },
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        if (token.email) session.user.email = token.email as string;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
