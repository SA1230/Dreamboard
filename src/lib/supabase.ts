import { createClient } from "@supabase/supabase-js";

// Server-side client with service_role key — bypasses RLS.
// ONLY use this in server-side code (API routes, NextAuth callbacks).
// NEVER import this in a "use client" file.
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables"
    );
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Client-side (browser) client with anon key — subject to RLS.
// Safe to use in "use client" components.
// Currently unused — ready for when we add client-side profile reads.
export function createBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(url, key);
}
