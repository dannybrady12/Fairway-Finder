'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { SessionContextProvider } from '@supabase/auth-helpers-react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [supabaseClient] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );

  return (
    <html lang="en">
      <body>
        <SessionContextProvider supabaseClient={supabaseClient} initialSession={null}>
          {children}
        </SessionContextProvider>
      </body>
    </html>
  );
}

