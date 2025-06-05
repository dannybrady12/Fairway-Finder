import './globals.css';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { SessionContextProvider } from '@supabase/auth-helpers-react';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-black">
        <SessionContextProvider supabaseClient={supabase} initialSession={session}>
          {children}
        </SessionContextProvider>
      </body>
    </html>
  );
}
