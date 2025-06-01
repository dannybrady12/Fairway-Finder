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
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Get users that the current user follows
      const { data: followingData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      const followingIds = followingData?.map((follow) => follow.following_id) || [];

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
        .limit(5);

      const validReviews = (reviews || []).filter((r) => r.course?.name);

      console.log('Raw Reviews:', reviews);
      console.log('Valid Reviews:', validReviews);

      setFeedItems([...(rounds || []), ...validReviews]);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feedItems.length > 0 ? (
        feedItems.map((item, index) => {
          if ('status' in item) {
            return <LiveRoundCard key={`round-${index}`} round={item} />;
          }
          return <ReviewCard key={`review-${index}`} review={item as CourseReview} />;
        })
      ) : (
        <p className="text-center text-gray-500">No valid courses found.</p>
      )}
    </div>
  );
}
