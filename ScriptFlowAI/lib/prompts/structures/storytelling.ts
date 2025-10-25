import { ResearchSource, ScriptOptions } from "@/lib/types";
import { formatSourcesWithNaturalCitations, getCitationInstructions } from "../citation-utils";

export function buildStorytellingPrompt(
  topic: string,
  synthesis: string,
  sources: ResearchSource[],
  options: ScriptOptions
): string {
  const lengthGuide = getLengthGuide(options.length);
  const toneGuide = getToneGuide(options.tone);
  const citationInstructions = options.includeCitations
    ? "Weave natural source citations into the narrative (e.g., 'According to...')."
    : "Weave information from research naturally without explicit citations.";

  const sourcesText = formatSourcesWithNaturalCitations(sources, options.includeCitations);

  return `You are an expert YouTube scriptwriter specializing in narrative storytelling format.

TOPIC: ${topic}

${synthesis}

${sourcesText}

STRUCTURE REQUIREMENTS:
Create a compelling narrative following the classic story arc:

1. SETUP (0:00-${lengthGuide.setup}):
   - Introduce the "characters" (could be people, companies, concepts, technologies)
   - Establish the world/context
   - Hook with intrigue - hint at the conflict to come
   - Make viewers emotionally invested

2. CONFLICT/INCITING INCIDENT (${lengthGuide.setup}-${lengthGuide.conflict}):
   - Introduce the central challenge or turning point
   - Raise the stakes
   - Show why this matters
   - Build tension

3. RISING ACTION (${lengthGuide.conflict}-${lengthGuide.climax}):
   - Show attempts to address the challenge
   - Include setbacks and breakthroughs
   - Deepen the narrative with research-backed details
   - Build toward the climax
   - [B-ROLL] suggestions for key story moments

4. CLIMAX (${lengthGuide.climax}-${lengthGuide.resolution}):
   - The turning point or revelation
   - Maximum tension/interest
   - The "aha!" moment

5. RESOLUTION (${lengthGuide.resolution}-${lengthGuide.total}):
   - Tie up narrative threads
   - Show the outcome/transformation
   - Extract broader lessons
   - Call to action

TARGET: ${lengthGuide.wordCount} words (~${lengthGuide.total} video)
TONE: ${toneGuide}
CITATIONS: ${citationInstructions}

STORYTELLING TECHNIQUES:
- Use vivid descriptions and sensory details
- Create emotional beats throughout
- Include dialogue or quotes where appropriate
- Use foreshadowing and callbacks
- Build suspense with pacing
- Make abstract concepts concrete through examples

ADDITIONAL REQUIREMENTS:
- Include [B-ROLL] and [GRAPHICS] suggestions for visual storytelling
- Mark emotional beats and pacing shifts
- End with SEO elements (3-5 title options emphasizing the narrative angle, 10-15 tags, 2-3 thumbnail concepts)

Generate the complete narrative script now.`;
}

function getLengthGuide(length: string) {
  switch (length) {
    case 'short':
      return {
        setup: '0:45',
        conflict: '1:30',
        climax: '3:30',
        resolution: '4:30',
        total: '5:00',
        wordCount: '750-800'
      };
    case 'long':
      return {
        setup: '2:00',
        conflict: '5:00',
        climax: '13:00',
        resolution: '16:00',
        total: '18:00',
        wordCount: '2700-3000'
      };
    default: // medium
      return {
        setup: '1:30',
        conflict: '3:00',
        climax: '7:00',
        resolution: '9:00',
        total: '10:00',
        wordCount: '1500-1600'
      };
  }
}

function getToneGuide(tone: string): string {
  switch (tone) {
    case 'casual':
      return 'Tell the story like you are sharing it with friends over coffee. Warm, relatable, personal.';
    case 'energetic':
      return 'Fast-paced and dynamic narration. Build excitement and momentum throughout the story.';
    case 'authoritative':
      return 'Commanding narrator voice. Documentary-style with gravitas and depth.';
    default: // professional
      return 'Polished storytelling with clear narration. Engaging but not overly casual.';
  }
}

