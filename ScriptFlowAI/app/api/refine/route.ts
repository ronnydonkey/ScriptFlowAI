import Anthropic from "@anthropic-ai/sdk"
import { NextRequest } from "next/server"
import { ResearchSource, ScriptOptions } from "@/lib/types"
import { buildRefinementPrompt } from "@/lib/prompts/refinement-prompts"
import { retryWithBackoff, getUserFriendlyErrorMessage } from "@/lib/utils/retry"

export const runtime = "edge"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('[Refine API] Request received')

    const { currentScript, refinementInstruction, sources, scriptOptions } = body as {
      currentScript: string
      refinementInstruction: string
      sources: ResearchSource[]
      scriptOptions?: ScriptOptions
    }

    // Validation
    if (!currentScript) {
      return new Response(JSON.stringify({ error: "Current script is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      })
    }

    if (!refinementInstruction || refinementInstruction.trim().length === 0) {
      return new Response(JSON.stringify({
        error: "Please provide a refinement instruction",
        suggestion: "Try something like: 'Make it shorter', 'Add more statistics', or 'Make the tone more casual'"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      })
    }

    if (!sources || sources.length === 0) {
      return new Response(JSON.stringify({
        error: "Research sources are required for refinement",
        suggestion: "Sources are needed to maintain citation accuracy"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      })
    }

    console.log('[Refine API] Building refinement prompt')
    console.log('[Refine API] Instruction:', refinementInstruction)
    console.log('[Refine API] Script length:', currentScript.length, 'characters')
    console.log('[Refine API] Sources:', sources.length)

    // Build refinement prompt
    const userMessage = buildRefinementPrompt(
      currentScript,
      refinementInstruction,
      sources,
      scriptOptions
    )

    // Create streaming response with retry logic
    const stream = await retryWithBackoff(
      async () => {
        return await anthropic.messages.stream({
          model: "claude-sonnet-4-20250514",
          max_tokens: 8192,
          messages: [
            {
              role: "user",
              content: userMessage,
            },
          ],
        })
      },
      {
        maxRetries: 3,
        baseDelay: 1000,
        onRetry: (attempt, error) => {
          console.log(`[Refine API] Retry attempt ${attempt}:`, error.message)
        }
      }
    )

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              const text = chunk.delta.text
              controller.enqueue(encoder.encode(text))
            }
          }
          controller.close()
        } catch (error) {
          console.error('[Refine API] Streaming error:', error)
          controller.error(error)
        }
      },
    })

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error: any) {
    console.error('[Refine API] Error:', error)
    console.error('[Refine API] Error stack:', error.stack)

    const userFriendlyMessage = getUserFriendlyErrorMessage(error)
    const errorResponse = {
      error: userFriendlyMessage,
      details: error.message || "Unknown error",
      suggestion: getSuggestionForError(error)
    }

    return new Response(JSON.stringify(errorResponse), {
      status: error.status || 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}

/**
 * Get actionable suggestions based on error type
 */
function getSuggestionForError(error: any): string {
  if (error.message?.includes('token') || error.message?.includes('context length')) {
    return 'Try making your refinement instruction more specific, or clear the version history to reduce context size.'
  }

  if (error.status === 429) {
    return 'Please wait a moment before trying again. The service is experiencing high demand.'
  }

  if (error.status >= 500) {
    return 'This is a temporary server issue. Please try again in a moment.'
  }

  if (error.message?.includes('network')) {
    return 'Please check your internet connection and try again.'
  }

  return 'Please try again. If the problem persists, try simplifying your request.'
}
