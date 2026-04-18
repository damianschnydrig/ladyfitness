import { createClient } from "@supabase/supabase-js";

const globalForSupabase = globalThis as unknown as {
  supabaseServer: ReturnType<typeof createClient> | undefined;
};

/**
 * Server-side Supabase client with service role key.
 * Bypasses Row Level Security — only use in Server Actions and API Routes.
 */
export function getSupabaseServer() {
  if (!globalForSupabase.supabaseServer) {
    globalForSupabase.supabaseServer = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }
  return globalForSupabase.supabaseServer;
}
