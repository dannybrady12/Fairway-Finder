# Deployment Guide for Golf Social App

## Prerequisites
- Vercel account for deployment
- Supabase account for backend services
- Environment variables for API keys and configuration

## Environment Variables
The following environment variables need to be set in your Vercel project:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_WEATHER_API_KEY=your_weather_api_key (optional for production)
```

## Deployment Steps

### 1. Set up Supabase Project
1. Create a new Supabase project
2. Run the database schema SQL scripts to set up tables and relationships
   - Use the `supabase-schema.sql` file which includes all tables, including the comparative ranking system
3. Configure authentication settings
   - Enable Email sign-up and sign-in
   - Set up any additional providers if needed (Google, GitHub, etc.)
4. Set up storage buckets for images
   - Create a public bucket for course and review images
5. Enable real-time features for relevant tables
   - Ensure the following tables have real-time enabled:
     - rounds
     - scores
     - course_reviews
     - course_comparisons
     - user_course_rankings
     - comments

### 2. Deploy to Vercel
1. Push your code to a GitHub repository
2. Connect your Vercel account to your GitHub repository
3. Configure the environment variables
4. Set the build command to `npm run build`
5. Set the output directory to `.next`
6. Deploy the application

### 3. Post-Deployment
1. Test all features on the live deployment
2. Verify authentication flows
3. Check real-time updates
4. Ensure all API integrations are working
5. Test the comparative ranking system with multiple user accounts

## Local Development
To run the application locally:

```bash
# Install dependencies
npm install

# Set up environment variables
# Create a .env.local file with the required variables

# Run the development server
npm run dev
```

## Maintenance
- Regularly update dependencies
- Monitor Supabase usage and quotas
- Check for any API rate limiting issues
- Monitor database performance, especially the ranking calculation triggers
