import { X } from 'lucide-react';
import { useState } from 'react';
import type { Translations } from '../i18n/translations';
import type { AppSettings } from '../types';

interface SettingsModalProps {
  settings: AppSettings;
  t: Translations;
  onSave: (next: AppSettings) => void;
  onClose: () => void;
}

const GEMINI_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash-lite',
  'gemini-3-flash-preview',
  'gemini-2.5-flash',
  'gemini-2.5-pro',
];

export function SettingsModal({ settings, t, onSave, onClose }: SettingsModalProps) {
  const [form, setForm] = useState<AppSettings>({ ...settings });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{t.settingsTitle}</h2>
            <p className="modal-subtitle">{t.settingsSubtitle}</p>
          </div>
          <button
            type="button"
            className="mini-icon-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="gemini-key-input">
              {t.geminiKeyLabel}
            </label>
            <input
              id="gemini-key-input"
              type="password"
              className="input-field"
              value={form.geminiApiKey}
              onChange={(e) => setForm({ ...form, geminiApiKey: e.target.value })}
              placeholder="AIza..."
              autoComplete="off"
            />
            <span className="form-hint">{t.geminiKeyHint}</span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="youtube-key-input">
              {t.youtubeKeyLabel}
            </label>
            <input
              id="youtube-key-input"
              type="password"
              className="input-field"
              value={form.youtubeApiKey}
              onChange={(e) => setForm({ ...form, youtubeApiKey: e.target.value })}
              placeholder="AIza..."
              autoComplete="off"
            />
            <span className="form-hint">{t.youtubeKeyHint}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="gemini-model-select">
                {t.modelLabel}
              </label>
              <select
                id="gemini-model-select"
                className="input-field"
                value={form.geminiModel}
                onChange={(e) => setForm({ ...form, geminiModel: e.target.value })}
              >
                {GEMINI_MODELS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="max-videos-select">
                {t.maxVideosLabel}
              </label>
              <select
                id="max-videos-select"
                className="input-field"
                value={form.maxVideosToAnalyze}
                onChange={(e) =>
                  setForm({ ...form, maxVideosToAnalyze: Number(e.target.value) })
                }
              >
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
                <option value={6}>6</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              {t.cancel}
            </button>
            <button type="submit" id="save-settings-btn" className="btn btn-primary">
              {t.saveSettings}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
