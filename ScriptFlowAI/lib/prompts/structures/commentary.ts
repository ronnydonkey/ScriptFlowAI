import { ResearchSource, ScriptOptions } from "@/lib/types";
import { formatSourcesWithNaturalCitations, getCitationInstructions } from "../citation-utils";

export function buildCommentaryPrompt(
  topic: string,
  synthesis: string,
  sources: ResearchSource[],
  options: ScriptOptions
): string {
  const lengthGuide = getLengthGuide(options.length);
  const toneGuide = getToneGuide(options.tone);
  const citationInstructions = getCitationInstructions(options.includeCitations);
  const sourcesText = formatSourcesWithNaturalCitations(sources, options.includeCitations);

  return `You are an expert YouTube commentary/analysis scriptwriter.

TOPIC: ${topic}

${synthesis}

${sourcesText}

COMMENTARY STRUCTURE:

1. CONTEXT SETUP (0:00-${lengthGuide.context}):
   - What happened / what we're analyzing
   - Why it's significant
   - Hook with your unique angle

2. INITIAL ANALYSIS (${lengthGuide.context}-${lengthGuide.analysis}):
   - Your perspective on the topic
   - Break down the key elements
   - Research-backed observations
   - [B-ROLL] of relevant footage/images

3. DEEPER DIVE (${lengthGuide.analysis}-${lengthGuide.dive}):
   - Explore implications
   - Connect to broader trends/context
   - Present multiple viewpoints
   - Address counterarguments

4. COUNTERPOINTS & NUANCE (${lengthGuide.dive}-${lengthGuide.counter}):
   - "But here's what's interesting..."
   - Contradictions from research
   - Alternative interpretations
   - What others are missing

5. CONCLUSION & TAKEAWAY (${lengthGuide.counter}-${lengthGuide.total}):
   - Your final verdict
   - What this means going forward
   - Invite viewer discussion
   - Strong CTA

TARGET: ${lengthGuide.wordCount} words
TONE: ${toneGuide}
CITATIONS: ${citationInstructions}

COMMENTARY BEST PRACTICES:
- Have a clear point of view (but acknowledge other perspectives)
- Use "I think" / "In my opinion" appropriately
- Back opinions with research evidence
- Be intellectually honest about uncertainty
- Create dialogue with imagined counterarguments
- Use rhetorical questions to engage viewers

Generate the complete commentary script now.`;
}

function getLengthGuide(length: string) {
  const guides = {
    short: { context: '0:45', analysis: '2:00', dive: '3:00', counter: '4:00', total: '5:00', wordCount: '750-800' },
    medium: { context: '1:30', analysis: '4:00', dive: '6:30', counter: '8:30', total: '10:00', wordCount: '1500-1600' },
    long: { context: '2:30', analysis: '7:00', dive: '12:00', counter: '15:30', total: '18:00', wordCount: '2700-3000' }
  };
  return guides[length as keyof typeof guides] || guides.medium;
}

function getToneGuide(tone: string): string {
  const guides = {
    casual: 'Conversational analysis, like discussing with friends. Relatable and down-to-earth.',
    energetic: 'Passionate commentary with strong opinions. Animated and engaging delivery.',
    authoritative: 'Expert analysis with gravitas. Measured, well-reasoned, commanding respect.',
    professional: 'Balanced commentary. Professional insights with clear reasoning.'
  };
  return guides[tone as keyof typeof guides] || guides.professional;
}
