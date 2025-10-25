import googleTrends from 'google-trends-api';
import { Trend } from '@/lib/types';

export async function scrapeGoogleTrends(
  keywords: string[],
  geo: string = 'US'
): Promise<Trend[]> {
  const trends: Trend[] = [];

  for (const keyword of keywords) {
    try {
      // Get interest over time
      const interestData = await googleTrends.interestOverTime({
        keyword,
        geo,
        startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      });

      const parsed = JSON.parse(interestData);
      const timelineData = parsed.default?.timelineData || [];

      if (timelineData.length === 0) continue;

      // Calculate trend velocity (is it rising?)
      const recent = timelineData.slice(-3);
      const older = timelineData.slice(-7, -4);
      const recentAvg = recent.reduce((sum: number, d: any) =>
        sum + (d.value?.[0] || 0), 0) / recent.length;
      const olderAvg = older.reduce((sum: number, d: any) =>
        sum + (d.value?.[0] || 0), 0) / older.length;

      const velocity = olderAvg > 0 ? (recentAvg - olderAvg) / olderAvg : 0;

      // Only include if trending up
      if (velocity > 0.1) {
        trends.push({
          id: `gtrends-${keyword.replace(/\s+/g, '-')}-${Date.now()}`,
          source: 'google_trends',
          title: `"${keyword}" is trending`,
          description: `Search interest up ${(velocity * 100).toFixed(0)}% in the last 3 days`,
          rawData: {
            keyword,
            currentInterest: recentAvg,
            velocity,
            geo,
          },
          engagementScore: Math.floor(recentAvg * (1 + velocity)),
          detectedAt: new Date(),
          keywords: [keyword],
        });
      }
    } catch (error: any) {
      console.error(`Failed to get trends for "${keyword}":`, error.message);
      // Continue with other keywords
    }
  }

  return trends.sort((a, b) =>
    (b.engagementScore || 0) - (a.engagementScore || 0)
  );
}

// Get related queries for a keyword
export async function getRelatedQueries(
  keyword: string,
  geo: string = 'US'
): Promise<string[]> {
  try {
    const data = await googleTrends.relatedQueries({ keyword, geo });
    const parsed = JSON.parse(data);

    const rising = parsed.default?.rankedList?.[0]?.rankedKeyword || [];
    return rising
      .map((item: any) => item.query)
      .slice(0, 10);
  } catch (error) {
    console.error('Failed to get related queries:', error);
    return [];
  }
}
