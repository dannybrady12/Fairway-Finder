import { createBrowserClient } from '@supabase/ssr';

export const createBrowserClientWrapper = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Supabase URL or Anon Key is missing');
  }

  return createBrowserClient(url, key);
};
