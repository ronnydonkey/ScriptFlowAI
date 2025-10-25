import { ResearchSource, ScriptOptions } from "@/lib/types";
import { formatSourcesWithNaturalCitations, getCitationInstructions } from "../citation-utils";

export function buildHookProblemSolutionPrompt(
  topic: string,
  synthesis: string,
  sources: ResearchSource[],
  options: ScriptOptions
): string {
  const lengthGuide = getLengthGuide(options.length);
  const toneGuide = getToneGuide(options.tone);
  const citationInstructions = getCitationInstructions(options.includeCitations);
  const sourcesText = formatSourcesWithNaturalCitations(sources, options.includeCitations);

  return `You are an expert YouTube scriptwriter specializing in the Hook-Problem-Solution format.

TOPIC: ${topic}

${synthesis}

${sourcesText}

STRUCTURE REQUIREMENTS:
This script must follow the Hook-Problem-Solution format strictly:

1. HOOK (0:00-0:15):
   - Grab attention immediately with a shocking statistic, compelling question, or bold claim
   - Make viewers want to keep watching
   - No intro fluff - dive straight into impact

2. PROBLEM DEFINITION (0:15-${lengthGuide.problemEnd}):
   - Clearly define the problem or challenge
   - Make viewers feel it's relevant to them personally
   - Use research data to establish the scale/importance
   - Create emotional connection

3. SOLUTION PRESENTATION (${lengthGuide.problemEnd}-${lengthGuide.solutionEnd}):
   - Present the solution with evidence from research
   - Break down into clear, actionable steps or components
   - Include examples and use cases
   - Address potential objections
   - [B-ROLL] suggestions for visual demonstration

4. CALL TO ACTION (${lengthGuide.solutionEnd}-${lengthGuide.total}):
   - Summarize key takeaways
   - Clear next steps for viewers
   - Engagement request (like, subscribe, comment)

TARGET: ${lengthGuide.wordCount} words (~${lengthGuide.total} video)
TONE: ${toneGuide}
CITATIONS: ${citationInstructions}

ADDITIONAL REQUIREMENTS:
- Include [B-ROLL] suggestions for key visual moments
- Add strategic pauses and emphasis points
- Include viewer engagement prompts throughout
- End with SEO elements (3-5 title options, 10-15 tags, 2-3 thumbnail concepts)

Generate the complete script now, following this structure precisely.`;
}

function getLengthGuide(length: string) {
  switch (length) {
    case 'short':
      return {
        problemEnd: '1:30',
        solutionEnd: '4:00',
        total: '5:00',
        wordCount: '750-800'
      };
    case 'long':
      return {
        problemEnd: '3:00',
        solutionEnd: '14:00',
        total: '18:00',
        wordCount: '2700-3000'
      };
    default: // medium
      return {
        problemEnd: '2:00',
        solutionEnd: '7:00',
        total: '10:00',
        wordCount: '1500-1600'
      };
  }
}

function getToneGuide(tone: string): string {
  switch (tone) {
    case 'casual':
      return 'Conversational and friendly, like talking to a friend. Use contractions, personal anecdotes, and casual language.';
    case 'energetic':
      return 'High-energy and enthusiastic. Use exclamation points, short punchy sentences, and motivational language.';
    case 'authoritative':
      return 'Expert and confident. Use data-driven language, precise terminology, and commanding presence.';
    default: // professional
      return 'Professional yet approachable. Clear, articulate, and well-structured without being overly formal.';
  }
}
