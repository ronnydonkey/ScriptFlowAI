import { ResearchSource, ScriptOptions } from "@/lib/types";
import { formatSourcesWithNaturalCitations, getCitationInstructions } from "../citation-utils";

export function buildNewsPrompt(
  topic: string,
  synthesis: string,
  sources: ResearchSource[],
  options: ScriptOptions
): string {
  const lengthGuide = getLengthGuide(options.length);
  const toneGuide = getToneGuide(options.tone);
  const citationInstructions = getCitationInstructions(options.includeCitations);
  const sourcesText = formatSourcesWithNaturalCitations(sources, options.includeCitations);

  return `You are an expert YouTube news breakdown scriptwriter.

TOPIC: ${topic}

${synthesis}

${sourcesText}

NEWS BREAKDOWN STRUCTURE:

1. THE HEADLINE (0:00-0:20):
   - Lead with the most important fact
   - "Here's what happened..."
   - Immediate context

2. WHAT HAPPENED (0:20-${lengthGuide.what}):
   - Chronological breakdown of events
   - Key facts and figures
   - Who, what, when, where
   - [B-ROLL] of news footage/images
   - Timeline graphics if complex

3. WHY IT MATTERS (${lengthGuide.what}-${lengthGuide.why}):
   - Impact analysis
   - Who is affected
   - Broader significance
   - Connect to viewer's life

4. CONTEXT & BACKGROUND (${lengthGuide.why}-${lengthGuide.context}):
   - Historical context
   - "This isn't the first time..."
   - Related events/trends
   - Expert perspectives from sources

5. IMPLICATIONS & WHAT'S NEXT (${lengthGuide.context}-${lengthGuide.next}):
   - What could happen next
   - Different scenarios
   - What experts are saying
   - Ongoing developments to watch

6. WRAP-UP (${lengthGuide.next}-${lengthGuide.total}):
   - Summary of key points
   - Final context
   - How to stay informed
   - CTA

TARGET: ${lengthGuide.wordCount} words
TONE: ${toneGuide}
CITATIONS: ${citationInstructions}

NEWS BEST PRACTICES:
- Lead with facts, not opinion
- Separate facts from analysis
- Present multiple perspectives
- Acknowledge what's unknown/unclear
- Use precise language
- Include latest updates
- Fact-check and verify information
- Attribute claims appropriately

PACING:
- Urgent but not sensational
- Clear and direct
- Build understanding progressively
- Maintain viewer trust with accuracy

Generate the complete news breakdown script now.`;
}

function getLengthGuide(length: string) {
  const guides = {
    short: { what: '1:30', why: '2:30', context: '3:30', next: '4:30', total: '5:00', wordCount: '750-800' },
    medium: { what: '3:00', why: '5:00', context: '7:00', next: '9:00', total: '10:00', wordCount: '1500-1600' },
    long: { what: '5:00', why: '9:00', context: '13:00', next: '16:00', total: '18:00', wordCount: '2700-3000' }
  };
  return guides[length as keyof typeof guides] || guides.medium;
}

function getToneGuide(tone: string): string {
  const guides = {
    casual: 'Accessible news explainer. Break down complex news into understandable pieces.',
    energetic: 'Breaking news energy! Urgent but informative. Keep viewers engaged.',
    authoritative: 'Serious journalism. Credible, thorough, unbiased reporting.',
    professional: 'Standard news delivery. Clear, factual, balanced.'
  };
  return guides[tone as keyof typeof guides] || guides.professional;
}
