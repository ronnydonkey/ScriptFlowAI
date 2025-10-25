-- Trends discovered from sources
CREATE TABLE IF NOT EXISTS trends (
    id TEXT PRIMARY KEY,
    source TEXT NOT NULL, -- 'reddit' | 'youtube' | 'google_trends'
    title TEXT NOT NULL,
    url TEXT,
    description TEXT,
    raw_data JSONB,
    engagement_score INTEGER,
    detected_at TIMESTAMP DEFAULT NOW(),
    keywords TEXT[]
);

-- Avatar interests for matching
CREATE TABLE IF NOT EXISTS avatar_interests (
    id TEXT PRIMARY KEY,
    avatar_name TEXT NOT NULL,
    interest_type TEXT NOT NULL, -- 'keyword' | 'subreddit' | 'topic'
    interest_value TEXT NOT NULL,
    weight DECIMAL(3,2) DEFAULT 1.0
);

-- Trend suggestions matched to avatars
CREATE TABLE IF NOT EXISTS trend_suggestions (
    id TEXT PRIMARY KEY,
    trend_id TEXT REFERENCES trends(id),
    avatar_name TEXT NOT NULL,
    relevance_score DECIMAL(3,2),
    suggested_angle TEXT,
    why_relevant TEXT,
    user_action TEXT, -- 'accepted' | 'rejected' | 'ignored'
    suggested_at TIMESTAMP DEFAULT NOW(),
    actioned_at TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_trends_detected_at ON trends(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_trend_suggestions_avatar ON trend_suggestions(avatar_name);
CREATE INDEX IF NOT EXISTS idx_trend_suggestions_actioned ON trend_suggestions(user_action);
