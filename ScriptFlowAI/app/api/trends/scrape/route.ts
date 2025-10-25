import { NextRequest, NextResponse } from 'next/server';
import { scrapeRedditTrends } from '@/lib/scrapers/reddit';
import { scrapeYouTubeTrends, YOUTUBE_CATEGORIES } from '@/lib/scrapers/youtube';
import { scrapeGoogleTrends } from '@/lib/scrapers/google-trends';
import { Trend } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sources = ['reddit', 'youtube', 'google_trends'] } = body;

    const allTrends: Trend[] = [];

    // Scrape Reddit
    if (sources.includes('reddit')) {
      const redditTrends = await scrapeRedditTrends([
        'technology',
        'science',
        'videos',
        'youtubers',
      ]);
      allTrends.push(...redditTrends);
    }

    // Scrape YouTube
    if (sources.includes('youtube')) {
      const youtubeTrends = await scrapeYouTubeTrends(
        YOUTUBE_CATEGORIES.SCIENCE_TECH
      );
      allTrends.push(...youtubeTrends);
    }

    // Scrape Google Trends
    if (sources.includes('google_trends')) {
      const googleTrends = await scrapeGoogleTrends([
        'AI',
        'technology',
        'science',
        'tutorial',
      ]);
      allTrends.push(...googleTrends);
    }

    // Deduplicate and sort by engagement
    const uniqueTrends = Array.from(
      new Map(allTrends.map(t => [t.title.toLowerCase(), t])).values()
    );

    const sortedTrends = uniqueTrends
      .sort((a, b) => (b.engagementScore || 0) - (a.engagementScore || 0))
      .slice(0, 50); // Top 50

    return NextResponse.json({
      trends: sortedTrends,
      count: sortedTrends.length,
      timestamp: new Date(),
    });
  } catch (error: any) {
    console.error('[Trends Scrape API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to scrape trends',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
