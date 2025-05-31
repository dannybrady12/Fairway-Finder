# Local Testing Guide for Golf Social App

## Setup for Local Testing

1. **Environment Setup**
   - Ensure Node.js 18+ is installed
   - Install all dependencies with `npm install`
   - Create a `.env.local` file with required Supabase credentials
   - Set up a local Supabase instance or use a development project

2. **Database Preparation**
   - Run the complete schema SQL script in Supabase
   - Add some sample data for courses, users, and reviews
   - Verify all tables are created correctly, including the comparative ranking tables

3. **Test User Accounts**
   - Create at least 3 test user accounts
   - For each account, add 5+ course reviews to trigger comparison prompts
   - Create some follow relationships between test users

## Testing Methodology

### 1. Feature Testing
Follow the testing checklist systematically, testing each feature in isolation:
- Authentication flows
- Course search and details
- Review submission and display
- Live scoring
- Comparative ranking system
- User profiles

### 2. Integration Testing
Test how features work together:
- Submit reviews and verify they appear in the feed
- Start live rounds and check they update in real-time
- Make course comparisons and verify rankings update

### 3. Edge Case Testing
Test boundary conditions:
- What happens when a user has exactly 5 reviews?
- How does the system handle ties in comparisons?
- What if a user compares the same courses multiple times with different results?

### 4. Performance Testing
- Test with a larger dataset (50+ courses, 10+ users)
- Verify the ranking calculation triggers don't cause performance issues
- Check page load times and real-time update performance

### 5. Responsive Design Testing
Test on multiple device sizes:
- Mobile (320px - 480px)
- Tablet (768px - 1024px)
- Desktop (1200px+)

## Common Issues to Watch For

1. **Real-time Updates**
   - Ensure subscriptions are properly cleaned up to prevent memory leaks
   - Verify updates appear without page refresh

2. **Ranking Algorithm**
   - Check that ELO calculations are working correctly
   - Verify normalization to 1-10 scale works for all edge cases
   - Test with various comparison patterns to ensure rankings stabilize

3. **Authentication**
   - Test session expiration and renewal
   - Verify protected routes redirect properly

4. **Database Triggers**
   - Ensure ranking recalculation trigger doesn't cause performance issues
   - Verify all triggers fire correctly when data changes

## Testing Tools

- Browser DevTools for network and performance monitoring
- React DevTools for component inspection
- Supabase Dashboard for monitoring real-time events and database changes

## Final Verification

Before deployment, perform a complete end-to-end test:
1. Register a new user
2. Search for and view courses
3. Submit reviews for 5+ courses
4. Complete course comparisons when prompted
5. View personal and aggregate rankings
6. Start a live round and enter scores
7. View another user's live round and leave comments

Document any issues found and fix them before proceeding to deployment.
