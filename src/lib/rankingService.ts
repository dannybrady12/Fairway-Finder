import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { createBrowserClient } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CourseComparison, UserCourseRanking } from '@/types/database.types';

/**
 * Custom hook for subscribing to ranking updates
 */
export function useRankingSubscription(userId: string) {
  const supabase = createBrowserClient();
  const router = useRouter();
  
  useEffect(() => {
    // Subscribe to ranking updates
    const rankingSubscription = supabase
      .channel(`rankings-${userId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_course_rankings',
          filter: `user_id=eq.${userId}`
        }, 
        () => {
          router.refresh();
        }
      )
      .subscribe();
      
    // Subscribe to comparison updates
    const comparisonSubscription = supabase
      .channel(`comparisons-${userId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'course_comparisons',
          filter: `user_id=eq.${userId}`
        }, 
        () => {
          router.refresh();
        }
      )
      .subscribe();
    
    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(rankingSubscription);
      supabase.removeChannel(comparisonSubscription);
    };
  }, [supabase, userId, router]);
  
  return null;
}

/**
 * Custom hook for fetching user rankings
 */
export function useUserRankings(userId: string) {
  const supabase = createBrowserClient();
  const [rankings, setRankings] = useState<UserCourseRanking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchRankings = async () => {
      setIsLoading(true);
      
      try {
        const { data } = await supabase
          .from('user_course_rankings')
          .select('*, course:courses(*)')
          .eq('user_id', userId)
          .order('rank_position', { ascending: true });
          
        setRankings(data || []);
      } catch (error) {
        console.error('Error fetching rankings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRankings();
    
    // Subscribe to ranking updates
    const subscription = supabase
      .channel(`rankings-${userId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_course_rankings',
          filter: `user_id=eq.${userId}`
        }, 
        () => {
          fetchRankings();
        }
      )
      .subscribe();
    
    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [supabase, userId]);
  
  return { rankings, isLoading };
}

/**
 * Server action to submit a course comparison
 */
export async function submitCourseComparison(
  userId: string,
  courseAId: string,
  courseBId: string,
  preferredCourseId: string,
  comparisonStrength: number
) {
  const supabase = createServerSupabaseClient();
  
  try {
    const { error } = await supabase
      .from('course_comparisons')
      .insert({
        user_id: userId,
        course_a_id: courseAId,
        course_b_id: courseBId,
        preferred_course_id: preferredCourseId,
        comparison_strength: comparisonStrength
      });
      
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error('Error submitting comparison:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Server action to get pending comparisons for a user
 */
export async function getPendingComparisons(userId: string, courseId: string) {
  const supabase = createServerSupabaseClient();
  
  try {
    // Get user's review count
    const { count: reviewCount } = await supabase
      .from('course_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    // Get user's comparison count
    const { count: comparisonCount } = await supabase
      .from('course_comparisons')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    // Check if we should prompt for comparisons
    if (reviewCount >= 5 && (comparisonCount === 0 || reviewCount % 3 === 0)) {
      // Get user's rankings
      const { data: rankings } = await supabase
        .from('user_course_rankings')
        .select('*')
        .eq('user_id', userId);
      
      // Select courses to compare
      const coursesToCompare = [];
      
      if (rankings && rankings.length > 0) {
        // Sort rankings by position
        const sortedRankings = [...rankings].sort((a, b) => a.rank_position - b.rank_position);
        
        // Add top-ranked course
        if (sortedRankings[0].course_id !== courseId) {
          coursesToCompare.push({
            courseAId: courseId,
            courseBId: sortedRankings[0].course_id
          });
        }
        
        // Add middle-ranked course
        const middleIndex = Math.floor(sortedRankings.length / 2);
        if (sortedRankings[middleIndex].course_id !== courseId) {
          coursesToCompare.push({
            courseAId: courseId,
            courseBId: sortedRankings[middleIndex].course_id
          });
        }
        
        // Add bottom-ranked course
        if (sortedRankings.length >= 3 && sortedRankings[sortedRankings.length - 1].course_id !== courseId) {
          coursesToCompare.push({
            courseAId: courseId,
            courseBId: sortedRankings[sortedRankings.length - 1].course_id
          });
        }
      } else {
        // If no rankings yet, get other courses the user has reviewed
        const { data: reviews } = await supabase
          .from('course_reviews')
          .select('course_id')
          .eq('user_id', userId)
          .neq('course_id', courseId)
          .limit(3);
        
        if (reviews) {
          reviews.forEach(review => {
            coursesToCompare.push({
              courseAId: courseId,
              courseBId: review.course_id
            });
          });
        }
      }
      
      // Fetch course details for the comparisons
      const comparisons = [];
      
      for (const comp of coursesToCompare) {
        // Get course A (the new course)
        const { data: courseA } = await supabase
          .from('courses')
          .select('*')
          .eq('id', comp.courseAId)
          .single();
        
        // Get course B (the existing course)
        const { data: courseB } = await supabase
          .from('courses')
          .select('*')
          .eq('id', comp.courseBId)
          .single();
        
        if (courseA && courseB) {
          comparisons.push({ courseA, courseB });
        }
      }
      
      return { shouldPrompt: true, comparisons };
    }
    
    return { shouldPrompt: false, comparisons: [] };
  } catch (error: any) {
    console.error('Error getting pending comparisons:', error);
    return { shouldPrompt: false, comparisons: [], error: error.message };
  }
}
