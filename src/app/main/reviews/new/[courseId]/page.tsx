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
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Failed to get session:', error.message);
        return;
      }
      if (data?.session?.user?.id) {
        setUserId(data.session.user.id);
      }
    };

    fetchSession();
  }, []);

  if (!userId) return <p className="text-center mt-10">Loading user...</p>;

  return (
    <div className="p-6">
      <CourseReviewForm courseId={params.courseId} userId={userId} />
    </div>
  );
}
