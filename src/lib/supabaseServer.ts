// ✅ Fixed: await cookies() based on your environment expectations
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Temporary fallback type for Supabase
type Database = any;

export async function createServerSupabaseClient() {
  const cookieStore = await cookies(); // ✅ awaited based on your runtime

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}
