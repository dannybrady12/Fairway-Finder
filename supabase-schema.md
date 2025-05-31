# Supabase Database Schema for Golf Social App

## Overview
This document outlines the relational database schema for the Golf Social App using Supabase (PostgreSQL). The schema is designed to support all core features and the additional features requested, including tournaments, weather integration, handicap calculation, and advanced shot tracking.

## Tables

### users
- `id` UUID PRIMARY KEY (managed by Supabase Auth)
- `username` VARCHAR(50) UNIQUE NOT NULL
- `email` VARCHAR(255) UNIQUE NOT NULL
- `full_name` VARCHAR(100)
- `bio` TEXT
- `profile_image_url` VARCHAR(255)
- `handicap` DECIMAL(4,1)
- `created_at` TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- `updated_at` TIMESTAMP WITH TIME ZONE DEFAULT NOW()

### follows
- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `follower_id` UUID REFERENCES users(id) ON DELETE CASCADE
- `following_id` UUID REFERENCES users(id) ON DELETE CASCADE
- `created_at` TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- UNIQUE(follower_id, following_id)

### courses
- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `name` VARCHAR(100) NOT NULL
- `address` VARCHAR(255)
- `city` VARCHAR(100)
- `state` VARCHAR(50)
- `country` VARCHAR(50)
- `postal_code` VARCHAR(20)
- `latitude` DECIMAL(10,8)
- `longitude` DECIMAL(11,8)
- `description` TEXT
- `website` VARCHAR(255)
- `phone` VARCHAR(50)
- `email` VARCHAR(255)
- `total_holes` INTEGER DEFAULT 18
- `par` INTEGER
- `rating` DECIMAL(3,1)
- `slope` INTEGER
- `created_at` TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- `updated_at` TIMESTAMP WITH TIME ZONE DEFAULT NOW()

### course_holes
- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `course_id` UUID REFERENCES courses(id) ON DELETE CASCADE
- `hole_number` INTEGER NOT NULL
- `par` INTEGER NOT NULL
- `distance_yards` INTEGER
- `distance_meters` INTEGER
- `handicap_index` INTEGER
- `created_at` TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- `updated_at` TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- UNIQUE(course_id, hole_number)

### course_images
- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `course_id` UUID REFERENCES courses(id) ON DELETE CASCADE
- `image_url` VARCHAR(255) NOT NULL
- `is_primary` BOOLEAN DEFAULT FALSE
- `caption` VARCHAR(255)
- `uploaded_by` UUID REFERENCES users(id) ON DELETE SET NULL
- `created_at` TIMESTAMP WITH TIME ZONE DEFAULT NOW()

### course_reviews
- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `course_id` UUID REFERENCES courses(id) ON DELETE CASCADE
- `user_id` UUID REFERENCES users(id) ON DELETE CASCADE
- `rating` INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5)
- `content` TEXT
- `created_at` TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- `updated_at` TIMESTAMP WITH TIME ZONE DEFAULT NOW()

### review_images
- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `review_id` UUID REFERENCES course_reviews(id) ON DELETE CASCADE
- `image_url` VARCHAR(255) NOT NULL
- `created_at` TIMESTAMP WITH TIME ZONE DEFAULT NOW()

### rounds
- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `user_id` UUID REFERENCES users(id) ON DELETE CASCADE
- `course_id` UUID REFERENCES courses(id) ON DELETE CASCADE
- `date_played` DATE NOT NULL
- `tee_time` TIME
- `status` VARCHAR(20) NOT NULL CHECK (status IN ('planned', 'in_progress', 'completed', 'canceled'))
- `total_score` INTEGER
- `weather_conditions` VARCHAR(100)
- `temperature` INTEGER
- `wind_speed` INTEGER
- `notes` TEXT
- `created_at` TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- `updated_at` TIMESTAMP WITH TIME ZONE DEFAULT NOW()

### scores
- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `round_id` UUID REFERENCES rounds(id) ON DELETE CASCADE
- `hole_id` UUID REFERENCES course_holes(id) ON DELETE CASCADE
- `strokes` INTEGER NOT NULL
- `putts` INTEGER
- `fairway_hit` BOOLEAN
- `green_in_regulation` BOOLEAN
- `sand_shots` INTEGER DEFAULT 0
- `penalties` INTEGER DEFAULT 0
- `created_at` TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- `updated_at` TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- UNIQUE(round_id, hole_id)

### shot_tracking
- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `score_id` UUID REFERENCES scores(id) ON DELETE CASCADE
- `shot_number` INTEGER NOT NULL
- `club_used` VARCHAR(50)
- `distance` INTEGER
- `latitude` DECIMAL(10,8)
- `longitude` DECIMAL(11,8)
- `result` VARCHAR(50) CHECK (result IN ('fairway', 'rough', 'sand', 'green', 'water', 'out_of_bounds', 'other'))
- `notes` TEXT
- `created_at` TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- UNIQUE(score_id, shot_number)

### comments
- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `user_id` UUID REFERENCES users(id) ON DELETE CASCADE
- `round_id` UUID REFERENCES rounds(id) ON DELETE CASCADE
- `content` TEXT NOT NULL
- `created_at` TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- `updated_at` TIMESTAMP WITH TIME ZONE DEFAULT NOW()

### tournaments
- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `name` VARCHAR(100) NOT NULL
- `description` TEXT
- `creator_id` UUID REFERENCES users(id) ON DELETE CASCADE
- `course_id` UUID REFERENCES courses(id) ON DELETE SET NULL
- `start_date` DATE NOT NULL
- `end_date` DATE NOT NULL
- `status` VARCHAR(20) CHECK (status IN ('planned', 'in_progress', 'completed', 'canceled'))
- `max_participants` INTEGER
- `entry_fee` DECIMAL(10,2)
- `prize_description` TEXT
- `created_at` TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- `updated_at` TIMESTAMP WITH TIME ZONE DEFAULT NOW()

### tournament_participants
- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `tournament_id` UUID REFERENCES tournaments(id) ON DELETE CASCADE
- `user_id` UUID REFERENCES users(id) ON DELETE CASCADE
- `status` VARCHAR(20) CHECK (status IN ('invited', 'registered', 'confirmed', 'declined', 'withdrawn'))
- `registration_date` TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- UNIQUE(tournament_id, user_id)

### tournament_rounds
- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `tournament_id` UUID REFERENCES tournaments(id) ON DELETE CASCADE
- `round_id` UUID REFERENCES rounds(id) ON DELETE CASCADE
- `round_number` INTEGER NOT NULL
- UNIQUE(tournament_id, round_id)

### user_clubs
- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `user_id` UUID REFERENCES users(id) ON DELETE CASCADE
- `name` VARCHAR(50) NOT NULL
- `brand` VARCHAR(50)
- `type` VARCHAR(20) CHECK (type IN ('driver', 'wood', 'hybrid', 'iron', 'wedge', 'putter'))
- `loft` DECIMAL(3,1)
- `created_at` TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- `updated_at` TIMESTAMP WITH TIME ZONE DEFAULT NOW()

### weather_data
- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `course_id` UUID REFERENCES courses(id) ON DELETE CASCADE
- `date` DATE NOT NULL
- `time` TIME NOT NULL
- `temperature` DECIMAL(5,2)
- `condition` VARCHAR(50)
- `wind_speed` DECIMAL(5,2)
- `wind_direction` VARCHAR(10)
- `humidity` DECIMAL(5,2)
- `precipitation` DECIMAL(5,2)
- `created_at` TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- UNIQUE(course_id, date, time)

## Indexes
- Index on `users(username)`
- Index on `users(email)`
- Index on `courses(name)`
- Index on `courses(latitude, longitude)` (for geospatial queries)
- Index on `rounds(user_id, date_played)`
- Index on `rounds(course_id)`
- Index on `rounds(status)`
- Index on `scores(round_id)`
- Index on `tournament_participants(tournament_id)`
- Index on `tournament_participants(user_id)`
- Index on `comments(round_id)`
- Index on `follows(follower_id)`
- Index on `follows(following_id)`

## Row Level Security (RLS) Policies
Supabase allows for row-level security policies to control access to data:

1. Users can read all public data
2. Users can only update/delete their own data
3. Course reviews are publicly readable but only editable by the author
4. Round data is publicly readable but only editable by the round creator
5. Comments are publicly readable but only editable by the author

## Real-time Subscriptions
The following tables will have real-time capabilities enabled:
- rounds (for live scoring updates)
- scores (for hole-by-hole updates)
- comments (for live commenting)
- tournament_participants (for tournament registration updates)

## Storage Buckets
1. `profile-images` - For user profile pictures
2. `course-images` - For course photos
3. `review-images` - For images attached to reviews

## Functions and Triggers
1. Function to calculate and update user handicap based on recent rounds
2. Trigger to update course average rating when new reviews are added
3. Function to calculate tournament leaderboard
4. Trigger to update round total_score when scores are added/modified
