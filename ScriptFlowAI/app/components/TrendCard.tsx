'use client';

import { TrendSuggestion } from '@/lib/types';
import { TrendingUp, Clock, ExternalLink } from 'lucide-react';

interface TrendCardProps {
  suggestion: TrendSuggestion;
  onGenerateScript: (suggestion: TrendSuggestion) => void;
  onReject: (suggestion: TrendSuggestion) => void;
}

export function TrendCard({ suggestion, onGenerateScript, onReject }: TrendCardProps) {
  const { trend, suggestedAngle, whyRelevant, relevanceScore } = suggestion;

  const getSourceEmoji = (source: string) => {
    switch (source) {
      case 'reddit': return '🔴';
      case 'youtube': return '📺';
      case 'google_trends': return '📈';
      default: return '🔍';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{getSourceEmoji(trend.source)}</span>
            <span className="text-sm text-gray-500 uppercase">
              {trend.source.replace('_', ' ')}
            </span>
            <div className="ml-auto flex items-center gap-1 text-green-600">
              <TrendingUp size={16} />
              <span className="text-sm font-medium">
                {(relevanceScore * 100).toFixed(0)}% match
              </span>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {trend.title}
          </h3>
        </div>
      </div>

      {/* Description */}
      {trend.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {trend.description}
        </p>
      )}

      {/* Why Relevant */}
      <div className="bg-blue-50 border border-blue-100 rounded p-3 mb-3">
        <p className="text-sm text-blue-900">
          <strong>Why this matters:</strong> {whyRelevant}
        </p>
      </div>

      {/* Suggested Angle */}
      <div className="bg-purple-50 border border-purple-100 rounded p-3 mb-4">
        <p className="text-sm text-purple-900">
          <strong>Your angle:</strong> {suggestedAngle}
        </p>
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
        <div className="flex items-center gap-1">
          <Clock size={14} />
          <span>{new Date(trend.detectedAt).toLocaleDateString()}</span>
        </div>
        {trend.url && (
          <a
            href={trend.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-blue-600"
          >
            <ExternalLink size={14} />
            <span>View source</span>
          </a>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onGenerateScript(suggestion)}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          Generate Script
        </button>
        <button
          onClick={() => onReject(suggestion)}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Not Interested
        </button>
      </div>
    </div>
  );
}
