import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Initialize Supabase middleware client
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session (if needed)
  await supabase.auth.getSession();

  return res;
}

// Only run middleware on routes that need auth — exclude public routes like /courses
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public|auth|courses).*)',
  ],
};
