# Deployment Guide

## Quick Deploy to Vercel

### Prerequisites

1. A GitHub account
2. A Vercel account (sign up at [vercel.com](https://vercel.com))
3. A Neo4j Aura free account (sign up at [neo4j.com/cloud/aura](https://neo4j.com/cloud/aura))

### Step 1: Set Up Neo4j Aura Database

1. Go to [https://console.neo4j.io/](https://console.neo4j.io/)
2. Click "New Instance"
3. Select "AuraDB Free"
4. Choose a name for your database (e.g., "hurl-stories")
5. Select a region close to your Vercel region (e.g., us-east-1 for iad1)
6. Click "Create"
7. **IMPORTANT**: Download the credentials file - you'll need:
   - Connection URI (e.g., `neo4j+s://xxxxx.databases.neo4j.io`)
   - Username (usually `neo4j`)
   - Password (auto-generated)

### Step 2: Deploy to Vercel

#### Option A: Using Vercel Dashboard

1. Push this repository to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Click "Import Project"
4. Select your repository
5. Configure the project:
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)

6. Add Environment Variables:
   ```
   NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
   NEO4J_USERNAME=neo4j
   NEO4J_PASSWORD=your-password-here
   ```

7. Click "Deploy"

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (will prompt for environment variables)
vercel

# Or deploy with environment variables
vercel --env NEO4J_URI=neo4j+s://xxx.databases.neo4j.io \
       --env NEO4J_USERNAME=neo4j \
       --env NEO4J_PASSWORD=your-password

# Deploy to production
vercel --prod
```

### Step 3: Verify Deployment

1. Once deployed, Vercel will give you a URL (e.g., `your-app.vercel.app`)
2. Visit `https://your-app.vercel.app/api/health`
3. You should see:
   ```json
   {
     "success": true,
     "data": {
       "status": "healthy",
       "database": "connected"
     }
   }
   ```

4. Visit the main page and create your first story!

### Step 4: Custom Domain (Optional)

1. In Vercel Dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain (e.g., `hurl.ainot.io`)
4. Follow the DNS configuration instructions

## Updating Environment Variables

If you need to change your Neo4j credentials or add new environment variables:

1. Go to Vercel Dashboard
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Edit or add variables
5. Redeploy your application (automatic on next git push, or manual redeploy)

## Monitoring

### View Logs

1. Go to Vercel Dashboard
2. Select your project
3. Click "Deployments"
4. Click on a deployment
5. View "Functions" tab for API logs

### Neo4j Monitoring

1. Go to [Neo4j Console](https://console.neo4j.io/)
2. Click on your database
3. View metrics, query performance, and storage usage

## Troubleshooting

### "Database connection failed" Error

**Possible causes:**
1. Incorrect environment variables
2. Neo4j instance is paused (free tier pauses after inactivity)
3. Network issues

**Solutions:**
1. Check environment variables in Vercel dashboard
2. Resume your Neo4j Aura instance from the console
3. Check Neo4j Aura status page

### Function Timeout

Vercel free tier has a 10-second function timeout. If queries are slow:

1. Optimize your Cypher queries
2. Add indexes to your Neo4j database
3. Consider upgrading to Vercel Pro (60-second timeout)

### "Module not found" Errors

1. Ensure all dependencies are in `package.json`
2. Clear Vercel cache and redeploy
3. Check that build logs show successful dependency installation

## Performance Optimization

### Enable Edge Functions

For faster API responses, you can use Vercel Edge Functions:

1. Add to your API route files:
   ```typescript
   export const runtime = 'edge'; // Add this line
   ```

Note: Neo4j driver works with Edge runtime, but test thoroughly.

### Add Database Indexes

Connect to your Neo4j database and create indexes:

```cypher
CREATE INDEX story_id FOR (s:Story) ON (s.id);
CREATE INDEX story_title FOR (s:Story) ON (s.title);
```

### Caching

Consider adding caching for frequently accessed data:

```typescript
// In your API routes
export const revalidate = 60; // Revalidate every 60 seconds
```

## Scaling Considerations

### When to Upgrade Neo4j

Upgrade from AuraDB Free when you reach:
- 200,000 nodes (stories)
- 400,000 relationships
- 50 MB storage
- Need for automated backups

### When to Upgrade Vercel

Upgrade to Vercel Pro ($20/month) when you need:
- More than 100GB bandwidth/month
- Password protection
- Advanced analytics
- 60-second function timeout (vs 10 seconds)

## Security Best Practices

1. **Never commit `.env.local`** - Already in `.gitignore`
2. **Rotate Neo4j credentials** periodically
3. **Use Vercel environment variables** for sensitive data
4. **Enable Vercel Preview Protection** in settings
5. **Set up CORS** if building a separate frontend

## Backup Strategy

### Neo4j Backup

Free tier doesn't include automated backups. To backup manually:

1. Use the Neo4j Browser
2. Export your graph:
   ```cypher
   CALL apoc.export.json.all("backup.json")
   ```
3. Download the backup file

For automated backups, upgrade to Neo4j Professional tier.

### Code Backup

Your code is automatically backed up in:
1. GitHub repository
2. Vercel deployment history (last 100 deployments)

## Production Checklist

- [ ] Environment variables set in Vercel
- [ ] Neo4j database is running and accessible
- [ ] Health endpoint returns success
- [ ] Custom domain configured (if needed)
- [ ] SSL certificate is active (automatic with Vercel)
- [ ] Analytics enabled (Vercel Analytics)
- [ ] Error monitoring set up (Sentry, LogRocket, etc.)
- [ ] Database indexes created for performance
- [ ] Backup strategy in place
- [ ] Team members have access to Vercel/Neo4j consoles

## Support

- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **Neo4j**: [neo4j.com/support](https://neo4j.com/support)
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)
