import { GoogleGenAI, Type } from '@google/genai';
import type {
  DocumentarySlide,
  DocumentarySlideKind,
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
  detailedSummary: string;
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

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error(`Timeout after ${ms}ms (${label})`));
    }, ms);
    promise.then(
      (val) => {
        window.clearTimeout(timer);
        resolve(val);
      },
      (err) => {
        window.clearTimeout(timer);
        reject(err);
      }
    );
  });
}

async function callWithRetry<T>(
  fn: (activeModel: string) => Promise<T>,
  primaryModel: string
): Promise<T> {
  const fallbackPool = [
    primaryModel,
    'gemini-3.6-flash',
    'gemini-3.5-flash-lite',
    'gemini-3-flash-preview',
  ];
  const modelsToTry = Array.from(new Set(fallbackPool));

  let lastErr: unknown;
  for (let i = 0; i < modelsToTry.length; i++) {
    try {
      return await withTimeout(fn(modelsToTry[i]), 55000, modelsToTry[i]);
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      const isTransient =
        msg.includes('503') ||
        msg.includes('429') ||
        msg.includes('404') ||
        msg.includes('UNAVAILABLE') ||
        msg.includes('Timeout');
      if (!isTransient || i === modelsToTry.length - 1) {
        throw err;
      }
      await new Promise((r) => setTimeout(r, 1500));
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
  const fastModel = model === 'gemini-3.8-flash' ? 'gemini-3.5-flash-lite' : model;

  try {
    const response = await withTimeout(
      ai.models.generateContent({
        model: fastModel,
        contents: `You are a YouTube research assistant. Given a user's learning goal, generate 2 concise, high-signal YouTube search queries that will find the best creator tutorials, demos, feature breakdowns, or walking/drone tours on YouTube. Prefer English search terms unless the topic is specifically Greek.

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
      }),
      10000,
      'search-planning'
    );

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

  const prompt = `Analyze this YouTube video (both spoken audio/transcript and visual frames/scenes/slides/code) as a documentary film researcher for the viewer's prompt:
"${userQuery}"

${durationHint}
${languageInstruction(language)}

Instructions:
1. Determine if this video contains genuinely useful spoken explanations OR strong visual footage (e.g. aerial/drone shots, walking tours, live demos, diagrams) that helps answer or illustrate any part of the viewer's prompt.
2. If relevant, extract 1 to 3 of the most valuable, self-contained segments (each ideally 18 to 75 seconds long).
3. Choose startSeconds and endSeconds carefully on natural sentence pauses or visual scene cuts so clips never feel awkwardly cut off mid-thought.
4. In "transcriptExcerpt", quote or closely describe what is being said or visually shown in that exact segment.
5. In "detailedSummary", write a clear, engaging 3 to 5 sentence written summary of EVERYTHING important explained, demonstrated, or shown in this segment — NOT a raw verbatim transcript, but rich prose that preserves every essential fact, tip, step, or insight for a written HTML slide presentation.
6. In "aiExplanation", explain concisely what specific part of the viewer's question this segment answers.
7. In "keyTakeaways", list 2-3 concise bullet points from that segment.`;

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
                    detailedSummary: { type: Type.STRING },
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
                    'detailedSummary',
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
      const start = Math.max(0, Math.min(Math.floor(seg.startSeconds || 0), maxDur - 8));
      const end = Math.max(start + 8, Math.min(Math.floor(seg.endSeconds || start + 30), maxDur));
      if (end - start < 8) return null;

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

function normalizeSlideKind(kind?: string): DocumentarySlideKind {
  if (kind === 'title' || kind === 'question' || kind === 'narrative' || kind === 'outro') {
    return kind;
  }
  return 'narrative';
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
    transcriptExcerpt: c.transcriptExcerpt,
    relevanceScore: c.relevanceScore,
  }));

  let orderedIds = candidates.slice(0, targetClipCount).map((c) => c.tempId);
  let synthesisTitle = userQuery;
  let executiveSummary = '';
  let keyInsights: string[] = [];
  const slidesMap = new Map<string, DocumentarySlide[]>();
  let outroSlide: DocumentarySlide | undefined;

  try {
    const response = await callWithRetry(
      (activeModel) =>
        ai.models.generateContent({
          model: activeModel,
          contents: `You are an acclaimed documentary film director, essayist, narrator, and editor.
The viewer asked: "${userQuery}"

Think first about how YOU would personally answer this question by breaking it down into a compelling sequence of sub-questions and narrative chapters. Instead of writing a long text essay, you answer through an alternating sequence of **cinematic narration slides** (1 or 2 slides in a row) and **real video segments** that visually or vocally prove, show, or answer what your slide just set up.

Your directing & editing job:
1. Select the best ${Math.min(targetClipCount, candidates.length)} non-redundant video segments from the candidates below and order them in "orderedClipIds" like a real documentary (Establishing hook -> Context/History/Core concept -> Deeper angles/Contrasts/Experiences -> Memorable climax). Prefer variety across different source videos when possible.
2. For EACH selected clip in "orderedClipIds", craft its "introSlides" (an array of **1 or 2 sequential slides** that play one after the other right before that footage fades in):
   - For the **FIRST clip** in the documentary: ALWAYS create **2 sequential slides**:
     * Slide 1 (kind: "title"): The opening documentary title card — an evocative main title in "headline" and a crisp 1-sentence thesis/hook in "body".
     * Slide 2 (kind: "question" or "narrative"): Sets up the very first sub-question or opening premise AND naturally introduces the creator/channel whose footage follows (for proper documentary attribution & copyright transparency, e.g., in Greek: "Το κανάλι [channelTitle] εξηγεί..." / "Ο [Creator] από το κανάλι [channelTitle] μας δείχνει...", or in English: "[Creator/Channel] explains..." / "[channelTitle] captures...").
   - For **subsequent clips (#2 to #N)**: Create **1 or 2 sequential slides** that weave a real narrative thread from what the viewer JUST experienced in the previous clip into the next angle!
     * Whenever switching to a different channel/creator (or introducing a new expert voice), prefer **2 sequential slides**:
       - Slide 1 (kind: "question" or "narrative"): Poses the thematic bridge or intriguing next sub-question (e.g., "Τι συμβαίνει όμως όταν..." or "Πέρα από την αρχιτεκτονική που μόλις είδαμε, η πόλη διαθέτει και έντονη κοινωνική ζωή...").
       - Slide 2 (kind: "narrative"): Naturally introduces the creator/channel who answers or captures it (e.g., "Ο Chris από το κανάλι ChrisTechTips αναλύει..." or "Το κανάλι TheSkyExplorer καταγράφει από ψηλά..."), connecting smoothly to the footage.
     * When continuing from the same channel, 1 crisp pivot slide (kind: "question" or "narrative") is great.
   - Keep each slide concise and cinematic: "headline" 3–11 words; "body" 0–2 crisp, readable sentences.
3. Also create a single closing "outroSlide" (kind: "outro") that appears after the final clip fades out — a memorable concluding thought that ties the whole answer together.
4. CRITICAL STYLE RULE: Do NOT write robotic meta-talk like "This clip shows" or "Αυτό το απόσπασμα δείχνει". Instead, introduce creators/channels naturally the way a real documentary narrator introduces an expert, filmmaker, or guide ("Ο Andrej Karpathy εξηγεί...", "Το κανάλι 3Blue1Brown οπτικοποιεί...", "Ο John από το κανάλι JohnTech αναφέρει...").

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
                clipSequences: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      tempId: { type: Type.STRING },
                      introSlides: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            kind: { type: Type.STRING },
                            eyebrow: { type: Type.STRING },
                            headline: { type: Type.STRING },
                            body: { type: Type.STRING },
                          },
                          required: ['kind', 'headline'],
                        },
                      },
                    },
                    required: ['tempId', 'introSlides'],
                  },
                },
                outroSlide: {
                  type: Type.OBJECT,
                  properties: {
                    eyebrow: { type: Type.STRING },
                    headline: { type: Type.STRING },
                    body: { type: Type.STRING },
                  },
                  required: ['headline', 'body'],
                },
              },
              required: [
                'synthesisTitle',
                'executiveSummary',
                'keyInsights',
                'orderedClipIds',
                'clipSequences',
                'outroSlide',
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
    if (Array.isArray(parsed.clipSequences)) {
      for (const seq of parsed.clipSequences) {
        if (seq?.tempId && Array.isArray(seq.introSlides) && seq.introSlides.length > 0) {
          const normalizedSlides: DocumentarySlide[] = seq.introSlides
            .slice(0, 2)
            .filter((s: { headline?: string }) => Boolean(s?.headline))
            .map((s: { kind?: string; eyebrow?: string; headline: string; body?: string }) => ({
              kind: normalizeSlideKind(s.kind),
              eyebrow: s.eyebrow || undefined,
              headline: s.headline,
              body: s.body || undefined,
            }));
          if (normalizedSlides.length > 0) {
            slidesMap.set(seq.tempId, normalizedSlides);
          }
        }
      }
    }
    if (parsed.outroSlide?.headline) {
      outroSlide = {
        kind: 'outro',
        eyebrow: parsed.outroSlide.eyebrow || (language === 'el' ? 'ΕΠΙΛΟΓΟΣ' : 'EPILOGUE'),
        headline: parsed.outroSlide.headline,
        body: parsed.outroSlide.body || undefined,
      };
    }
  } catch (err) {
    console.warn('Synthesis ordering fallback:', err);
  }

  const candidateMap = new Map(candidates.map((c) => [c.tempId, c]));
  const finalClips: SynthesizedClip[] = orderedIds
    .map((id) => candidateMap.get(id))
    .filter((c): c is RawClipCandidate => Boolean(c))
    .map((c, index) => {
      const introSlides = slidesMap.get(c.tempId) || [
        {
          kind: index === 0 ? ('title' as const) : ('narrative' as const),
          headline: c.clipTitle,
          body: c.aiExplanation,
        },
      ];
      const primarySlide = introSlides[introSlides.length - 1];
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
        detailedSummary: c.detailedSummary || c.aiExplanation,
        keyTakeaways: c.keyTakeaways || [],
        bridgeQuestion: primarySlide.headline,
        bridgeText: primarySlide.body || '',
        introSlides,
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
    outroSlide,
    sourceVideos,
  };
}
