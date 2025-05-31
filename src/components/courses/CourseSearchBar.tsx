'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function CourseSearchBar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-lg mx-auto mb-8">
      <div className="flex items-center border-2 border-gray-300 rounded-full overflow-hidden bg-white">
        <input
          type="text"
          placeholder="Search for golf courses..."
          className="w-full py-3 px-5 focus:outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          type="submit"
          className="bg-green-600 text-white p-3 hover:bg-green-700 transition-colors"
        >
          <Search className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
}
