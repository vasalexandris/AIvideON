import { Link2, Loader2, PlayCircle, Search, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import type { Translations } from '../i18n/translations';
import { extractYouTubeVideoId } from '../services/youtubeService';
import type { DiscoveryMode, PipelineStatus } from '../types';

interface PromptStudioProps {
  query: string;
  onChangeQuery: (q: string) => void;
  mode: DiscoveryMode;
  onChangeMode: (m: DiscoveryMode) => void;
  manualUrls: string[];
  onChangeManualUrls: (urls: string[]) => void;
  pipeline: PipelineStatus;
  compact: boolean;
  t: Translations;
  onSynthesize: () => void;
  onLoadDemo: () => void;
}

export function PromptStudio({
  query,
  onChangeQuery,
  mode,
  onChangeMode,
  manualUrls,
  onChangeManualUrls,
  pipeline,
  compact,
  t,
  onSynthesize,
  onLoadDemo,
}: PromptStudioProps) {
  const [urlInput, setUrlInput] = useState('');

  const isBusy =
    pipeline.stage === 'planning' ||
    pipeline.stage === 'searching' ||
    pipeline.stage === 'analyzing' ||
    pipeline.stage === 'synthesizing';

  const handleAddUrl = () => {
    const id = extractYouTubeVideoId(urlInput);
    if (!id) return;
    const normalized = `https://www.youtube.com/watch?v=${id}`;
    if (!manualUrls.includes(normalized)) {
      onChangeManualUrls([...manualUrls, normalized]);
    }
    setUrlInput('');
  };

  const handleRemoveUrl = (urlToRemove: string) => {
    onChangeManualUrls(manualUrls.filter((u) => u !== urlToRemove));
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'analyzing':
        return t.statusAnalyzing;
      case 'done':
        return t.statusDone;
      case 'skipped':
        return t.statusSkipped;
      case 'error':
        return t.statusError;
      default:
        return t.statusPending;
    }
  };

  return (
    <section className={`prompt-studio ${compact ? 'compact' : ''}`}>
      {!compact && (
        <div className="hero-header">
          <h1 className="hero-title">{t.heroTitle}</h1>
          <p className="hero-subtitle">{t.heroSubtitle}</p>
        </div>
      )}

      <div className="mode-tabs" role="tablist">
        <button
          type="button"
          id="mode-auto-btn"
          role="tab"
          aria-selected={mode === 'auto'}
          className={`mode-tab ${mode === 'auto' ? 'active' : ''}`}
          onClick={() => onChangeMode('auto')}
          disabled={isBusy}
        >
          <Search size={14} />
          <span>{t.modeAuto}</span>
        </button>
        <button
          type="button"
          id="mode-manual-btn"
          role="tab"
          aria-selected={mode === 'manual'}
          className={`mode-tab ${mode === 'manual' ? 'active' : ''}`}
          onClick={() => onChangeMode('manual')}
          disabled={isBusy}
        >
          <Link2 size={14} />
          <span>{t.modeManual}</span>
        </button>
      </div>

      <div className="query-box">
        <textarea
          id="query-input"
          className="query-textarea"
          value={query}
          onChange={(e) => onChangeQuery(e.target.value)}
          placeholder={t.queryPlaceholder}
          rows={compact ? 2 : 3}
          disabled={isBusy}
        />

        {mode === 'manual' && (
          <div className="manual-urls-section">
            <span className="manual-urls-label">{t.manualUrlsLabel}</span>
            <div className="manual-url-row">
              <input
                id="manual-url-input"
                type="text"
                className="input-field"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddUrl();
                  }
                }}
                placeholder={t.manualUrlsPlaceholder}
                disabled={isBusy}
              />
              <button
                type="button"
                id="add-url-btn"
                className="btn btn-ghost"
                onClick={handleAddUrl}
                disabled={isBusy || !extractYouTubeVideoId(urlInput)}
              >
                {t.addUrl}
              </button>
            </div>
            {manualUrls.length > 0 && (
              <div className="url-chips">
                {manualUrls.map((url) => {
                  const vid = extractYouTubeVideoId(url);
                  return (
                    <span key={url} className="url-chip">
                      <span>yt:{vid}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveUrl(url)}
                        aria-label="Remove URL"
                      >
                        <X size={13} />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="studio-footer">
        {!compact && (
          <div className="examples-row">
            <span className="examples-label">{t.examplesLabel}</span>
            {t.examples.map((ex) => (
              <button
                key={ex.label}
                type="button"
                className="example-chip"
                onClick={() => onChangeQuery(ex.query)}
                disabled={isBusy}
              >
                {ex.label}
              </button>
            ))}
          </div>
        )}

        <div className="studio-cta-group">
          <button
            type="button"
            id="try-demo-btn"
            className="btn btn-ghost"
            onClick={onLoadDemo}
            disabled={isBusy}
          >
            <PlayCircle size={16} />
            <span>{t.tryDemoBtn}</span>
          </button>

          <button
            type="button"
            id="synthesize-btn"
            className="btn btn-primary"
            onClick={onSynthesize}
            disabled={isBusy}
          >
            {isBusy ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
            <span>{isBusy ? t.synthesizingBtn : t.synthesizeBtn}</span>
          </button>
        </div>
      </div>

      {isBusy && (
        <div className="pipeline-card">
          <div className="pipeline-header">
            <Loader2 size={16} className="spin" style={{ color: 'var(--accent)' }} />
            <span>{pipeline.message}</span>
          </div>
          {pipeline.videoProgress.length > 0 && (
            <div className="video-progress-grid">
              {pipeline.videoProgress.map((vp) => (
                <div key={vp.videoId} className="video-progress-item">
                  <span className="video-progress-title" title={vp.title}>
                    {vp.title}
                  </span>
                  <span className={`progress-badge ${vp.status}`}>
                    {getStatusLabel(vp.status)}
                    {vp.clipsFound !== undefined && vp.status === 'done'
                      ? ` (${vp.clipsFound})`
                      : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {pipeline.stage === 'error' && pipeline.error && (
        <div className="error-banner" role="alert">
          <span>{pipeline.error}</span>
        </div>
      )}
    </section>
  );
}
