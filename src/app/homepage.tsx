import { createServerSupabaseClient } from '@/lib/supabaseServer';
import Link from 'next/link';

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();
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

  const roundsData = currentUser
    ? await supabase
        .from('scorecards')
        .select('*, course:courses(name, city, state, image_url)')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(3)
    : { data: [] };

  const rounds = roundsData?.data ?? [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-14">
      <h1 className="text-4xl font-extrabold text-center text-gray-900">
        Welcome to <span className="text-green-600">Fairway Finder</span>
      </h1>

      {/* Featured Courses */}
      <section>
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Top Rated Courses</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {validCourses.length > 0 ? (
            validCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white border rounded-xl shadow-sm hover:shadow-md transition p-5"
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {course.name} <span className="text-sm text-gray-500">– {course.city}</span>
                </h3>
                <p className="text-sm text-gray-500">{course.state}</p>
                <p className="text-sm mt-1 text-yellow-600">
                  ⭐ {typeof course.rating === 'number' ? course.rating.toFixed(1) : 'N/A'}
                </p>
                <Link
                  href={`/main/courses/${course.id}`}
                  className="inline-block mt-3 text-green-600 hover:underline text-sm font-medium"
                >
                  View Course
                </Link>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No valid courses found.</p>
          )}
        </div>
      </section>

      {/* My Recent Rounds */}
      {currentUser && rounds.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">My Recent Rounds</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rounds.map((round) => (
              <div
                key={round.id}
                className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md"
              >
                <h3 className="text-lg font-semibold">
                  {round.course?.name || 'Unknown Course'}
                </h3>
                <p className="text-sm text-gray-500">
                  {round.course?.city || '—'}, {round.course?.state || '—'}
                </p>
                <p className="text-sm mt-1">
                  Score: <span className="font-medium">{round.total_score || 'N/A'}</span>
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

      {/* Quick Links */}
      <section className="text-center">
        <h2 className="text-xl font-medium mb-4 text-gray-800">Quick Links</h2>
        <div className="flex flex-col md:flex-row justify-center gap-4">
          <Link
            href="/courses"
            className="inline-block px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
          >
            Browse All Courses
          </Link>
          <Link
            href="/rounds/new"
            className="inline-block px-6 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700"
          >
            Start New Round
          </Link>
        </div>
      </section>
    </div>
  );
}
