import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { searchCourses } from '@/lib/golfCourseAPI';
import { Database } from '@/types/database.types';
import CourseCard from './CourseCard';

type Course = Database['public']['Tables']['courses']['Row'];

export default function CourseSearch() {
  const [query, setQuery] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const router = useRouter();

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setSearchPerformed(true);
    
    try {
      const results = await searchCourses(query);
      setCourses(results);
    } catch (error) {
      console.error('Error searching courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim()) {
        handleSearch();
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, handleSearch]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative mb-6">
        <Input
          type="text"
          placeholder="Search for golf courses..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Button 
          onClick={handleSearch}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white rounded-full px-4 py-1 text-sm"
        >
          Search
        </Button>
      </div>

      {loading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      )}

      {searchPerformed && !loading && courses.length === 0 && (
        <div className="text-center my-8">
          <p className="text-gray-600 mb-2">No courses found matching &ldquo;{query}&rdquo;</p>
          <p className="text-sm text-gray-500">Try a different search term or location</p>
          
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-800 mb-2">Can&apos;t find your course?</h3>
            <p className="text-sm text-green-700 mb-3">
              Help grow our database by adding missing courses.
            </p>
            <Button 
              onClick={() => router.push('/courses/add')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Add a Course
            </Button>
          </div>
        </div>
      )}

      {!loading && courses.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Search Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
          
          {courses.length >= 10 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Looking for a specific course?</h3>
              <p className="text-sm text-blue-700 mb-3">
                Try adding your city or state to narrow down results.
              </p>
              <p className="text-xs text-blue-600">
                Example: &ldquo;Augusta National Georgia&rdquo; or &ldquo;Pebble Beach California&rdquo;
              </p>
            </div>
          )}
          
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-800 mb-2">Can&apos;t find your course?</h3>
            <p className="text-sm text-green-700 mb-3">
              Help grow our database by adding missing courses.
            </p>
            <Button 
              onClick={() => router.push('/courses/add')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Add a Course
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
