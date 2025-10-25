import { google } from 'googleapis';
import { Trend } from '@/lib/types';

const youtube = google.youtube('v3');

export async function scrapeYouTubeTrends(
  categoryId?: string,
  regionCode: string = 'US',
  maxResults: number = 25
): Promise<Trend[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    throw new Error('YouTube API key not configured');
  }

  try {
    const response = await youtube.videos.list({
      key: apiKey,
      part: ['snippet', 'statistics'],
      chart: 'mostPopular',
      regionCode,
      videoCategoryId: categoryId,
      maxResults,
    });

    const trends: Trend[] = (response.data.items || []).map((video) => {
      const snippet = video.snippet!;
      const stats = video.statistics!;

      return {
        id: `youtube-${video.id}`,
        source: 'youtube',
        title: snippet.title!,
        url: `https://youtube.com/watch?v=${video.id}`,
        description: snippet.description?.substring(0, 500),
        rawData: {
          channelTitle: snippet.channelTitle,
          publishedAt: snippet.publishedAt,
          categoryId: snippet.categoryId,
        },
        engagementScore:
          parseInt(stats.viewCount || '0') / 1000 +
          parseInt(stats.likeCount || '0') +
          parseInt(stats.commentCount || '0'),
        detectedAt: new Date(),
        keywords: extractKeywords(snippet.title!),
      };
    });

    return trends.sort((a, b) =>
      (b.engagementScore || 0) - (a.engagementScore || 0)
    );
  } catch (error: any) {
    console.error('YouTube API error:', error.message);
    throw new Error(`Failed to fetch YouTube trends: ${error.message}`);
  }
}

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .slice(0, 10);
}

// YouTube category IDs for targeting
export const YOUTUBE_CATEGORIES = {
  SCIENCE_TECH: '28',
  EDUCATION: '27',
  GAMING: '20',
  NEWS_POLITICS: '25',
  ENTERTAINMENT: '24',
};
