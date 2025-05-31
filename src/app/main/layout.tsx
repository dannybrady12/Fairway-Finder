import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { redirect } from 'next/navigation';
import MainNavigation from '@/components/layout/MainNavigation';
import Footer from '@/components/layout/Footer';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerSupabaseClient();
  
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  
  // If no session, redirect to login
  if (!session) {
    redirect('/auth/login');
  }

  return (
    <div className="flex flex-col min-h-screen">
      <MainNavigation />
      <div className="flex-grow container mx-auto px-4 py-8">
        {children}
      </div>
      <Footer />
    </div>
  );
}
