import { useCallback, useEffect, useMemo, useState } from 'react';
import { ClipContextCard } from './components/ClipContextCard';
import { CompositePlayer } from './components/CompositePlayer';
import { Header } from './components/Header';
import { HistoryDrawer } from './components/HistoryDrawer';
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
  Language,
  PipelineStatus,
  SynthesisResult,
  YouTubeVideoCandidate,
} from './types';

const STORAGE_SETTINGS_KEY = 'aivideon_settings_v1';
const STORAGE_HISTORY_KEY = 'aivideon_history_v1';
const STORAGE_LANG_KEY = 'aivideon_lang_v1';

const DEFAULT_SETTINGS: AppSettings = {
  geminiApiKey: '',
  youtubeApiKey: '',
  geminiModel: 'gemini-2.5-flash',
  maxVideosToAnalyze: 4,
  targetClipCount: 6,
};

export function App() {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_LANG_KEY);
    return saved === 'en' ? 'en' : 'el';
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_SETTINGS_KEY);
      return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
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

  const [currentSynthesis, setCurrentSynthesis] = useState<SynthesisResult | null>(null);
  const [activeClipId, setActiveClipId] = useState<string | null>(null);
  const [autoPlayOnClipChange, setAutoPlayOnClipChange] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const t = translations[language];

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

  const handleClipEnded = useCallback(() => {
    if (!autoAdvance) return;
    if (activeClipIndex >= 0 && activeClipIndex < enabledClips.length - 1) {
      setAutoPlayOnClipChange(true);
      setActiveClipId(enabledClips[activeClipIndex + 1].id);
    }
  }, [autoAdvance, activeClipIndex, enabledClips]);

  const {
    containerRef,
    isPlaying,
    currentSeconds,
    togglePlay,
    seekToSecond,
    play,
  } = useYouTubePlayer({
    activeClip,
    autoPlayOnClipChange,
    playbackRate,
    onClipEnded: handleClipEnded,
  });

  const handleSelectClip = (index: number, seekOffset?: number) => {
    const target = enabledClips[index];
    if (!target) return;

    if (target.id === activeClip?.id && seekOffset !== undefined) {
      seekToSecond(target.startSeconds + seekOffset);
      play();
      return;
    }

    setAutoPlayOnClipChange(true);
    setActiveClipId(target.id);
    if (seekOffset !== undefined) {
      window.setTimeout(() => {
        seekToSecond(target.startSeconds + seekOffset);
      }, 450);
    }
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

  const handleLoadDemo = () => {
    const demo = getDemoSynthesis(language);
    setCurrentSynthesis(demo);
    setQuery(demo.query);
    setActiveClipId(demo.clips[0]?.id ?? null);
    setAutoPlayOnClipChange(true);
    setPipeline({ stage: 'ready', message: '', videoProgress: [] });
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

      setCurrentSynthesis(result);
      setActiveClipId(result.clips[0]?.id ?? null);
      setAutoPlayOnClipChange(false);
      saveToHistory(result);
      setPipeline({ stage: 'ready', message: '', videoProgress: [] });
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
            const demo = getDemoSynthesis(lang);
            setCurrentSynthesis(demo);
            setQuery(demo.query);
            setActiveClipId(demo.clips[0]?.id ?? null);
          }
        }}
        t={t}
        hasGeminiKey={Boolean(settings.geminiApiKey.trim())}
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onResetHome={() => {
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
            </div>

            <div className="workspace-grid">
              <div className="player-column">
                <CompositePlayer
                  containerRef={containerRef}
                  enabledClips={enabledClips}
                  activeClipIndex={activeClipIndex}
                  activeClip={activeClip}
                  currentSeconds={currentSeconds}
                  isPlaying={isPlaying}
                  autoAdvance={autoAdvance}
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
                      seekToSecond(activeClip.startSeconds);
                      play();
                    }
                  }}
                  onSelectClip={handleSelectClip}
                  onToggleAutoAdvance={setAutoAdvance}
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
          onSelect={(item) => {
            setCurrentSynthesis(item);
            setQuery(item.query);
            setActiveClipId(item.clips.find((c) => c.enabled)?.id ?? item.clips[0]?.id ?? null);
            setAutoPlayOnClipChange(false);
          }}
          onDelete={handleDeleteHistory}
          onClose={() => setIsHistoryOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
