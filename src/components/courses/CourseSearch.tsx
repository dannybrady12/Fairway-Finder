'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MapPin, Info } from 'lucide-react';
import { GolfCourseData } from '@/lib/golfCourseAPI';
import Link from 'next/link';

export default function CourseSearchComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<GolfCourseData[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState('');
  
  // Handle search form submission
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setError('');
    
    try {
      const response = await fetch(`/api/courses/search?q=${encodeURIComponent(searchQuery)}&page=${currentPage}`);
      
      if (!response.ok) {
        throw new Error('Failed to search courses');
      }
      
      const data = await response.json();
      setSearchResults(data.courses);
      setTotalResults(data.total);
      
      // Update URL with search query
      router.push(`/courses?q=${encodeURIComponent(searchQuery)}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred while searching');
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Load search results when page loads with query parameter
  useEffect(() => {
    if (initialQuery) {
      handleSearch();
    }
  }, [initialQuery]);
  
  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
    handleSearch();
  };
  
  // Render verification badge
  const renderVerificationBadge = (isVerified: boolean) => {
    return isVerified ? (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Verified
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        Unverified
      </span>
    );
  };
  
  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Search form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex items-center border-2 border-gray-300 rounded-full overflow-hidden bg-white">
          <input
            type="text"
            placeholder="Search for golf courses by name, city, or state..."
            className="w-full py-3 px-5 focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            className="bg-green-600 text-white p-3 hover:bg-green-700 transition-colors"
            disabled={isSearching}
          >
            {isSearching ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Search className="h-5 w-5" />
            )}
          </button>
        </div>
      </form>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {/* Search results */}
      {searchResults.length > 0 ? (
        <div>
          <div className="mb-4 text-gray-600">
            Found {totalResults} courses matching "{searchQuery}"
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {searchResults.map((course) => (
              <Link 
                href={`/courses/${course.id}`} 
                key={course.id}
                className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{course.name}</h3>
                    {renderVerificationBadge(course.isVerified)}
                  </div>
                  
                  <div className="flex items-center text-gray-500 text-sm mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{course.city}, {course.state}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <div>
                      <span className="text-gray-500">Holes:</span> {course.holes}
                    </div>
                    {course.teeBoxes && course.teeBoxes.length > 0 && (
                      <>
                        <div>
                          <span className="text-gray-500">Par:</span> {course.teeBoxes[0].par}
                        </div>
                        <div>
                          <span className="text-gray-500">Rating:</span> {course.teeBoxes[0].rating}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {/* Pagination */}
          {totalResults > 10 && (
            <div className="flex justify-center space-x-2 mb-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Previous
              </button>
              
              <span className="px-4 py-2 bg-green-600 text-white rounded">
                {currentPage}
              </span>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage * 10 >= totalResults}
                className={`px-4 py-2 rounded ${
                  currentPage * 10 >= totalResults
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : searchQuery && !isSearching ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">No courses found matching "{searchQuery}"</p>
          <p className="text-gray-500">Try adjusting your search or</p>
          <Link 
            href="/courses/contribute" 
            className="inline-block mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Add a new course
          </Link>
        </div>
      ) : null}
      
      {/* Add new course button */}
      <div className="text-center mt-8 mb-12">
        <p className="text-gray-600 mb-4">Don't see the course you're looking for?</p>
        <Link 
          href="/courses/contribute" 
          className="inline-block px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Add a new course
        </Link>
      </div>
    </div>
  );
}
