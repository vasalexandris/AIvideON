import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  CheckSquare,
  ExternalLink,
  Film,
  ListVideo,
  Square,
} from 'lucide-react';
import { useState } from 'react';
import { formatTime, type Translations } from '../i18n/translations';
import type { SynthesisResult } from '../types';

interface SynthesisSidebarProps {
  synthesis: SynthesisResult;
  activeClipId: string | null;
  t: Translations;
  onSelectClipById: (clipId: string) => void;
  onToggleClipEnabled: (clipId: string) => void;
  onMoveClip: (clipId: string, direction: 'up' | 'down') => void;
}

type SidebarTab = 'storyboard' | 'guide' | 'sources';

export function SynthesisSidebar({
  synthesis,
  activeClipId,
  t,
  onSelectClipById,
  onToggleClipEnabled,
  onMoveClip,
}: SynthesisSidebarProps) {
  const [tab, setTab] = useState<SidebarTab>('storyboard');

  return (
    <aside className="sidebar-card">
      <div className="sidebar-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'storyboard'}
          className={`sidebar-tab ${tab === 'storyboard' ? 'active' : ''}`}
          onClick={() => setTab('storyboard')}
        >
          <ListVideo size={14} />
          <span>{t.tabStoryboard}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={tab === 'guide'}
          className={`sidebar-tab ${tab === 'guide' ? 'active' : ''}`}
          onClick={() => setTab('guide')}
        >
          <BookOpen size={14} />
          <span>{t.tabGuide}</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={tab === 'sources'}
          className={`sidebar-tab ${tab === 'sources' ? 'active' : ''}`}
          onClick={() => setTab('sources')}
        >
          <Film size={14} />
          <span>{t.tabSources}</span>
        </button>
      </div>

      <div className="sidebar-body">
        {tab === 'storyboard' &&
          synthesis.clips.map((clip, idx) => {
            const isActive = clip.id === activeClipId;
            const dur = Math.max(1, clip.endSeconds - clip.startSeconds);

            return (
              <div
                key={clip.id}
                className={`clip-item ${isActive ? 'active' : ''} ${
                  !clip.enabled ? 'disabled' : ''
                }`}
                onClick={() => {
                  if (clip.enabled) onSelectClipById(clip.id);
                }}
              >
                <div className="clip-thumb-wrap">
                  <img src={clip.thumbnailUrl} alt={clip.clipTitle} loading="lazy" />
                  <span className="clip-duration-badge">{formatTime(dur)}</span>
                </div>

                <div className="clip-info">
                  <div className="clip-title">{clip.clipTitle}</div>
                  <div className="clip-meta-row">
                    <span
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {clip.channelTitle}
                    </span>
                    <span className="clip-range-mono">
                      {formatTime(clip.startSeconds)}–{formatTime(clip.endSeconds)}
                    </span>
                  </div>
                </div>

                <div
                  className="clip-actions-col"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="mini-icon-btn"
                    title={clip.enabled ? t.disableClip : t.enableClip}
                    onClick={() => onToggleClipEnabled(clip.id)}
                  >
                    {clip.enabled ? (
                      <CheckSquare size={15} style={{ color: 'var(--accent)' }} />
                    ) : (
                      <Square size={15} />
                    )}
                  </button>

                  <div style={{ display: 'flex', gap: '2px' }}>
                    <button
                      type="button"
                      className="mini-icon-btn"
                      disabled={idx === 0}
                      title={t.moveUp}
                      onClick={() => onMoveClip(clip.id, 'up')}
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      type="button"
                      className="mini-icon-btn"
                      disabled={idx === synthesis.clips.length - 1}
                      title={t.moveDown}
                      onClick={() => onMoveClip(clip.id, 'down')}
                    >
                      <ArrowDown size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

        {tab === 'guide' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', padding: '0.25rem' }}>
            <div className="context-section">
              <span className="context-section-label">{t.executiveSummary}</span>
              <p className="context-text">{synthesis.executiveSummary}</p>
            </div>

            {synthesis.keyInsights.length > 0 && (
              <div className="context-section">
                <span className="context-section-label">{t.keyInsights}</span>
                <ul className="takeaways-list">
                  {synthesis.keyInsights.map((insight, i) => (
                    <li key={i}>{insight}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {tab === 'sources' &&
          synthesis.sourceVideos.map((video) => (
            <div key={video.videoId} className="source-item">
              <div className="clip-thumb-wrap" style={{ width: '84px', height: '48px' }}>
                <img src={video.thumbnailUrl} alt={video.title} loading="lazy" />
                {video.durationSeconds ? (
                  <span className="clip-duration-badge">
                    {formatTime(video.durationSeconds)}
                  </span>
                ) : null}
              </div>

              <div className="clip-info">
                <div className="clip-title">{video.title}</div>
                <div className="clip-meta-row">
                  <span>{video.channelTitle}</span>
                </div>
              </div>

              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mini-icon-btn"
                title={t.watchOnYoutube}
              >
                <ExternalLink size={16} />
              </a>
            </div>
          ))}
      </div>
    </aside>
  );
}
