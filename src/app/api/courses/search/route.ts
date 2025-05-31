import { NextRequest, NextResponse } from 'next/server';
import { searchGolfCourses } from '@/lib/golfCourseAPI';

export async function GET(request: NextRequest) {
  // Get search parameters
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '10');
  
  try {
    // Search courses using the API service
    const results = await searchGolfCourses(query, page, pageSize);
    
    if (!results) {
      return NextResponse.json(
        { error: 'Failed to fetch courses' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Error searching courses:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while searching courses' },
      { status: 500 }
    );
  }
}
