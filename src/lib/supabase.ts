import { createBrowserClient } from '@supabase/ssr';

// For legacy usage throughout your app
export function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Supabase URL or Anon Key is missing');
  }

  return createBrowserClient(url, key);
}

// For components expecting the old import style
export { createSupabaseClient as createBrowserClient };
