'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourse() {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) {
        console.error('Error fetching course:', error);
        router.push('/');
        return;
      }

      setCourse(data);
      setLoading(false);
    }

    fetchCourse();
  }, [params.id, router, supabase]);

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  if (!course) return <div className="p-4 text-center">Course not found.</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">{course.name}</h1>
      <p className="text-gray-600 mb-2">{course.city}, {course.state}</p>
      {course.image_url && (
        <img
          src={course.image_url}
          alt={course.name}
          className="w-full rounded-xl shadow mb-6"
        />
      )}
      <p className="text-lg">Par: {course.par}</p>
    </div>
  );
}
