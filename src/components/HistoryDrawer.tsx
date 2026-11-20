import { Trash2, X } from 'lucide-react';
import type { Translations } from '../i18n/translations';
import type { SynthesisResult } from '../types';

interface HistoryDrawerProps {
  items: SynthesisResult[];
  t: Translations;
  onSelect: (item: SynthesisResult) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function HistoryDrawer({
  items,
  t,
  onSelect,
  onDelete,
  onClose,
}: HistoryDrawerProps) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2 className="modal-title">{t.historyTitle}</h2>
          <button type="button" className="mini-icon-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {items.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.5rem 0' }}>
            {t.historyEmpty}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {items.map((item) => (
              <div
                key={item.id}
                className="source-item"
                style={{ justifyContent: 'space-between' }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.synthesisTitle}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {item.clips.length} {t.clipsCount} ·{' '}
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                    onClick={() => {
                      onSelect(item);
                      onClose();
                    }}
                  >
                    {t.loadSynthesis}
                  </button>
                  <button
                    type="button"
                    className="mini-icon-btn"
                    onClick={() => onDelete(item.id)}
                    aria-label={t.deleteSynthesis}
                    title={t.deleteSynthesis}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
