import Anthropic from "@anthropic-ai/sdk"
import { NextRequest } from "next/server"
import { ResearchResult, ScriptOptions } from "@/lib/types"
import { buildScriptPrompt, buildRefinementPrompt } from "@/lib/prompts/script-prompts"
import { retryWithBackoff, getUserFriendlyErrorMessage } from "@/lib/utils/retry"

export const runtime = "edge"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('[Chat API] Request body keys:', Object.keys(body))

    const { message, researchContext, refinementContext, scriptOptions } = body as {
      message: string
      researchContext?: ResearchResult
      refinementContext?: {
        originalScript: string
        sources: ResearchResult
      }
      scriptOptions?: ScriptOptions
    }

    if (!message) {
      return new Response("Message is required", { status: 400 })
    }

    let userMessage: string
    let maxTokens = 4096

    // Build appropriate prompt based on context
    try {
      if (refinementContext) {
        console.log('[Chat API] Building refinement prompt')
        // Script refinement mode
        userMessage = buildRefinementPrompt(
          refinementContext.originalScript,
          message,
          refinementContext.sources.sources
        )
        maxTokens = 8192 // Longer output for full scripts
      } else if (researchContext) {
        console.log('[Chat API] Building script prompt with options:', scriptOptions)
        console.log('[Chat API] Research has', researchContext.sources?.length, 'sources')
        console.log('[Chat API] Source order verification:')
        researchContext.sources.forEach((source, idx) => {
          console.log(`  [${idx + 1}] ${source.title.substring(0, 50)}... (${source.url})`)
        })
        // Script generation from research mode
        userMessage = buildScriptPrompt(
          researchContext.query,
          researchContext.sources,
          scriptOptions
        )
        maxTokens = 8192 // Longer output for full scripts
      } else {
        console.log('[Chat API] Regular chat mode')
        // Regular chat mode
        userMessage = message
      }
    } catch (promptError: any) {
      console.error('[Chat API] Error building prompt:', promptError)
      throw new Error(`Failed to build prompt: ${promptError.message}`)
    }

    const stream = await retryWithBackoff(
      async () => {
        return await anthropic.messages.stream({
          model: "claude-sonnet-4-20250514",
          max_tokens: maxTokens,
          messages: [
            {
              role: "user",
              content: userMessage,
            },
          ],
          system: researchContext || refinementContext
            ? undefined // Let the prompt itself guide the behavior for script generation
            : `You are an expert YouTube research and scriptwriting assistant. Your job is to help content creators:

1. Research trending topics and video ideas
2. Analyze competitors and successful content strategies
3. Write engaging, well-structured YouTube scripts with:
   - Attention-grabbing hooks
   - Clear narrative flow
   - Strategic CTAs (calls to action)
   - Optimized pacing for viewer retention

4. Provide SEO guidance for titles, descriptions, and tags
5. Suggest visual elements and B-roll ideas

Be creative, data-driven, and always focus on maximizing viewer engagement and retention.`,
        })
      },
      {
        maxRetries: 3,
        baseDelay: 1000,
        onRetry: (attempt, error) => {
          console.log(`[Chat API] Retry attempt ${attempt}:`, error.message)
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
    console.error('[Chat API] Error in chat route:', error)
    console.error('[Chat API] Error stack:', error.stack)

    const userFriendlyMessage = getUserFriendlyErrorMessage(error)
    const detailedError = {
      error: userFriendlyMessage,
      details: error.message || 'Unknown error',
      stack: error.stack?.split('\n').slice(0, 3).join('\n') || 'No stack trace available'
    }

    return new Response(JSON.stringify(detailedError), {
      status: error.status || 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}
