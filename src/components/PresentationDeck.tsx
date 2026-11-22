import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  MessageSquareQuote,
  Presentation,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatTime, type Translations } from '../i18n/translations';
import {
  downloadPresentationHtml,
  getClipRichText,
  openPresentationInNewTab,
} from '../services/presentationExporter';
import type { Language, SynthesisResult } from '../types';

interface PresentationDeckProps {
  synthesis: SynthesisResult;
  language: Language;
  t: Translations;
}

export function PresentationDeck({ synthesis, language, t }: PresentationDeckProps) {
  const clips = synthesis.clips.filter((c) => c.enabled);
  const totalSlides = clips.length + 2; // Cover + N Clips + Outro
  const [slideIdx, setSlideIdx] = useState(0);

  // Reset to Cover slide when switching to a different synthesis
  useEffect(() => {
    setSlideIdx(0);
  }, [synthesis.id]);

  // Clamp if clips were disabled
  useEffect(() => {
    if (slideIdx >= totalSlides) {
      setSlideIdx(Math.max(0, totalSlides - 1));
    }
  }, [slideIdx, totalSlides]);

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT')
      ) {
        return;
      }
      if (e.key === 'ArrowRight') {
        setSlideIdx((prev) => Math.min(totalSlides - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setSlideIdx((prev) => Math.max(0, prev - 1));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [totalSlides]);

  const totalSeconds = clips.reduce(
    (acc, c) => acc + Math.max(1, c.endSeconds - c.startSeconds),
    0
  );
  const uniqueCreators = Array.from(new Set(clips.map((c) => c.channelTitle)));

  const isCover = slideIdx === 0;
  const isOutro = slideIdx === totalSlides - 1;
  const currentClip = !isCover && !isOutro ? clips[slideIdx - 1] : null;

  return (
    <section className="presentation-shell" aria-label="HTML Slide Presentation">
      <div className="presentation-toolbar">
        <div className="presentation-toolbar-left">
          <Presentation size={17} style={{ color: 'var(--accent)' }} />
          <span className="mono-badge">
            {t.slideOf} {slideIdx + 1} / {totalSlides}
          </span>
        </div>

        <div className="presentation-toolbar-actions">
          <button
            type="button"
            id="open-html-presentation-btn"
            className="btn btn-ghost"
            onClick={() => openPresentationInNewTab(synthesis, language)}
          >
            <ExternalLink size={15} />
            <span>{t.openHtmlPage}</span>
          </button>
          <button
            type="button"
            id="download-html-presentation-btn"
            className="btn btn-primary"
            onClick={() => downloadPresentationHtml(synthesis, language)}
          >
            <Download size={15} />
            <span>{t.downloadHtml}</span>
          </button>
        </div>
      </div>

      <div className="presentation-stage">
        {isCover && (
          <div className="pres-cover-slide">
            <span className="doc-slide-chapter">{t.presentationCoverLabel}</span>
            <div className="doc-slide-divider" />
            <h2 className="pres-cover-title">{synthesis.synthesisTitle}</h2>
            <p className="pres-cover-summary">{synthesis.executiveSummary}</p>

            <div className="pres-badges-row">
              <span className="mono-badge">
                {clips.length} {t.clipsCount}
              </span>
              <span className="mono-badge">{formatTime(totalSeconds)}</span>
              {uniqueCreators.map((creator) => (
                <span key={creator} className="pres-creator-pill">
                  {creator}
                </span>
              ))}
            </div>

            {totalSlides > 1 && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setSlideIdx(1)}
              >
                <span>{t.nextSlide}</span>
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        )}

        {currentClip && (
          <div key={currentClip.id} className="pres-clip-slide">
            <div className="pres-video-col">
              <div className="pres-video-frame">
                <iframe
                  src={`https://www.youtube.com/embed/${encodeURIComponent(
                    currentClip.videoId
                  )}?start=${currentClip.startSeconds}&end=${currentClip.endSeconds}&rel=0&modestbranding=1`}
                  title={currentClip.clipTitle}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>

              <div className="pres-video-meta">
                <div className="pres-creator-block">
                  <span className="pres-creator-label">{t.sourceCreatorLabel}:</span>
                  <strong>{currentClip.channelTitle}</strong>
                </div>
                <span className="mono-badge">
                  {t.playSegmentHint}: {formatTime(currentClip.startSeconds)} –{' '}
                  {formatTime(currentClip.endSeconds)}
                </span>
                <a
                  href={`https://www.youtube.com/watch?v=${currentClip.videoId}&t=${currentClip.startSeconds}s`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pres-yt-link"
                >
                  <span>{t.watchOnYoutube}</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>

            <div className="pres-text-col">
              <span className="doc-slide-chapter">
                {t.chapterLabel} {String(slideIdx).padStart(2, '0')} /{' '}
                {String(clips.length).padStart(2, '0')}
              </span>

              <h3 className="pres-slide-heading">
                {currentClip.bridgeQuestion || currentClip.clipTitle}
              </h3>

              <p className="pres-rich-body">{getClipRichText(currentClip)}</p>

              {currentClip.transcriptExcerpt && (
                <div className="context-section">
                  <span className="context-section-label">
                    <MessageSquareQuote size={13} />
                    <span>{t.transcriptExcerpt}</span>
                  </span>
                  <blockquote className="transcript-quote">
                    {currentClip.transcriptExcerpt}
                  </blockquote>
                </div>
              )}

              {currentClip.keyTakeaways.length > 0 && (
                <div className="context-section">
                  <span className="context-section-label">
                    <CheckCircle2 size={13} />
                    <span>{t.keyTakeaways}</span>
                  </span>
                  <ul className="takeaways-list">
                    {currentClip.keyTakeaways.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {isOutro && (
          <div className="pres-outro-slide">
            <span className="doc-slide-chapter">{t.presentationOutroLabel}</span>
            <h3 className="pres-slide-heading">
              {synthesis.outroSlide?.headline || synthesis.synthesisTitle}
            </h3>
            {synthesis.outroSlide?.body && (
              <p className="pres-rich-body">{synthesis.outroSlide.body}</p>
            )}

            {synthesis.keyInsights.length > 0 && (
              <div className="pres-insights-grid">
                {synthesis.keyInsights.map((insight, i) => (
                  <div key={i} className="pres-insight-card">
                    <span className="pres-insight-num">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p>{insight}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="context-section" style={{ marginTop: '1.25rem' }}>
              <span className="context-section-label">{t.tabSources}</span>
              <div className="pres-sources-row">
                {synthesis.sourceVideos.map((v) => (
                  <a
                    key={v.videoId}
                    href={v.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pres-source-link"
                  >
                    <strong>{v.channelTitle}</strong> — {v.title}
                    <ExternalLink size={13} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="presentation-footer">
        <button
          type="button"
          className="btn btn-ghost"
          disabled={slideIdx === 0}
          onClick={() => setSlideIdx((prev) => Math.max(0, prev - 1))}
        >
          <ChevronLeft size={16} />
          <span>{t.prevSlide}</span>
        </button>

        <div className="pres-dots" role="tablist" aria-label="Slides">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button
              key={i}
              type="button"
              className={`pres-dot ${i === slideIdx ? 'active' : ''}`}
              onClick={() => setSlideIdx(i)}
              aria-label={`${t.slideOf} ${i + 1}`}
            />
          ))}
        </div>

        <button
          type="button"
          className="btn btn-primary"
          disabled={slideIdx === totalSlides - 1}
          onClick={() => setSlideIdx((prev) => Math.min(totalSlides - 1, prev + 1))}
        >
          <span>{t.nextSlide}</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </section>
  );
}
