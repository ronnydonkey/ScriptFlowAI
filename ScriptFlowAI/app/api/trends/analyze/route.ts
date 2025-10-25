import { NextRequest, NextResponse } from 'next/server';
import { batchAnalyzeTrends } from '@/lib/agents/trend-analyzer';
import { Trend, AvatarProfile } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { trends, avatar } = body as {
      trends: Trend[];
      avatar: AvatarProfile;
    };

    if (!trends || !Array.isArray(trends)) {
      return NextResponse.json(
        { error: 'Trends array is required' },
        { status: 400 }
      );
    }

    if (!avatar || !avatar.name) {
      return NextResponse.json(
        { error: 'Avatar profile is required' },
        { status: 400 }
      );
    }

    // Analyze trends for relevance
    const suggestions = await batchAnalyzeTrends(trends, avatar);

    return NextResponse.json({
      suggestions: suggestions.slice(0, 10), // Top 10 suggestions
      avatarName: avatar.name,
      analyzedCount: trends.length,
      relevantCount: suggestions.length,
      timestamp: new Date(),
    });
  } catch (error: any) {
    console.error('[Trends Analyze API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze trends',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
