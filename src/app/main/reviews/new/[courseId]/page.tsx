'use client';

import { useEffect, useState } from 'react';
import CourseReviewForm from '@/components/reviews/CourseReviewForm';

export default function NewReviewPage({ params }: { params: { courseId: string } }) {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      const { createSupabaseClient } = await import('@/lib/supabase');
      const supabase = createSupabaseClient();
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user?.id) {
        setUserId(data.session.user.id);
      }
    };

    getUserId();
  }, []);

  if (!userId) {
    return <p className="text-center mt-10">Loading review form...</p>;
  }

  return (
    <div className="p-6">
      <CourseReviewForm courseId={params.courseId} userId={userId} />
    </div>
  );
}
