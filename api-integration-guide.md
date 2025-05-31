# Golf Social App - API Integration Guide

## GolfCourseAPI.com Integration

This document provides instructions for setting up and using the GolfCourseAPI.com integration in the Golf Social App.

### API Key Setup

1. **Obtain API Key**
   - Sign up at [GolfCourseAPI.com](https://golfcourseapi.com)
   - Your API key is: `XU3Z6MFJUBIFR7NGKQN672QN7A`

2. **Configure Environment Variables**
   - Add the following to your `.env.local` file:
   ```
   NEXT_PUBLIC_GOLF_COURSE_API_KEY=XU3Z6MFJUBIFR7NGKQN672QN7A
   ```
   - For production deployment, add this as an environment variable in Vercel

### Data Sources

The Golf Social App uses a hybrid approach to golf course data:

1. **GolfCourseAPI.com (Primary Source)**
   - Provides access to ~30,000 golf courses worldwide
   - Includes course details, hole information, and ratings
   - Data is cached locally to reduce API calls

2. **CSV Import (Supplementary)**
   - Allows administrators to bulk import course data
   - Useful for adding courses not in the API
   - See CSV Import section below for details

3. **User Contributions (Community)**
   - Enables users to add missing courses or update existing ones
   - Creates a self-sustaining ecosystem as the user base grows
   - See User Contribution section below for details

### API Usage

The app uses the GolfCourseAPI.com for the following operations:

1. **Course Search**
   - When users search for courses by name, city, or state
   - Results are cached in the database to reduce API calls

2. **Course Details**
   - When viewing a specific course's details
   - Includes hole information, ratings, and location data

3. **Data Refresh**
   - Course data older than 90 days is automatically refreshed
   - Administrators can manually trigger refreshes

### Rate Limits

GolfCourseAPI.com has the following rate limits:

- 100 requests per minute
- 5,000 requests per day

The app implements caching strategies to stay within these limits.

## CSV Import Guide

### CSV Format

To import courses via CSV, use the following format:

```csv
name,city,state,country,holes,par,address,postal_code,website,phone,latitude,longitude,rating,slope
Augusta National Golf Club,Augusta,GA,USA,18,72,2604 Washington Rd,30904,https://www.augustanational.com,(706) 667-6000,33.5021,-82.0232,76.2,148
```

Required fields:
- name
- city
- state
- holes
- par

Optional fields:
- country (defaults to USA)
- address
- postal_code
- website
- phone
- latitude
- longitude
- rating
- slope

### Import Process

1. **Prepare CSV File**
   - Create a CSV file following the format above
   - Save with UTF-8 encoding

2. **Access Admin Panel**
   - Navigate to `/admin/courses/import`
   - Login with administrator credentials

3. **Upload CSV**
   - Click "Choose File" and select your CSV
   - Click "Upload and Validate"
   - Review validation results

4. **Confirm Import**
   - Review the courses to be imported
   - Click "Import Courses" to add them to the database

5. **Review Results**
   - The system will display import statistics
   - Any errors will be listed for review

### Bulk Import Considerations

- Large imports (>1000 courses) are processed in batches
- Duplicate detection is based on name and location
- Existing courses can be updated by including an `id` column

## User Contribution Guide

### Contribution Types

Users can contribute to the course database in several ways:

1. **Add New Course**
   - Submit details for a course not in the database
   - Requires basic information (name, location, holes, par)

2. **Update Existing Course**
   - Correct or enhance information for existing courses
   - Can update specific fields without changing others

3. **Add Course Photos**
   - Upload photos of courses
   - Helps create a visual database of courses

### Contribution Process

1. **Submit Contribution**
   - Users navigate to `/courses/contribute`
   - Fill out the contribution form
   - Submit for review

2. **Verification**
   - Contributions are marked as "unverified" initially
   - Administrators review submissions
   - Verified contributions are marked accordingly

3. **Notification**
   - Contributors receive notifications when their submissions are reviewed
   - Feedback is provided for rejected contributions

### Trust System

The app implements a trust system for user contributions:

1. **Trust Levels**
   - New users start at trust level 0
   - Trust increases with verified contributions
   - Higher trust levels require less verification

2. **Privileges**
   - Trust level 3+: Contributions are auto-verified
   - Trust level 5+: Can verify other users' contributions
   - Trust level 10+: Can bulk import courses

## Administrator Guide

### Data Management

Administrators have access to additional tools:

1. **Course Management**
   - View all courses in the database
   - Filter by data source, verification status
   - Manually verify or update courses

2. **Contribution Moderation**
   - Review pending contributions
   - Approve, reject, or modify submissions
   - Manage user trust levels

3. **Data Synchronization**
   - Trigger manual refresh from GolfCourseAPI.com
   - Schedule bulk refreshes
   - Monitor API usage and limits

### API Monitoring

The admin dashboard provides insights into API usage:

1. **Usage Statistics**
   - Daily/monthly API calls
   - Cache hit rates
   - Error rates

2. **Rate Limit Management**
   - Current usage vs. limits
   - Automatic throttling settings
   - Override options for priority operations

## Troubleshooting

### Common Issues

1. **API Connection Issues**
   - Check API key configuration
   - Verify network connectivity
   - Check GolfCourseAPI.com status

2. **Missing Course Data**
   - Search with alternative terms
   - Check for typos in course name
   - Consider adding the course via contribution

3. **Import Failures**
   - Verify CSV format matches requirements
   - Check for special characters in data
   - Ensure required fields are present

### Support

For technical support with the API integration:

1. Contact the development team
2. Check the GolfCourseAPI.com documentation
3. Review server logs for detailed error information
