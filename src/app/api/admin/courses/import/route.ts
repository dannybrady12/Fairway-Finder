import { NextRequest, NextResponse } from 'next/server';
import { processCsvImport } from '@/lib/golfCourseAPI';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const supabase = createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check if user is an admin (you would need to implement this check)
    const { data: user } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();
    
    if (!user?.is_admin) {
      return NextResponse.json(
        { error: 'Admin privileges required' },
        { status: 403 }
      );
    }
    
    // Get the CSV data from the request
    const formData = await request.formData();
    const csvFile = formData.get('file') as File;
    
    if (!csvFile) {
      return NextResponse.json(
        { error: 'No CSV file provided' },
        { status: 400 }
      );
    }
    
    // Read the CSV file
    const csvData = await csvFile.text();
    
    // Process the CSV import
    const result = await processCsvImport(csvData);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error importing CSV:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while importing CSV' },
      { status: 500 }
    );
  }
}
