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
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  if (!userId) return <p className="text-center mt-10">Loading user...</p>;

  return (
    <div className="p-6">
      <CourseReviewForm courseId={params.courseId} userId={userId} />
    </div>
  );
}
