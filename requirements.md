# Golf Social App Requirements

## Core Features

### Homepage Feed
- Display recent course reviews and live rounds being played
- Prioritize content from users the current user follows
- Real-time updates for live rounds

### Course Search and Details
- Search functionality for golf courses
- Course information display (name, location, photos, par info)
- User-submitted ratings, written reviews, and photos

### Live Scoring
- Start a new round functionality
- Hole-by-hole score entry
- Real-time scorecard updates
- Statistics calculation

### Live Round Viewer
- Watch rounds update in real-time
- Comment functionality on live rounds
- Notification system for followed users' rounds

### User Profiles
- Bio and profile information
- Past scorecards display
- Review history
- Current live rounds
- Following/follower system

## Data Models

### Users
- User ID (primary key)
- Username
- Email
- Password (hashed)
- Profile picture
- Bio
- Following/Followers lists
- Created date

### Courses
- Course ID (primary key)
- Name
- Location (address, coordinates)
- Par information (hole-by-hole)
- Course photos
- Average rating
- Created date

### Scorecards
- Scorecard ID (primary key)
- User ID (foreign key)
- Course ID (foreign key)
- Date played
- Hole-by-hole scores
- Total score
- Status (live/completed)
- Created date
- Last updated

### Reviews
- Review ID (primary key)
- User ID (foreign key)
- Course ID (foreign key)
- Star rating
- Written content
- Photos (optional)
- Created date

### Comments
- Comment ID (primary key)
- User ID (foreign key)
- Scorecard ID (foreign key)
- Content
- Created date

## Technical Requirements

### Frontend
- React/Next.js for UI framework
- Tailwind CSS for styling
- Responsive design for mobile and desktop
- Real-time updates using Firebase/Firestore listeners

### Backend
- Firebase Authentication for user management
- Firestore for database
- Firebase Storage for image uploads
- Firebase Cloud Functions for complex operations (optional)

### Deployment
- Vercel or Netlify for hosting
- Firebase project configuration
