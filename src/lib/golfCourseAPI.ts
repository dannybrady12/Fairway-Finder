/**
 * GolfCourseAPI.com Integration Service
 * 
 * This module handles integration with GolfCourseAPI.com for golf course data.
 * It provides functions for fetching course information, searching courses,
 * and handling API responses.
 */

import { createServerSupabaseClient } from './supabaseServer';
import { Course } from '@/types/database.types';

// GolfCourseAPI configuration
// This should be set as environment variable in production
const GOLF_COURSE_API_BASE_URL = 'https://golf-course-api.p.rapidapi.com';
const GOLF_COURSE_API_KEY = process.env.NEXT_PUBLIC_GOLF_COURSE_API_KEY || '';

// Interface for GolfCourseAPI data
export interface GolfCourseAPIResponse {
  courses: GolfCourseData[];
  total: number;
  page: number;
  pageSize: number;
}

export interface GolfCourseData {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  website: string;
  latitude: number;
  longitude: number;
  holes: number;
  teeBoxes: TeeBox[];
  isPrivate: boolean;
  isVerified: boolean;
}

export interface TeeBox {
  name: string;
  par: number;
  rating: number;
  slope: number;
  holes: HoleData[];
}

export interface HoleData {
  number: number;
  par: number;
  handicap: number;
  yards: number;
}

/**
 * Search for golf courses by name, city, or state
 */
export async function searchGolfCourses(query: string, page: number = 1, pageSize: number = 10): Promise<GolfCourseAPIResponse | null> {
  try {
    // For development without API key, return mock data
    if (!GOLF_COURSE_API_KEY) {
      console.warn('No Golf Course API key provided, returning mock data');
      return getMockSearchResults(query, page, pageSize);
    }

    const response = await fetch(`${GOLF_COURSE_API_BASE_URL}/courses/search?q=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`, {
      headers: {
        'X-RapidAPI-Key': GOLF_COURSE_API_KEY,
        'X-RapidAPI-Host': 'golf-course-api.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      throw new Error(`Golf Course API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching golf courses:', error);
    return null;
  }
}

/**
 * Get a golf course by ID
 */
export async function getGolfCourseById(courseId: string): Promise<GolfCourseData | null> {
  try {
    // For development without API key, return mock data
    if (!GOLF_COURSE_API_KEY) {
      console.warn('No Golf Course API key provided, returning mock data');
      return getMockCourseById(courseId);
    }

    const response = await fetch(`${GOLF_COURSE_API_BASE_URL}/courses/${courseId}`, {
      headers: {
        'X-RapidAPI-Key': GOLF_COURSE_API_KEY,
        'X-RapidAPI-Host': 'golf-course-api.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      throw new Error(`Golf Course API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting golf course by ID:', error);
    return null;
  }
}

/**
 * Convert GolfCourseAPI data to our database model
 */
export function convertToDbModel(apiCourse: GolfCourseData): Partial<Course> {
  // Find the primary tee box (usually the one with the highest rating)
  const primaryTeeBox = apiCourse.teeBoxes?.sort((a, b) => b.rating - a.rating)[0];
  
  return {
    name: apiCourse.name,
    address: apiCourse.address,
    city: apiCourse.city,
    state: apiCourse.state,
    country: apiCourse.country,
    postal_code: apiCourse.zipCode,
    latitude: apiCourse.latitude,
    longitude: apiCourse.longitude,
    description: `${apiCourse.name} is a ${apiCourse.holes}-hole golf course.`,
    website: apiCourse.website,
    phone: apiCourse.phone,
    total_holes: apiCourse.holes,
    par: primaryTeeBox?.par,
    rating: primaryTeeBox?.rating,
    slope: primaryTeeBox?.slope,
    external_id: apiCourse.id,
    data_source: 'golfcourseapi',
    is_verified: apiCourse.isVerified,
    is_private: apiCourse.isPrivate,
    updated_at: new Date().toISOString()
  };
}

/**
 * Synchronize a golf course with our database
 */
export async function syncCourseToDatabase(courseId: string): Promise<string | null> {
  try {
    const supabase = createServerSupabaseClient();
    
    // Fetch course from API
    const apiCourse = await getGolfCourseById(courseId);
    if (!apiCourse) {
      throw new Error(`Course not found: ${courseId}`);
    }
    
    // Convert to our database model
    const courseData = convertToDbModel(apiCourse);
    
    // Check if course already exists in our database
    const { data: existingCourse } = await supabase
      .from('courses')
      .select('id')
      .eq('external_id', courseId)
      .eq('data_source', 'golfcourseapi')
      .single();
    
    if (existingCourse) {
      // Update existing course
      const { error } = await supabase
        .from('courses')
        .update(courseData)
        .eq('id', existingCourse.id);
      
      if (error) throw error;
      
      // Sync hole data if tee boxes are available
      if (apiCourse.teeBoxes && apiCourse.teeBoxes.length > 0) {
        await syncHoleData(existingCourse.id, apiCourse.teeBoxes[0]);
      }
      
      return existingCourse.id;
    } else {
      // Insert new course
      const { data, error } = await supabase
        .from('courses')
        .insert(courseData)
        .select('id')
        .single();
      
      if (error) throw error;
      if (!data) throw new Error('Failed to insert course');
      
      // Sync hole data if tee boxes are available
      if (apiCourse.teeBoxes && apiCourse.teeBoxes.length > 0) {
        await syncHoleData(data.id, apiCourse.teeBoxes[0]);
      }
      
      return data.id;
    }
  } catch (error) {
    console.error('Error syncing course to database:', error);
    return null;
  }
}

/**
 * Synchronize hole data for a course
 */
async function syncHoleData(courseId: string, teeBox: TeeBox): Promise<void> {
  try {
    const supabase = createServerSupabaseClient();
    
    // Delete existing holes for this course
    await supabase
      .from('course_holes')
      .delete()
      .eq('course_id', courseId);
    
    // Insert new hole data
    const holeData = teeBox.holes.map(hole => ({
      course_id: courseId,
      hole_number: hole.number,
      par: hole.par,
      distance_yards: hole.yards,
      handicap_index: hole.handicap
    }));
    
    const { error } = await supabase
      .from('course_holes')
      .insert(holeData);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error syncing hole data:', error);
  }
}

/**
 * Process CSV data for course import
 */
export async function processCsvImport(csvData: string): Promise<{
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
}> {
  const result = {
    success: false,
    imported: 0,
    failed: 0,
    errors: [] as string[]
  };

  try {
    // Parse CSV data
    const lines = csvData.split('\n');
    const headers = lines[0].split(',');
    
    // Validate headers
    const requiredHeaders = ['name', 'city', 'state', 'holes', 'par'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      result.errors.push(`Missing required headers: ${missingHeaders.join(', ')}`);
      return result;
    }
    
    // Process each line
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      try {
        const values = lines[i].split(',');
        const courseData: Record<string, any> = {};
        
        // Map CSV columns to course data
        headers.forEach((header, index) => {
          courseData[header] = values[index]?.trim() || '';
        });
        
        // Validate required fields
        if (!courseData.name || !courseData.city || !courseData.state) {
          throw new Error(`Line ${i}: Missing required fields`);
        }
        
        // Convert to database model
        const dbCourse: Partial<Course> = {
          name: courseData.name,
          city: courseData.city,
          state: courseData.state,
          country: courseData.country || 'USA',
          total_holes: parseInt(courseData.holes) || 18,
          par: parseInt(courseData.par) || 72,
          data_source: 'csv_import',
          is_verified: false,
          updated_at: new Date().toISOString()
        };
        
        // Add optional fields if present
        if (courseData.address) dbCourse.address = courseData.address;
        if (courseData.postal_code) dbCourse.postal_code = courseData.postal_code;
        if (courseData.website) dbCourse.website = courseData.website;
        if (courseData.phone) dbCourse.phone = courseData.phone;
        if (courseData.latitude) dbCourse.latitude = parseFloat(courseData.latitude);
        if (courseData.longitude) dbCourse.longitude = parseFloat(courseData.longitude);
        if (courseData.rating) dbCourse.rating = parseFloat(courseData.rating);
        if (courseData.slope) dbCourse.slope = parseInt(courseData.slope);
        
        // Insert into database
        const supabase = createServerSupabaseClient();
        const { error } = await supabase.from('courses').insert(dbCourse);
        
        if (error) {
          throw new Error(`Line ${i}: ${error.message}`);
        }
        
        result.imported++;
      } catch (error: any) {
        result.failed++;
        result.errors.push(error.message);
      }
    }
    
    result.success = result.imported > 0;
    return result;
  } catch (error: any) {
    result.errors.push(`CSV processing error: ${error.message}`);
    return result;
  }
}

/**
 * Submit a user-contributed course
 */
export async function submitUserContributedCourse(courseData: Partial<Course>, userId: string): Promise<{
  success: boolean;
  courseId?: string;
  error?: string;
}> {
  try {
    const supabase = createServerSupabaseClient();
    
    // Add metadata for user contribution
    const dbCourse: Partial<Course> = {
      ...courseData,
      data_source: 'user_contributed',
      is_verified: false,
      contributed_by: userId,
      updated_at: new Date().toISOString()
    };
    
    // Insert into database
    const { data, error } = await supabase
      .from('courses')
      .insert(dbCourse)
      .select('id')
      .single();
    
    if (error) {
      throw error;
    }
    
    return {
      success: true,
      courseId: data?.id
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Mock data for development without API key
function getMockSearchResults(query: string, page: number, pageSize: number): GolfCourseAPIResponse {
  const mockCourses = [
    {
      id: 'mock-001',
      name: 'Augusta National Golf Club',
      address: '2604 Washington Rd',
      city: 'Augusta',
      state: 'GA',
      zipCode: '30904',
      country: 'USA',
      phone: '(706) 667-6000',
      website: 'https://www.augustanational.com',
      latitude: 33.5021,
      longitude: -82.0232,
      holes: 18,
      teeBoxes: [
        {
          name: 'Championship',
          par: 72,
          rating: 76.2,
          slope: 148,
          holes: Array(18).fill(0).map((_, i) => ({
            number: i + 1,
            par: i % 5 === 0 ? 5 : i % 4 === 0 ? 3 : 4,
            handicap: i + 1,
            yards: 150 + (i * 20)
          }))
        }
      ],
      isPrivate: true,
      isVerified: true
    },
    {
      id: 'mock-002',
      name: 'Pebble Beach Golf Links',
      address: '1700 17-Mile Drive',
      city: 'Pebble Beach',
      state: 'CA',
      zipCode: '93953',
      country: 'USA',
      phone: '(831) 574-5609',
      website: 'https://www.pebblebeach.com',
      latitude: 36.5725,
      longitude: -121.9486,
      holes: 18,
      teeBoxes: [
        {
          name: 'Championship',
          par: 72,
          rating: 75.5,
          slope: 145,
          holes: Array(18).fill(0).map((_, i) => ({
            number: i + 1,
            par: i % 5 === 0 ? 5 : i % 4 === 0 ? 3 : 4,
            handicap: i + 1,
            yards: 150 + (i * 20)
          }))
        }
      ],
      isPrivate: false,
      isVerified: true
    },
    {
      id: 'mock-003',
      name: 'St Andrews Links - Old Course',
      address: 'Golf Place',
      city: 'St Andrews',
      state: 'Fife',
      zipCode: 'KY16 9JA',
      country: 'Scotland',
      phone: '+44 1334 466666',
      website: 'https://www.standrews.com',
      latitude: 56.3431,
      longitude: -2.8025,
      holes: 18,
      teeBoxes: [
        {
          name: 'Championship',
          par: 72,
          rating: 73.1,
          slope: 132,
          holes: Array(18).fill(0).map((_, i) => ({
            number: i + 1,
            par: i % 5 === 0 ? 5 : i % 4 === 0 ? 3 : 4,
            handicap: i + 1,
            yards: 150 + (i * 20)
          }))
        }
      ],
      isPrivate: false,
      isVerified: true
    }
  ];
  
  // Filter by query if provided
  const filteredCourses = query 
    ? mockCourses.filter(c => 
        c.name.toLowerCase().includes(query.toLowerCase()) || 
        c.city.toLowerCase().includes(query.toLowerCase()) ||
        c.state.toLowerCase().includes(query.toLowerCase()))
    : mockCourses;
  
  // Paginate
  const startIndex = (page - 1) * pageSize;
  const paginatedCourses = filteredCourses.slice(startIndex, startIndex + pageSize);
  
  return {
    courses: paginatedCourses,
    total: filteredCourses.length,
    page,
    pageSize
  };
}

function getMockCourseById(courseId: string): GolfCourseData | null {
  const mockCourses = getMockSearchResults('', 1, 10).courses;
  return mockCourses.find(c => c.id === courseId) || null;
}
