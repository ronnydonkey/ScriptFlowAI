import { ResearchSource, ResearchSynthesis } from "@/lib/types";

/**
 * Synthesize research sources into a structured brief
 * @param sources - Array of research sources
 * @returns ResearchSynthesis object with key insights
 */
export function synthesizeResearch(sources: ResearchSource[]): ResearchSynthesis {
  if (sources.length === 0) {
    return {
      keyThemes: [],
      mainPoints: [],
      consensus: "No sources available for synthesis.",
      contradictions: [],
    };
  }

  // Extract key themes from summaries and highlights
  const keyThemes = extractKeyThemes(sources);

  // Identify main points across sources
  const mainPoints = extractMainPoints(sources);

  // Find consensus
  const consensus = findConsensus(sources);

  // Identify contradictions
  const contradictions = findContradictions(sources);

  // Find most recent source
  const mostRecentSource = findMostRecentSource(sources);

  // Find most authoritative source (highest score)
  const mostAuthoritativeSource = findMostAuthoritativeSource(sources);

  return {
    keyThemes,
    mainPoints,
    consensus,
    contradictions,
    mostRecentSource,
    mostAuthoritativeSource,
  };
}

function extractKeyThemes(sources: ResearchSource[]): string[] {
  const themes = new Set<string>();

  sources.forEach((source) => {
    // Extract from highlights
    source.highlights?.forEach((highlight) => {
      // Simple keyword extraction (in production, use NLP)
      const words = highlight.toLowerCase().split(/\s+/);
      if (words.length >= 3) {
        themes.add(highlight.substring(0, 100));
      }
    });
  });

  return Array.from(themes).slice(0, 5);
}

function extractMainPoints(sources: ResearchSource[]): string[] {
  const points: string[] = [];

  sources.forEach((source) => {
    // Use summary as main point - NO source numbers here
    // Source numbers will be added by citation-utils in the actual source list
    if (source.summary) {
      points.push(`${source.summary.substring(0, 200)}${source.summary.length > 200 ? '...' : ''}`);
    }
  });

  return points.slice(0, 8); // Top 8 points
}

function findConsensus(sources: ResearchSource[]): string {
  if (sources.length === 0) return "No consensus available.";
  if (sources.length === 1) return sources[0].summary;

  // Simple consensus: common themes in summaries
  const summaries = sources.map((s) => s.summary.toLowerCase());
  const commonWords = new Set<string>();

  // Find words that appear in multiple summaries (simplified)
  summaries.forEach((summary) => {
    const words = summary.split(/\s+/).filter((w) => w.length > 5);
    words.forEach((word) => {
      const count = summaries.filter((s) => s.includes(word)).length;
      if (count >= 2) {
        commonWords.add(word);
      }
    });
  });

  if (commonWords.size > 0) {
    return `Multiple sources discuss: ${Array.from(commonWords).slice(0, 5).join(", ")}`;
  }

  return "Sources cover related but distinct aspects of the topic.";
}

function findContradictions(sources: ResearchSource[]): string[] {
  // Simplified contradiction detection
  // In production, use semantic analysis
  const contradictions: string[] = [];

  // Look for opposing keywords in summaries
  const opposingPairs = [
    ["positive", "negative"],
    ["increase", "decrease"],
    ["beneficial", "harmful"],
    ["effective", "ineffective"],
    ["supports", "opposes"],
  ];

  sources.forEach((source1, idx1) => {
    sources.forEach((source2, idx2) => {
      if (idx1 >= idx2) return;

      opposingPairs.forEach(([word1, word2]) => {
        if (
          source1.summary.toLowerCase().includes(word1) &&
          source2.summary.toLowerCase().includes(word2)
        ) {
          contradictions.push(
            `Some sources suggest ${word1} perspectives while others indicate ${word2} viewpoints`
          );
        }
      });
    });
  });

  return contradictions.slice(0, 3);
}

function findMostRecentSource(sources: ResearchSource[]): ResearchSource | undefined {
  const sourcesWithDates = sources.filter((s) => s.publishedDate);

  if (sourcesWithDates.length === 0) return undefined;

  return sourcesWithDates.reduce((mostRecent, current) => {
    const currentDate = new Date(current.publishedDate!);
    const mostRecentDate = new Date(mostRecent.publishedDate!);
    return currentDate > mostRecentDate ? current : mostRecent;
  });
}

function findMostAuthoritativeSource(sources: ResearchSource[]): ResearchSource | undefined {
  const sourcesWithScores = sources.filter((s) => s.score !== undefined);

  if (sourcesWithScores.length === 0) return sources[0];

  return sourcesWithScores.reduce((mostAuth, current) => {
    return (current.score || 0) > (mostAuth.score || 0) ? current : mostAuth;
  });
}

/**
 * Format research synthesis for inclusion in prompts
 */
export function formatSynthesisForPrompt(synthesis: ResearchSynthesis): string {
  let formatted = `RESEARCH SYNTHESIS:\n\n`;

  if (synthesis.keyThemes.length > 0) {
    formatted += `Key Themes:\n${synthesis.keyThemes.map((t, i) => `${i + 1}. ${t}`).join("\n")}\n\n`;
  }

  formatted += `Consensus: ${synthesis.consensus}\n\n`;

  if (synthesis.contradictions.length > 0) {
    formatted += `Note - Contradictions Found:\n${synthesis.contradictions.map((c, i) => `- ${c}`).join("\n")}\n\n`;
  }

  if (synthesis.mostRecentSource) {
    formatted += `Most Recent Source: ${synthesis.mostRecentSource.title} (${synthesis.mostRecentSource.publishedDate})\n\n`;
  }

  if (synthesis.mainPoints.length > 0) {
    formatted += `Main Points Across Sources:\n${synthesis.mainPoints.map((p, i) => `${i + 1}. ${p}`).join("\n")}\n`;
  }

  return formatted;
}
