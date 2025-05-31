'use client';

import { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Course } from '@/types/database.types';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

interface CourseComparisonPromptProps {
  courseA: Course;
  courseB: Course;
  onComplete: () => void;
  onSkip?: () => void;
}

export default function CourseComparisonPrompt({
  courseA,
  courseB,
  onComplete,
  onSkip
}: CourseComparisonPromptProps) {
  const router = useRouter();
  const supabase = createBrowserClient();
  
  const [preferredCourse, setPreferredCourse] = useState<string | null>(null);
  const [comparisonStrength, setComparisonStrength] = useState<number>(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async () => {
    if (!preferredCourse) {
      setError('Please select which course you preferred');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to submit a comparison');
      }
      
      // Submit comparison
      const { error: insertError } = await supabase
        .from('course_comparisons')
        .insert({
          user_id: user.id,
          course_a_id: courseA.id,
          course_b_id: courseB.id,
          preferred_course_id: preferredCourse,
          comparison_strength: comparisonStrength
        });
      
      if (insertError) throw insertError;
      
      // Trigger recalculation of rankings (in a real app, this would be a server function)
      // For now, we'll just complete the flow
      
      onComplete();
    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting your comparison');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold text-center mb-6">Which course did you prefer?</h2>
      
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Course A */}
        <div 
          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
            preferredCourse === courseA.id 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setPreferredCourse(courseA.id)}
        >
          <div className="text-lg font-medium mb-2">{courseA.name}</div>
          <div className="text-sm text-gray-600 mb-3">
            {courseA.city}, {courseA.state}
          </div>
          {preferredCourse === courseA.id && (
            <div className="text-green-600 text-sm font-medium">Selected</div>
          )}
        </div>
        
        {/* Course B */}
        <div 
          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
            preferredCourse === courseB.id 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setPreferredCourse(courseB.id)}
        >
          <div className="text-lg font-medium mb-2">{courseB.name}</div>
          <div className="text-sm text-gray-600 mb-3">
            {courseB.city}, {courseB.state}
          </div>
          {preferredCourse === courseB.id && (
            <div className="text-green-600 text-sm font-medium">Selected</div>
          )}
        </div>
      </div>
      
      {/* Comparison strength slider */}
      {preferredCourse && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How strongly do you prefer this course?
          </label>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2">Slightly</span>
            <input
              type="range"
              min="1"
              max="5"
              value={comparisonStrength}
              onChange={(e) => setComparisonStrength(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm text-gray-500 ml-2">Strongly</span>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {/* Action buttons */}
      <div className="flex justify-end">
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Skip
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!preferredCourse || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin inline" />
              Submitting...
            </>
          ) : (
            'Submit Comparison'
          )}
        </button>
      </div>
    </div>
  );
}
