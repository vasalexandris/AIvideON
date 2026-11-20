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
  playbackRate: number;
  t: Translations;
  onTogglePlay: () => void;
  onPrevClip: () => void;
  onNextClip: () => void;
  onReplayClip: () => void;
  onSelectClip: (index: number, seekOffset?: number) => void;
  onToggleAutoAdvance: (next: boolean) => void;
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
  playbackRate,
  t,
  onTogglePlay,
  onPrevClip,
  onNextClip,
  onReplayClip,
  onSelectClip,
  onToggleAutoAdvance,
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
              onClick={onTogglePlay}
              disabled={!activeClip}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
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
