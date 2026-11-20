export type Language = 'el' | 'en';

export type DiscoveryMode = 'auto' | 'manual';

export type PipelineStage =
  | 'idle'
  | 'planning'
  | 'searching'
  | 'analyzing'
  | 'synthesizing'
  | 'ready'
  | 'error';

export interface AppSettings {
  geminiApiKey: string;
  youtubeApiKey: string;
  geminiModel: string;
  maxVideosToAnalyze: number;
  targetClipCount: number;
}

export interface YouTubeVideoCandidate {
  videoId: string;
  url: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  publishedAt?: string;
  durationSeconds?: number;
  description?: string;
}

export interface SynthesizedClip {
  id: string;
  videoId: string;
  videoUrl: string;
  videoTitle: string;
  channelTitle: string;
  thumbnailUrl: string;
  startSeconds: number;
  endSeconds: number;
  clipTitle: string;
  aiExplanation: string;
  transcriptExcerpt: string;
  keyTakeaways: string[];
  enabled: boolean;
}

export interface SynthesisResult {
  id: string;
  query: string;
  language: Language;
  createdAt: string;
  synthesisTitle: string;
  executiveSummary: string;
  keyInsights: string[];
  clips: SynthesizedClip[];
  sourceVideos: YouTubeVideoCandidate[];
  isDemo?: boolean;
}

export interface VideoAnalysisProgress {
  videoId: string;
  title: string;
  status: 'pending' | 'analyzing' | 'done' | 'skipped' | 'error';
  clipsFound?: number;
}

export interface PipelineStatus {
  stage: PipelineStage;
  message: string;
  videoProgress: VideoAnalysisProgress[];
  error?: string;
}
