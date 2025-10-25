"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResearchResult, ScriptStructure, ScriptTone, VideoLength, ScriptOptions, ScriptVersion } from "@/lib/types"
import { REFINEMENT_SUGGESTIONS } from "@/lib/prompts/refinement-prompts"
import { ResearchSidebar } from "@/components/ResearchSidebar"
import { ScriptDisplay } from "@/components/ScriptDisplay"

type Mode = "chat" | "research"
type MobileView = "sources" | "script"

export default function Home() {
  const [mode, setMode] = useState<Mode>("research")

  // Chat state
  const [message, setMessage] = useState("")
  const [response, setResponse] = useState("")
  const [isChatLoading, setIsChatLoading] = useState(false)
  const [chatError, setChatError] = useState("")

  // Research state
  const [topic, setTopic] = useState("")
  const [researchResult, setResearchResult] = useState<ResearchResult | null>(null)
  const [isResearching, setIsResearching] = useState(false)
  const [researchError, setResearchError] = useState("")

  // Script generation state
  const [generatedScript, setGeneratedScript] = useState("")
  const [isGeneratingScript, setIsGeneratingScript] = useState(false)
  const [scriptError, setScriptError] = useState("")

  // Script options state
  const [scriptStructure, setScriptStructure] = useState<ScriptStructure>('hook-problem-solution')
  const [scriptTone, setScriptTone] = useState<ScriptTone>('professional')
  const [videoLength, setVideoLength] = useState<VideoLength>('medium')
  const [includeCitations, setIncludeCitations] = useState(true)
  const [showScriptOptions, setShowScriptOptions] = useState(false)

  // Refinement state
  const [refinementInput, setRefinementInput] = useState("")
  const [isRefining, setIsRefining] = useState(false)
  const [showRefinement, setShowRefinement] = useState(false)
  const [refinementError, setRefinementError] = useState("")

  // Version control state
  const [scriptVersions, setScriptVersions] = useState<ScriptVersion[]>([])
  const [currentVersionId, setCurrentVersionId] = useState<string>("")
  const [showVersionHistory, setShowVersionHistory] = useState(false)

  // Layout state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [mobileView, setMobileView] = useState<MobileView>("sources")

  // Check for URL parameters on mount (e.g., from trends page)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const topicParam = urlParams.get('topic')
    if (topicParam) {
      setTopic(decodeURIComponent(topicParam))
      // Clear the URL parameter to keep URL clean
      window.history.replaceState({}, '', '/')
    }
  }, [])

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    setIsChatLoading(true)
    setChatError("")
    setResponse("")

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText || "Failed to fetch")
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error("No reader available")
      }

      let accumulatedResponse = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        accumulatedResponse += chunk
        setResponse(accumulatedResponse)
      }
    } catch (err: any) {
      setChatError(err.message || "An error occurred")
    } finally {
      setIsChatLoading(false)
    }
  }

  const handleResearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) return

    setIsResearching(true)
    setResearchError("")
    setResearchResult(null)
    setGeneratedScript("")
    setScriptError("")
    setShowRefinement(false)

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to research topic")
      }

      const result: ResearchResult = await res.json()
      setResearchResult(result)
    } catch (err: any) {
      setResearchError(err.message || "An error occurred")
    } finally {
      setIsResearching(false)
    }
  }

  const handleGenerateScript = async () => {
    if (!researchResult) return

    setIsGeneratingScript(true)
    setScriptError("")
    setGeneratedScript("")
    setShowRefinement(false)

    const scriptOptions: ScriptOptions = {
      structure: scriptStructure,
      tone: scriptTone,
      length: videoLength,
      includeCitations,
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "generate script",
          researchContext: researchResult,
          scriptOptions,
        }),
      })

      if (!res.ok) {
        const errorText = await res.text()
        throw new Error(errorText || "Failed to generate script")
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error("No reader available")
      }

      let accumulatedScript = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        accumulatedScript += chunk
        setGeneratedScript(accumulatedScript)
      }

      // Create initial version
      const initialVersion: ScriptVersion = {
        id: crypto.randomUUID(),
        content: accumulatedScript,
        timestamp: new Date(),
        changeDescription: "Initial script generation"
      }
      setScriptVersions([initialVersion])
      setCurrentVersionId(initialVersion.id)
      setShowRefinement(true)
    } catch (err: any) {
      setScriptError(err.message || "An error occurred")
    } finally {
      setIsGeneratingScript(false)
    }
  }

  const handleRefineScript = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!refinementInput.trim() || !researchResult || !generatedScript) return

    setIsRefining(true)
    setRefinementError("")

    const scriptOptions: ScriptOptions = {
      structure: scriptStructure,
      tone: scriptTone,
      length: videoLength,
      includeCitations,
    }

    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentScript: generatedScript,
          refinementInstruction: refinementInput,
          sources: researchResult.sources,
          scriptOptions,
        }),
      })

      if (!res.ok) {
        const errorText = await res.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText }
        }
        throw new Error(errorData.error || "Failed to refine script")
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error("No reader available")
      }

      let accumulatedScript = ""
      setGeneratedScript("") // Clear old script while streaming new one

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        accumulatedScript += chunk
        setGeneratedScript(accumulatedScript)
      }

      // Create new version
      const newVersion: ScriptVersion = {
        id: crypto.randomUUID(),
        content: accumulatedScript,
        timestamp: new Date(),
        changeDescription: refinementInput
      }

      // Add to versions (keep max 10)
      setScriptVersions(prev => {
        const updated = [...prev, newVersion]
        return updated.length > 10 ? updated.slice(-10) : updated
      })
      setCurrentVersionId(newVersion.id)
      setRefinementInput("")
    } catch (err: any) {
      setRefinementError(err.message || "An error occurred")
    } finally {
      setIsRefining(false)
    }
  }

  const handleChatClear = () => {
    setMessage("")
    setResponse("")
    setChatError("")
  }

  const handleResearchClear = () => {
    setTopic("")
    setResearchResult(null)
    setResearchError("")
    setGeneratedScript("")
    setScriptError("")
    setRefinementError("")
    setShowRefinement(false)
    setScriptVersions([])
    setCurrentVersionId("")
  }

  const downloadScript = () => {
    if (!generatedScript) return

    const blob = new Blob([generatedScript], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `youtube-script-${researchResult?.query.replace(/\s+/g, "-")}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Version control functions
  const restoreVersion = (versionId: string) => {
    const version = scriptVersions.find(v => v.id === versionId)
    if (version) {
      setGeneratedScript(version.content)
      setCurrentVersionId(version.id)
    }
  }

  const applySuggestion = (suggestion: typeof REFINEMENT_SUGGESTIONS[0]) => {
    setRefinementInput(suggestion.instruction)
  }

  // Enhanced export functions
  const exportAsMarkdown = () => {
    if (!generatedScript || !researchResult) return

    const currentVersion = scriptVersions.find(v => v.id === currentVersionId)
    const metadata = `# YouTube Script: ${researchResult.query}

**Generated:** ${new Date().toLocaleDateString()}
**Structure:** ${scriptStructure}
**Tone:** ${scriptTone}
**Length:** ${videoLength}
${currentVersion ? `**Version:** ${scriptVersions.indexOf(currentVersion) + 1} - ${currentVersion.changeDescription}` : ''}

## Research Sources

${researchResult.sources.map((s, idx) => `${idx + 1}. [${s.title}](${s.url})`).join('\n')}

---

## Script

${generatedScript}
`

    const blob = new Blob([metadata], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `youtube-script-${researchResult.query.replace(/\s+/g, "-")}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyScriptToClipboard = async () => {
    if (!generatedScript) return
    try {
      await navigator.clipboard.writeText(generatedScript)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const getStructureDescription = (structure: ScriptStructure): string => {
    const descriptions = {
      'hook-problem-solution': 'Start with a hook, define the problem, present the solution',
      'storytelling': 'Narrative arc with setup, conflict, climax, and resolution',
      'listicle': 'Numbered list format (Top 5, Top 10, etc.)',
      'educational-deep-dive': 'Progressive learning from basics to advanced concepts',
      'commentary-analysis': 'Analysis and commentary on a topic or event',
      'news-breakdown': 'Breaking down recent news or developments'
    };
    return descriptions[structure];
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            YouTube Research & Scriptwriting AI
          </h1>
          <p className="text-muted-foreground">
            Powered by Claude Sonnet 4.5 & Exa
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="flex justify-center gap-2">
          <Button
            variant={mode === "research" ? "default" : "outline"}
            onClick={() => setMode("research")}
          >
            Research & Script
          </Button>
          <Button
            variant={mode === "chat" ? "default" : "outline"}
            onClick={() => setMode("chat")}
          >
            Chat with Claude
          </Button>
        </div>

        {/* Research Mode */}
        {mode === "research" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Research a Topic</CardTitle>
                <CardDescription>
                  Enter a YouTube topic to research. We&apos;ll find the most relevant sources to help you create well-informed content.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleResearchSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="topic" className="text-sm font-medium">
                      Topic
                    </label>
                    <Textarea
                      id="topic"
                      placeholder="e.g., AI automation for small businesses, quantum computing applications, latest developments in renewable energy..."
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      rows={3}
                      disabled={isResearching}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isResearching || !topic.trim()}>
                      {isResearching ? "Researching..." : "Research Topic"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleResearchClear}
                      disabled={isResearching}
                    >
                      Clear All
                    </Button>
                  </div>
                </form>

                {researchError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">Error: {researchError}</p>
                  </div>
                )}

                {isResearching && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-md flex items-center gap-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                    <p className="text-sm text-blue-600">Researching sources...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Script Options */}
            {researchResult && !isResearching && !generatedScript && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Script Options</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowScriptOptions(!showScriptOptions)}
                    >
                      {showScriptOptions ? "Hide Options" : "Show Options"}
                    </Button>
                  </div>
                  <CardDescription>
                    Customize your script structure, tone, and length
                  </CardDescription>
                </CardHeader>
                {showScriptOptions && (
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Structure</label>
                        <select
                          className="w-full p-2 border rounded-md bg-white"
                          value={scriptStructure}
                          onChange={(e) => setScriptStructure(e.target.value as ScriptStructure)}
                        >
                          <option value="hook-problem-solution">Hook → Problem → Solution</option>
                          <option value="storytelling">Storytelling (Narrative Arc)</option>
                          <option value="listicle">Listicle (Top X List)</option>
                          <option value="educational-deep-dive">Educational Deep Dive</option>
                          <option value="commentary-analysis">Commentary & Analysis</option>
                          <option value="news-breakdown">News Breakdown</option>
                        </select>
                        <p className="text-xs text-muted-foreground">
                          {getStructureDescription(scriptStructure)}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Tone</label>
                        <select
                          className="w-full p-2 border rounded-md bg-white"
                          value={scriptTone}
                          onChange={(e) => setScriptTone(e.target.value as ScriptTone)}
                        >
                          <option value="professional">Professional</option>
                          <option value="casual">Casual & Friendly</option>
                          <option value="energetic">Energetic & Enthusiastic</option>
                          <option value="authoritative">Authoritative & Expert</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Video Length</label>
                        <select
                          className="w-full p-2 border rounded-md bg-white"
                          value={videoLength}
                          onChange={(e) => setVideoLength(e.target.value as VideoLength)}
                        >
                          <option value="short">Short (3-5 min)</option>
                          <option value="medium">Medium (8-10 min)</option>
                          <option value="long">Long (15-20 min)</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Citations</label>
                        <div className="flex items-center gap-2 p-2">
                          <input
                            type="checkbox"
                            checked={includeCitations}
                            onChange={(e) => setIncludeCitations(e.target.checked)}
                            className="h-4 w-4"
                          />
                          <span className="text-sm">Include source citations in script</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            )}

            {/* Two-Column Layout (Desktop) / Tab Layout (Mobile) */}
            {researchResult && !isResearching && (
              <>
                {/* Mobile Tabs */}
                <div className="md:hidden space-y-4">
                  {/* Tab Navigation */}
                  <div className="flex gap-2 border-b pb-2">
                    <button
                      onClick={() => setMobileView("sources")}
                      className={`flex-1 px-4 py-2 rounded-t-lg font-medium transition-colors ${
                        mobileView === "sources"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Sources ({researchResult.sources.length})
                    </button>
                    <button
                      onClick={() => setMobileView("script")}
                      className={`flex-1 px-4 py-2 rounded-t-lg font-medium transition-colors ${
                        mobileView === "script"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Script
                    </button>
                  </div>

                  {/* Generate Script Button (Mobile) */}
                  {!generatedScript && (
                    <Button
                      variant="default"
                      size="lg"
                      onClick={handleGenerateScript}
                      disabled={isGeneratingScript || researchResult.sources.length === 0}
                      className="w-full"
                    >
                      {isGeneratingScript ? "Generating Script..." : "Generate Script from Research"}
                    </Button>
                  )}

                  {/* Mobile Content */}
                  {mobileView === "sources" ? (
                    <div className="space-y-3">
                      {researchResult.sources.length === 0 ? (
                        <Card>
                          <CardContent className="p-8 text-center">
                            <p className="text-muted-foreground">
                              No sources found. Try rephrasing your topic.
                            </p>
                          </CardContent>
                        </Card>
                      ) : (
                        researchResult.sources.map((source, sourceIndex) => (
                          <Card key={source.id} className="text-sm">
                            <CardHeader className="p-4 pb-2">
                              <div className="mb-2">
                                <span className="inline-block px-2 py-0.5 bg-blue-600 text-white text-xs font-semibold rounded">
                                  Source #{sourceIndex + 1}
                                </span>
                              </div>
                              <CardTitle className="text-sm">{source.title}</CardTitle>
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-muted-foreground hover:underline truncate"
                              >
                                {new URL(source.url).hostname}
                              </a>
                            </CardHeader>
                            <CardContent className="p-4 pt-2">
                              <p className="text-xs text-muted-foreground line-clamp-3">
                                {source.summary}
                              </p>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  ) : (
                    <ScriptDisplay
                      generatedScript={generatedScript}
                      isGeneratingScript={isGeneratingScript}
                      scriptError={scriptError}
                      refinementError={refinementError}
                      refinementInput={refinementInput}
                      setRefinementInput={setRefinementInput}
                      isRefining={isRefining}
                      scriptVersions={scriptVersions}
                      currentVersionId={currentVersionId}
                      showVersionHistory={showVersionHistory}
                      setShowVersionHistory={setShowVersionHistory}
                      showRefinement={showRefinement}
                      onRefineScript={handleRefineScript}
                      onRestoreVersion={restoreVersion}
                      onApplySuggestion={applySuggestion}
                      onCopyScript={copyScriptToClipboard}
                      onDownloadScript={downloadScript}
                      onExportMarkdown={exportAsMarkdown}
                      topic={researchResult.query}
                      researchSources={researchResult.sources}
                    />
                  )}
                </div>

                {/* Desktop Two-Column Layout */}
                <div className="hidden md:block">
                  {/* Generate Script Button (Desktop) */}
                  {!generatedScript && (
                    <div className="mb-4 flex justify-end">
                      <Button
                        variant="default"
                        size="lg"
                        onClick={handleGenerateScript}
                        disabled={isGeneratingScript || researchResult.sources.length === 0}
                      >
                        {isGeneratingScript ? "Generating Script..." : "Generate Script from Research"}
                      </Button>
                    </div>
                  )}

                  {researchResult.sources.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground">
                          No sources found. Try rephrasing your topic.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-12 gap-6">
                      {/* Left Sidebar - Research Sources */}
                      <ResearchSidebar
                        sources={researchResult.sources}
                        isCollapsed={isSidebarCollapsed}
                        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className={isSidebarCollapsed ? "col-span-1" : "col-span-4"}
                      />

                      {/* Right Main Content - Generated Script */}
                      <div className={`transition-layout ${isSidebarCollapsed ? "col-span-11" : "col-span-8"}`}>
                        <ScriptDisplay
                          generatedScript={generatedScript}
                          isGeneratingScript={isGeneratingScript}
                          scriptError={scriptError}
                          refinementError={refinementError}
                          refinementInput={refinementInput}
                          setRefinementInput={setRefinementInput}
                          isRefining={isRefining}
                          scriptVersions={scriptVersions}
                          currentVersionId={currentVersionId}
                          showVersionHistory={showVersionHistory}
                          setShowVersionHistory={setShowVersionHistory}
                          showRefinement={showRefinement}
                          onRefineScript={handleRefineScript}
                          onRestoreVersion={restoreVersion}
                          onApplySuggestion={applySuggestion}
                          onCopyScript={copyScriptToClipboard}
                          onDownloadScript={downloadScript}
                          onExportMarkdown={exportAsMarkdown}
                          topic={researchResult.query}
                          researchSources={researchResult.sources}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Chat Mode */}
        {mode === "chat" && (
          <Card>
            <CardHeader>
              <CardTitle>Chat with Claude</CardTitle>
              <CardDescription>
                Ask me anything to get started with your YouTube research and scriptwriting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleChatSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    Your Message
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Type your message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    disabled={isChatLoading}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={isChatLoading || !message.trim()}>
                    {isChatLoading ? "Sending..." : "Send"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleChatClear}
                    disabled={isChatLoading}
                  >
                    Clear
                  </Button>
                </div>
              </form>

              {chatError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">Error: {chatError}</p>
                </div>
              )}

              {response && (
                <div className="p-4 bg-white border rounded-md">
                  <h3 className="text-sm font-medium mb-2">Response:</h3>
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                    {response}
                  </div>
                </div>
              )}

              {isChatLoading && !response && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-600">Waiting for response...</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
