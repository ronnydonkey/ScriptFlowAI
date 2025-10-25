import { ResearchSource, ScriptOptions } from "@/lib/types";
import { formatSourcesWithNaturalCitations, getCitationInstructions } from "../citation-utils";

export function buildEducationalPrompt(
  topic: string,
  synthesis: string,
  sources: ResearchSource[],
  options: ScriptOptions
): string {
  const lengthGuide = getLengthGuide(options.length);
  const toneGuide = getToneGuide(options.tone);
  const citationInstructions = getCitationInstructions(options.includeCitations);
  const sourcesText = formatSourcesWithNaturalCitations(sources, options.includeCitations);

  return `You are an expert educational YouTube scriptwriter.

TOPIC: ${topic}

${synthesis}

${sourcesText}

EDUCATIONAL STRUCTURE:

1. FOUNDATION (0:00-${lengthGuide.foundation}):
   - Hook with why this topic matters
   - Define key terms and concepts
   - Establish prerequisite knowledge
   - Set learning objectives

2. CORE CONCEPTS (${lengthGuide.foundation}-${lengthGuide.core}):
   - Build from simple to complex
   - Explain each concept thoroughly
   - Use analogies and examples
   - [GRAPHICS] for diagrams and explanations

3. PRACTICAL APPLICATION (${lengthGuide.core}-${lengthGuide.application}):
   - Real-world examples
   - Case studies from research
   - Step-by-step walkthroughs
   - Common mistakes to avoid

4. ADVANCED INSIGHTS (${lengthGuide.application}-${lengthGuide.advanced}):
   - Deeper dive into nuances
   - Connect to broader context
   - Recent developments
   - Expert perspectives

5. SUMMARY & NEXT STEPS (${lengthGuide.advanced}-${lengthGuide.total}):
   - Key takeaways
   - Further learning resources
   - Practice suggestions
   - CTA

TARGET: ${lengthGuide.wordCount} words
TONE: ${toneGuide}
CITATIONS: ${citationInstructions}

TEACHING PRINCIPLES:
- Explain jargon before using it
- Use the "explain like I'm 5" then build complexity approach
- Repeat key concepts in different ways
- Check understanding with rhetorical questions
- Provide visual learning cues with [GRAPHICS] and [ANIMATION] suggestions

Generate the complete educational script now.`;
}

function getLengthGuide(length: string) {
  const guides = {
    short: { foundation: '1:00', core: '2:30', application: '3:30', advanced: '4:15', total: '5:00', wordCount: '750-800' },
    medium: { foundation: '2:00', core: '5:00', application: '7:00', advanced: '8:30', total: '10:00', wordCount: '1500-1600' },
    long: { foundation: '3:00', core: '9:00', application: '13:00', advanced: '16:00', total: '18:00', wordCount: '2700-3000' }
  };
  return guides[length as keyof typeof guides] || guides.medium;
}

function getToneGuide(tone: string): string {
  const guides = {
    casual: 'Friendly teacher explaining to students. Encourage questions and curiosity.',
    energetic: 'Enthusiastic educator making learning exciting. Passion for the subject shines through.',
    authoritative: 'Expert professor lecturing. Deep knowledge presented with academic rigor.',
    professional: 'Clear, methodical instruction. Accessible yet thorough.'
  };
  return guides[tone as keyof typeof guides] || guides.professional;
}
