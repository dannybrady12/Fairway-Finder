import { createBrowserClient as createSupabaseClient } from '@supabase/ssr';

export const createBrowserClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Supabase URL or Anon Key is missing');
  }

  return createSupabaseClient(url, key);
};
