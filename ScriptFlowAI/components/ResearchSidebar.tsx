"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResearchSource } from "@/lib/types"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface ResearchSidebarProps {
  sources: ResearchSource[]
  isCollapsed: boolean
  onToggleCollapse: () => void
  className?: string
}

export function ResearchSidebar({
  sources,
  isCollapsed,
  onToggleCollapse,
  className = "",
}: ResearchSidebarProps) {
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set())

  const toggleSourceExpansion = (sourceId: string) => {
    setExpandedSources((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(sourceId)) {
        newSet.delete(sourceId)
      } else {
        newSet.add(sourceId)
      }
      return newSet
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getScoreColor = (score?: number) => {
    if (!score) return "bg-gray-100 text-gray-700"
    if (score >= 0.8) return "bg-green-100 text-green-700"
    if (score >= 0.6) return "bg-yellow-100 text-yellow-700"
    return "bg-gray-100 text-gray-700"
  }

  if (isCollapsed) {
    return (
      <div className={`${className} relative transition-layout`}>
        <div className="sticky top-4 flex flex-col items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center gap-2"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="text-xs">Show Sources ({sources.length})</span>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className} relative transition-layout`}>
      <div className="sticky top-4 space-y-4">
        {/* Header with collapse button */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            Research Sources ({sources.length})
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable sources container */}
        <div className="max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          {sources.map((source, sourceIndex) => (
            <Card key={source.id} className="text-sm">
              <CardHeader className="p-4 pb-2">
                <div className="mb-2">
                  <span className="inline-block px-2 py-0.5 bg-blue-600 text-white text-xs font-semibold rounded">
                    Source #{sourceIndex + 1}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm leading-tight line-clamp-2">
                    {source.title}
                  </CardTitle>
                  {source.score && (
                    <span
                      className={`px-1.5 py-0.5 text-xs rounded whitespace-nowrap ${getScoreColor(
                        source.score
                      )}`}
                    >
                      {(source.score * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline truncate flex-1"
                  >
                    {new URL(source.url).hostname}
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(source.url)}
                    className="h-5 px-1 text-xs"
                  >
                    Copy
                  </Button>
                </div>
                {source.publishedDate && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(source.publishedDate).toLocaleDateString()}
                  </p>
                )}
              </CardHeader>
              <CardContent className="p-4 pt-2 space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {source.summary}
                  </p>
                </div>

                {source.highlights && source.highlights.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium mb-1">Key Points</h4>
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                      {source.highlights.slice(0, 2).map((highlight, idx) => (
                        <li key={idx} className="leading-relaxed line-clamp-2">
                          • {highlight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {source.text && (
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSourceExpansion(source.id)}
                      className="h-6 px-2 text-xs"
                    >
                      {expandedSources.has(source.id)
                        ? "Hide Full Text"
                        : "Show Full Text"}
                    </Button>
                    {expandedSources.has(source.id) && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-muted-foreground max-h-48 overflow-y-auto">
                        {source.text.substring(0, 1500)}
                        {source.text.length > 1500 && "..."}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
