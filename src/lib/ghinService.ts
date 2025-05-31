/**
 * USGA GHIN API Service
 * 
 * This module handles integration with the USGA GHIN API for golf course data.
 * It provides functions for fetching course information, synchronizing data,
 * and handling API responses.
 */

import { createServerSupabaseClient } from './supabaseServer';
import { Course } from '@/types/database.types';

// GHIN API configuration
// These should be set as environment variables in production
const GHIN_API_BASE_URL = process.env.NEXT_PUBLIC_GHIN_API_BASE_URL || 'https://api.ghin.com/api/v1';
const GHIN_API_KEY = process.env.GHIN_API_KEY || '';

// Interface for GHIN Course data
export interface GHINCourse {
  ghin_course_id: string;
  course_name: string;
  facility_name?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  num_holes: number;
  course_rating?: number;
  slope_rating?: number;
  par?: number;
  tee_sets?: GHINTeeset[];
}

export interface GHINTeeset {
  tee_set_id: string;
  tee_color: string;
  gender: string;
  course_rating: number;
  slope_rating: number;
  par: number;
  holes: GHINHole[];
}

export interface GHINHole {
  hole_number: number;
  par: number;
  yardage: number;
  handicap_index: number;
}

/**
 * Fetch a course by GHIN ID
 */
export async function fetchCourseByGHINId(ghinCourseId: string): Promise<GHINCourse | null> {
  try {
    const response = await fetch(`${GHIN_API_BASE_URL}/courses/${ghinCourseId}`, {
      headers: {
        'Authorization': `Bearer ${GHIN_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`GHIN API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching course from GHIN:', error);
    return null;
  }
}

/**
 * Search for courses by name, city, or state
 */
export async function searchGHINCourses(query: string, limit: number = 10): Promise<GHINCourse[]> {
  try {
    const response = await fetch(`${GHIN_API_BASE_URL}/courses/search?q=${encodeURIComponent(query)}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${GHIN_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`GHIN API error: ${response.status}`);
    }

    const data = await response.json();
    return data.courses || [];
  } catch (error) {
    console.error('Error searching GHIN courses:', error);
    return [];
  }
}

/**
 * Convert a GHIN course to our database model
 */
export function convertGHINCourseToDatabaseModel(ghinCourse: GHINCourse): Partial<Course> {
  // Find the primary tee set (usually the one with the highest course rating)
  const primaryTeeSet = ghinCourse.tee_sets?.sort((a, b) => b.course_rating - a.course_rating)[0];
  
  return {
    name: ghinCourse.course_name,
    address: ghinCourse.address,
    city: ghinCourse.city,
    state: ghinCourse.state,
    country: ghinCourse.country,
    postal_code: ghinCourse.postal_code,
    latitude: ghinCourse.latitude,
    longitude: ghinCourse.longitude,
    description: `${ghinCourse.facility_name || ghinCourse.course_name} is a ${ghinCourse.num_holes}-hole golf course.`,
    website: ghinCourse.website,
    phone: ghinCourse.phone,
    total_holes: ghinCourse.num_holes,
    par: primaryTeeSet?.par || ghinCourse.par,
    rating: primaryTeeSet?.course_rating,
    slope: primaryTeeSet?.slope_rating,
    ghin_course_id: ghinCourse.ghin_course_id,
    updated_at: new Date().toISOString()
  };
}

/**
 * Synchronize a GHIN course with our database
 */
export async function syncGHINCourseToDatabase(ghinCourseId: string): Promise<string | null> {
  try {
    const supabase = createServerSupabaseClient();
    
    // Fetch course from GHIN API
    const ghinCourse = await fetchCourseByGHINId(ghinCourseId);
    if (!ghinCourse) {
      throw new Error(`Course not found in GHIN: ${ghinCourseId}`);
    }
    
    // Convert to our database model
    const courseData = convertGHINCourseToDatabaseModel(ghinCourse);
    
    // Check if course already exists in our database
    const { data: existingCourse } = await supabase
      .from('courses')
      .select('id')
      .eq('ghin_course_id', ghinCourseId)
      .single();
    
    if (existingCourse) {
      // Update existing course
      const { error } = await supabase
        .from('courses')
        .update(courseData)
        .eq('id', existingCourse.id);
      
      if (error) throw error;
      
      // Sync hole data if tee sets are available
      if (ghinCourse.tee_sets && ghinCourse.tee_sets.length > 0) {
        await syncHoleData(existingCourse.id, ghinCourse.tee_sets[0]);
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
      
      // Sync hole data if tee sets are available
      if (ghinCourse.tee_sets && ghinCourse.tee_sets.length > 0) {
        await syncHoleData(data.id, ghinCourse.tee_sets[0]);
      }
      
      return data.id;
    }
  } catch (error) {
    console.error('Error syncing GHIN course to database:', error);
    return null;
  }
}

/**
 * Synchronize hole data for a course
 */
async function syncHoleData(courseId: string, teeSet: GHINTeeset): Promise<void> {
  try {
    const supabase = createServerSupabaseClient();
    
    // Delete existing holes for this course
    await supabase
      .from('course_holes')
      .delete()
      .eq('course_id', courseId);
    
    // Insert new hole data
    const holeData = teeSet.holes.map(hole => ({
      course_id: courseId,
      hole_number: hole.hole_number,
      par: hole.par,
      distance_yards: hole.yardage,
      handicap_index: hole.handicap_index
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
 * Batch import popular courses from GHIN
 * This can be run as a scheduled job or admin function
 */
export async function batchImportPopularCourses(limit: number = 100): Promise<number> {
  try {
    // This would typically call a GHIN API endpoint that returns popular courses
    // For now, we'll simulate with a search for common terms
    const popularSearchTerms = ['national', 'pebble', 'pinehurst', 'augusta', 'bethpage'];
    let importedCount = 0;
    
    for (const term of popularSearchTerms) {
      const courses = await searchGHINCourses(term, Math.floor(limit / popularSearchTerms.length));
      
      for (const course of courses) {
        const courseId = await syncGHINCourseToDatabase(course.ghin_course_id);
        if (courseId) importedCount++;
      }
    }
    
    return importedCount;
  } catch (error) {
    console.error('Error batch importing courses:', error);
    return 0;
  }
}

/**
 * Get course details, first checking our database then falling back to GHIN
 */
export async function getCourseDetails(courseIdOrGhinId: string): Promise<Course | null> {
  try {
    const supabase = createServerSupabaseClient();
    
    // First try to get from our database by ID
    let { data: course } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseIdOrGhinId)
      .single();
    
    if (!course) {
      // Try to get by GHIN ID
      ({ data: course } = await supabase
        .from('courses')
        .select('*')
        .eq('ghin_course_id', courseIdOrGhinId)
        .single());
    }
    
    if (course) {
      // If course exists but is older than 30 days, refresh from GHIN
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      if (course.ghin_course_id && new Date(course.updated_at) < thirtyDaysAgo) {
        await syncGHINCourseToDatabase(course.ghin_course_id);
        
        // Get updated course data
        const { data: refreshedCourse } = await supabase
          .from('courses')
          .select('*')
          .eq('id', course.id)
          .single();
        
        if (refreshedCourse) {
          return refreshedCourse;
        }
      }
      
      return course;
    }
    
    // If not in our database and looks like a GHIN ID, try to import from GHIN
    if (courseIdOrGhinId.match(/^\d+$/)) {
      const courseId = await syncGHINCourseToDatabase(courseIdOrGhinId);
      
      if (courseId) {
        const { data: newCourse } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single();
        
        return newCourse || null;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting course details:', error);
    return null;
  }
}
