import { Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react';
import type { RefObject } from 'react';
import { formatTime, type Translations } from '../i18n/translations';
import type { DocumentarySlide, SynthesizedClip } from '../types';

export type SlidePhase = 'visible' | 'fading-between' | 'fading-out';

interface CompositePlayerProps {
  containerRef: RefObject<HTMLDivElement | null>;
  enabledClips: SynthesizedClip[];
  activeClipIndex: number;
  activeClip: SynthesizedClip | null;
  currentSeconds: number;
  isPlaying: boolean;
  autoAdvance: boolean;
  docSlidesEnabled: boolean;
  activeSlide: DocumentarySlide | null;
  slideIndex: number;
  slideCount: number;
  slidePhase: SlidePhase;
  slideProgressPct: number;
  isFadingOut: boolean;
  featuredCreators: string[];
  playbackRate: number;
  t: Translations;
  onTogglePlay: () => void;
  onPrevClip: () => void;
  onNextClip: () => void;
  onReplayClip: () => void;
  onSelectClip: (index: number, seekOffset?: number) => void;
  onToggleAutoAdvance: (next: boolean) => void;
  onToggleDocSlides: (next: boolean) => void;
  onPlayNowFromSlide: () => void;
  onChangePlaybackRate: (rate: number) => void;
}

export function CompositePlayer({
  containerRef,
  enabledClips,
  activeClipIndex,
  activeClip,
  currentSeconds,
  isPlaying,
  autoAdvance,
  docSlidesEnabled,
  activeSlide,
  slideIndex,
  slideCount,
  slidePhase,
  slideProgressPct,
  isFadingOut,
  featuredCreators,
  playbackRate,
  t,
  onTogglePlay,
  onPrevClip,
  onNextClip,
  onReplayClip,
  onSelectClip,
  onToggleAutoAdvance,
  onToggleDocSlides,
  onPlayNowFromSlide,
  onChangePlaybackRate,
}: CompositePlayerProps) {
  const totalCompositeSeconds = enabledClips.reduce(
    (acc, c) => acc + Math.max(1, c.endSeconds - c.startSeconds),
    0
  );

  const elapsedBeforeActive = enabledClips
    .slice(0, Math.max(0, activeClipIndex))
    .reduce((acc, c) => acc + Math.max(1, c.endSeconds - c.startSeconds), 0);

  const activeClipDuration = activeClip
    ? Math.max(1, activeClip.endSeconds - activeClip.startSeconds)
    : 1;

  const activeClipElapsed = activeClip
    ? Math.max(0, Math.min(activeClipDuration, currentSeconds - activeClip.startSeconds))
    : 0;

  const compositeElapsed = elapsedBeforeActive + activeClipElapsed;

  const isShowingSlide = Boolean(activeSlide);
  const slideEyebrow =
    activeSlide?.eyebrow ||
    (activeSlide?.kind === 'outro'
      ? ''
      : `${t.chapterLabel} ${String(activeClipIndex + 1).padStart(2, '0')} / ${String(
          enabledClips.length
        ).padStart(2, '0')}`);

  return (
    <div className="player-card">
      <div className="player-topbar">
        <div className="player-now-playing">
          {activeClip ? (
            <>
              <span className="mono-badge">
                {t.clipOf} {activeClipIndex + 1}/{enabledClips.length}
              </span>
              <span className="player-now-playing-text" title={activeClip.videoTitle}>
                {activeClip.channelTitle} — {activeClip.videoTitle}
              </span>
            </>
          ) : (
            <span className="player-now-playing-text">{t.noActiveClips}</span>
          )}
        </div>
        {activeClip && (
          <span className="mono-badge">
            {formatTime(activeClip.startSeconds)} – {formatTime(activeClip.endSeconds)}
          </span>
        )}
      </div>

      <div className="player-viewport">
        <div ref={containerRef} />
        <div className={`player-fade-curtain ${isFadingOut ? 'active' : ''}`} />

        {activeSlide && (
          <div
            className={`doc-slide-overlay kind-${activeSlide.kind} ${
              slidePhase === 'fading-out' ? 'leaving' : ''
            }`}
            role="region"
            aria-label="Documentary Narrative Slide"
          >
            {activeClip && (
              <div
                className="doc-slide-bg-thumb"
                style={{ backgroundImage: `url(${activeClip.thumbnailUrl})` }}
              />
            )}
            <div className="doc-slide-vignette" />

            <div
              key={`${activeClip?.id || 'outro'}-${slideIndex}-${activeSlide.headline}`}
              className={`doc-slide-content ${
                slidePhase === 'fading-between' ? 'fading-between' : ''
              }`}
            >
              {slideEyebrow && <span className="doc-slide-chapter">{slideEyebrow}</span>}

              <div className="doc-slide-divider" />

              <h3 className="doc-slide-question">{activeSlide.headline}</h3>

              {activeSlide.body && <p className="doc-slide-text">{activeSlide.body}</p>}

              {activeSlide.kind === 'outro' && featuredCreators.length > 0 && (
                <div className="doc-slide-credits">
                  AIvideON · {featuredCreators.join(' · ')}
                </div>
              )}
            </div>

            {slideCount > 1 && (
              <div className="doc-slide-dots" aria-hidden="true">
                {Array.from({ length: slideCount }).map((_, idx) => (
                  <span
                    key={idx}
                    className={`doc-slide-dot ${idx === slideIndex ? 'active' : ''}`}
                  />
                ))}
              </div>
            )}

            {activeSlide.kind !== 'outro' && (
              <div className="doc-slide-progress-track">
                <div
                  className="doc-slide-progress-fill"
                  style={{ width: `${Math.min(100, Math.max(0, slideProgressPct))}%` }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="composite-controls">
        {/* Segmented Composite Timeline */}
        <div className="timeline-wrapper">
          <div className="timeline-segments" role="group" aria-label="Composite Timeline">
            {enabledClips.map((clip, idx) => {
              const dur = Math.max(1, clip.endSeconds - clip.startSeconds);
              const flexGrow = dur;
              const isCompleted = idx < activeClipIndex;
              const isActive = idx === activeClipIndex;
              const fillPct = isActive
                ? Math.min(100, Math.max(0, (activeClipElapsed / dur) * 100))
                : isCompleted
                ? 100
                : 0;

              return (
                <div
                  key={clip.id}
                  className={`timeline-segment ${isActive ? 'active' : ''} ${
                    isCompleted ? 'completed' : ''
                  }`}
                  style={{ flexGrow }}
                  title={`${clip.clipTitle} (${formatTime(clip.startSeconds)}–${formatTime(
                    clip.endSeconds
                  )})`}
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                    onSelectClip(idx, Math.floor(ratio * dur));
                  }}
                >
                  <div className="timeline-segment-fill" style={{ width: `${fillPct}%` }} />
                </div>
              );
            })}
          </div>

          <div className="timeline-time-row">
            <span>{formatTime(compositeElapsed)}</span>
            <span>{formatTime(totalCompositeSeconds)}</span>
          </div>
        </div>

        {/* Transport Controls */}
        <div className="transport-row">
          <div className="transport-buttons">
            <button
              type="button"
              id="prev-clip-btn"
              className="icon-btn"
              onClick={onPrevClip}
              disabled={activeClipIndex <= 0}
              title={t.prevClip}
            >
              <SkipBack size={15} />
              <span>{t.prevClip}</span>
            </button>

            <button
              type="button"
              id="play-pause-btn"
              className="icon-btn primary-play"
              onClick={isShowingSlide ? onPlayNowFromSlide : onTogglePlay}
              disabled={!activeClip}
            >
              {isPlaying && !isShowingSlide ? (
                <Pause size={16} />
              ) : (
                <Play size={16} fill="currentColor" />
              )}
            </button>

            <button
              type="button"
              id="next-clip-btn"
              className="icon-btn"
              onClick={onNextClip}
              disabled={activeClipIndex >= enabledClips.length - 1}
              title={t.nextClip}
            >
              <span>{t.nextClip}</span>
              <SkipForward size={15} />
            </button>

            <button
              type="button"
              id="replay-clip-btn"
              className="icon-btn"
              onClick={onReplayClip}
              disabled={!activeClip}
              title={t.replayClip}
            >
              <RotateCcw size={15} />
            </button>
          </div>

          <div className="transport-options">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={docSlidesEnabled}
                onChange={(e) => onToggleDocSlides(e.target.checked)}
              />
              <span>{t.docSlides}</span>
            </label>

            <label className="toggle-label">
              <input
                type="checkbox"
                checked={autoAdvance}
                onChange={(e) => onToggleAutoAdvance(e.target.checked)}
              />
              <span>{t.autoAdvance}</span>
            </label>

            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>{t.speed}</span>
              <select
                className="speed-select"
                value={playbackRate}
                onChange={(e) => onChangePlaybackRate(Number(e.target.value))}
              >
                <option value={1}>1x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
