export interface ResearchSource {
  id: string;
  title: string;
  url: string;
  publishedDate?: string;
  author?: string;
  summary: string;
  text?: string;
  score?: number;
  highlights?: string[];
}

export interface ResearchResult {
  query: string;
  sources: ResearchSource[];
  timestamp: Date;
}

export type ScriptStructure =
  | 'hook-problem-solution'
  | 'storytelling'
  | 'listicle'
  | 'educational-deep-dive'
  | 'commentary-analysis'
  | 'news-breakdown';

export type ScriptTone =
  | 'professional'
  | 'casual'
  | 'energetic'
  | 'authoritative';

export type VideoLength =
  | 'short'   // 3-5 min
  | 'medium'  // 8-10 min
  | 'long';   // 15-20 min

export interface ScriptOptions {
  structure: ScriptStructure;
  tone: ScriptTone;
  length: VideoLength;
  includeCitations: boolean;
}

export interface ResearchSynthesis {
  keyThemes: string[];
  mainPoints: string[];
  consensus: string;
  contradictions: string[];
  mostRecentSource?: ResearchSource;
  mostAuthoritativeSource?: ResearchSource;
}

export interface ScriptVersion {
  id: string;
  content: string;
  timestamp: Date;
  changeDescription: string;
}

export interface ScriptState {
  currentVersion: string;
  versions: ScriptVersion[];
  researchContext: ResearchResult;
  scriptOptions: ScriptOptions;
}
