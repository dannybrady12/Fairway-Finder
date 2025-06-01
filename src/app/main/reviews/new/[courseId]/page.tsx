'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the form with SSR disabled
const CourseReviewForm = dynamic(() => import('@/components/reviews/CourseReviewForm'), { ssr: false });

export default function NewReviewPage({ params }: { params: { courseId: string } }) {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      // Dynamically import the client-safe Supabase function
      const { createSupabaseClient } = await import('@/lib/supabase');
      const supabase = createSupabaseClient();
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user?.id) {
        setUserId(data.session.user.id);
      }
    };

    getUserId();
  }, []);

  if (!userId) return <p className="text-center mt-10">Loading review form...</p>;

  return (
    <div className="p-6">
      <CourseReviewForm courseId={params.courseId} userId={userId} />
    </div>
  );
}

