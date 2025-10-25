import { ResearchSource, ScriptOptions } from "@/lib/types";
import { formatSourcesWithNaturalCitations } from "./citation-utils";

/**
 * Build a refinement prompt for iterative script improvement
 */
export function buildRefinementPrompt(
  currentScript: string,
  refinementInstruction: string,
  sources: ResearchSource[],
  options?: ScriptOptions
): string {
  const sourcesText = formatSourcesWithNaturalCitations(sources, options?.includeCitations ?? true);

  return `You are refining a YouTube script based on user feedback.

CURRENT SCRIPT:
${currentScript}

USER'S REFINEMENT REQUEST:
${refinementInstruction}

${sourcesText}

IMPORTANT INSTRUCTIONS:
- Make ONLY the changes requested by the user
- Preserve the overall structure and quality unless specifically asked to change them
- Maintain all existing citations and add new ones if adding content
- Keep the same tone unless specifically asked to change it
- If adding new information, cite the relevant source using natural language (e.g., "According to TechCrunch, ...")
- If shortening, remove less critical content first and preserve key points
- If the user asks to "add more statistics" or "add more data", find relevant numbers from the research sources and cite them
- If the user asks to change tone, adjust language style while keeping facts and citations intact
- Output the COMPLETE refined script, not just the changes

REFINEMENT BEST PRACTICES:
- Be surgical: Only modify what's needed to address the feedback
- Maintain flow: Ensure transitions still work after changes
- Preserve citations: Don't lose existing source attributions
- Stay consistent: Match the style and quality of the original script
- Be complete: Return the full refined script, ready to use

Generate the complete refined script now.`;
}

/**
 * Build a prompt for multi-turn refinement with conversation context
 */
export function buildMultiTurnRefinementPrompt(
  currentScript: string,
  refinementHistory: Array<{ instruction: string; result: string }>,
  newInstruction: string,
  sources: ResearchSource[],
  options?: ScriptOptions
): string {
  const sourcesText = formatSourcesWithNaturalCitations(sources, options?.includeCitations ?? true);

  const historyText = refinementHistory.length > 0
    ? `PREVIOUS REFINEMENTS:
${refinementHistory.map((ref, idx) => `
Refinement ${idx + 1}: "${ref.instruction}"
`).join('\n')}

This context shows what changes have been made so far. Build on these refinements.
`
    : '';

  return `You are continuing to refine a YouTube script based on iterative user feedback.

CURRENT SCRIPT STATE:
${currentScript}

${historyText}

NEW REFINEMENT REQUEST:
${newInstruction}

${sourcesText}

IMPORTANT INSTRUCTIONS:
- This is refinement #${refinementHistory.length + 1} in an ongoing conversation
- Apply the new instruction while preserving all previous improvements
- Don't undo previous refinements unless the new instruction explicitly asks to
- Maintain all existing citations and structure
- Output the COMPLETE refined script incorporating all changes

Generate the complete refined script now.`;
}

/**
 * Common refinement suggestion templates
 */
export const REFINEMENT_SUGGESTIONS = [
  {
    label: "Make it shorter",
    instruction: "Shorten this script to fit a shorter video format. Remove less critical points while keeping the core message and all important citations."
  },
  {
    label: "Add more statistics",
    instruction: "Add more data points and statistics from the research sources. Cite each statistic with natural language citations (e.g., 'According to [Source], ...')."
  },
  {
    label: "More casual tone",
    instruction: "Make the tone more casual and conversational. Use simpler language, contractions, and a friendlier voice while keeping all facts and citations."
  },
  {
    label: "More professional tone",
    instruction: "Make the tone more professional and authoritative. Use formal language and stronger, more confident phrasing while keeping all facts and citations."
  },
  {
    label: "Strengthen the hook",
    instruction: "Make the opening hook more dramatic and attention-grabbing. Use a stronger opening statement, surprising fact, or compelling question to hook viewers immediately."
  },
  {
    label: "Add B-roll suggestions",
    instruction: "Add more [B-ROLL] and [GRAPHICS] suggestions throughout the script to guide the video editor on what visuals to include."
  },
  {
    label: "More energetic",
    instruction: "Increase the energy and enthusiasm in the script. Use more exclamation points, power words, and exciting language while maintaining professionalism."
  },
  {
    label: "Add more examples",
    instruction: "Add more concrete examples and use cases from the research sources to make abstract concepts more relatable and understandable."
  },
  {
    label: "Improve transitions",
    instruction: "Smooth out the transitions between sections. Add better connecting phrases and logical flow between different parts of the script."
  },
  {
    label: "Stronger CTA",
    instruction: "Strengthen the call-to-action at the end. Make it more compelling and give viewers a clear, specific action to take."
  }
];
