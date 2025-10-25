import { ResearchSource } from "@/lib/types";

/**
 * Extract publication name from URL and title
 */
export function extractPublicationName(url: string, title: string): string {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    const parts = domain.split('.');

    // Common publication domains
    const publicationMap: { [key: string]: string } = {
      'techcrunch.com': 'TechCrunch',
      'theverge.com': 'The Verge',
      'wired.com': 'Wired',
      'arstechnica.com': 'Ars Technica',
      'nytimes.com': 'The New York Times',
      'wsj.com': 'The Wall Street Journal',
      'reuters.com': 'Reuters',
      'bloomberg.com': 'Bloomberg',
      'forbes.com': 'Forbes',
      'medium.com': 'Medium',
      'substack.com': 'Substack',
      'github.com': 'GitHub',
      'openai.com': 'OpenAI',
      'anthropic.com': 'Anthropic',
      'mit.edu': 'MIT',
      'stanford.edu': 'Stanford',
      'arxiv.org': 'arXiv',
      'nature.com': 'Nature',
      'science.org': 'Science',
      'bbc.com': 'BBC',
      'cnn.com': 'CNN',
      'theguardian.com': 'The Guardian',
    };

    // Check if we have a known publication
    if (publicationMap[domain]) {
      return publicationMap[domain];
    }

    // Otherwise capitalize the main domain part
    const mainDomain = parts[parts.length - 2] || parts[0];
    return mainDomain.charAt(0).toUpperCase() + mainDomain.slice(1);
  } catch {
    // Fallback to first few words of title
    return title.split(' ').slice(0, 2).join(' ');
  }
}

/**
 * Format sources with natural citation instructions
 */
export function formatSourcesWithNaturalCitations(
  sources: ResearchSource[],
  includeCitations: boolean
): string {
  console.log('[Citation Utils] Formatting', sources.length, 'sources')

  if (!includeCitations) {
    return `RESEARCH SOURCES (${sources.length} total - use information but don't cite):
${sources.slice(0, 5).map((s) => `- ${s.title}: ${s.summary.substring(0, 150)}...`).join('\n')}`;
  }

  return `RESEARCH SOURCES:
${sources.map((source, idx) => {
    const publicationName = extractPublicationName(source.url, source.title);
    console.log(`[Citation Utils] Source #${idx + 1}: ${publicationName} (${source.url})`)
    return `
Source #${idx + 1} - ${publicationName}
Title: ${source.title}
URL: ${source.url}
${source.publishedDate ? `Published: ${source.publishedDate}` : ''}
${source.author ? `Author: ${source.author}` : ''}
Summary: ${source.summary}
${source.highlights && source.highlights.length > 0 ? `Key Points: ${source.highlights.slice(0, 3).join('; ')}` : ''}
${source.text ? `Excerpt: ${source.text.substring(0, 500)}...` : ''}

WHEN CITING THIS SOURCE, use natural language like:
- "According to ${publicationName}, ..."
- "${publicationName} reports that..."
- "As ${publicationName} notes, ..."
- "Research from ${publicationName} shows..."
${source.author ? `- "${source.author} writes that..."` : ''}

---`;
  }).join('\n')}

CITATION INSTRUCTIONS:
- Use the publication name naturally in your writing
- Do NOT use [Source #1] or [Source X] format
- Make citations sound journalistic and professional
- Examples: "According to TechCrunch, ..." or "The Verge reports..." or "MIT research shows..."
- Integrate citations smoothly into the narrative
- Maintain credibility by attributing information to sources`;
}

/**
 * Get citation instruction text
 */
export function getCitationInstructions(includeCitations: boolean): string {
  return includeCitations
    ? "Cite sources using natural language (e.g., 'According to TechCrunch, ...') - NOT [Source #] format."
    : "Do not include source citations in the script.";
}
