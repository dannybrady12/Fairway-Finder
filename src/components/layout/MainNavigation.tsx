import Link from 'next/link';
import { Home, Search, Trophy, User } from 'lucide-react';

export default function MainNavigation() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Golf className="h-8 w-8 text-green-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">GolfSocial</span>
            </Link>
          </div>
          
          <nav className="flex items-center space-x-4 md:space-x-6">
            <Link 
              href="/" 
              className="flex flex-col items-center text-gray-600 hover:text-green-600 transition-colors"
            >
              <Home className="h-6 w-6" />
              <span className="text-xs mt-1">Home</span>
            </Link>
            
            <Link 
              href="/courses" 
              className="flex flex-col items-center text-gray-600 hover:text-green-600 transition-colors"
            >
              <Search className="h-6 w-6" />
              <span className="text-xs mt-1">Courses</span>
            </Link>
            
            <Link 
              href="/scoring" 
              className="flex flex-col items-center text-gray-600 hover:text-green-600 transition-colors"
            >
              <Golf className="h-6 w-6" />
              <span className="text-xs mt-1">Score</span>
            </Link>
            
            <Link 
              href="/tournaments" 
              className="flex flex-col items-center text-gray-600 hover:text-green-600 transition-colors"
            >
              <Trophy className="h-6 w-6" />
              <span className="text-xs mt-1">Tournaments</span>
            </Link>
            
            <Link 
              href="/profile" 
              className="flex flex-col items-center text-gray-600 hover:text-green-600 transition-colors"
            >
              <User className="h-6 w-6" />
              <span className="text-xs mt-1">Profile</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
