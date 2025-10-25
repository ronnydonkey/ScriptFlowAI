'use client';

import { useState, useEffect } from 'react';
import { TrendCard } from '@/app/components/TrendCard';
import { TrendSuggestion, AvatarProfile } from '@/lib/types';
import { RefreshCw } from 'lucide-react';

export default function TrendsPage() {
  const [suggestions, setSuggestions] = useState<TrendSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock avatar (replace with actual avatar selection)
  const mockAvatar: AvatarProfile = {
    name: 'Tech Explainer',
    description: 'Educational tech content for curious minds',
    interests: {
      keywords: ['AI', 'technology', 'programming', 'science'],
      subreddits: ['r/technology', 'r/programming', 'r/science'],
      topics: ['artificial intelligence', 'software development', 'physics'],
    },
    tone: 'educational and engaging',
    audienceLevel: 'intermediate',
  };

  const fetchTrends = async () => {
    setLoading(true);
    setError(null);

    try {
      // Step 1: Scrape trends
      const scrapeRes = await fetch('/api/trends/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sources: ['reddit', 'youtube', 'google_trends'],
        }),
      });

      if (!scrapeRes.ok) {
        throw new Error('Failed to fetch trends');
      }

      const { trends } = await scrapeRes.json();

      // Step 2: Analyze for relevance
      const analyzeRes = await fetch('/api/trends/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trends,
          avatar: mockAvatar,
        }),
      });

      if (!analyzeRes.ok) {
        throw new Error('Failed to analyze trends');
      }

      const { suggestions: newSuggestions } = await analyzeRes.json();
      setSuggestions(newSuggestions);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerateScript = async (suggestion: TrendSuggestion) => {
    // Navigate to main page with trend pre-filled
    // Build a concise topic that fits within URL limits
    let topic = `${suggestion.trend.title}

Suggested Angle: ${suggestion.suggestedAngle}`;

    // Add context if there's room (max ~1000 chars to be safe for URL encoding)
    if (topic.length < 800) {
      topic += `

Context: ${suggestion.whyRelevant}`;
    }

    // Add source if there's still room
    if (topic.length < 900 && suggestion.trend.url) {
      topic += `

Source: ${suggestion.trend.url}`;
    }

    window.location.href = `/?topic=${encodeURIComponent(topic)}`;
  };

  const handleReject = async (suggestion: TrendSuggestion) => {
    // Remove from list
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    // TODO: Save rejection to database for learning
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Trending Topics for {mockAvatar.name}
            </h1>
            <p className="text-gray-600">
              Personalized content ideas based on what&apos;s trending right now
            </p>
          </div>
          <button
            onClick={fetchTrends}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <RefreshCw className="animate-spin mx-auto mb-4" size={32} />
            <p className="text-gray-600">Finding trending topics...</p>
          </div>
        )}

        {/* Suggestions Grid */}
        {!loading && suggestions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {suggestions.map(suggestion => (
              <TrendCard
                key={suggestion.id}
                suggestion={suggestion}
                onGenerateScript={handleGenerateScript}
                onReject={handleReject}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && suggestions.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-gray-600">
              No relevant trends found. Try adjusting your avatar preferences.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
