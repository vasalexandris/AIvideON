import { Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react';
import type { RefObject } from 'react';
import { formatTime, type Translations } from '../i18n/translations';
import type { SynthesizedClip } from '../types';

interface CompositePlayerProps {
  containerRef: RefObject<HTMLDivElement | null>;
  enabledClips: SynthesizedClip[];
  activeClipIndex: number;
  activeClip: SynthesizedClip | null;
  currentSeconds: number;
  isPlaying: boolean;
  autoAdvance: boolean;
  docSlidesEnabled: boolean;
  isShowingSlide: boolean;
  slidePaused: boolean;
  slideProgressPct: number;
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
  onToggleSlidePause: () => void;
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
  isShowingSlide,
  slidePaused,
  slideProgressPct,
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
  onToggleSlidePause,
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

        {isShowingSlide && activeClip && (
          <div className="doc-slide-overlay" role="region" aria-label="Chapter Transition">
            <div
              className="doc-slide-bg-thumb"
              style={{ backgroundImage: `url(${activeClip.thumbnailUrl})` }}
            />

            <div className="doc-slide-content">
              <span className="doc-slide-chapter">
                {t.chapterLabel} {String(activeClipIndex + 1).padStart(2, '0')} /{' '}
                {String(enabledClips.length).padStart(2, '0')}
              </span>

              <h3 className="doc-slide-question">
                {activeClip.bridgeQuestion || activeClip.clipTitle}
              </h3>

              {activeClip.bridgeText && (
                <p className="doc-slide-text">{activeClip.bridgeText}</p>
              )}

              <div className="doc-slide-upnext">
                <span>{t.upNextLabel}:</span>
                <strong style={{ color: 'var(--text-primary)' }}>
                  {activeClip.channelTitle}
                </strong>
                <span className="clip-range-mono">
                  {formatTime(activeClip.startSeconds)} – {formatTime(activeClip.endSeconds)}
                </span>
              </div>

              <div className="doc-slide-actions">
                <button
                  type="button"
                  id="slide-play-now-btn"
                  className="btn btn-primary"
                  onClick={onPlayNowFromSlide}
                >
                  <Play size={15} fill="currentColor" />
                  <span>{t.playNow}</span>
                </button>

                <button
                  type="button"
                  id="slide-pause-btn"
                  className="btn btn-ghost"
                  onClick={onToggleSlidePause}
                >
                  {slidePaused ? <Play size={14} /> : <Pause size={14} />}
                  <span>{slidePaused ? t.resumeSlide : t.pauseSlide}</span>
                </button>
              </div>
            </div>

            <div className="doc-slide-progress-track">
              <div
                className="doc-slide-progress-fill"
                style={{ width: `${Math.min(100, Math.max(0, slideProgressPct))}%` }}
              />
            </div>
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
