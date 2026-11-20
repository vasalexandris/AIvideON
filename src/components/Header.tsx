import { History, Play, Settings } from 'lucide-react';
import type { Translations } from '../i18n/translations';
import type { Language } from '../types';

interface HeaderProps {
  language: Language;
  onChangeLanguage: (lang: Language) => void;
  t: Translations;
  hasGeminiKey: boolean;
  historyCount: number;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onResetHome: () => void;
}

export function Header({
  language,
  onChangeLanguage,
  t,
  hasGeminiKey,
  historyCount,
  onOpenHistory,
  onOpenSettings,
  onResetHome,
}: HeaderProps) {
  return (
    <header className="top-header">
      <div className="header-inner">
        <div
          className="brand"
          onClick={onResetHome}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onResetHome()}
        >
          <div className="brand-mark" aria-hidden="true">
            <Play size={18} fill="currentColor" />
          </div>
          <div className="brand-text">
            <span className="brand-name">AIvideON</span>
            <span className="brand-tagline">{t.brandTagline}</span>
          </div>
        </div>

        <div className="header-actions">
          <div className="lang-toggle" role="group" aria-label="Language">
            <button
              type="button"
              id="lang-el-btn"
              className={`lang-btn ${language === 'el' ? 'active' : ''}`}
              onClick={() => onChangeLanguage('el')}
            >
              ΕΛ
            </button>
            <button
              type="button"
              id="lang-en-btn"
              className={`lang-btn ${language === 'en' ? 'active' : ''}`}
              onClick={() => onChangeLanguage('en')}
            >
              EN
            </button>
          </div>

          <button
            type="button"
            id="open-history-btn"
            className="btn btn-ghost"
            onClick={onOpenHistory}
          >
            <History size={16} />
            <span>
              {t.history}
              {historyCount > 0 ? ` (${historyCount})` : ''}
            </span>
          </button>

          <button
            type="button"
            id="open-settings-btn"
            className="btn btn-ghost"
            onClick={onOpenSettings}
          >
            <span className={`status-dot ${hasGeminiKey ? 'ready' : 'missing'}`} />
            <Settings size={16} />
            <span>{hasGeminiKey ? t.keysReady : t.keysMissing}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
