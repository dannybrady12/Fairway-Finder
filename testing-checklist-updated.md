# Testing Checklist for Golf Social App

## Authentication
- [ ] User registration works correctly
- [ ] User login works correctly
- [ ] Session persistence works across page refreshes
- [ ] Protected routes redirect to login when not authenticated
- [ ] User profile information is correctly displayed

## Homepage Feed
- [ ] Feed displays recent course reviews from followed users
- [ ] Feed displays live rounds from followed users
- [ ] Real-time updates work when new content is added
- [ ] Empty state is displayed correctly when no content is available
- [ ] Feed items are properly sorted by timestamp

## Course Search and Details
- [ ] Course search functionality works
- [ ] Course listings display correct information
- [ ] Course detail page shows all relevant course information
- [ ] Weather integration displays current and forecast data
- [ ] Course hole information is displayed correctly

## Beli-style Review System
- [ ] "Loved It/Liked It/OK" review options work correctly
- [ ] Users can add comments to reviews
- [ ] Users can add tags to reviews
- [ ] Users can upload photos with reviews
- [ ] Users can only submit one review per course (edit existing if already reviewed)
- [ ] Review feed displays correctly with proper styling
- [ ] Real-time updates work when new reviews are added

## Comparative Ranking System
- [ ] After 5+ reviews, comparison prompts appear
- [ ] Course comparison UI works correctly
- [ ] Comparison strength slider functions properly
- [ ] Personal rankings are calculated and displayed correctly
- [ ] Aggregate course scores are calculated correctly
- [ ] Confidence indicators reflect the number of comparisons
- [ ] Rankings update in real-time when new comparisons are made
- [ ] Course cards show aggregate scores with appropriate styling
- [ ] Course detail page shows both personal and aggregate rankings

## Live Scoring
- [ ] Users can start a new round
- [ ] Hole-by-hole score entry works
- [ ] Real-time scorecard updates are visible to other users
- [ ] Score vs par is calculated correctly
- [ ] Round status (in progress, completed) is managed correctly

## User Profiles
- [ ] Profile displays user information correctly
- [ ] Past scorecards are displayed
- [ ] Review history is displayed
- [ ] Current live rounds are highlighted
- [ ] Follow/unfollow functionality works
- [ ] Personal course rankings are displayed correctly

## Real-time Features
- [ ] Live round updates appear in real-time
- [ ] New reviews appear in feed without refresh
- [ ] Score updates appear in real-time
- [ ] Comments on live rounds update in real-time
- [ ] Ranking changes update in real-time

## Responsive Design
- [ ] Application is usable on mobile devices
- [ ] Application is usable on tablet devices
- [ ] Application is usable on desktop devices
- [ ] Navigation is accessible across all device sizes

## Error Handling
- [ ] Form validation works correctly
- [ ] API errors are handled gracefully
- [ ] Loading states are displayed appropriately
- [ ] Empty states are handled correctly

## Performance
- [ ] Page load times are reasonable
- [ ] Real-time updates don't cause performance issues
- [ ] Images are optimized for quick loading
- [ ] No memory leaks in client-side code

## Database Triggers and Functions
- [ ] Ranking recalculation trigger works correctly
- [ ] User handicap calculation trigger works correctly
- [ ] Round total score calculation trigger works correctly
- [ ] Row-level security policies are enforced correctly
