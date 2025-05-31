export type User = {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  bio?: string;
  profile_image_url?: string;
  handicap?: number;
  created_at: string;
  updated_at: string;
};

export type Course = {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  website?: string;
  phone?: string;
  email?: string;
  total_holes: number;
  par?: number;
  rating?: number;
  slope?: number;
  created_at: string;
  updated_at: string;
  aggregate_score?: number;
  confidence_rating?: number;
};

export type CourseHole = {
  id: string;
  course_id: string;
  hole_number: number;
  par: number;
  distance_yards?: number;
  distance_meters?: number;
  handicap_index?: number;
  created_at: string;
  updated_at: string;
};

export type CourseImage = {
  id: string;
  course_id: string;
  image_url: string;
  is_primary: boolean;
  caption?: string;
  uploaded_by?: string;
  created_at: string;
};

export type ReviewLevel = 'loved_it' | 'liked_it' | 'ok';

export type CourseReview = {
  id: string;
  course_id: string;
  user_id: string;
  review_level: ReviewLevel;
  comment?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  user?: User;
  course?: Course;
};

export type ReviewImage = {
  id: string;
  review_id: string;
  image_url: string;
  created_at: string;
};

export type CourseComparison = {
  id: string;
  user_id: string;
  course_a_id: string;
  course_b_id: string;
  preferred_course_id: string;
  comparison_strength: number; // 1-5
  created_at: string;
  course_a?: Course;
  course_b?: Course;
  preferred_course?: Course;
};

export type UserCourseRanking = {
  id: string;
  user_id: string;
  course_id: string;
  rank_position: number;
  normalized_score: number; // 1-10
  created_at: string;
  updated_at: string;
  course?: Course;
  previous_rank_position?: number;
};

export type Round = {
  id: string;
  user_id: string;
  course_id: string;
  date_played: string;
  tee_time?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'canceled';
  total_score?: number;
  weather_conditions?: string;
  temperature?: number;
  wind_speed?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  course?: Course;
  scores?: Score[];
};

export type Score = {
  id: string;
  round_id: string;
  hole_id: string;
  strokes: number;
  putts?: number;
  fairway_hit?: boolean;
  green_in_regulation?: boolean;
  sand_shots?: number;
  penalties?: number;
  created_at: string;
  updated_at: string;
  hole?: CourseHole;
  shot_tracking?: ShotTracking[];
};

export type ShotTracking = {
  id: string;
  score_id: string;
  shot_number: number;
  club_used?: string;
  distance?: number;
  latitude?: number;
  longitude?: number;
  result?: 'fairway' | 'rough' | 'sand' | 'green' | 'water' | 'out_of_bounds' | 'other';
  notes?: string;
  created_at: string;
};

export type Comment = {
  id: string;
  user_id: string;
  round_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user?: User;
};

export type Tournament = {
  id: string;
  name: string;
  description?: string;
  creator_id: string;
  course_id?: string;
  start_date: string;
  end_date: string;
  status: 'planned' | 'in_progress' | 'completed' | 'canceled';
  max_participants?: number;
  entry_fee?: number;
  prize_description?: string;
  created_at: string;
  updated_at: string;
  creator?: User;
  course?: Course;
  participants?: TournamentParticipant[];
};

export type TournamentParticipant = {
  id: string;
  tournament_id: string;
  user_id: string;
  status: 'invited' | 'registered' | 'confirmed' | 'declined' | 'withdrawn';
  registration_date: string;
  user?: User;
};

export type TournamentRound = {
  id: string;
  tournament_id: string;
  round_id: string;
  round_number: number;
  round?: Round;
};

export type UserClub = {
  id: string;
  user_id: string;
  name: string;
  brand?: string;
  type: 'driver' | 'wood' | 'hybrid' | 'iron' | 'wedge' | 'putter';
  loft?: number;
  created_at: string;
  updated_at: string;
};

export type WeatherData = {
  id: string;
  course_id: string;
  date: string;
  time: string;
  temperature?: number;
  condition?: string;
  wind_speed?: number;
  wind_direction?: string;
  humidity?: number;
  precipitation?: number;
  created_at: string;
};
