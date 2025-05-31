import Link from 'next/link';
import { Home, User, MapPin } from 'lucide-react';
import { createClient } from '@/lib/supabase';

// Use a different icon since GolfBall isn't available
import { CircleIcon } from 'lucide-react';

export default async function MainNavigation() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const isLoggedIn = !!session;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 flex justify-around items-center z-10">
      <Link href="/" className="flex flex-col items-center text-gray-500 hover:text-green-600">
        <Home size={24} />
        <span className="text-xs mt-1">Home</span>
      </Link>
      
      <Link href="/courses" className="flex flex-col items-center text-gray-500 hover:text-green-600">
        <CircleIcon size={24} />
        <span className="text-xs mt-1">Courses</span>
      </Link>
      
      {isLoggedIn ? (
        <>
          <Link href="/rounds/new" className="flex flex-col items-center text-gray-500 hover:text-green-600">
            <MapPin size={24} />
            <span className="text-xs mt-1">Play</span>
          </Link>
          
          <Link href="/profile" className="flex flex-col items-center text-gray-500 hover:text-green-600">
            <User size={24} />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </>
      ) : (
        <Link href="/auth/login" className="flex flex-col items-center text-gray-500 hover:text-green-600">
          <CircleIcon size={24} />
          <span className="text-xs mt-1">Login</span>
        </Link>
      )}
    </nav>
  );
}

