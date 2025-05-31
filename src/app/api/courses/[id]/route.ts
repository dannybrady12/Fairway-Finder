import { NextRequest, NextResponse } from 'next/server';
import { getGolfCourseById, syncCourseToDatabase } from '@/lib/golfCourseAPI';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const courseId = params.id;
  
  try {
    const supabase = createServerSupabaseClient();
    
    // First check if course exists in our database
    let { data: course } = await supabase
      .from('courses')
      .select('*, course_holes(*)')
      .eq('external_id', courseId)
      .single();
    
    // If not found by external_id, try by our internal id
    if (!course) {
      ({ data: course } = await supabase
        .from('courses')
        .select('*, course_holes(*)')
        .eq('id', courseId)
        .single());
    }
    
    // If course exists in our database
    if (course) {
      // Check if it needs refreshing (older than 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      if (course.external_id && course.data_source === 'golfcourseapi' && 
          (!course.updated_at || new Date(course.updated_at) < thirtyDaysAgo)) {
        // Refresh course data in background
        syncCourseToDatabase(course.external_id).catch(console.error);
      }
      
      return NextResponse.json(course);
    }
    
    // If not in database, try to fetch from API
    const apiCourse = await getGolfCourseById(courseId);
    
    if (!apiCourse) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }
    
    // Sync to database and return the course
    const dbCourseId = await syncCourseToDatabase(courseId);
    
    if (!dbCourseId) {
      return NextResponse.json(
        { error: 'Failed to sync course to database' },
        { status: 500 }
      );
    }
    
    // Get the newly synced course from database
    const { data: newCourse } = await supabase
      .from('courses')
      .select('*, course_holes(*)')
      .eq('id', dbCourseId)
      .single();
    
    return NextResponse.json(newCourse);
  } catch (error: any) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while fetching the course' },
      { status: 500 }
    );
  }
}
