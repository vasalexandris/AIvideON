import { GoogleGenAI, Type } from '@google/genai';
import type {
  Language,
  SynthesisResult,
  SynthesizedClip,
  YouTubeVideoCandidate,
} from '../types';

interface ExtractedSegment {
  startSeconds: number;
  endSeconds: number;
  clipTitle: string;
  aiExplanation: string;
  transcriptExcerpt: string;
  keyTakeaways: string[];
  relevanceScore: number;
}

interface RawClipCandidate extends ExtractedSegment {
  tempId: string;
  video: YouTubeVideoCandidate;
}

function getClient(apiKey: string): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: apiKey.trim(),
    httpOptions: { apiVersion: 'v1beta' },
  });
}

async function callWithRetry<T>(
  fn: (activeModel: string) => Promise<T>,
  primaryModel: string
): Promise<T> {
  const modelsToTry =
    primaryModel === 'gemini-3.8-flash'
      ? ['gemini-3.8-flash', 'gemini-3.8-flash', 'gemini-3.5-flash-lite']
      : [primaryModel, primaryModel];

  let lastErr: unknown;
  for (let i = 0; i < modelsToTry.length; i++) {
    try {
      return await fn(modelsToTry[i]);
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      const isTransient = msg.includes('503') || msg.includes('429') || msg.includes('UNAVAILABLE');
      if (!isTransient || i === modelsToTry.length - 1) {
        throw err;
      }
      await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
    }
  }
  throw lastErr;
}

function languageInstruction(language: Language): string {
  return language === 'el'
    ? 'Write all titles, explanations, summaries, and takeaways in natural, clear Greek (Ελληνικά). Keep technical AI/programming terms in English where standard.'
    : 'Write all titles, explanations, summaries, and takeaways in clear, concise English.';
}

export async function generateSearchQueries(
  userQuery: string,
  geminiApiKey: string,
  model: string
): Promise<string[]> {
  const ai = getClient(geminiApiKey);

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `You are a YouTube research assistant. Given a user's learning goal, generate 2 concise, high-signal YouTube search queries that will find the best creator tutorials, demos, feature breakdowns, or tips & tricks on YouTube. Prefer English search terms for technical/AI topics unless the topic is specifically Greek.

User query: "${userQuery}"`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            searchQueries: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['searchQueries'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    if (Array.isArray(parsed.searchQueries) && parsed.searchQueries.length > 0) {
      return parsed.searchQueries.slice(0, 2);
    }
  } catch (err) {
    console.warn('Search query planning fallback:', err);
  }

  return [userQuery];
}

export async function analyzeVideoForClips(
  video: YouTubeVideoCandidate,
  userQuery: string,
  language: Language,
  geminiApiKey: string,
  model: string
): Promise<RawClipCandidate[]> {
  const ai = getClient(geminiApiKey);

  const durationHint = video.durationSeconds
    ? `The video total duration is ${video.durationSeconds} seconds. All timestamps MUST be strictly between 0 and ${video.durationSeconds}.`
    : 'Ensure all timestamps are accurate to the actual video timeline.';

  const prompt = `Analyze this YouTube video (both spoken audio/transcript and visual frames/slides/code) in relation to the user's learning goal:
"${userQuery}"

${durationHint}
${languageInstruction(language)}

Instructions:
1. Determine if this video contains genuinely useful, specific information answering the user's goal.
2. If relevant, extract 1 to 3 of the most valuable, self-contained segments (each ideally 20 to 120 seconds long) where the creator explains or demonstrates key points.
3. Provide exact startSeconds and endSeconds as integers (in seconds).
4. In "transcriptExcerpt", quote or closely paraphrase what the creator says/shows in that exact segment.
5. In "aiExplanation", explain WHY this segment is useful for the user's goal and what to pay attention to.
6. In "keyTakeaways", list 2-3 concise bullet points from that segment.`;

  const response = await callWithRetry(
    (activeModel) =>
      ai.models.generateContent({
        model: activeModel,
        contents: [
          {
            fileData: {
              fileUri: video.url,
            },
          },
          {
            text: prompt,
          },
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isRelevant: { type: Type.BOOLEAN },
              segments: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    startSeconds: { type: Type.INTEGER },
                    endSeconds: { type: Type.INTEGER },
                    clipTitle: { type: Type.STRING },
                    aiExplanation: { type: Type.STRING },
                    transcriptExcerpt: { type: Type.STRING },
                    keyTakeaways: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    relevanceScore: { type: Type.INTEGER },
                  },
                  required: [
                    'startSeconds',
                    'endSeconds',
                    'clipTitle',
                    'aiExplanation',
                    'transcriptExcerpt',
                    'keyTakeaways',
                    'relevanceScore',
                  ],
                },
              },
            },
            required: ['isRelevant', 'segments'],
          },
        },
      }),
    model
  );

  const parsed = JSON.parse(response.text || '{}');
  if (!parsed.isRelevant || !Array.isArray(parsed.segments)) {
    return [];
  }

  const maxDur = video.durationSeconds && video.durationSeconds > 0 ? video.durationSeconds : 7200;

  return parsed.segments
    .map((seg: ExtractedSegment, idx: number): RawClipCandidate | null => {
      const start = Math.max(0, Math.min(Math.floor(seg.startSeconds || 0), maxDur - 5));
      const end = Math.max(start + 5, Math.min(Math.floor(seg.endSeconds || start + 30), maxDur));
      if (end - start < 5) return null;

      return {
        ...seg,
        startSeconds: start,
        endSeconds: end,
        tempId: `${video.videoId}-${idx}-${start}`,
        video,
      };
    })
    .filter((c: RawClipCandidate | null): c is RawClipCandidate => c !== null);
}

export async function synthesizeClipsIntoLesson(
  userQuery: string,
  language: Language,
  candidates: RawClipCandidate[],
  sourceVideos: YouTubeVideoCandidate[],
  targetClipCount: number,
  geminiApiKey: string,
  model: string
): Promise<SynthesisResult> {
  const ai = getClient(geminiApiKey);

  const candidateSummaries = candidates.map((c) => ({
    tempId: c.tempId,
    videoTitle: c.video.title,
    channelTitle: c.video.channelTitle,
    startSeconds: c.startSeconds,
    endSeconds: c.endSeconds,
    clipTitle: c.clipTitle,
    aiExplanation: c.aiExplanation,
    relevanceScore: c.relevanceScore,
  }));

  let orderedIds = candidates.slice(0, targetClipCount).map((c) => c.tempId);
  let synthesisTitle = userQuery;
  let executiveSummary = '';
  let keyInsights: string[] = [];
  const bridgeMap = new Map<string, { bridgeQuestion: string; bridgeText: string }>();

  try {
    const response = await callWithRetry(
      (activeModel) =>
        ai.models.generateContent({
          model: activeModel,
          contents: `You are an expert documentary director, curriculum designer, and video editor.
The user asked: "${userQuery}"
Below are candidate video clips extracted from multiple YouTube videos.
Select the best ${Math.min(targetClipCount, candidates.length)} non-redundant clips and order them into the most logical, educational viewing sequence (e.g. Overview/Concept -> Implementation/Demo -> Pro Tips/Pitfalls) so watching them back-to-back feels like one cohesive documentary.

For EACH selected clip in orderedClipIds, also write a documentary interstitial slide in "clipTransitions":
- "bridgeQuestion": A short, intriguing documentary hook question or chapter prompt (max 12 words) shown before the clip plays.
- "bridgeText": 1-2 concise sentences connecting what the viewer just saw (or introducing the topic for the first clip) to what they are about to discover in this next clip.

${languageInstruction(language)}

Candidate clips:
${JSON.stringify(candidateSummaries, null, 2)}`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                synthesisTitle: { type: Type.STRING },
                executiveSummary: { type: Type.STRING },
                keyInsights: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                orderedClipIds: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                clipTransitions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      tempId: { type: Type.STRING },
                      bridgeQuestion: { type: Type.STRING },
                      bridgeText: { type: Type.STRING },
                    },
                    required: ['tempId', 'bridgeQuestion', 'bridgeText'],
                  },
                },
              },
              required: [
                'synthesisTitle',
                'executiveSummary',
                'keyInsights',
                'orderedClipIds',
                'clipTransitions',
              ],
            },
          },
        }),
      model
    );

    const parsed = JSON.parse(response.text || '{}');
    if (parsed.synthesisTitle) synthesisTitle = parsed.synthesisTitle;
    if (parsed.executiveSummary) executiveSummary = parsed.executiveSummary;
    if (Array.isArray(parsed.keyInsights)) keyInsights = parsed.keyInsights;
    if (Array.isArray(parsed.orderedClipIds) && parsed.orderedClipIds.length > 0) {
      const validSet = new Set(candidates.map((c) => c.tempId));
      const filtered = parsed.orderedClipIds.filter((id: string) => validSet.has(id));
      if (filtered.length > 0) {
        orderedIds = filtered;
      }
    }
    if (Array.isArray(parsed.clipTransitions)) {
      for (const tr of parsed.clipTransitions) {
        if (tr?.tempId && (tr.bridgeQuestion || tr.bridgeText)) {
          bridgeMap.set(tr.tempId, {
            bridgeQuestion: tr.bridgeQuestion || '',
            bridgeText: tr.bridgeText || '',
          });
        }
      }
    }
  } catch (err) {
    console.warn('Synthesis ordering fallback:', err);
  }

  const candidateMap = new Map(candidates.map((c) => [c.tempId, c]));
  const finalClips: SynthesizedClip[] = orderedIds
    .map((id) => candidateMap.get(id))
    .filter((c): c is RawClipCandidate => Boolean(c))
    .map((c, index) => {
      const bridge = bridgeMap.get(c.tempId);
      return {
        id: `clip-${Date.now()}-${index}`,
        videoId: c.video.videoId,
        videoUrl: c.video.url,
        videoTitle: c.video.title,
        channelTitle: c.video.channelTitle,
        thumbnailUrl: c.video.thumbnailUrl,
        startSeconds: c.startSeconds,
        endSeconds: c.endSeconds,
        clipTitle: c.clipTitle,
        aiExplanation: c.aiExplanation,
        transcriptExcerpt: c.transcriptExcerpt,
        keyTakeaways: c.keyTakeaways || [],
        bridgeQuestion: bridge?.bridgeQuestion || c.clipTitle,
        bridgeText: bridge?.bridgeText || c.aiExplanation,
        enabled: true,
      };
    });

  if (!executiveSummary && finalClips.length > 0) {
    executiveSummary = finalClips.map((c) => c.aiExplanation).join(' ');
  }

  return {
    id: `syn-${Date.now()}`,
    query: userQuery,
    language,
    createdAt: new Date().toISOString(),
    synthesisTitle,
    executiveSummary,
    keyInsights,
    clips: finalClips,
    sourceVideos,
  };
}
