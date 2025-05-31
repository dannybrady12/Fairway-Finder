# Supabase Schema SQL for Golf Social App (Updated with Comparative Ranking)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(100),
  bio TEXT,
  profile_image_url VARCHAR(255),
  handicap DECIMAL(4,1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Follows table
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Courses table
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(50),
  country VARCHAR(50),
  postal_code VARCHAR(20),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  description TEXT,
  website VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  total_holes INTEGER DEFAULT 18,
  par INTEGER,
  rating DECIMAL(3,1),
  slope INTEGER,
  aggregate_score DECIMAL(3,1),
  confidence_rating DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course holes table
CREATE TABLE course_holes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  hole_number INTEGER NOT NULL,
  par INTEGER NOT NULL,
  distance_yards INTEGER,
  distance_meters INTEGER,
  handicap_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, hole_number)
);

-- Course images table
CREATE TABLE course_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  image_url VARCHAR(255) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  caption VARCHAR(255),
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course reviews table (Beli-style)
CREATE TABLE course_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  review_level VARCHAR(20) NOT NULL CHECK (review_level IN ('loved_it', 'liked_it', 'ok')),
  comment TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Review images table
CREATE TABLE review_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES course_reviews(id) ON DELETE CASCADE,
  image_url VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course comparisons table (for comparative ranking)
CREATE TABLE course_comparisons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_a_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  course_b_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  preferred_course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  comparison_strength INTEGER CHECK (comparison_strength BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_a_id, course_b_id)
);

-- User course rankings table (for comparative ranking)
CREATE TABLE user_course_rankings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  rank_position DECIMAL(4,2),
  normalized_score DECIMAL(3,1) CHECK (normalized_score BETWEEN 1 AND 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Rounds table
CREATE TABLE rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  date_played DATE NOT NULL,
  tee_time TIME,
  status VARCHAR(20) NOT NULL CHECK (status IN ('planned', 'in_progress', 'completed', 'canceled')),
  total_score INTEGER,
  weather_conditions VARCHAR(100),
  temperature INTEGER,
  wind_speed INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scores table
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  round_id UUID REFERENCES rounds(id) ON DELETE CASCADE,
  hole_id UUID REFERENCES course_holes(id) ON DELETE CASCADE,
  strokes INTEGER NOT NULL,
  putts INTEGER,
  fairway_hit BOOLEAN,
  green_in_regulation BOOLEAN,
  sand_shots INTEGER DEFAULT 0,
  penalties INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(round_id, hole_id)
);

-- Shot tracking table
CREATE TABLE shot_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  score_id UUID REFERENCES scores(id) ON DELETE CASCADE,
  shot_number INTEGER NOT NULL,
  club_used VARCHAR(50),
  distance INTEGER,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  result VARCHAR(50) CHECK (result IN ('fairway', 'rough', 'sand', 'green', 'water', 'out_of_bounds', 'other')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(score_id, shot_number)
);

-- Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  round_id UUID REFERENCES rounds(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tournaments table
CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) CHECK (status IN ('planned', 'in_progress', 'completed', 'canceled')),
  max_participants INTEGER,
  entry_fee DECIMAL(10,2),
  prize_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tournament participants table
CREATE TABLE tournament_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) CHECK (status IN ('invited', 'registered', 'confirmed', 'declined', 'withdrawn')),
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tournament_id, user_id)
);

-- Tournament rounds table
CREATE TABLE tournament_rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  round_id UUID REFERENCES rounds(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  UNIQUE(tournament_id, round_id)
);

-- User clubs table
CREATE TABLE user_clubs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  brand VARCHAR(50),
  type VARCHAR(20) CHECK (type IN ('driver', 'wood', 'hybrid', 'iron', 'wedge', 'putter')),
  loft DECIMAL(3,1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Weather data table
CREATE TABLE weather_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  temperature DECIMAL(5,2),
  condition VARCHAR(50),
  wind_speed DECIMAL(5,2),
  wind_direction VARCHAR(10),
  humidity DECIMAL(5,2),
  precipitation DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, date, time)
);

-- Create indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_courses_name ON courses(name);
CREATE INDEX idx_courses_location ON courses(latitude, longitude);
CREATE INDEX idx_rounds_user_date ON rounds(user_id, date_played);
CREATE INDEX idx_rounds_course ON rounds(course_id);
CREATE INDEX idx_rounds_status ON rounds(status);
CREATE INDEX idx_scores_round ON scores(round_id);
CREATE INDEX idx_tournament_participants_tournament ON tournament_participants(tournament_id);
CREATE INDEX idx_tournament_participants_user ON tournament_participants(user_id);
CREATE INDEX idx_comments_round ON comments(round_id);
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
CREATE INDEX idx_course_comparisons_user ON course_comparisons(user_id);
CREATE INDEX idx_user_course_rankings_user ON user_course_rankings(user_id);
CREATE INDEX idx_user_course_rankings_course ON user_course_rankings(course_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_holes ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_course_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE shot_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_data ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can read all public data
CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);

-- Users can only update their own data
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

-- Course reviews are publicly readable but only editable by the author
CREATE POLICY "Reviews are viewable by everyone" ON course_reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert own reviews" ON course_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON course_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON course_reviews FOR DELETE USING (auth.uid() = user_id);

-- Course comparisons are publicly readable but only editable by the author
CREATE POLICY "Comparisons are viewable by everyone" ON course_comparisons FOR SELECT USING (true);
CREATE POLICY "Users can insert own comparisons" ON course_comparisons FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comparisons" ON course_comparisons FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comparisons" ON course_comparisons FOR DELETE USING (auth.uid() = user_id);

-- User course rankings are publicly readable but only editable by the author
CREATE POLICY "Rankings are viewable by everyone" ON user_course_rankings FOR SELECT USING (true);
CREATE POLICY "Users can insert own rankings" ON user_course_rankings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own rankings" ON user_course_rankings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own rankings" ON user_course_rankings FOR DELETE USING (auth.uid() = user_id);

-- Round data is publicly readable but only editable by the round creator
CREATE POLICY "Rounds are viewable by everyone" ON rounds FOR SELECT USING (true);
CREATE POLICY "Users can insert own rounds" ON rounds FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own rounds" ON rounds FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own rounds" ON rounds FOR DELETE USING (auth.uid() = user_id);

-- Comments are publicly readable but only editable by the author
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can insert own comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Create functions and triggers
-- Function to calculate and update user handicap based on recent rounds
CREATE OR REPLACE FUNCTION update_user_handicap()
RETURNS TRIGGER AS $$
BEGIN
  -- This is a simplified handicap calculation
  -- In a real implementation, this would follow proper handicap calculation rules
  UPDATE users
  SET handicap = (
    SELECT AVG(r.total_score - c.par)
    FROM rounds r
    JOIN courses c ON r.course_id = c.id
    WHERE r.user_id = NEW.user_id
    AND r.status = 'completed'
    ORDER BY r.date_played DESC
    LIMIT 5
  ),
  updated_at = NOW()
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user handicap when a round is completed
CREATE TRIGGER trigger_update_handicap
AFTER UPDATE OF status ON rounds
FOR EACH ROW
WHEN (NEW.status = 'completed' AND OLD.status = 'in_progress')
EXECUTE FUNCTION update_user_handicap();

-- Function to update round total_score when scores are added/modified
CREATE OR REPLACE FUNCTION update_round_total_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE rounds
  SET total_score = (
    SELECT SUM(strokes)
    FROM scores
    WHERE round_id = NEW.round_id
  ),
  updated_at = NOW()
  WHERE id = NEW.round_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update round total_score when scores change
CREATE TRIGGER trigger_update_round_score
AFTER INSERT OR UPDATE OR DELETE ON scores
FOR EACH ROW
EXECUTE FUNCTION update_round_total_score();

-- Function to recalculate user course rankings after a new comparison
CREATE OR REPLACE FUNCTION recalculate_user_rankings()
RETURNS TRIGGER AS $$
DECLARE
  base_rating CONSTANT INTEGER := 1500;
  user_id_val UUID;
  course_ids UUID[];
  course_id_val UUID;
  ratings JSONB := '{}';
  sorted_ratings JSONB[];
  min_rating FLOAT;
  max_rating FLOAT;
  normalized_score FLOAT;
  rank_position INTEGER := 1;
BEGIN
  -- Get the user ID from the new comparison
  user_id_val := NEW.user_id;
  
  -- Get all course IDs that the user has compared
  SELECT ARRAY_AGG(DISTINCT course_id)
  INTO course_ids
  FROM (
    SELECT course_a_id AS course_id FROM course_comparisons WHERE user_id = user_id_val
    UNION
    SELECT course_b_id AS course_id FROM course_comparisons WHERE user_id = user_id_val
  ) AS courses;
  
  -- Initialize ratings for all courses
  FOREACH course_id_val IN ARRAY course_ids
  LOOP
    ratings := jsonb_set(ratings, ARRAY[course_id_val::text], to_jsonb(base_rating));
  END LOOP;
  
  -- Process all comparisons to update ratings
  FOR i IN 1..3 LOOP -- Multiple passes to stabilize ratings
    FOR winner_id, loser_id, strength IN
      SELECT 
        preferred_course_id,
        CASE WHEN preferred_course_id = course_a_id THEN course_b_id ELSE course_a_id END,
        comparison_strength
      FROM course_comparisons
      WHERE user_id = user_id_val
    LOOP
      -- ELO calculation
      DECLARE
        winner_rating INTEGER := (ratings->>(winner_id::text))::INTEGER;
        loser_rating INTEGER := (ratings->>(loser_id::text))::INTEGER;
        expected_winner FLOAT := 1.0 / (1.0 + power(10, (loser_rating - winner_rating) / 400.0));
        expected_loser FLOAT := 1.0 - expected_winner;
        k_factor INTEGER := 32 * (strength / 3.0);
        new_winner_rating INTEGER := winner_rating + k_factor * (1 - expected_winner);
        new_loser_rating INTEGER := loser_rating + k_factor * (0 - expected_loser);
      BEGIN
        ratings := jsonb_set(ratings, ARRAY[winner_id::text], to_jsonb(new_winner_rating));
        ratings := jsonb_set(ratings, ARRAY[loser_id::text], to_jsonb(new_loser_rating));
      END;
    END LOOP;
  END LOOP;
  
  -- Convert to array and sort by rating
  SELECT array_agg(jsonb_build_object('course_id', key, 'rating', value))
  INTO sorted_ratings
  FROM jsonb_each(ratings)
  ORDER BY (value::text)::INTEGER DESC;
  
  -- Find min and max for normalization
  SELECT 
    MIN((value::text)::INTEGER),
    MAX((value::text)::INTEGER)
  INTO min_rating, max_rating
  FROM jsonb_each(ratings);
  
  -- If there's not enough spread, use a default range
  IF (max_rating - min_rating) < 200 THEN
    min_rating := LEAST(min_rating, base_rating - 100);
    max_rating := GREATEST(max_rating, base_rating + 100);
  END IF;
  
  -- Delete existing rankings
  DELETE FROM user_course_rankings WHERE user_id = user_id_val;
  
  -- Insert new rankings
  FOR i IN 1..array_length(sorted_ratings, 1)
  LOOP
    course_id_val := (sorted_ratings[i]->>'course_id')::UUID;
    normalized_score := 1 + 9 * (((sorted_ratings[i]->>'rating')::FLOAT - min_rating) / (max_rating - min_rating));
    normalized_score := GREATEST(1, LEAST(10, normalized_score));
    normalized_score := round(normalized_score * 10) / 10; -- Round to 1 decimal place
    
    INSERT INTO user_course_rankings (
      user_id,
      course_id,
      rank_position,
      normalized_score
    ) VALUES (
      user_id_val,
      course_id_val,
      i,
      normalized_score
    );
  END LOOP;
  
  -- Update aggregate scores for all affected courses
  FOREACH course_id_val IN ARRAY course_ids
  LOOP
    UPDATE courses
    SET 
      aggregate_score = (
        SELECT AVG(normalized_score)
        FROM user_course_rankings
        WHERE course_id = course_id_val
      ),
      confidence_rating = LEAST(1.0, (
        SELECT COUNT(*)::FLOAT / 5
        FROM user_course_rankings
        WHERE course_id = course_id_val
      )),
      updated_at = NOW()
    WHERE id = course_id_val;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to recalculate rankings after a new comparison
CREATE TRIGGER trigger_recalculate_rankings
AFTER INSERT OR UPDATE ON course_comparisons
FOR EACH ROW
EXECUTE FUNCTION recalculate_user_rankings();

-- Enable real-time for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE rounds;
ALTER PUBLICATION supabase_realtime ADD TABLE scores;
ALTER PUBLICATION supabase_realtime ADD TABLE course_reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE course_comparisons;
ALTER PUBLICATION supabase_realtime ADD TABLE user_course_rankings;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;
ALTER PUBLICATION supabase_realtime ADD TABLE tournament_participants;
