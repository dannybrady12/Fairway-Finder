'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Course } from '@/types/database.types';
import CourseComparisonPrompt from '@/components/reviews/CourseComparisonPrompt';
import { selectCoursesToCompare, shouldPromptForComparisons } from '@/lib/rankingAlgorithm';

interface ComparisonManagerProps {
  courseId: string;
  onComplete: () => void;
}

export default function ComparisonManager({ courseId, onComplete }: ComparisonManagerProps) {
  const router = useRouter();
  const supabase = createBrowserClient();
  
  const [isLoading, setIsLoading] = useState(true);
  const [showComparisons, setShowComparisons] = useState(false);
  const [comparisons, setComparisons] = useState<{courseA: Course; courseB: Course}[]>([]);
  const [currentComparisonIndex, setCurrentComparisonIndex] = useState(0);
  
  useEffect(() => {
    const checkForComparisons = async () => {
      setIsLoading(true);
      
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setShowComparisons(false);
          setIsLoading(false);
          return;
        }
        
        // Count user's reviews
        const { count: reviewCount } = await supabase
          .from('course_reviews')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        // Count user's comparisons
        const { count: comparisonCount } = await supabase
          .from('course_comparisons')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        // Check if we should prompt for comparisons
        const shouldPrompt = shouldPromptForComparisons(
          user.id,
          reviewCount || 0,
          comparisonCount || 0
        );
        
        if (shouldPrompt) {
          // Get user's rankings
          const { data: rankings } = await supabase
            .from('user_course_rankings')
            .select('*')
            .eq('user_id', user.id);
          
          // Select courses to compare
          const coursesToCompare = selectCoursesToCompare(
            user.id,
            courseId,
            rankings || [],
            3 // Limit to 3 comparisons
          );
          
          if (coursesToCompare.length > 0) {
            // Fetch course details for the comparisons
            const comparisonPromises = coursesToCompare.map(async (comp) => {
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
              
              return { courseA, courseB };
            });
            
            const resolvedComparisons = await Promise.all(comparisonPromises);
            setComparisons(resolvedComparisons.filter(c => c.courseA && c.courseB));
            setShowComparisons(resolvedComparisons.length > 0);
          } else {
            setShowComparisons(false);
          }
        } else {
          setShowComparisons(false);
        }
      } catch (error) {
        console.error('Error checking for comparisons:', error);
        setShowComparisons(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkForComparisons();
  }, [supabase, courseId]);
  
  const handleComparisonComplete = () => {
    if (currentComparisonIndex < comparisons.length - 1) {
      // Move to next comparison
      setCurrentComparisonIndex(currentComparisonIndex + 1);
    } else {
      // All comparisons complete
      onComplete();
    }
  };
  
  const handleSkip = () => {
    if (currentComparisonIndex < comparisons.length - 1) {
      // Move to next comparison
      setCurrentComparisonIndex(currentComparisonIndex + 1);
    } else {
      // All comparisons skipped
      onComplete();
    }
  };
  
  if (isLoading) {
    return null; // Loading state
  }
  
  if (!showComparisons) {
    // No comparisons needed
    return null;
  }
  
  const currentComparison = comparisons[currentComparisonIndex];
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Help Us Improve Course Rankings</h2>
          <p className="text-gray-600 mb-6">
            Please compare these courses to help us build more accurate rankings.
            {comparisons.length > 1 && ` (${currentComparisonIndex + 1} of ${comparisons.length})`}
          </p>
          
          <CourseComparisonPrompt
            courseA={currentComparison.courseA}
            courseB={currentComparison.courseB}
            onComplete={handleComparisonComplete}
            onSkip={handleSkip}
          />
        </div>
      </div>
    </div>
  );
}
