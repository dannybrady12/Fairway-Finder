'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import CourseReviewForm from '@/components/reviews/CourseReviewForm';

interface Props {
  params: { courseId: string };
}

export default function NewReviewPage({ params }: Props) {
  const supabase = createBrowserClient();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Don't call supabase.auth.getUser() directly in the browser context on load
    const getUserId = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error('Failed to get session:', error.message);
        return;
      }

      if (session?.user?.id) {
        setUserId(session.user.id);
      }
    };

    getUserId();
  }, [supabase]);

  if (!userId) return <p className="text-center mt-10">Loading user...</p>;

  return (
    <div className="p-6">
      <CourseReviewForm courseId={params.courseId} userId={userId} />
    </div>
  );
}
