# Vercel Deployment Configuration

## Environment Variables

Add the following environment variables in your Vercel project settings:

```
NEXT_PUBLIC_GOLF_COURSE_API_KEY=XU3Z6MFJUBIFR7NGKQN672QN7A
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Build Settings

- **Framework Preset**: Next.js
- **Build Command**: `next build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Development Command**: `next dev`

## Deployment Configuration

- **Root Directory**: `./`
- **Node.js Version**: 18.x (or latest LTS)
- **Include source maps**: Yes (for better error tracking)

## Serverless Function Configuration

- **Maximum Duration**: 10s (default)
- **Maximum Memory**: 1024 MB (default)

## Edge Network Configuration

- **Edge Caching**: Enable for static assets
- **ISR Cache**: Enable for course data pages

## Custom Domains

After initial deployment, add your custom domain in the Vercel dashboard:

1. Go to Project Settings > Domains
2. Add your domain (e.g., golfsocial.app)
3. Follow the DNS configuration instructions

## Deployment Hooks

Consider setting up deployment hooks for:

1. Supabase schema changes
2. API key rotations
3. Scheduled data refreshes

## Environment Specific Settings

### Production

- Set `NODE_ENV=production`
- Enable all production optimizations

### Preview Deployments

- Use separate Supabase project for preview environments
- Enable GitHub pull request previews

## Post-Deployment Verification

After deploying, verify:

1. API connections are working
2. Authentication flows complete successfully
3. Course search and detail pages load correctly
4. User contributions can be submitted
5. Admin features are properly secured

## Monitoring and Analytics

Enable:

1. Vercel Analytics for performance monitoring
2. Error tracking (Sentry recommended)
3. Usage metrics for API calls

## Rollback Strategy

In case of deployment issues:

1. Use Vercel's instant rollback feature
2. Check logs for specific errors
3. Verify environment variables are correctly set

## Scaling Considerations

As usage grows:

1. Consider upgrading Supabase plan for higher limits
2. Monitor API usage and adjust caching strategies
3. Implement regional deployments for global users
