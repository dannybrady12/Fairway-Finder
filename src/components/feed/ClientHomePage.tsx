'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { FeedItem } from '@/components/feed/FeedItem';
import { CourseReview, Round } from '@/types/database.types';
import LiveRoundCard from '@/components/rounds/LiveRoundCard';
import ReviewCard from '@/components/reviews/ReviewCard';
import { Loader2 } from 'lucide-react';

export default function ClientHomePage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [isLoading, setIsLoading] = useState(true);
  const [liveRounds, setLiveRounds] = useState<Round[]>([]);
  const [feedItems, setFeedItems] = useState<any[]>([]);
  
  // Enable real-time subscriptions
  useRealtimeSubscription();
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }
      
      // Get users that the current user follows
      const { data: followingData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);
      
      const followingIds = followingData?.map(follow => follow.following_id) || [];
      
      // Add current user to the list to include their content too
      followingIds.push(user.id);
      
      // Get recent live rounds from followed users
      const { data: rounds } = await supabase
        .from('rounds')
        .select('*, user:users(*), course:courses(*)')
        .in('user_id', followingIds)
        .eq('status', 'in_progress')
        .order('created_at', { ascending: false })
        .limit(5);
      
      // Get recent reviews from followed users
      const { data: reviews } = await supabase
        .from('course_reviews')
        .select('*, user:users(*), course:courses(*)')
        .in('user_id', followingIds)
        .order('created_at', { ascending: false })
        .limit(10);
      
      setLiveRounds(rounds || []);
      
      // Combine and sort feed items
      const items = [
        ...(rounds || []).map((round: Round) => ({
          type: 'round',
          data: round,
          timestamp: new Date(round.created_at).getTime(),
        })),
        ...(reviews || []).map((review: CourseReview) => ({
          type: 'review',
          data: review,
          timestamp: new Date(review.created_at).getTime(),
        })),
      ].sort((a, b) => b.timestamp - a.timestamp);
      
      setFeedItems(items);
      setIsLoading(false);
    };
    
    fetchData();
  }, [supabase, router]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      {liveRounds.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Live Rounds</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveRounds.map((round) => (
              <LiveRoundCard key={round.id} round={round} />
            ))}
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        {feedItems.length > 0 ? (
          feedItems.map((item, index) => (
            <div key={index}>
              {item.type === 'review' ? (
                <ReviewCard review={item.data} showCourse={true} />
              ) : (
                <LiveRoundCard round={item.data} />
              )}
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">
              Your feed is empty. Follow other golfers or check out some courses to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
