import { CheckCircle2, ExternalLink, MessageSquareQuote, Sparkles } from 'lucide-react';
import { formatTime, type Translations } from '../i18n/translations';
import type { SynthesizedClip } from '../types';

interface ClipContextCardProps {
  clip: SynthesizedClip | null;
  t: Translations;
}

export function ClipContextCard({ clip, t }: ClipContextCardProps) {
  if (!clip) {
    return (
      <div className="context-card">
        <p className="context-text" style={{ color: 'var(--text-secondary)' }}>
          {t.noActiveClips}
        </p>
      </div>
    );
  }

  const deepLink = `https://www.youtube.com/watch?v=${clip.videoId}&t=${clip.startSeconds}s`;

  return (
    <div className="context-card">
      <div className="context-card-header">
        <div>
          <h3 className="context-clip-title">{clip.clipTitle}</h3>
          <div className="context-channel">
            {clip.channelTitle} · {clip.videoTitle} ·{' '}
            <span className="clip-range-mono">
              {formatTime(clip.startSeconds)} – {formatTime(clip.endSeconds)}
            </span>
          </div>
        </div>

        <a
          href={deepLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost"
          style={{ padding: '0.38rem 0.7rem', fontSize: '0.78rem' }}
        >
          <ExternalLink size={14} />
          <span>{t.watchOnYoutube}</span>
        </a>
      </div>

      <div className="context-section">
        <span className="context-section-label">
          <Sparkles size={13} />
          <span>{t.whyThisClip}</span>
        </span>
        <p className="context-text">{clip.aiExplanation}</p>
      </div>

      {clip.transcriptExcerpt && (
        <div className="context-section">
          <span className="context-section-label">
            <MessageSquareQuote size={13} />
            <span>{t.transcriptExcerpt}</span>
          </span>
          <blockquote className="transcript-quote">{clip.transcriptExcerpt}</blockquote>
        </div>
      )}

      {clip.keyTakeaways.length > 0 && (
        <div className="context-section">
          <span className="context-section-label">
            <CheckCircle2 size={13} />
            <span>{t.keyTakeaways}</span>
          </span>
          <ul className="takeaways-list">
            {clip.keyTakeaways.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
