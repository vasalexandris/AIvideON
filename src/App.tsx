import { Film, Presentation } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ClipContextCard } from './components/ClipContextCard';
import { CompositePlayer, type SlidePhase } from './components/CompositePlayer';
import { Header } from './components/Header';
import { HistoryDrawer } from './components/HistoryDrawer';
import { PresentationDeck } from './components/PresentationDeck';
import { PromptStudio } from './components/PromptStudio';
import { SettingsModal } from './components/SettingsModal';
import { SynthesisSidebar } from './components/SynthesisSidebar';
import { getDemoSynthesis } from './data/demoSynthesis';
import { useYouTubePlayer } from './hooks/useYouTubePlayer';
import { formatTime, translations } from './i18n/translations';
import {
  analyzeVideoForClips,
  generateSearchQueries,
  synthesizeClipsIntoLesson,
} from './services/geminiService';
import {
  extractYouTubeVideoId,
  fetchVideosByIds,
  searchYouTubeVideos,
} from './services/youtubeService';
import type {
  AppSettings,
  DiscoveryMode,
  DocumentarySlide,
  Language,
  PipelineStatus,
  SynthesisResult,
  SynthesizedClip,
  YouTubeVideoCandidate,
} from './types';

const STORAGE_SETTINGS_KEY = 'aivideon_settings_v1';
const STORAGE_HISTORY_KEY = 'aivideon_history_v1';
const STORAGE_LANG_KEY = 'aivideon_lang_v1';

const DEFAULT_SETTINGS: AppSettings = {
  geminiApiKey: '',
  youtubeApiKey: '',
  geminiModel: 'gemini-3.8-flash',
  maxVideosToAnalyze: 4,
  targetClipCount: 6,
};

function getSlidesForClip(clip: SynthesizedClip | null | undefined): DocumentarySlide[] {
  if (!clip) return [];
  if (clip.introSlides && clip.introSlides.length > 0) {
    return clip.introSlides;
  }
  if (clip.bridgeQuestion || clip.bridgeText) {
    return [
      {
        kind: 'narrative',
        headline: clip.bridgeQuestion || clip.clipTitle,
        body: clip.bridgeText || undefined,
      },
    ];
  }
  return [];
}

function computeSlideDurationMs(slide: DocumentarySlide): number {
  const words = `${slide.headline || ''} ${slide.body || ''}`
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const base = slide.kind === 'title' ? 5000 : 4200;
  return Math.min(11500, Math.max(6000, base + words * 310));
}

export function App() {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_LANG_KEY);
    return saved === 'en' ? 'en' : 'el';
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_SETTINGS_KEY);
      if (!raw) return DEFAULT_SETTINGS;
      const parsed = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
      if (parsed.geminiModel === 'gemini-2.5-flash' || parsed.geminiModel === 'gemini-2.0-flash') {
        parsed.geminiModel = 'gemini-3.8-flash';
      }
      return parsed;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [history, setHistory] = useState<SynthesisResult[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<DiscoveryMode>('auto');
  const [manualUrls, setManualUrls] = useState<string[]>([]);
  const [pipeline, setPipeline] = useState<PipelineStatus>({
    stage: 'idle',
    message: '',
    videoProgress: [],
  });

  const [workspaceView, setWorkspaceView] = useState<'documentary' | 'presentation'>('documentary');
  const [currentSynthesis, setCurrentSynthesis] = useState<SynthesisResult | null>(null);
  const [activeClipId, setActiveClipId] = useState<string | null>(null);
  const [autoPlayOnClipChange, setAutoPlayOnClipChange] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [docSlidesEnabled, setDocSlidesEnabled] = useState(true);

  // Multi-slide documentary sequence state
  const [slideQueue, setSlideQueue] = useState<DocumentarySlide[]>([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [slideMode, setSlideMode] = useState<'none' | 'intro' | 'outro'>('none');
  const [slidePhase, setSlidePhase] = useState<SlidePhase>('visible');
  const [slideProgressPct, setSlideProgressPct] = useState(0);
  const transitionTimeoutRef = useRef<number | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const t = translations[language];

  const clearPendingTransition = useCallback(() => {
    if (transitionTimeoutRef.current !== null) {
      window.clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearPendingTransition();
  }, [clearPendingTransition]);

  useEffect(() => {
    localStorage.setItem(STORAGE_LANG_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const handleSaveSettings = (next: AppSettings) => {
    setSettings(next);
    localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(next));
  };

  const saveToHistory = (result: SynthesisResult) => {
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.id !== result.id);
      const next = [result, ...filtered].slice(0, 20);
      localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  };

  const handleDeleteHistory = (id: string) => {
    setHistory((prev) => {
      const next = prev.filter((item) => item.id !== id);
      localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  };

  const enabledClips = useMemo(
    () => (currentSynthesis ? currentSynthesis.clips.filter((c) => c.enabled) : []),
    [currentSynthesis]
  );

  const activeClipIndex = useMemo(() => {
    if (!enabledClips.length) return -1;
    const idx = enabledClips.findIndex((c) => c.id === activeClipId);
    return idx >= 0 ? idx : 0;
  }, [enabledClips, activeClipId]);

  const activeClip = activeClipIndex >= 0 ? enabledClips[activeClipIndex] : null;
  const activeSlide = slideMode !== 'none' ? slideQueue[slideIndex] ?? null : null;
  const isShowingSlide = Boolean(activeSlide);

  const featuredCreators = useMemo(() => {
    if (!currentSynthesis) return [];
    return Array.from(new Set(currentSynthesis.clips.filter((c) => c.enabled).map((c) => c.channelTitle)));
  }, [currentSynthesis]);

  const startSlideSequence = useCallback(
    (slides: DocumentarySlide[], modeType: 'intro' | 'outro') => {
      clearPendingTransition();
      setSlideQueue(slides);
      setSlideIndex(0);
      setSlideMode(modeType);
      setSlidePhase('visible');
      setSlideProgressPct(0);
    },
    [clearPendingTransition]
  );

  const dismissSlidesImmediately = useCallback(() => {
    clearPendingTransition();
    setSlideQueue([]);
    setSlideIndex(0);
    setSlideMode('none');
    setSlidePhase('visible');
    setSlideProgressPct(0);
  }, [clearPendingTransition]);

  const triggerClipWithOptionalSlide = useCallback(
    (clipId: string, showSlideIfEnabled = true, clipsSource = enabledClips) => {
      clearPendingTransition();
      const target = clipsSource.find((c) => c.id === clipId);
      const slides = getSlidesForClip(target);

      if (showSlideIfEnabled && docSlidesEnabled && slides.length > 0) {
        setAutoPlayOnClipChange(false);
        setActiveClipId(clipId);
        startSlideSequence(slides, 'intro');
      } else {
        dismissSlidesImmediately();
        setAutoPlayOnClipChange(true);
        setActiveClipId(clipId);
      }
    },
    [enabledClips, docSlidesEnabled, clearPendingTransition, startSlideSequence, dismissSlidesImmediately]
  );

  const handleClipEnded = useCallback(() => {
    if (!autoAdvance) return;
    if (activeClipIndex >= 0 && activeClipIndex < enabledClips.length - 1) {
      triggerClipWithOptionalSlide(enabledClips[activeClipIndex + 1].id, true);
    } else if (
      activeClipIndex === enabledClips.length - 1 &&
      docSlidesEnabled &&
      currentSynthesis?.outroSlide
    ) {
      startSlideSequence([currentSynthesis.outroSlide], 'outro');
    }
  }, [
    autoAdvance,
    activeClipIndex,
    enabledClips,
    docSlidesEnabled,
    currentSynthesis,
    triggerClipWithOptionalSlide,
    startSlideSequence,
  ]);

  const {
    containerRef,
    isPlaying,
    isFadingOut,
    currentSeconds,
    togglePlay,
    seekToSecond,
    play,
    pause,
  } = useYouTubePlayer({
    activeClip,
    autoPlayOnClipChange,
    playbackRate,
    suppressEndCheck: isShowingSlide,
    onClipEnded: handleClipEnded,
  });

  const handlePlayNowFromSlide = useCallback(() => {
    clearPendingTransition();
    if (slideMode === 'outro') {
      if (enabledClips.length > 0) {
        triggerClipWithOptionalSlide(enabledClips[0].id, true);
      } else {
        dismissSlidesImmediately();
      }
      return;
    }

    setSlidePhase('fading-out');
    setSlideProgressPct(100);
    play();
    transitionTimeoutRef.current = window.setTimeout(() => {
      dismissSlidesImmediately();
    }, 750);
  }, [
    clearPendingTransition,
    slideMode,
    enabledClips,
    triggerClipWithOptionalSlide,
    dismissSlidesImmediately,
    play,
  ]);

  // Multi-slide documentary timer: smoothly cross-fades between sequential slides, then cross-fades into video
  useEffect(() => {
    if (slideMode !== 'intro' || !activeSlide || slidePhase !== 'visible') return;

    const durationMs = computeSlideDurationMs(activeSlide);
    const TICK_MS = 100;
    const step = (TICK_MS / durationMs) * 100;

    const timer = window.setInterval(() => {
      setSlideProgressPct((prev) => {
        const next = prev + step;
        if (next >= 100) {
          window.clearInterval(timer);

          if (slideIndex < slideQueue.length - 1) {
            // Smooth cross-fade between Slide 1 -> Slide 2 on the same dark canvas
            setSlidePhase('fading-between');
            transitionTimeoutRef.current = window.setTimeout(() => {
              setSlideIndex((i) => i + 1);
              setSlideProgressPct(0);
              setSlidePhase('visible');
            }, 460);
          } else {
            // Final intro slide finished -> cross-fade out into the video with audio fade-in
            handlePlayNowFromSlide();
          }
          return 100;
        }
        return next;
      });
    }, TICK_MS);

    return () => window.clearInterval(timer);
  }, [slideMode, activeSlide, slidePhase, slideIndex, slideQueue.length, handlePlayNowFromSlide]);

  const handleSelectClip = (index: number, seekOffset?: number) => {
    const target = enabledClips[index];
    if (!target) return;

    if (seekOffset !== undefined) {
      dismissSlidesImmediately();
      if (target.id === activeClip?.id) {
        seekToSecond(target.startSeconds + seekOffset);
        play();
        return;
      }
      setAutoPlayOnClipChange(true);
      setActiveClipId(target.id);
      window.setTimeout(() => {
        seekToSecond(target.startSeconds + seekOffset);
      }, 450);
      return;
    }

    if (isPlaying) {
      pause();
    }
    triggerClipWithOptionalSlide(target.id, true);
  };

  const handleSelectClipById = (clipId: string) => {
    const idx = enabledClips.findIndex((c) => c.id === clipId);
    if (idx >= 0) {
      handleSelectClip(idx);
    }
  };

  const handleToggleClipEnabled = (clipId: string) => {
    if (!currentSynthesis) return;
    const updatedClips = currentSynthesis.clips.map((c) =>
      c.id === clipId ? { ...c, enabled: !c.enabled } : c
    );
    setCurrentSynthesis({ ...currentSynthesis, clips: updatedClips });

    if (clipId === activeClipId) {
      const nextEnabled = updatedClips.find((c) => c.enabled);
      setActiveClipId(nextEnabled ? nextEnabled.id : null);
      dismissSlidesImmediately();
    }
  };

  const handleMoveClip = (clipId: string, direction: 'up' | 'down') => {
    if (!currentSynthesis) return;
    const idx = currentSynthesis.clips.findIndex((c) => c.id === clipId);
    if (idx < 0) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= currentSynthesis.clips.length) return;

    const copy = [...currentSynthesis.clips];
    [copy[idx], copy[swapIdx]] = [copy[swapIdx], copy[idx]];
    setCurrentSynthesis({ ...currentSynthesis, clips: copy });
  };

  const openSynthesis = useCallback(
    (result: SynthesisResult) => {
      clearPendingTransition();
      setCurrentSynthesis(result);
      setQuery(result.query);
      const firstClip = result.clips.find((c) => c.enabled) ?? result.clips[0];
      setActiveClipId(firstClip?.id ?? null);
      const slides = getSlidesForClip(firstClip);
      if (docSlidesEnabled && slides.length > 0) {
        setAutoPlayOnClipChange(false);
        startSlideSequence(slides, 'intro');
      } else {
        dismissSlidesImmediately();
        setAutoPlayOnClipChange(true);
      }
      setPipeline({ stage: 'ready', message: '', videoProgress: [] });
    },
    [clearPendingTransition, docSlidesEnabled, startSlideSequence, dismissSlidesImmediately]
  );

  const handleLoadDemo = () => {
    openSynthesis(getDemoSynthesis(language));
  };

  const handleSynthesize = async () => {
    if (!query.trim()) {
      setPipeline({ stage: 'error', message: '', videoProgress: [], error: t.errorNoQuery });
      return;
    }
    if (!settings.geminiApiKey.trim()) {
      setPipeline({ stage: 'error', message: '', videoProgress: [], error: t.errorNoGeminiKey });
      setIsSettingsOpen(true);
      return;
    }
    if (mode === 'auto' && !settings.youtubeApiKey.trim()) {
      setPipeline({ stage: 'error', message: '', videoProgress: [], error: t.errorNoYoutubeKey });
      setIsSettingsOpen(true);
      return;
    }
    if (mode === 'manual' && manualUrls.length === 0) {
      setPipeline({ stage: 'error', message: '', videoProgress: [], error: t.errorNoUrls });
      return;
    }

    try {
      let candidates: YouTubeVideoCandidate[] = [];

      if (mode === 'auto') {
        setPipeline({ stage: 'planning', message: t.pipelinePlanning, videoProgress: [] });
        const searchQueries = await generateSearchQueries(
          query,
          settings.geminiApiKey,
          settings.geminiModel
        );

        setPipeline({ stage: 'searching', message: t.pipelineSearching, videoProgress: [] });
        const searchBatches = await Promise.all(
          searchQueries.map((sq) =>
            searchYouTubeVideos(sq, settings.youtubeApiKey, settings.maxVideosToAnalyze)
          )
        );

        const seen = new Set<string>();
        for (const batch of searchBatches) {
          for (const v of batch) {
            if (!seen.has(v.videoId)) {
              seen.add(v.videoId);
              candidates.push(v);
            }
          }
        }
        candidates = candidates.slice(0, settings.maxVideosToAnalyze);
      } else {
        setPipeline({ stage: 'searching', message: t.pipelineSearching, videoProgress: [] });
        const ids = manualUrls
          .map((u) => extractYouTubeVideoId(u))
          .filter((id): id is string => Boolean(id));
        candidates = await fetchVideosByIds(ids, settings.youtubeApiKey);
      }

      if (candidates.length === 0) {
        throw new Error('No YouTube videos found for this query.');
      }

      const initialProgress = candidates.map((v) => ({
        videoId: v.videoId,
        title: v.title,
        status: 'pending' as const,
      }));

      setPipeline({
        stage: 'analyzing',
        message: t.pipelineAnalyzing,
        videoProgress: initialProgress,
      });

      const allRawClips = [];

      // Analyze videos sequentially or in small batches of 2 to respect rate limits
      for (const video of candidates) {
        setPipeline((prev) => ({
          ...prev,
          videoProgress: prev.videoProgress.map((vp) =>
            vp.videoId === video.videoId ? { ...vp, status: 'analyzing' } : vp
          ),
        }));

        try {
          const extracted = await analyzeVideoForClips(
            video,
            query,
            language,
            settings.geminiApiKey,
            settings.geminiModel
          );

          allRawClips.push(...extracted);

          setPipeline((prev) => ({
            ...prev,
            videoProgress: prev.videoProgress.map((vp) =>
              vp.videoId === video.videoId
                ? {
                    ...vp,
                    status: extracted.length > 0 ? 'done' : 'skipped',
                    clipsFound: extracted.length,
                  }
                : vp
            ),
          }));
        } catch (err) {
          console.error(`Error analyzing ${video.videoId}:`, err);
          setPipeline((prev) => ({
            ...prev,
            videoProgress: prev.videoProgress.map((vp) =>
              vp.videoId === video.videoId ? { ...vp, status: 'error' } : vp
            ),
          }));
        }
      }

      if (allRawClips.length === 0) {
        throw new Error(
          language === 'el'
            ? 'Δεν βρέθηκαν σχετικά αποσπάσματα στα επιλεγμένα βίντεο. Δοκίμασε πιο συγκεκριμένο ερώτημα ή άλλα βίντεο.'
            : 'No relevant segments were found in the analyzed videos. Try a different query or custom URLs.'
        );
      }

      setPipeline((prev) => ({
        ...prev,
        stage: 'synthesizing',
        message: t.pipelineSynthesizing,
      }));

      const result = await synthesizeClipsIntoLesson(
        query,
        language,
        allRawClips,
        candidates,
        settings.targetClipCount,
        settings.geminiApiKey,
        settings.geminiModel
      );

      saveToHistory(result);
      openSynthesis(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setPipeline({
        stage: 'error',
        message: '',
        videoProgress: [],
        error: msg,
      });
    }
  };

  const totalSynthesizedSeconds = enabledClips.reduce(
    (acc, c) => acc + Math.max(1, c.endSeconds - c.startSeconds),
    0
  );

  const totalOriginalSeconds = (currentSynthesis?.sourceVideos || []).reduce(
    (acc, v) => acc + (v.durationSeconds || 0),
    0
  );

  return (
    <div className="app-shell">
      <Header
        language={language}
        onChangeLanguage={(lang) => {
          setLanguage(lang);
          if (currentSynthesis?.isDemo) {
            openSynthesis(getDemoSynthesis(lang));
          }
        }}
        t={t}
        hasGeminiKey={Boolean(settings.geminiApiKey.trim())}
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onResetHome={() => {
          dismissSlidesImmediately();
          setCurrentSynthesis(null);
          setActiveClipId(null);
          setPipeline({ stage: 'idle', message: '', videoProgress: [] });
        }}
      />

      <main className="main-container">
        <PromptStudio
          query={query}
          onChangeQuery={setQuery}
          mode={mode}
          onChangeMode={setMode}
          manualUrls={manualUrls}
          onChangeManualUrls={setManualUrls}
          pipeline={pipeline}
          compact={Boolean(currentSynthesis)}
          t={t}
          onSynthesize={handleSynthesize}
          onLoadDemo={handleLoadDemo}
        />

        {currentSynthesis && (
          <>
            <div className="workspace-header">
              <div className="workspace-title-group">
                <h2 className="workspace-title">{currentSynthesis.synthesisTitle}</h2>
                <div className="workspace-meta">
                  {currentSynthesis.isDemo && <span className="demo-pill">{t.demoBadge}</span>}
                  <span className="mono-badge">
                    {t.synthesizedFrom} {formatTime(totalSynthesizedSeconds)}
                    {totalOriginalSeconds > 0
                      ? ` ${t.ofOriginalVideo} ${formatTime(totalOriginalSeconds)}`
                      : ''}
                  </span>
                  <span>
                    {enabledClips.length} {t.clipsCount} · {currentSynthesis.sourceVideos.length}{' '}
                    videos
                  </span>
                </div>
              </div>

              <div className="view-switcher" role="tablist" aria-label="View Mode">
                <button
                  type="button"
                  id="view-documentary-btn"
                  role="tab"
                  aria-selected={workspaceView === 'documentary'}
                  className={`view-switch-btn ${workspaceView === 'documentary' ? 'active' : ''}`}
                  onClick={() => setWorkspaceView('documentary')}
                >
                  <Film size={15} />
                  <span>{t.viewDocumentary}</span>
                </button>
                <button
                  type="button"
                  id="view-presentation-btn"
                  role="tab"
                  aria-selected={workspaceView === 'presentation'}
                  className={`view-switch-btn ${workspaceView === 'presentation' ? 'active' : ''}`}
                  onClick={() => {
                    pause();
                    dismissSlidesImmediately();
                    setWorkspaceView('presentation');
                  }}
                >
                  <Presentation size={15} />
                  <span>{t.viewPresentation}</span>
                </button>
              </div>
            </div>

            {workspaceView === 'presentation' && (
              <PresentationDeck
                synthesis={currentSynthesis}
                language={language}
                t={t}
              />
            )}

            <div
              className="workspace-grid"
              style={{ display: workspaceView === 'documentary' ? undefined : 'none' }}
            >
              <div className="player-column">
                <CompositePlayer
                  containerRef={containerRef}
                  enabledClips={enabledClips}
                  activeClipIndex={activeClipIndex}
                  activeClip={activeClip}
                  currentSeconds={currentSeconds}
                  isPlaying={isPlaying}
                  autoAdvance={autoAdvance}
                  docSlidesEnabled={docSlidesEnabled}
                  activeSlide={activeSlide}
                  slideIndex={slideIndex}
                  slideCount={slideQueue.length}
                  slidePhase={slidePhase}
                  slideProgressPct={slideProgressPct}
                  isFadingOut={isFadingOut}
                  featuredCreators={featuredCreators}
                  playbackRate={playbackRate}
                  t={t}
                  onTogglePlay={togglePlay}
                  onPrevClip={() => activeClipIndex > 0 && handleSelectClip(activeClipIndex - 1)}
                  onNextClip={() =>
                    activeClipIndex < enabledClips.length - 1 &&
                    handleSelectClip(activeClipIndex + 1)
                  }
                  onReplayClip={() => {
                    if (activeClip) {
                      dismissSlidesImmediately();
                      seekToSecond(activeClip.startSeconds);
                      play();
                    }
                  }}
                  onSelectClip={handleSelectClip}
                  onToggleAutoAdvance={setAutoAdvance}
                  onToggleDocSlides={(next) => {
                    setDocSlidesEnabled(next);
                    if (!next && isShowingSlide) {
                      handlePlayNowFromSlide();
                    }
                  }}
                  onPlayNowFromSlide={handlePlayNowFromSlide}
                  onChangePlaybackRate={setPlaybackRate}
                />

                <ClipContextCard clip={activeClip} t={t} />
              </div>

              <SynthesisSidebar
                synthesis={currentSynthesis}
                activeClipId={activeClip?.id ?? null}
                t={t}
                onSelectClipById={handleSelectClipById}
                onToggleClipEnabled={handleToggleClipEnabled}
                onMoveClip={handleMoveClip}
              />
            </div>
          </>
        )}
      </main>

      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          t={t}
          onSave={handleSaveSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {isHistoryOpen && (
        <HistoryDrawer
          items={history}
          t={t}
          onSelect={(item) => openSynthesis(item)}
          onDelete={handleDeleteHistory}
          onClose={() => setIsHistoryOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
