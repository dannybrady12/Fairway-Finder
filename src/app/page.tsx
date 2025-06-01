import { createServerSupabaseClient } from '@/lib/supabaseServer';
import Link from 'next/link';

export default async function HomeFeedPage() {
  const supabase = createServerSupabaseClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const currentUser = session?.user;

  const { data: courses = [] } = await supabase
    .from('courses')
    .select('*')
    .order('rating', { ascending: false })
    .limit(10);

  const validCourses = (courses || []).filter(
    (c) => c?.name && c?.city && c?.state
  );

  const { data: rounds = [] } = currentUser
    ? await supabase
        .from('scorecards')
        .select('*, course:courses(name, city, state, image_url)')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(3)
    : { data: [] };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      <h1 className="text-3xl font-bold">Welcome to Fairway Finder</h1>

      {/* Featured Courses */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Top Rated Courses</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {validCourses?.length > 0 ? (
            validCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white shadow rounded-lg overflow-hidden"
              >
                <div className="p-4">
                  <h3 className="text-lg font-bold">
                    {course.name} - {course.city}
                  </h3>
                  <p className="text-sm text-gray-500">{course.state}</p>
                  <p className="text-sm mt-1 text-yellow-600">
                    ⭐{' '}
                    {typeof course.rating === 'number'
                      ? course.rating.toFixed(1)
                      : 'N/A'}
                  </p>
                  <Link
                    href={`/main/courses/${course.id}`}
                    className="mt-3 inline-block text-green-700 hover:underline text-sm"
                  >
                    View Course
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No valid courses found.</p>
          )}
        </div>
      </section>

      {/* My Recent Rounds */}
      {currentUser && rounds?.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">My Recent Rounds</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rounds.map((round) => (
              <div
                key={round.id}
                className="border rounded-lg p-4 bg-gray-50"
              >
                <h3 className="text-lg font-bold">
                  {round.course?.name || 'Unknown Course'}
                </h3>
                <p className="text-sm text-gray-500">
                  {round.course?.city || '—'}, {round.course?.state || '—'}
                </p>
                <p className="text-sm mt-1">
                  Score: <strong>{round.total_score || 'N/A'}</strong>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Played on{' '}
                  {round.created_at
                    ? new Date(round.created_at).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Actions */}
      <section className="text-center">
        <h2 className="text-xl font-medium mb-2">Quick Links</h2>
        <div className="flex flex-col md:flex-row justify-center gap-4">
          <Link
            href="/courses"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Browse All Courses
          </Link>
          <Link
            href="/rounds/new"
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Start New Round
          </Link>
        </div>
      </section>
    </div>
  );
}
