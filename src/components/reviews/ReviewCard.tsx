import { CourseReview, User, Course, ReviewLevel } from '@/types/database.types';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ThumbsUp, MessageCircle } from 'lucide-react';

interface ReviewCardProps {
  review: CourseReview & {
    user: User;
    course?: Course;
  };
  showCourse?: boolean;
}

export default function ReviewCard({ review, showCourse = false }: ReviewCardProps) {
  // Format date to readable format
  const formattedDate = new Date(review.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  // Get emoji and color based on review level
  const getReviewLevelInfo = (level: ReviewLevel) => {
    switch (level) {
      case 'loved_it':
        return { emoji: '😍', text: 'Loved It', bgColor: 'bg-green-100', textColor: 'text-green-800' };
      case 'liked_it':
        return { emoji: '🙂', text: 'Liked It', bgColor: 'bg-blue-100', textColor: 'text-blue-800' };
      case 'ok':
        return { emoji: '😐', text: 'OK', bgColor: 'bg-gray-100', textColor: 'text-gray-800' };
      default:
        return { emoji: '🙂', text: 'Liked It', bgColor: 'bg-blue-100', textColor: 'text-blue-800' };
    }
  };

  const levelInfo = getReviewLevelInfo(review.review_level);

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
      <div className="p-4">
        {/* User info and review level */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 mr-3">
              {review.user?.profile_image_url ? (
                <Image 
                  src={review.user.profile_image_url} 
                  alt={review.user.username} 
                  width={40} 
                  height={40}
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-green-100 text-green-800 font-bold">
                  {review.user?.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <Link href={`/profile/${review.user?.id}`} className="font-medium text-gray-900 hover:text-green-600">
                {review.user?.full_name || review.user?.username}
              </Link>
              <div className="text-xs text-gray-500">{formattedDate}</div>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full ${levelInfo.bgColor} ${levelInfo.textColor} text-sm font-medium flex items-center`}>
            <span className="mr-1">{levelInfo.emoji}</span>
            <span>{levelInfo.text}</span>
          </div>
        </div>
        
        {/* Course name if showCourse is true */}
        {showCourse && review.course && (
          <Link href={`/courses/${review.course.id}`} className="block mb-2 text-sm font-medium text-green-600 hover:underline">
            {review.course.name}
          </Link>
        )}
        
        {/* Review content */}
        {review.comment && (
          <div className="mb-4">
            <p className="text-gray-700">{review.comment}</p>
          </div>
        )}
        
        {/* Tags */}
        {review.tags && review.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {review.tags.map((tag, index) => (
              <span 
                key={index} 
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Review images would go here */}
        <div className="flex flex-wrap gap-2 mb-4">
          {/* Placeholder for review images */}
          {/* Will be implemented with actual data */}
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center text-sm text-gray-500 pt-3 border-t border-gray-100">
          <button className="flex items-center mr-4 hover:text-green-600">
            <Heart className="h-4 w-4 mr-1" />
            <span>Like</span>
          </button>
          <button className="flex items-center mr-4 hover:text-green-600">
            <MessageCircle className="h-4 w-4 mr-1" />
            <span>Comment</span>
          </button>
        </div>
      </div>
    </div>
  );
}
