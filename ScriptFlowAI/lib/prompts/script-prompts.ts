import { ResearchSource, ScriptOptions } from "@/lib/types";
import { synthesizeResearch, formatSynthesisForPrompt } from "@/lib/agents/research-synthesizer";
import { buildHookProblemSolutionPrompt } from "./structures/hook-problem-solution";
import { buildStorytellingPrompt } from "./structures/storytelling";
import { buildListiclePrompt } from "./structures/listicle";
import { buildEducationalPrompt } from "./structures/educational";
import { buildCommentaryPrompt } from "./structures/commentary";
import { buildNewsPrompt } from "./structures/news";

export function buildScriptPrompt(
  topic: string,
  sources: ResearchSource[],
  options?: ScriptOptions
): string {
  // Default options if not provided
  const scriptOptions: ScriptOptions = options || {
    structure: 'hook-problem-solution',
    tone: 'professional',
    length: 'medium',
    includeCitations: true,
  };

  // Synthesize research
  const synthesis = synthesizeResearch(sources);
  const synthesisText = formatSynthesisForPrompt(synthesis);

  // Route to appropriate structure builder
  switch (scriptOptions.structure) {
    case 'storytelling':
      return buildStorytellingPrompt(topic, synthesisText, sources, scriptOptions);

    case 'listicle':
      return buildListiclePrompt(topic, synthesisText, sources, scriptOptions);

    case 'educational-deep-dive':
      return buildEducationalPrompt(topic, synthesisText, sources, scriptOptions);

    case 'commentary-analysis':
      return buildCommentaryPrompt(topic, synthesisText, sources, scriptOptions);

    case 'news-breakdown':
      return buildNewsPrompt(topic, synthesisText, sources, scriptOptions);

    case 'hook-problem-solution':
    default:
      return buildHookProblemSolutionPrompt(topic, synthesisText, sources, scriptOptions);
  }
}

export function buildRefinementPrompt(
  originalScript: string,
  refinementInstruction: string,
  sources: ResearchSource[]
) {
  const sourcesText = sources
    .map((source, idx) => `[Source ${idx + 1}]: ${source.title} - ${source.url}`)
    .join("\n");

  return `You are refining a YouTube script based on user feedback.

ORIGINAL SCRIPT:
${originalScript}

AVAILABLE SOURCES:
${sourcesText}

USER'S REFINEMENT REQUEST:
${refinementInstruction}

INSTRUCTIONS:
- Modify the script according to the user's request
- Maintain the overall quality and structure
- Keep source citations intact where relevant
- If the request changes the focus, add new citations as needed
- Preserve the professional, engaging tone

Generate the refined script now.`;
}
