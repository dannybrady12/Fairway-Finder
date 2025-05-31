import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { redirect } from 'next/navigation';
import ReviewForm from '@/components/reviews/ReviewForm';
import ComparisonManager from '@/components/reviews/ComparisonManager';

export default async function CourseReviewPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();
  
  // Get course details
  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', params.id)
    .single();
    
  if (!course) {
    redirect('/courses');
  }
  
  // Get current user
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/auth/login');
  }
  
  // Check if user has already reviewed this course
  const { data: existingReview } = await supabase
    .from('course_reviews')
    .select('*')
    .eq('course_id', params.id)
    .eq('user_id', session.user.id)
    .single();
  
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {existingReview ? 'Edit Your Review' : 'Review'} - {course.name}
      </h1>
      
      <ReviewForm 
        course={course} 
        existingReview={existingReview || undefined} 
      />
      
      {/* Comparison manager will conditionally show if needed */}
      <ComparisonManager 
        courseId={params.id} 
        onComplete={() => {}} 
      />
    </div>
  );
}
