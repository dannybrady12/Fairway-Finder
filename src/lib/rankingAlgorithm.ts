import { CourseComparison, UserCourseRanking, Course } from '@/types/database.types';

// ELO K-factor determines how much each comparison affects the rating
const ELO_K_FACTOR = 32;
// Base rating for new courses in a user's ranking
const BASE_RATING = 1500;
// Minimum number of comparisons needed for confidence
const MIN_COMPARISONS_FOR_CONFIDENCE = 5;

/**
 * Calculate new ELO ratings after a comparison
 */
export function calculateNewRatings(
  winnerRating: number,
  loserRating: number,
  comparisonStrength: number // 1-5
): { winnerNewRating: number; loserNewRating: number } {
  // Expected score based on current ratings
  const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  const expectedLoser = 1 - expectedWinner;
  
  // Adjust K-factor based on comparison strength (1-5)
  const adjustedK = ELO_K_FACTOR * (comparisonStrength / 3);
  
  // Calculate new ratings
  const winnerNewRating = winnerRating + adjustedK * (1 - expectedWinner);
  const loserNewRating = loserRating + adjustedK * (0 - expectedLoser);
  
  return { winnerNewRating, loserNewRating };
}

/**
 * Convert raw ELO rating to a 1-10 scale
 */
export function normalizeRating(rating: number, minRating: number, maxRating: number): number {
  // If there's not enough spread, use a default range
  if (maxRating - minRating < 200) {
    minRating = Math.min(minRating, BASE_RATING - 100);
    maxRating = Math.max(maxRating, BASE_RATING + 100);
  }
  
  // Normalize to 1-10 scale
  let normalized = 1 + 9 * ((rating - minRating) / (maxRating - minRating));
  
  // Clamp between 1-10
  normalized = Math.max(1, Math.min(10, normalized));
  
  // Round to one decimal place
  return Math.round(normalized * 10) / 10;
}

/**
 * Calculate rankings for a user based on their comparisons
 */
export function calculateUserRankings(
  userId: string,
  comparisons: CourseComparison[],
  existingRankings: UserCourseRanking[] = []
): UserCourseRanking[] {
  // Initialize ratings map with existing ratings or base rating
  const ratings: Record<string, number> = {};
  const previousRankings: Record<string, number> = {};
  
  // Store previous rankings for change tracking
  existingRankings.forEach(ranking => {
    ratings[ranking.course_id] = BASE_RATING + (ranking.normalized_score - 5.5) * 100;
    previousRankings[ranking.course_id] = ranking.rank_position;
  });
  
  // Get all unique course IDs from comparisons
  const courseIds = new Set<string>();
  comparisons.forEach(comp => {
    courseIds.add(comp.course_a_id);
    courseIds.add(comp.course_b_id);
  });
  
  // Initialize any missing courses with base rating
  courseIds.forEach(courseId => {
    if (!ratings[courseId]) {
      ratings[courseId] = BASE_RATING;
    }
  });
  
  // Process all comparisons to update ratings
  comparisons.forEach(comp => {
    const winnerId = comp.preferred_course_id;
    const loserId = comp.preferred_course_id === comp.course_a_id ? comp.course_b_id : comp.course_a_id;
    
    const { winnerNewRating, loserNewRating } = calculateNewRatings(
      ratings[winnerId],
      ratings[loserId],
      comp.comparison_strength
    );
    
    ratings[winnerId] = winnerNewRating;
    ratings[loserId] = loserNewRating;
  });
  
  // Convert to array and sort by rating
  const sortedRatings = Object.entries(ratings)
    .map(([courseId, rating]) => ({ courseId, rating }))
    .sort((a, b) => b.rating - a.rating);
  
  // Find min and max for normalization
  const minRating = Math.min(...sortedRatings.map(item => item.rating));
  const maxRating = Math.max(...sortedRatings.map(item => item.rating));
  
  // Create rankings with normalized scores
  const rankings: UserCourseRanking[] = sortedRatings.map((item, index) => {
    const normalizedScore = normalizeRating(item.rating, minRating, maxRating);
    
    return {
      id: '', // Will be assigned by database
      user_id: userId,
      course_id: item.courseId,
      rank_position: index + 1,
      normalized_score: normalizedScore,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      previous_rank_position: previousRankings[item.courseId] || null
    };
  });
  
  return rankings;
}

/**
 * Calculate aggregate score for a course based on all user rankings
 */
export function calculateAggregateScore(
  courseId: string,
  allRankings: UserCourseRanking[]
): { score: number; confidence: number } {
  // Filter rankings for this course
  const courseRankings = allRankings.filter(ranking => ranking.course_id === courseId);
  
  if (courseRankings.length === 0) {
    return { score: 0, confidence: 0 };
  }
  
  // Calculate average normalized score
  const totalScore = courseRankings.reduce((sum, ranking) => sum + ranking.normalized_score, 0);
  const averageScore = totalScore / courseRankings.length;
  
  // Calculate confidence based on number of rankings
  let confidence = Math.min(courseRankings.length / MIN_COMPARISONS_FOR_CONFIDENCE, 1);
  
  return {
    score: Math.round(averageScore * 10) / 10, // Round to one decimal
    confidence
  };
}

/**
 * Determine which courses to compare for a user
 */
export function selectCoursesToCompare(
  userId: string,
  newCourseId: string,
  userRankings: UserCourseRanking[],
  limit: number = 3
): { courseAId: string; courseBId: string }[] {
  // Filter out the new course
  const existingRankings = userRankings.filter(ranking => ranking.course_id !== newCourseId);
  
  if (existingRankings.length === 0) {
    return [];
  }
  
  // If user has few rankings, compare with all
  if (existingRankings.length <= limit) {
    return existingRankings.map(ranking => ({
      courseAId: newCourseId,
      courseBId: ranking.course_id
    }));
  }
  
  // Otherwise, select a diverse set of courses to compare with
  const sortedRankings = [...existingRankings].sort((a, b) => a.rank_position - b.rank_position);
  const comparisons: { courseAId: string; courseBId: string }[] = [];
  
  // Add top-ranked course
  comparisons.push({
    courseAId: newCourseId,
    courseBId: sortedRankings[0].course_id
  });
  
  // Add middle-ranked course
  const middleIndex = Math.floor(sortedRankings.length / 2);
  comparisons.push({
    courseAId: newCourseId,
    courseBId: sortedRankings[middleIndex].course_id
  });
  
  // Add bottom-ranked course if we have enough rankings
  if (sortedRankings.length >= 3) {
    comparisons.push({
      courseAId: newCourseId,
      courseBId: sortedRankings[sortedRankings.length - 1].course_id
    });
  }
  
  return comparisons.slice(0, limit);
}

/**
 * Check if a user should be prompted for comparisons
 */
export function shouldPromptForComparisons(
  userId: string,
  userReviews: number,
  existingComparisons: number
): boolean {
  // Prompt after 5 reviews
  if (userReviews >= 5 && existingComparisons === 0) {
    return true;
  }
  
  // Prompt every 3 new reviews after that
  if (userReviews >= 5 && userReviews % 3 === 0) {
    return true;
  }
  
  return false;
}
