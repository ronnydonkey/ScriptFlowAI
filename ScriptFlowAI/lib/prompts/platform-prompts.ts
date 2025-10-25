import { ResearchSource } from '@/lib/types';

export interface PlatformPrompt {
  systemPrompt: string;
  getUserPrompt: (topic: string, sources: ResearchSource[], youtubeScript: string) => string;
}

export const PLATFORM_PROMPTS: Record<string, PlatformPrompt> = {
  blog: {
    systemPrompt: `You are an expert blog writer who creates engaging, well-researched articles for Medium and Substack. Your writing is:
- Clear and accessible to general audiences
- Well-structured with headers and sections
- Evidence-based with proper citations
- Engaging with a conversational yet authoritative tone
- SEO-friendly with natural keyword usage`,

    getUserPrompt: (topic, sources, youtubeScript) => `
Create a comprehensive blog post about: ${topic}

RESEARCH SOURCES:
${sources.map((s, i) => `[${i + 1}] ${s.title}\n${s.url}\n${s.summary || s.text?.substring(0, 200)}`).join('\n\n')}

REFERENCE SCRIPT (for content ideas - DO NOT copy verbatim):
${youtubeScript.substring(0, 1000)}...

REQUIREMENTS:
1. Write a 800-1200 word blog post optimized for Medium/Substack
2. Start with a compelling hook
3. Use clear headers (##) to organize sections
4. Include specific facts and examples from the research sources
5. Add inline citations like [Source 1] when referencing specific claims
6. End with key takeaways and a thought-provoking conclusion
7. Use markdown formatting (bold, italics, lists)
8. DO NOT include video timestamps or "in this video" language
9. Write in first person ("I'll explain...") for relatability

BLOG POST:`,
  },

  twitter: {
    systemPrompt: `You are a Twitter thread expert who understands what makes content go viral. You know:

CRITICAL RULES:
- Each tweet MUST be under 280 characters (including numbers like "1/")
- Twitter doesn't support markdown - use plain text only
- Line breaks are your formatting tool
- Hooks must create curiosity
- Every tweet should be valuable standalone
- No video references, timestamps, or YouTube language
- No "in this video" or similar phrases

TWITTER CULTURE:
- Start with pattern interrupt (surprising stat, bold claim, question)
- Use conversational, direct language
- Strategic emojis (1-2 per tweet max)
- White space matters - break lines for emphasis
- End with engagement (question, call to reflect)

STRUCTURE:
- Tweet 1: Hook (make them NEED to read more)
- Tweets 2-10: One insight per tweet, punchy and clear
- Final tweet: Memorable takeaway + question`,

    getUserPrompt: (topic, sources, youtubeScript) => `
Create a Twitter thread from this research about: ${topic}

RESEARCH INSIGHTS:
${sources.slice(0, 5).map((s, i) => `${i + 1}. ${s.title}\nKey point: ${s.summary?.substring(0, 150) || s.text?.substring(0, 150)}`).join('\n\n')}

CONTENT TO ADAPT (DO NOT copy word-for-word, extract key insights):
${youtubeScript.substring(0, 1200)}

YOUR TASK:
Create an 8-12 tweet thread that:

1. HOOK TWEET (Tweet 1):
   - Start with surprising fact, bold claim, or provocative question
   - Include "🧵 Thread:" or similar
   - Under 240 characters
   - Make it IMPOSSIBLE to scroll past

2. BODY TWEETS (2-10):
   - Number each: "1/", "2/", etc.
   - ONE clear insight per tweet
   - Each under 270 characters (leave room for numbers)
   - Use line breaks for emphasis
   - NO markdown (**, ##, etc)
   - Add 1 relevant emoji if it adds value
   - Make each tweet valuable even if read alone

3. CLOSING TWEET:
   - Memorable summary or key takeaway
   - End with engaging question
   - Encourage replies

ANTI-PATTERNS (DO NOT DO):
❌ "In this video..."
❌ "At 3:45 I explain..."
❌ Markdown formatting (*bold*, [links])
❌ Tweets over 280 characters
❌ Hashtags in body (save for final tweet if needed)
❌ Copy-pasting YouTube script language
❌ B-roll cues or production notes

VALIDATION:
- Count characters in each tweet (including "1/")
- Every tweet under 280? ✓
- No markdown? ✓
- No video references? ✓
- Each tweet standalone valuable? ✓

OUTPUT FORMAT:
🧵 [Your compelling hook]

Thread: 👇

---

1/ [First key insight]

[Supporting detail or example]

---

2/ [Second insight]

[Why it matters]

---

[Continue for 8-12 tweets total]

---

[Final tweet with takeaway and question]

What's your experience with [topic]?

TWITTER THREAD:`,
  },
};

export function getPlatformPrompt(platform: string): PlatformPrompt {
  return PLATFORM_PROMPTS[platform] || PLATFORM_PROMPTS.blog;
}
