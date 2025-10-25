"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScriptVersion, ScriptOptions, ResearchSource } from "@/lib/types"
import { REFINEMENT_SUGGESTIONS } from "@/lib/prompts/refinement-prompts"

interface ScriptDisplayProps {
  generatedScript: string
  isGeneratingScript: boolean
  scriptError: string
  refinementError: string
  refinementInput: string
  setRefinementInput: (value: string) => void
  isRefining: boolean
  scriptVersions: ScriptVersion[]
  currentVersionId: string
  showVersionHistory: boolean
  setShowVersionHistory: (value: boolean) => void
  showRefinement: boolean
  onRefineScript: (e: React.FormEvent) => void
  onRestoreVersion: (versionId: string) => void
  onApplySuggestion: (suggestion: typeof REFINEMENT_SUGGESTIONS[0]) => void
  onCopyScript: () => void
  onDownloadScript: () => void
  onExportMarkdown: () => void
  topic?: string
}

export function ScriptDisplay({
  generatedScript,
  isGeneratingScript,
  scriptError,
  refinementError,
  refinementInput,
  setRefinementInput,
  isRefining,
  scriptVersions,
  currentVersionId,
  showVersionHistory,
  setShowVersionHistory,
  showRefinement,
  onRefineScript,
  onRestoreVersion,
  onApplySuggestion,
  onCopyScript,
  onDownloadScript,
  onExportMarkdown,
  topic,
}: ScriptDisplayProps) {
  const calculateScriptMetadata = (script: string) => {
    const wordCount = script.trim().split(/\s+/).length
    const estimatedMinutes = Math.round(wordCount / 150)
    const citationMatches = script.match(/\[Source \d+\]/g)
    const citationCount = citationMatches ? new Set(citationMatches).size : 0

    return { wordCount, estimatedMinutes, citationCount }
  }

  if (isGeneratingScript && !generatedScript) {
    return (
      <div className="p-8 bg-blue-50 border-2 border-blue-200 rounded-lg flex flex-col items-center justify-center gap-4 min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-blue-600 font-medium text-lg">
          Generating your script from research sources...
        </p>
        <p className="text-blue-500 text-sm">This may take 30-60 seconds</p>
      </div>
    )
  }

  if (!generatedScript) {
    return (
      <div className="p-12 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-4 min-h-[400px]">
        <div className="text-center space-y-3">
          <h3 className="text-xl font-semibold text-gray-700">
            No Script Generated Yet
          </h3>
          <p className="text-gray-500 max-w-md">
            Research sources on the left, then click &quot;Generate Script from Research&quot; to create your YouTube script
          </p>
        </div>
      </div>
    )
  }

  const metadata = calculateScriptMetadata(generatedScript)

  return (
    <Card className="border-2 border-green-200 bg-green-50/30">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-2xl mb-2">Generated Script</CardTitle>
            {topic && (
              <p className="text-sm text-muted-foreground mb-2">
                Topic: <span className="font-medium">{topic}</span>
              </p>
            )}
            <CardDescription>
              <div className="flex flex-wrap gap-4 text-sm">
                <span>📝 {metadata.wordCount} words</span>
                <span>⏱️ ~{metadata.estimatedMinutes} min video</span>
                <span>🔗 {metadata.citationCount} sources cited</span>
              </div>
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={onCopyScript}
            >
              Copy Script
            </Button>
            <Button variant="outline" size="sm" onClick={onDownloadScript}>
              Download .txt
            </Button>
            <Button variant="outline" size="sm" onClick={onExportMarkdown}>
              Export .md
            </Button>
            {scriptVersions.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVersionHistory(!showVersionHistory)}
              >
                {showVersionHistory ? 'Hide' : 'Show'} Versions ({scriptVersions.length})
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Script Content */}
        <div className="p-6 bg-white border rounded-lg max-h-[500px] overflow-y-auto custom-scrollbar">
          <div className="prose prose-sm max-w-none whitespace-pre-wrap">
            {generatedScript}
          </div>
        </div>

        {/* Version History */}
        {showVersionHistory && scriptVersions.length > 1 && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-sm font-semibold mb-3">Version History</h3>
            <div className="space-y-2">
              {scriptVersions.map((version, idx) => (
                <div
                  key={version.id}
                  className={`p-3 rounded-md flex items-center justify-between ${
                    version.id === currentVersionId
                      ? 'bg-blue-100 border border-blue-300'
                      : 'bg-white border'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        Version {idx + 1}
                        {version.id === currentVersionId && (
                          <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded">Current</span>
                        )}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {version.changeDescription}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {version.timestamp.toLocaleString()}
                    </p>
                  </div>
                  {version.id !== currentVersionId && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRestoreVersion(version.id)}
                    >
                      Restore
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Messages */}
        {scriptError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">Error: {scriptError}</p>
          </div>
        )}

        {refinementError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">Refinement Error: {refinementError}</p>
          </div>
        )}

        {/* Refinement Section */}
        {showRefinement && (
          <div className="pt-4 border-t space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Refine Script</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Use the suggestions below or write your own refinement instruction
              </p>
            </div>

            {/* Suggestion Chips */}
            <div className="flex flex-wrap gap-2">
              {REFINEMENT_SUGGESTIONS.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => onApplySuggestion(suggestion)}
                  disabled={isRefining}
                  className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-full border border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {suggestion.label}
                </button>
              ))}
            </div>

            {/* Refinement Form */}
            <form onSubmit={onRefineScript} className="space-y-3">
              <Textarea
                placeholder="e.g., Make it more casual, Add more statistics, Shorten to 5 minutes..."
                value={refinementInput}
                onChange={(e) => setRefinementInput(e.target.value)}
                rows={3}
                disabled={isRefining}
              />
              <div className="flex gap-2">
                <Button
                  type="submit"
                  variant="default"
                  disabled={isRefining || !refinementInput.trim()}
                >
                  {isRefining ? "Refining..." : "Apply Refinement"}
                </Button>
                {isRefining && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
                    Refining script...
                  </div>
                )}
              </div>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
