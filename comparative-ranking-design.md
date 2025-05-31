# Comparative Ranking System Design

## Overview
This document outlines the design for a comparative ranking system that builds on the Beli-style review system. After users have reviewed several courses, the system will ask them comparative questions to establish a personalized ranking of courses on a 1-10 scale.

## Database Schema Additions

### course_comparisons
- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `user_id` UUID REFERENCES users(id) ON DELETE CASCADE
- `course_a_id` UUID REFERENCES courses(id) ON DELETE CASCADE
- `course_b_id` UUID REFERENCES courses(id) ON DELETE CASCADE
- `preferred_course_id` UUID REFERENCES courses(id) ON DELETE CASCADE
- `comparison_strength` INTEGER (1-5, how strongly they prefer one over the other)
- `created_at` TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- UNIQUE(user_id, course_a_id, course_b_id)

### user_course_rankings
- `id` UUID PRIMARY KEY DEFAULT uuid_generate_v4()
- `user_id` UUID REFERENCES users(id) ON DELETE CASCADE
- `course_id` UUID REFERENCES courses(id) ON DELETE CASCADE
- `rank_position` DECIMAL(4,2) (allows for positions between whole numbers)
- `normalized_score` INTEGER (1-10 scale)
- `created_at` TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- `updated_at` TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- UNIQUE(user_id, course_id)

## Algorithm Design

### When to Trigger Comparisons
1. After a user has reviewed at least 5 courses
2. When a new review is submitted and the user has >5 previous reviews
3. Periodically (e.g., once a month) to refine rankings

### Comparison Selection Logic
1. For new reviews: Compare with 2-3 previously reviewed courses across the spectrum (top-rated, mid-rated, low-rated)
2. For refinement: Identify courses with similar ratings and ask for direct comparisons

### Ranking Algorithm
1. Use an ELO-like rating system where courses gain/lose points based on comparisons
2. Convert raw ELO scores to a 1-10 scale for display
3. Recalculate all rankings after each new comparison
4. Weight recent comparisons more heavily than older ones

### Aggregate Course Rating
1. Calculate the average normalized score across all users
2. Apply a confidence factor based on number of rankings
3. Show both the average score and the confidence level

## UI Components

### Comparison Prompt
- Shown after submitting a new review (if eligible)
- Simple UI asking "Which course did you prefer?"
- Shows two courses side by side with their names and key details
- Slider to indicate strength of preference

### Personal Rankings Page
- List of all courses the user has reviewed
- Sorted by their personalized ranking
- Shows movement up/down since last review
- Option to manually adjust rankings

### Course Detail Enhancement
- Add section showing the course's position in the user's personal rankings
- Show aggregate ranking from all users
- Display "Users who ranked this course highly also enjoyed..." section

## Implementation Phases

### Phase 1: Data Structure
- Add new database tables
- Implement basic comparison collection
- Build ranking algorithm

### Phase 2: UI Integration
- Create comparison UI components
- Update profile and course pages
- Implement triggers for comparison prompts

### Phase 3: Refinement
- Add analytics to track ranking stability
- Implement periodic re-ranking suggestions
- Optimize algorithm based on user behavior
