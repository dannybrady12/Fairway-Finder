import { CourseReview } from '@/types/database.types';
import ReviewCard from './ReviewCard';

interface ReviewFeedProps {
  reviews: CourseReview[];
  showCourse?: boolean;
}

export default function ReviewFeed({ reviews, showCourse = false }: ReviewFeedProps) {
  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} showCourse={showCourse} />
      ))}
    </div>
  );
}
