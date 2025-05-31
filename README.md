# Golf Social App

A social golf web application that allows users to track scores, review courses, and connect with other golfers.

## Features

- **Homepage Feed**: Shows recent course reviews and live rounds being played, prioritized by users you follow
- **Course Search**: Find golf courses, view details, and read reviews
- **Beli-style Review System**: "Loved It/Liked It/OK" review options instead of traditional star ratings
- **Live Scoring**: Start a round, enter hole-by-hole scores, and see real-time updates
- **Live Round Viewer**: Watch rounds update hole-by-hole and leave comments
- **User Profiles**: View bio, past scorecards, reviews, and current live rounds
- **Weather Integration**: Check current and forecasted weather for courses
- **Tournament Creation**: Create and join competitions with friends

## Tech Stack

- **Frontend**: Next.js with App Router, TypeScript, and Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Storage, Real-time)
- **APIs**: Weather integration

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- (Optional) Weather API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   NEXT_PUBLIC_WEATHER_API_KEY=your-weather-api-key (optional)
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

### Database Setup

1. Create a new Supabase project
2. Run the SQL script in `supabase-schema.sql` to set up the database schema
3. Configure authentication and storage settings in the Supabase dashboard

## Deployment

See `deployment.md` for detailed instructions on deploying to Vercel.

## Project Structure

- `/src/app`: Next.js App Router pages
- `/src/components`: Reusable UI components
- `/src/lib`: Utility functions and API clients
- `/src/hooks`: Custom React hooks
- `/src/types`: TypeScript type definitions

## License

This project is licensed under the MIT License.
