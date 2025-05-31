# Course Data Synchronization and Contribution Strategy

## Overview

This document outlines the strategy for managing golf course data in the Golf Social App, combining data from GolfCourseAPI.com, CSV imports, and user contributions.

## Data Sources

1. **GolfCourseAPI.com (Primary)**
   - Provides access to ~30,000 golf courses worldwide
   - Includes course details, hole information, and ratings
   - Requires API key for production use

2. **CSV Import (Supplementary)**
   - Allows administrators to bulk import course data
   - Useful for adding courses not in the API
   - Supports custom data fields

3. **User Contributions (Community)**
   - Enables users to add missing courses or update existing ones
   - Creates a self-sustaining ecosystem as the user base grows
   - Requires moderation to maintain data quality

## Database Schema Updates

The following fields have been added to the `courses` table:

```sql
-- Added to courses table
external_id VARCHAR(100),           -- ID from external API
data_source VARCHAR(50) NOT NULL,   -- 'golfcourseapi', 'csv_import', or 'user_contributed'
is_verified BOOLEAN DEFAULT false,  -- Whether data has been verified
contributed_by UUID,                -- User ID who contributed (if applicable)
version INTEGER DEFAULT 1,          -- Data version for tracking changes
last_synced TIMESTAMP,              -- When data was last synced with external source
```

## Synchronization Strategy

### Initial Data Loading

1. **On-Demand Loading**
   - Courses are fetched from GolfCourseAPI.com when users search for them
   - Results are cached in our database to reduce API calls
   - This approach minimizes initial data load while ensuring users find courses

2. **Popular Courses Preloading**
   - Admin can trigger preloading of popular courses
   - Uses search terms like "national", "links", etc. to find well-known courses
   - Creates a good initial dataset without overwhelming the database

### Data Refresh Policy

1. **Time-Based Refresh**
   - Course data older than 90 days is refreshed from the API when accessed
   - Ensures data stays current without excessive API calls

2. **Manual Refresh**
   - Administrators can trigger manual refresh for specific courses
   - Useful when course details are known to have changed

3. **Change Detection**
   - Version number increments when course data changes
   - Allows tracking of data history and potential rollbacks

## Community Contribution Flow

1. **Contribution Types**
   - New course submission
   - Course data correction
   - Course details enhancement (adding missing info)
   - Course photos submission

2. **Submission Process**
   - User submits new/updated course data via form
   - Submission is marked as unverified
   - Basic validation occurs automatically
   - Notification sent to administrators

3. **Verification Process**
   - Admin reviews submissions in moderation queue
   - Can approve, reject, or modify submissions
   - Upon approval, course is marked as verified
   - Contributor receives notification

4. **Trust System**
   - Users gain trust points for verified contributions
   - Trusted users' submissions require less scrutiny
   - Creates incentive for quality contributions

## Data Conflict Resolution

1. **Priority Hierarchy**
   - Verified user contributions > GolfCourseAPI.com > Unverified contributions > CSV imports
   - More recent data takes precedence over older data

2. **Field-Level Merging**
   - Different fields can come from different sources
   - E.g., Course name from API but hole details from user contribution
   - Creates most complete dataset possible

3. **Conflict Flagging**
   - Significant discrepancies between sources are flagged for review
   - Administrators can manually resolve conflicts

## Caching Strategy

1. **Search Results Caching**
   - API search results cached for 24 hours
   - Reduces API calls for common searches

2. **Course Detail Caching**
   - Full course details cached in database
   - Refreshed based on access patterns and age

3. **In-Memory Caching**
   - Frequently accessed courses cached in memory
   - Improves performance for popular courses

## Fallback Mechanism

1. **API Unavailability**
   - If GolfCourseAPI.com is unavailable, system falls back to database
   - Error logging and alerts for persistent API issues

2. **Missing Data**
   - If course not found in API, check user contributions
   - Prompt users to contribute missing courses

## Implementation Details

1. **Batch Processing**
   - Background jobs for syncing multiple courses
   - Scheduled during off-peak hours

2. **Rate Limiting**
   - Respects GolfCourseAPI.com rate limits
   - Implements exponential backoff for retries

3. **Error Handling**
   - Graceful degradation when API errors occur
   - Clear user messaging about data source limitations

## Monitoring and Maintenance

1. **Data Quality Metrics**
   - Track verification rates, contribution rates
   - Monitor API reliability and response times

2. **Usage Analytics**
   - Track which courses are most viewed/played
   - Prioritize data quality for popular courses

3. **Regular Audits**
   - Scheduled reviews of data quality
   - Identification of courses needing updates
