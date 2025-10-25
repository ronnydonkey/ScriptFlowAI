import Exa from "exa-js";
import { ResearchResult, ResearchSource } from "@/lib/types";

// Initialize Exa client
const getExaClient = () => {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) {
    throw new Error("EXA_API_KEY is not configured");
  }
  return new Exa(apiKey);
};

/**
 * Research a topic using Exa API
 * @param topic - The topic to research
 * @returns ResearchResult with sources
 */
export async function research(topic: string): Promise<ResearchResult> {
  if (!topic || topic.trim().length === 0) {
    throw new Error("Topic cannot be empty");
  }

  const exa = getExaClient();

  try {
    // Set a timeout for the API call (30 seconds)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Research timeout after 30 seconds")), 30000)
    );

    const searchPromise = exa.searchAndContents(topic, {
      numResults: 10,
      useAutoprompt: true,
      type: "auto",
      highlights: true,
      summary: true,
      text: true,
    });

    const response = await Promise.race([searchPromise, timeoutPromise]) as Awaited<typeof searchPromise>;

    // Transform Exa results to our ResearchSource format
    const sources: ResearchSource[] = response.results.map((result, index) => ({
      id: `source-${Date.now()}-${index}`,
      title: result.title || "Untitled",
      url: result.url || "",
      publishedDate: result.publishedDate,
      author: result.author,
      summary: result.summary || result.text?.substring(0, 300) + "..." || "No summary available",
      text: result.text,
      score: result.score,
      highlights: result.highlights,
    }));

    return {
      query: topic,
      sources,
      timestamp: new Date(),
    };
  } catch (error: any) {
    // Handle specific error types
    if (error.message?.includes("timeout")) {
      throw new Error("Research request timed out. Please try again.");
    }

    if (error.response?.status === 429) {
      throw new Error("Rate limit exceeded. Please try again in a few moments.");
    }

    if (error.response?.status === 401) {
      throw new Error("Invalid Exa API key. Please check your configuration.");
    }

    // Re-throw with more context
    throw new Error(`Research failed: ${error.message || "Unknown error"}`);
  }
}
