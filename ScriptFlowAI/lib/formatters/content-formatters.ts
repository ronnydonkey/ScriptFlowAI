import { ResearchSource } from '@/lib/types';

export type ExportFormat = 'youtube' | 'blog' | 'twitter' | 'linkedin' | 'newsletter';

export interface FormatOptions {
  includeCitations?: boolean;
  includeTitle?: boolean;
  maxTweetLength?: number;
}

/**
 * Format content as a blog post (Medium/Substack style)
 */
export function formatAsBlogPost(
  script: string,
  title?: string,
  sources?: ResearchSource[],
  options: FormatOptions = {}
): string {
  const { includeCitations = true } = options;

  let output = '';

  // Add title
  if (title) {
    output += `# ${title}\n\n`;
  }

  // Add intro hook
  output += `${script}\n\n`;

  // Add sources section
  if (includeCitations && sources && sources.length > 0) {
    output += `---\n\n## Sources & Further Reading\n\n`;
    sources.forEach((source, idx) => {
      output += `${idx + 1}. [${source.title}](${source.url})`;
      if (source.author) output += ` - ${source.author}`;
      if (source.publishedDate) output += ` (${source.publishedDate})`;
      output += `\n`;
    });
  }

  return output;
}

/**
 * Format content as a Twitter thread
 */
export function formatAsTwitterThread(
  script: string,
  title?: string,
  sources?: ResearchSource[],
  options: FormatOptions = {}
): string {
  const { maxTweetLength = 280, includeCitations = true } = options;

  const tweets: string[] = [];

  // First tweet with hook
  if (title) {
    tweets.push(`🧵 ${title}\n\nA thread:`);
  }

  // Split script into paragraphs
  const paragraphs = script.split('\n\n').filter(p => p.trim().length > 0);

  let currentTweet = '';
  let tweetNumber = title ? 2 : 1;

  for (const paragraph of paragraphs) {
    const sentences = paragraph.split(/(?<=[.!?])\s+/);

    for (const sentence of sentences) {
      const withNumber = `${tweetNumber}/ ${currentTweet}${currentTweet ? ' ' : ''}${sentence}`.trim();

      if (withNumber.length <= maxTweetLength) {
        currentTweet = currentTweet ? `${currentTweet} ${sentence}` : sentence;
      } else {
        // Save current tweet and start new one
        if (currentTweet) {
          tweets.push(`${tweetNumber}/ ${currentTweet}`);
          tweetNumber++;
        }
        currentTweet = sentence;
      }
    }

    // Add paragraph break
    if (currentTweet) {
      tweets.push(`${tweetNumber}/ ${currentTweet}`);
      tweetNumber++;
      currentTweet = '';
    }
  }

  // Add final tweet if there's remaining content
  if (currentTweet) {
    tweets.push(`${tweetNumber}/ ${currentTweet}`);
    tweetNumber++;
  }

  // Add sources in final tweet
  if (includeCitations && sources && sources.length > 0) {
    const sourceTweet = `${tweetNumber}/ Sources:\n\n${sources
      .slice(0, 3)
      .map(s => `• ${s.url}`)
      .join('\n')}`;

    if (sourceTweet.length <= maxTweetLength) {
      tweets.push(sourceTweet);
    }
  }

  return tweets.join('\n\n---\n\n');
}

/**
 * Format content as LinkedIn article
 */
export function formatAsLinkedIn(
  script: string,
  title?: string,
  sources?: ResearchSource[],
  options: FormatOptions = {}
): string {
  const { includeCitations = true } = options;

  let output = '';

  // LinkedIn likes professional, structured content
  if (title) {
    output += `${title}\n\n`;
  }

  // Add content with professional formatting
  const paragraphs = script.split('\n\n');

  paragraphs.forEach((para, idx) => {
    // Add emoji bullets for key points
    if (para.includes(':') || para.includes('•')) {
      output += `💡 ${para}\n\n`;
    } else if (idx === 0) {
      output += `${para}\n\n`; // First paragraph as hook
    } else {
      output += `${para}\n\n`;
    }
  });

  // Add key takeaways section
  output += `\n---\n\n🔑 Key Takeaways:\n`;
  const keyPoints = extractKeyPoints(script);
  keyPoints.forEach(point => {
    output += `• ${point}\n`;
  });

  // Add sources
  if (includeCitations && sources && sources.length > 0) {
    output += `\n📚 Sources:\n`;
    sources.slice(0, 5).forEach(source => {
      output += `• ${source.title} - ${source.url}\n`;
    });
  }

  // Add engagement CTA
  output += `\n---\n\nWhat are your thoughts? Share in the comments below! 👇`;

  return output;
}

/**
 * Format content as email newsletter
 */
export function formatAsNewsletter(
  script: string,
  title?: string,
  sources?: ResearchSource[],
  options: FormatOptions = {}
): string {
  const { includeCitations = true } = options;

  let output = '';

  // Newsletter header
  if (title) {
    output += `Subject: ${title}\n\n`;
    output += `${title}\n${'='.repeat(title.length)}\n\n`;
  }

  // Add engaging intro
  output += `Hi there! 👋\n\n`;

  // Add content
  output += `${script}\n\n`;

  // Add sources box
  if (includeCitations && sources && sources.length > 0) {
    output += `---\n\n📖 READ MORE\n\n`;
    sources.forEach((source, idx) => {
      output += `${idx + 1}. ${source.title}\n   ${source.url}\n\n`;
    });
  }

  // Add footer
  output += `---\n\n`;
  output += `Thanks for reading! Reply to this email with your thoughts.\n\n`;
  output += `- Your Name`;

  return output;
}

/**
 * Extract key points from script for summaries
 */
function extractKeyPoints(script: string, maxPoints: number = 3): string[] {
  const sentences = script.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20);

  // Simple heuristic: find sentences with important keywords
  const importantKeywords = ['important', 'key', 'main', 'critical', 'essential', 'first', 'second', 'third'];

  const keyPoints = sentences
    .filter(sentence =>
      importantKeywords.some(keyword => sentence.toLowerCase().includes(keyword)) ||
      sentence.includes(':')
    )
    .slice(0, maxPoints);

  // If not enough key points found, just take first few sentences
  if (keyPoints.length < maxPoints) {
    return sentences.slice(0, maxPoints);
  }

  return keyPoints;
}

/**
 * Main export function that handles all formats
 */
export function exportContent(
  format: ExportFormat,
  script: string,
  title?: string,
  sources?: ResearchSource[],
  options: FormatOptions = {}
): string {
  switch (format) {
    case 'blog':
      return formatAsBlogPost(script, title, sources, options);
    case 'twitter':
      return formatAsTwitterThread(script, title, sources, options);
    case 'linkedin':
      return formatAsLinkedIn(script, title, sources, options);
    case 'newsletter':
      return formatAsNewsletter(script, title, sources, options);
    case 'youtube':
    default:
      return script; // Original format
  }
}

/**
 * Copy to clipboard helper
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Download as file helper
 */
export function downloadAsFile(content: string, filename: string, format: ExportFormat): void {
  const extension = format === 'blog' || format === 'newsletter' ? 'md' : 'txt';
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.${extension}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
