import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { TrendSuggestion } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 30;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { suggestions, avatarName } = body as {
      suggestions: TrendSuggestion[];
      avatarName: string;
    };

    if (!suggestions || suggestions.length === 0) {
      return NextResponse.json({
        digest: 'No trending topics found for your avatar today. Check back tomorrow!',
      });
    }

    const prompt = `Create an engaging daily trend digest email for a content creator.

AVATAR: ${avatarName}

TOP TRENDS (already filtered for relevance):
${suggestions.map((s, i) => `
${i + 1}. ${s.trend.title}
   Source: ${s.trend.source}
   Why relevant: ${s.whyRelevant}
   Suggested angle: ${s.suggestedAngle}
   Engagement: ${s.trend.engagementScore} points
`).join('\n')}

Create a concise, energizing email digest (max 300 words):
- Start with a personalized greeting for ${avatarName}
- Present the top 3-5 trends with emojis
- Include the suggested angle for each
- Add one-sentence calls to action ("Generate script", "Learn more")
- Keep tone encouraging and action-oriented

Return plain text (no markdown).`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    return NextResponse.json({
      digest: content.text,
      trendCount: suggestions.length,
      timestamp: new Date(),
    });
  } catch (error: any) {
    console.error('[Trends Digest API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate digest',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
