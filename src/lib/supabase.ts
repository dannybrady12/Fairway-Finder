import { createBrowserClient } from '@supabase/ssr';

// ✅ Use this everywhere in the app that used to call createBrowserClient
export { createBrowserClient };

// ✅ Use this in client-only logic like the review form
export function createSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
