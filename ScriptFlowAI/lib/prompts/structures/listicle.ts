import { ResearchSource, ScriptOptions } from "@/lib/types";
import { formatSourcesWithNaturalCitations, getCitationInstructions } from "../citation-utils";

export function buildListiclePrompt(
  topic: string,
  synthesis: string,
  sources: ResearchSource[],
  options: ScriptOptions
): string {
  const lengthGuide = getLengthGuide(options.length);
  const toneGuide = getToneGuide(options.tone);
  const citationInstructions = getCitationInstructions(options.includeCitations);
  const sourcesText = formatSourcesWithNaturalCitations(sources, options.includeCitations);

  return `You are an expert YouTube scriptwriter specializing in engaging listicle videos.

TOPIC: ${topic}

${synthesis}

${sourcesText}

STRUCTURE REQUIREMENTS:
Create a countdown or numbered list format with ${lengthGuide.itemCount} items:

1. INTRO (0:00-0:30):
   - Hook with the most surprising/interesting item from your list
   - Tease what viewers will learn
   - Set up the list theme
   - Quick engagement prompt ("like and subscribe to not miss any")

2. THE LIST (0:30-${lengthGuide.listEnd}):
   Each item should include:
   - Clear title/number announcement
   - Why it matters
   - Supporting evidence from research
   - Examples or use cases
   - [B-ROLL] suggestions for visuals
   - Smooth transition to next item

   Structure each item:
   - Hook (why this item is interesting)
   - Explanation (what it is)
   - Evidence (research-backed support)
   - Example (make it concrete)
   - Transition (lead to next item)

3. HONORABLE MENTIONS (${lengthGuide.listEnd}-${lengthGuide.mentionsEnd}):
   - 2-3 quick bonus items that didn't make the main list
   - Fast-paced, 15-30 seconds each

4. RECAP & CTA (${lengthGuide.mentionsEnd}-${lengthGuide.total}):
   - Quick recap of top 3 items
   - Ask viewers their opinion ("Which was your favorite? Comment below!")
   - Strong call to action
   - Tease next video

TARGET: ${lengthGuide.wordCount} words (~${lengthGuide.total} video)
TONE: ${toneGuide}
CITATIONS: ${citationInstructions}

LISTICLE BEST PRACTICES:
- Number items clearly (counting down is often more engaging)
- Use power words in item titles
- Vary the pacing - some items can be quick, others more detailed
- Build anticipation for #1
- Include surprising/counterintuitive items
- Use pattern breaks to maintain attention

PACING:
- Intro: High energy to hook viewers
- Items 1-3: Establish rhythm
- Middle items: Maintain energy, prevent lulls
- Final items: Build excitement toward #1
- Recap: Energetic summary

ADDITIONAL REQUIREMENTS:
- Mark each numbered item clearly with "## ITEM #X: [Title]"
- Include [B-ROLL] suggestions for each item
- Suggest [GRAPHICS] for statistics or comparisons
- End with SEO elements (3-5 title options with numbers, 10-15 tags, 2-3 thumbnail concepts showing the number)

Generate the complete listicle script now.`;
}

function getLengthGuide(length: string) {
  switch (length) {
    case 'short':
      return {
        itemCount: 5,
        listEnd: '4:00',
        mentionsEnd: '4:30',
        total: '5:00',
        wordCount: '750-800',
        timePerItem: '~45 seconds'
      };
    case 'long':
      return {
        itemCount: 15,
        listEnd: '15:00',
        mentionsEnd: '17:00',
        total: '18:00',
        wordCount: '2700-3000',
        timePerItem: '~1 minute'
      };
    default: // medium
      return {
        itemCount: 10,
        listEnd: '8:30',
        mentionsEnd: '9:30',
        total: '10:00',
        wordCount: '1500-1600',
        timePerItem: '~50 seconds'
      };
  }
}

function getToneGuide(tone: string): string {
  switch (tone) {
    case 'casual':
      return 'Fun and conversational, like counting down with friends. React to each item naturally.';
    case 'energetic':
      return 'High-energy countdown! Build excitement with each item. Use enthusiastic language and exclamations.';
    case 'authoritative':
      return 'Expert curation. Present items with confidence and detailed knowledge. Documentary-style credibility.';
    default: // professional
      return 'Clear and engaging presentation. Well-researched but accessible. Maintain momentum throughout.';
  }
}

