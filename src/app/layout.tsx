'use client';

import './globals.css';
import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { SessionContextProvider } from '@supabase/auth-helpers-react';

console.log('ENV CHECK:', process.env.NEXT_PUBLIC_SUPABASE_URL);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [supabaseClient] = useState(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      console.error('❌ Supabase env vars are missing');
    } else {
      console.log('✅ Supabase env vars loaded');
    }

    return createBrowserClient(url!, key!);
  });

  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-black">
        <SessionContextProvider supabaseClient={supabaseClient} initialSession={null}>
          {children}
        </SessionContextProvider>
      </body>
    </html>
  );
}
