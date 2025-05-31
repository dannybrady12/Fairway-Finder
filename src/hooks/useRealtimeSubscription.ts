'use client';

import { createBrowserClient } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Round, CourseReview } from '@/types/database.types';

// Custom hook for real-time subscriptions
export function useRealtimeSubscription() {
  const supabase = createBrowserClient();
  const router = useRouter();
  
  useEffect(() => {
    // Subscribe to live rounds updates
    const roundsSubscription = supabase
      .channel('public:rounds')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'rounds',
          filter: 'status=eq.in_progress'
        }, 
        () => {
          // Refresh the page to get the latest data
          router.refresh();
        }
      )
      .subscribe();
      
    // Subscribe to scores updates
    const scoresSubscription = supabase
      .channel('public:scores')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'scores'
        }, 
        () => {
          router.refresh();
        }
      )
      .subscribe();
      
    // Subscribe to reviews updates
    const reviewsSubscription = supabase
      .channel('public:course_reviews')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'course_reviews'
        }, 
        () => {
          router.refresh();
        }
      )
      .subscribe();
      
    // Subscribe to comments updates
    const commentsSubscription = supabase
      .channel('public:comments')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'comments'
        }, 
        () => {
          router.refresh();
        }
      )
      .subscribe();
    
    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(roundsSubscription);
      supabase.removeChannel(scoresSubscription);
      supabase.removeChannel(reviewsSubscription);
      supabase.removeChannel(commentsSubscription);
    };
  }, [supabase, router]);
  
  return null;
}

// Custom hook for specific round subscription
export function useRoundSubscription(roundId: string) {
  const supabase = createBrowserClient();
  const router = useRouter();
  const [round, setRound] = useState<Round | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Fetch initial round data
    const fetchRound = async () => {
      setIsLoading(true);
      const { data } = await supabase
        .from('rounds')
        .select('*, user:users(*), course:courses(*), scores(*)')
        .eq('id', roundId)
        .single();
        
      setRound(data);
      setIsLoading(false);
    };
    
    fetchRound();
    
    // Subscribe to round updates
    const roundSubscription = supabase
      .channel(`round-${roundId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'rounds',
          filter: `id=eq.${roundId}`
        }, 
        () => {
          fetchRound();
        }
      )
      .subscribe();
      
    // Subscribe to scores updates for this round
    const scoresSubscription = supabase
      .channel(`scores-${roundId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'scores',
          filter: `round_id=eq.${roundId}`
        }, 
        () => {
          fetchRound();
        }
      )
      .subscribe();
    
    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(roundSubscription);
      supabase.removeChannel(scoresSubscription);
    };
  }, [supabase, roundId, router]);
  
  return { round, isLoading };
}

// Custom hook for course reviews subscription
export function useCourseReviewsSubscription(courseId: string) {
  const supabase = createBrowserClient();
  const [reviews, setReviews] = useState<CourseReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Fetch initial reviews
    const fetchReviews = async () => {
      setIsLoading(true);
      const { data } = await supabase
        .from('course_reviews')
        .select('*, user:users(*)')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });
        
      setReviews(data || []);
      setIsLoading(false);
    };
    
    fetchReviews();
    
    // Subscribe to reviews updates for this course
    const reviewsSubscription = supabase
      .channel(`reviews-${courseId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'course_reviews',
          filter: `course_id=eq.${courseId}`
        }, 
        () => {
          fetchReviews();
        }
      )
      .subscribe();
    
    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(reviewsSubscription);
    };
  }, [supabase, courseId]);
  
  return { reviews, isLoading };
}
