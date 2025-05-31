import { createServerSupabaseClient } from '@/lib/supabaseServer';
import CourseCard from '@/components/courses/CourseCard';
import CourseSearchBar from '@/components/courses/CourseSearchBar';

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const supabase = createServerSupabaseClient();
  
  // Build query based on search parameters
  let query = supabase.from('courses').select('*');
  
  if (searchParams.search) {
    query = query.ilike('name', `%${searchParams.search}%`);
  }
  
  // Add sorting by aggregate score (if available) or name
  query = query.order('aggregate_score', { ascending: false, nullsLast: true })
               .order('name');
  
  // Execute query
  const { data: courses, error } = await query;
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Golf Courses</h1>
      
      {/* Search bar */}
      <CourseSearchBar />
      
      {/* Search results */}
      {searchParams.search && (
        <div className="mb-6">
          <p className="text-gray-600">
            Showing results for "{searchParams.search}"
            {courses && ` (${courses.length} courses found)`}
          </p>
        </div>
      )}
      
      {/* Courses grid */}
      {courses && courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">
            {searchParams.search
              ? `No courses found matching "${searchParams.search}"`
              : 'No courses available'}
          </p>
          <p className="text-gray-500">
            Try adjusting your search or check back later.
          </p>
        </div>
      )}
    </div>
  );
}
