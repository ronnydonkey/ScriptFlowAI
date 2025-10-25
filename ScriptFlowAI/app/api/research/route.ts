import { NextRequest, NextResponse } from "next/server";
import { research } from "@/lib/agents/research-agent";
import { retryWithBackoff, getUserFriendlyErrorMessage } from "@/lib/utils/retry";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic } = body;

    // Validate input
    if (!topic || typeof topic !== "string") {
      return NextResponse.json(
        { error: "Topic is required and must be a string" },
        { status: 400 }
      );
    }

    if (topic.trim().length === 0) {
      return NextResponse.json(
        { error: "Topic cannot be empty" },
        { status: 400 }
      );
    }

    if (topic.length > 1000) {
      return NextResponse.json(
        { error: "Topic is too long (max 1000 characters)" },
        { status: 400 }
      );
    }

    // Perform research with retry logic
    const result = await retryWithBackoff(
      async () => await research(topic),
      {
        maxRetries: 3,
        baseDelay: 1000,
        onRetry: (attempt, error) => {
          console.log(`[Research API] Retry attempt ${attempt}:`, error.message)
        }
      }
    );

    // Return results
    return NextResponse.json(result, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: any) {
    console.error("[Research API] Error:", error);
    console.error("[Research API] Error stack:", error.stack);

    // Handle specific error types
    if (error.message?.includes("not configured")) {
      return NextResponse.json(
        {
          error: "Exa API is not configured. Please add EXA_API_KEY to your environment.",
          suggestion: "Check your .env.local file and ensure EXA_API_KEY is set."
        },
        { status: 500 }
      );
    }

    if (error.message?.includes("Rate limit")) {
      return NextResponse.json(
        {
          error: error.message,
          suggestion: "Please wait a moment before trying again."
        },
        { status: 429 }
      );
    }

    if (error.message?.includes("Invalid Exa API key")) {
      return NextResponse.json(
        {
          error: error.message,
          suggestion: "Please check that your EXA_API_KEY is valid."
        },
        { status: 401 }
      );
    }

    // Generic error response with user-friendly message
    const userFriendlyMessage = getUserFriendlyErrorMessage(error);
    return NextResponse.json(
      {
        error: userFriendlyMessage,
        details: error.message || "Failed to perform research",
        suggestion: "Try rephrasing your topic or try again in a moment."
      },
      { status: error.status || 500 }
    );
  }
}
