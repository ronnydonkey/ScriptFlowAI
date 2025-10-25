import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getPlatformPrompt } from '@/lib/prompts/platform-prompts';
import { ResearchSource } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { platform, topic, sources, youtubeScript } = body as {
      platform: string;
      topic: string;
      sources: ResearchSource[];
      youtubeScript: string;
    };

    // Validate inputs
    if (!platform || !youtubeScript) {
      return NextResponse.json(
        { error: 'Platform and YouTube script are required' },
        { status: 400 }
      );
    }

    // Only support validated platforms - waiting for user demand before adding more
    const validPlatforms = ['blog', 'twitter'];
    if (!validPlatforms.includes(platform)) {
      return NextResponse.json(
        { error: `Invalid platform. Currently supported: ${validPlatforms.join(', ')}` },
        { status: 400 }
      );
    }

    // Get platform-specific prompt
    const platformPrompt = getPlatformPrompt(platform);
    const userPrompt = platformPrompt.getUserPrompt(
      topic || 'the topic',
      sources || [],
      youtubeScript
    );

    // Generate content using Claude
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: platformPrompt.systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    return NextResponse.json({
      content: content.text,
      platform,
      timestamp: new Date(),
    });
  } catch (error: any) {
    console.error('[Generate Platform API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate platform content',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
