import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export const createServerSupabaseClient = () => {
  const cookieStore = cookies(); // ✅ synchronous in App Router

  return createServerComponentClient({
    cookies: () => cookieStore,
  });
};
