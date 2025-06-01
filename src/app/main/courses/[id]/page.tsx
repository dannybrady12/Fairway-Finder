import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import CourseWeather from '@/components/courses/CourseWeather';
import CourseRankingDisplay from '@/components/courses/CourseRankingDisplay';
import ReviewCard from '@/components/reviews/ReviewCard';
import ReviewSubmitButton from '@/components/reviews/ReviewSubmitButton';

export default async function CourseDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();

  try {
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', params.id)
      .single();

    if (courseError) console.error('Course fetch error:', courseError);
    if (!course) return notFound();

    const { data: holes = [] } = await supabase
      .from('course_holes')
      .select('*')
      .eq('course_id', params.id)
      .order('hole_number', { ascending: true });

    const { data: images = [] } = await supabase
      .from('course_images')
      .select('*')
      .eq('course_id', params.id)
      .order('is_primary', { ascending: false });

    const { data: reviews = [] } = await supabase
      .from('course_reviews')
      .select('*, user:users(*)')
      .eq('course_id', params.id)
      .order('created_at', { ascending: false });

    const sessionResult = await supabase.auth.getSession();
    const session = sessionResult?.data?.session ?? null;
    const currentUser = session?.user ?? null;

    let userReview = null;
    if (currentUser) {
      try {
        const { data: existingReview, error: userReviewError } = await supabase
          .from('course_reviews')
          .select('*')
          .eq('course_id', params.id)
          .eq('user_id', currentUser.id)
          .single();
        if (userReviewError) console.error('User review fetch error:', userReviewError);
        userReview = existingReview || null;
      } catch (err) {
        console.error('Error fetching user review:', err);
      }
    }
    }

    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold mb-2">{course?.name || 'Unnamed Course'}</h1>
            <div className="text-gray-600 mb-4">
              {course?.city}, {course?.state}, {course?.country}
            </div>

            {images?.[0]?.image_url?.startsWith('http') ? (
              <div className="relative h-80 rounded-lg overflow-hidden mb-4">
                <Image
                  src={images[0].image_url}
                  alt={course?.name || 'Course image'}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-80 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                <span className="text-gray-500">No valid image found</span>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {['par', 'total_holes', 'rating', 'slope'].map((field, idx) => (
                <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">{field.replace('_', ' ').toUpperCase()}</div>
                  <div className="text-xl font-semibold">{course?.[field] || 'N/A'}</div>
                </div>
              ))}
            </div>

            {course?.description && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-3">About</h2>
                <p className="text-gray-700">{course.description}</p>
              </div>
            )}

            {holes.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-3">Holes</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hole</th>
                        <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Par</th>
                        <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yards</th>
                        <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Handicap</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {holes.map((hole) => (
                        <tr key={hole.id}>
                          <td className="py-2 px-3 whitespace-nowrap">{hole.hole_number}</td>
                          <td className="py-2 px-3 whitespace-nowrap">{hole.par}</td>
                          <td className="py-2 px-3 whitespace-nowrap">{hole.distance_yards || 'N/A'}</td>
                          <td className="py-2 px-3 whitespace-nowrap">{hole.handicap_index || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="mb-8">
              <div className="flex justify-between items-center mb-1">
                <h2 className="text-xl font-semibold">Reviews</h2>
                {reviews.length > 0 && (
                  <span className="text-sm text-gray-600">
                    {reviews.length} review{reviews.length > 1 ? 's' : ''} · Avg: {typeof course?.rating === 'number' ? course.rating.toFixed(1) : 'N/A'}
                  </span>
                )}
              </div>

              {currentUser && !userReview && (
                <ReviewSubmitButton courseId={params.id} />
              )}

              {reviews.length > 0 ? (
                <div className="space-y-4 mt-4">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} showCourse={false} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 mb-4">No reviews yet. Be the first to review this course!</p>
                  {currentUser ? (
                    <ReviewSubmitButton courseId={params.id} />
                  ) : (
                    <Link href="/auth/login" className="inline-block px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700">
                      Log in to review
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Course Ranking</h3>
              <CourseRankingDisplay course={course} />
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Weather</h3>
              <CourseWeather course={course} />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
              <div className="space-y-2 text-gray-700">
                {course?.phone && <div><strong>Phone:</strong> {course.phone}</div>}
                {course?.email && <div><strong>Email:</strong> {course.email}</div>}
                {course?.website && (
                  <div>
                    <strong>Website:</strong> <a href={course.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Visit</a>
                  </div>
                )}
                {course?.address && (
                  <div><strong>Address:</strong> {course.address}, {course.city}, {course.state} {course.postal_code}</div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 p-4 rounded-md text-green-800">
                <h3 className="text-lg font-semibold mb-2">Ready to play?</h3>
                <p className="mb-3">Start tracking your round shot-by-shot in real time.</p>
                <Link
                  href={`/rounds/new?course=${params.id}`}
                  className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Start a Round
                </Link>
              </div>
              <Link href={`/courses/${params.id}/photos`} className="block w-full py-2 px-4 border border-gray-300 text-gray-700 text-center rounded-md hover:bg-gray-50">
                View All Photos
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (err) {
    console.error('Unhandled error in Course Detail Page:', err);
    return notFound();
  }
}

