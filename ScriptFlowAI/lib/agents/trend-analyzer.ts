import Anthropic from '@anthropic-ai/sdk';
import { Trend, TrendSuggestion, AvatarProfile } from '@/lib/types';
import { retryWithBackoff } from '@/lib/utils/retry';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function analyzeTrendRelevance(
  trend: Trend,
  avatar: AvatarProfile
): Promise<TrendSuggestion | null> {
  const prompt = `You are analyzing if a trending topic is relevant to a content creator avatar.

AVATAR PROFILE:
Name: ${avatar.name}
Description: ${avatar.description}
Interests: ${JSON.stringify(avatar.interests, null, 2)}
Tone: ${avatar.tone}
Audience Level: ${avatar.audienceLevel}

TRENDING TOPIC:
Source: ${trend.source}
Title: ${trend.title}
Description: ${trend.description || 'N/A'}
URL: ${trend.url || 'N/A'}
Engagement: ${trend.engagementScore} points

TASK:
Determine if this trend is relevant to this avatar's content strategy.

Return ONLY valid JSON (no markdown, no code blocks):
{
  "is_relevant": boolean,
  "relevance_score": number (0.0 to 1.0),
  "reasoning": "brief explanation",
  "suggested_angle": "how avatar should approach this topic",
  "urgency": "rising" | "peaking" | "stable"
}

Be ruthlessly honest. False positives waste creator time.`;

  try {
    const response = await retryWithBackoff(
      async () => {
        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
        });

        const content = message.content[0];
        if (content.type !== 'text') {
          throw new Error('Unexpected response type');
        }

        return content.text;
      },
      { maxRetries: 3, baseDelay: 1000 }
    );

    // Parse JSON response (strip markdown if present)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Only return if relevant
    if (!analysis.is_relevant || analysis.relevance_score < 0.5) {
      return null;
    }

    return {
      id: `suggestion-${trend.id}-${Date.now()}`,
      trend,
      avatarName: avatar.name,
      relevanceScore: analysis.relevance_score,
      suggestedAngle: analysis.suggested_angle,
      whyRelevant: analysis.reasoning,
      suggestedAt: new Date(),
    };
  } catch (error: any) {
    console.error('Trend analysis failed:', error.message);
    return null;
  }
}

export async function batchAnalyzeTrends(
  trends: Trend[],
  avatar: AvatarProfile
): Promise<TrendSuggestion[]> {
  const suggestions: TrendSuggestion[] = [];

  // Process in parallel (max 5 at a time to avoid rate limits)
  const batchSize = 5;
  for (let i = 0; i < trends.length; i += batchSize) {
    const batch = trends.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(trend => analyzeTrendRelevance(trend, avatar))
    );

    suggestions.push(...results.filter((s): s is TrendSuggestion => s !== null));
  }

  // Sort by relevance score
  return suggestions.sort((a, b) => b.relevanceScore - a.relevanceScore);
}
