import { Trend } from '@/lib/types';

let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Reddit API credentials not configured');
  }

  // Get OAuth token
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error(`Reddit auth failed: ${response.statusText}`);
  }

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // 1 min buffer

  return accessToken;
}

export async function scrapeRedditTrends(
  subreddits: string[],
  timeFilter: 'hour' | 'day' | 'week' = 'day',
  limit: number = 25
): Promise<Trend[]> {
  const token = await getAccessToken();
  const trends: Trend[] = [];

  for (const subreddit of subreddits) {
    try {
      const response = await fetch(
        `https://oauth.reddit.com/r/${subreddit}/hot?limit=${limit}&t=${timeFilter}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'User-Agent': process.env.REDDIT_USER_AGENT || 'ScriptFlowAI/1.0',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.statusText}`);
      }

      const data = await response.json();
      const posts = data.data.children;

      for (const post of posts) {
        const postData = post.data;

        // Only include posts with significant engagement
        if (postData.score > 50 && postData.num_comments > 10) {
          trends.push({
            id: `reddit-${postData.id}`,
            source: 'reddit',
            title: postData.title,
            url: `https://reddit.com${postData.permalink}`,
            description: postData.selftext?.substring(0, 500) || undefined,
            rawData: {
              subreddit: postData.subreddit_name_prefixed,
              author: postData.author,
              created: postData.created_utc,
            },
            engagementScore: postData.score + postData.num_comments,
            detectedAt: new Date(),
            keywords: extractKeywords(postData.title),
          });
        }
      }
    } catch (error: any) {
      console.error(`Failed to scrape r/${subreddit}:`, error.message);
      // Continue with other subreddits
    }
  }

  return trends.sort((a, b) =>
    (b.engagementScore || 0) - (a.engagementScore || 0)
  );
}

function extractKeywords(text: string): string[] {
  // Simple keyword extraction (you can enhance this)
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .slice(0, 10);
}
