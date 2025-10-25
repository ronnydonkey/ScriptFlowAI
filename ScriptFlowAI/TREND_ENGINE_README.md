# ScriptFlowAI Trend Engine

The Trend Engine adds Reddit, YouTube, and Google Trends discovery to ScriptFlowAI, helping content creators find trending topics personalized to their avatar profiles.

## Features

- **Multi-Source Scraping**: Reddit, YouTube, and Google Trends
- **AI-Powered Relevance Analysis**: Claude analyzes each trend for your specific avatar
- **Personalized Suggestions**: Get content ideas with suggested angles
- **Automated Daily Digests**: Cron job runs daily at 8 AM UTC
- **One-Click Script Generation**: Navigate directly to script creation with pre-filled topics

## Setup Instructions

### 1. Install Dependencies

Already installed:
```bash
npm install snoowrap googleapis google-trends-api @vercel/postgres
npm install -D @types/snoowrap
```

### 2. Get API Credentials

#### Reddit API (Free)
1. Go to https://www.reddit.com/prefs/apps
2. Click "create another app..."
3. Select "script" type
4. Copy your `client_id` and `client_secret`
5. Add to `.env.local`:
```env
REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_client_secret
REDDIT_USER_AGENT=ScriptFlowAI/1.0
```

#### YouTube Data API (Free tier: 10k units/day)
1. Go to https://console.cloud.google.com
2. Create a new project or select existing
3. Enable "YouTube Data API v3"
4. Create credentials (API Key)
5. Add to `.env.local`:
```env
YOUTUBE_API_KEY=your_youtube_api_key
```

#### Google Trends API
No API key needed! Uses unofficial free API.

#### Anthropic API
Already configured in your `.env.local`:
```env
ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Database Setup (Vercel Postgres)

1. Go to your Vercel dashboard
2. Navigate to your ScriptFlowAI project
3. Go to Storage → Create Database → Postgres
4. Once created, go to the `.env.local` tab and copy connection strings to your local `.env.local`
5. In the Postgres dashboard, go to "Query" tab
6. Run the SQL from `lib/db/schema.sql`:

```sql
-- Copy and paste the entire contents of lib/db/schema.sql
```

### 4. Deploy to Vercel

```bash
git add .
git commit -m "Add Trend Engine feature"
git push
```

Vercel will automatically:
- Deploy your app
- Set up the daily cron job (runs at 8 AM UTC)
- Configure environment variables (make sure to add them in Vercel dashboard)

### 5. Add Environment Variables to Vercel

In Vercel Dashboard → Project Settings → Environment Variables, add:
- `REDDIT_CLIENT_ID`
- `REDDIT_CLIENT_SECRET`
- `REDDIT_USER_AGENT`
- `YOUTUBE_API_KEY`
- `ANTHROPIC_API_KEY` (already there)

## Usage

### Access the Trends Page

Navigate to: `https://your-app.vercel.app/trends`

Or add a navigation link in your main layout (recommended):
```tsx
<Link href="/trends" className="...">
  🔥 Trending Topics
</Link>
```

### How It Works

1. **Scraping**: The system scrapes Reddit, YouTube, and Google Trends daily
2. **Analysis**: Claude analyzes each trend against your avatar profile
3. **Filtering**: Only relevant trends (>50% relevance score) are shown
4. **Action**: Click "Generate Script" to pre-fill the main page with the topic

### Customize Avatar Profile

Edit the `mockAvatar` in `app/trends/page.tsx`:

```typescript
const mockAvatar: AvatarProfile = {
  name: 'Your Avatar Name',
  description: 'Brief description of your content style',
  interests: {
    keywords: ['keyword1', 'keyword2', 'keyword3'],
    subreddits: ['r/subreddit1', 'r/subreddit2'],
    topics: ['topic1', 'topic2'],
  },
  tone: 'casual / professional / energetic',
  audienceLevel: 'beginner' / 'intermediate' / 'advanced',
};
```

**Future Enhancement**: Create a UI for managing multiple avatars and saving them to the database.

## API Endpoints

### POST `/api/trends/scrape`
Scrapes trends from all sources.

**Request:**
```json
{
  "sources": ["reddit", "youtube", "google_trends"]
}
```

**Response:**
```json
{
  "trends": [...],
  "count": 50,
  "timestamp": "2025-10-24T..."
}
```

### POST `/api/trends/analyze`
Analyzes trends for avatar relevance.

**Request:**
```json
{
  "trends": [...],
  "avatar": { ... }
}
```

**Response:**
```json
{
  "suggestions": [...],
  "avatarName": "Tech Explainer",
  "analyzedCount": 50,
  "relevantCount": 8
}
```

### POST `/api/trends/digest`
Generates email digest of top trends.

**Request:**
```json
{
  "suggestions": [...],
  "avatarName": "Tech Explainer"
}
```

**Response:**
```json
{
  "digest": "Hi Tech Explainer! Here are today's top trends...",
  "trendCount": 8
}
```

## Cron Job

The `/api/trends/scrape` endpoint runs daily at 8 AM UTC via Vercel Cron.

**Configure in `vercel.json`:**
```json
{
  "crons": [{
    "path": "/api/trends/scrape",
    "schedule": "0 8 * * *"
  }]
}
```

## Cost Estimates

Per 100 active users with daily trend checks:

- **YouTube API**: $0 (within free quota if cached)
- **Reddit API**: $0 (free)
- **Google Trends**: $0 (free unofficial API)
- **Anthropic API**: ~$50-100/month (trend analysis)
- **Vercel Postgres**: ~$20/month
- **Total**: ~$70-120/month

## Customization

### Change Scraped Subreddits

Edit `app/api/trends/scrape/route.ts`:
```typescript
const redditTrends = await scrapeRedditTrends([
  'yoursubreddit',
  'anothersubreddit',
]);
```

### Change YouTube Category

Edit `app/api/trends/scrape/route.ts`:
```typescript
const youtubeTrends = await scrapeYouTubeTrends(
  YOUTUBE_CATEGORIES.EDUCATION // or GAMING, NEWS_POLITICS, etc.
);
```

### Change Google Trends Keywords

Edit `app/api/trends/scrape/route.ts`:
```typescript
const googleTrends = await scrapeGoogleTrends([
  'your keyword',
  'another topic',
]);
```

## Files Created

### Core Library
- `lib/types.ts` - Added Trend, TrendSuggestion, AvatarProfile types
- `lib/db/schema.sql` - Database schema for trends
- `lib/scrapers/reddit.ts` - Reddit scraper
- `lib/scrapers/youtube.ts` - YouTube scraper
- `lib/scrapers/google-trends.ts` - Google Trends scraper
- `lib/agents/trend-analyzer.ts` - AI-powered relevance analyzer

### API Routes
- `app/api/trends/scrape/route.ts` - Scrape endpoint
- `app/api/trends/analyze/route.ts` - Analysis endpoint
- `app/api/trends/digest/route.ts` - Digest generation

### Frontend
- `app/components/TrendCard.tsx` - Trend card component
- `app/trends/page.tsx` - Main trends page

### Config
- `vercel.json` - Added cron job configuration
- `.env.local` - Added new API keys

## Troubleshooting

### "Reddit API credentials not configured"
Make sure you've added `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, and `REDDIT_USER_AGENT` to `.env.local` and Vercel environment variables.

### "YouTube API key not configured"
Add `YOUTUBE_API_KEY` to `.env.local` and Vercel.

### No trends showing up
1. Check that API credentials are correct
2. Open browser console for errors
3. Check Vercel function logs
4. Try adjusting the avatar profile to be more general

### Build warnings about "utf-8-validate"
This is a non-critical optional dependency warning from snoowrap. The app works fine without it.

## Next Steps

1. **Build Avatar Management UI**: Create a page to manage multiple avatar profiles
2. **Save Rejections**: Track which trends users reject to improve recommendations
3. **Email Digests**: Integrate with email service to send daily digests
4. **Trend History**: Save trends to database for historical analysis
5. **Custom Filters**: Add UI controls for filtering by source, engagement, date
6. **Batch Actions**: Select multiple trends to generate scripts

## Support

For issues or questions, refer to the main ScriptFlowAI documentation or open an issue on GitHub.
