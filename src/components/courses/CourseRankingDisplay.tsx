'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { Course, UserCourseRanking } from '@/types/database.types';
import { ArrowUp, ArrowDown, Minus, Trophy, Award, Medal } from 'lucide-react';

interface CourseRankingDisplayProps {
  course: Course;
  userId?: string;
}

export default function CourseRankingDisplay({ course, userId }: CourseRankingDisplayProps) {
  const supabase = createBrowserClient();
  const [userRanking, setUserRanking] = useState<UserCourseRanking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchRankingData = async () => {
      setIsLoading(true);
      
      try {
        // If no userId provided, get current user
        let currentUserId = userId;
        if (!currentUserId) {
          const { data: { user } } = await supabase.auth.getUser();
          currentUserId = user?.id;
        }
        
        if (currentUserId) {
          // Fetch user's ranking for this course
          const { data: rankingData } = await supabase
            .from('user_course_rankings')
            .select('*')
            .eq('user_id', currentUserId)
            .eq('course_id', course.id)
            .single();
          
          setUserRanking(rankingData || null);
        }
      } catch (error) {
        console.error('Error fetching ranking data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRankingData();
  }, [supabase, course.id, userId]);
  
  // Render rank change indicator
  const renderRankChange = () => {
    if (!userRanking || !userRanking.previous_rank_position) return null;
    
    const change = userRanking.previous_rank_position - userRanking.rank_position;
    
    if (change > 0) {
      return (
        <div className="flex items-center text-green-600">
          <ArrowUp className="h-4 w-4 mr-1" />
          <span className="text-sm">{change}</span>
        </div>
      );
    } else if (change < 0) {
      return (
        <div className="flex items-center text-red-600">
          <ArrowDown className="h-4 w-4 mr-1" />
          <span className="text-sm">{Math.abs(change)}</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-gray-500">
          <Minus className="h-4 w-4 mr-1" />
          <span className="text-sm">No change</span>
        </div>
      );
    }
  };
  
  // Render medal for top 3 courses
  const renderRankMedal = () => {
    if (!userRanking) return null;
    
    if (userRanking.rank_position === 1) {
      return <Trophy className="h-5 w-5 text-yellow-500 mr-2" />;
    } else if (userRanking.rank_position === 2) {
      return <Award className="h-5 w-5 text-gray-400 mr-2" />;
    } else if (userRanking.rank_position === 3) {
      return <Medal className="h-5 w-5 text-amber-700 mr-2" />;
    }
    
    return null;
  };
  
  // Render aggregate score with confidence indicator
  const renderAggregateScore = () => {
    if (!course.aggregate_score) return null;
    
    // Calculate confidence level display (1-5 dots)
    const confidenceDots = course.confidence_rating 
      ? Math.ceil(course.confidence_rating * 5)
      : 0;
    
    return (
      <div className="mb-4">
        <div className="text-sm text-gray-500 mb-1">Community Rating</div>
        <div className="flex items-center">
          <div className="text-2xl font-bold mr-2">{course.aggregate_score.toFixed(1)}</div>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className={`h-2 w-2 rounded-full mx-0.5 ${
                  i < confidenceDots ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
        <div className="text-xs text-gray-400 mt-1">
          Based on {confidenceDots * 5}+ user comparisons
        </div>
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
      {/* Aggregate community score */}
      {renderAggregateScore()}
      
      {/* User's personal ranking */}
      {userRanking ? (
        <div>
          <div className="text-sm text-gray-500 mb-1">Your Ranking</div>
          <div className="flex items-center">
            {renderRankMedal()}
            <div className="text-lg font-semibold">
              #{userRanking.rank_position} in your rankings
            </div>
          </div>
          <div className="flex items-center mt-1">
            <div className="text-2xl font-bold mr-2">{userRanking.normalized_score.toFixed(1)}</div>
            <div className="text-sm text-gray-500">/ 10</div>
          </div>
          <div className="mt-2">
            {renderRankChange()}
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-500">
          Play and review more courses to see your personal ranking
        </div>
      )}
    </div>
  );
}
