import { formatTime, translations } from '../i18n/translations';
import type { Language, SynthesisResult, SynthesizedClip } from '../types';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function getClipRichText(clip: SynthesizedClip): string {
  if (clip.detailedSummary && clip.detailedSummary.trim().length > 0) {
    return clip.detailedSummary.trim();
  }
  return clip.aiExplanation || clip.bridgeText || '';
}

export function generatePresentationHtml(
  synthesis: SynthesisResult,
  language: Language
): string {
  const t = translations[language];
  const clips = synthesis.clips.filter((c) => c.enabled);
  const totalSeconds = clips.reduce(
    (acc, c) => acc + Math.max(1, c.endSeconds - c.startSeconds),
    0
  );
  const uniqueCreators = Array.from(new Set(clips.map((c) => c.channelTitle)));
  const totalSlides = clips.length + 2; // Cover + N Clips + Outro

  const clipSlidesHtml = clips
    .map((clip, idx) => {
      const slideNum = idx + 2;
      const embedSrc = `https://www.youtube.com/embed/${encodeURIComponent(
        clip.videoId
      )}?start=${clip.startSeconds}&end=${clip.endSeconds}&rel=0&modestbranding=1`;
      const deepLink = `https://www.youtube.com/watch?v=${encodeURIComponent(
        clip.videoId
      )}&t=${clip.startSeconds}s`;
      const richText = getClipRichText(clip);
      const heading = clip.bridgeQuestion || clip.clipTitle;
      const takeawaysHtml =
        clip.keyTakeaways && clip.keyTakeaways.length > 0
          ? `<ul class="takeaways">${clip.keyTakeaways
              .map((tk) => `<li>${escapeHtml(tk)}</li>`)
              .join('')}</ul>`
          : '';

      return `
      <section class="slide clip-slide" data-slide="${slideNum - 1}">
        <div class="slide-grid">
          <div class="video-pane">
            <div class="video-frame">
              <iframe
                data-src="${embedSrc}"
                title="${escapeHtml(clip.clipTitle)}"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen
              ></iframe>
            </div>
            <div class="video-caption">
              <span class="badge">${escapeHtml(clip.channelTitle)}</span>
              <span class="mono">${formatTime(clip.startSeconds)} – ${formatTime(
        clip.endSeconds
      )}</span>
              <a class="yt-link" href="${deepLink}" target="_blank" rel="noopener noreferrer">${escapeHtml(
        t.watchOnYoutube
      )} ↗</a>
            </div>
          </div>
          <div class="text-pane">
            <div class="eyebrow">${escapeHtml(t.chapterLabel)} ${String(idx + 1).padStart(
        2,
        '0'
      )} / ${String(clips.length).padStart(2, '0')}</div>
            <h2 class="slide-heading">${escapeHtml(heading)}</h2>
            <p class="rich-text">${escapeHtml(richText)}</p>
            ${
              clip.transcriptExcerpt
                ? `<blockquote class="quote">${escapeHtml(clip.transcriptExcerpt)}</blockquote>`
                : ''
            }
            ${
              takeawaysHtml
                ? `<div class="section-label">${escapeHtml(t.keyTakeaways)}</div>${takeawaysHtml}`
                : ''
            }
          </div>
        </div>
      </section>`;
    })
    .join('\n');

  const insightsHtml = synthesis.keyInsights
    .map(
      (ins, idx) =>
        `<div class="insight-card"><span class="insight-num">${String(idx + 1).padStart(
          2,
          '0'
        )}</span><p>${escapeHtml(ins)}</p></div>`
    )
    .join('');

  const sourcesHtml = synthesis.sourceVideos
    .map(
      (v) =>
        `<a class="source-pill" href="${escapeHtml(
          v.url
        )}" target="_blank" rel="noopener noreferrer"><strong>${escapeHtml(
          v.channelTitle
        )}</strong> — ${escapeHtml(v.title)} ↗</a>`
    )
    .join('');

  return `<!doctype html>
<html lang="${language}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(synthesis.synthesisTitle)} — AIvideON</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>
    :root {
      --bg: #090b0f;
      --surface: #12161e;
      --elevated: #1a1f2b;
      --border: rgba(255, 255, 255, 0.09);
      --text: #f4f5f7;
      --muted: #9ca3af;
      --accent: #f97316;
      --accent-soft: rgba(249, 115, 22, 0.14);
      --accent-text: #fdba74;
    }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: var(--bg);
      color: var(--text);
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      min-height: 100vh;
    }
    .deck-shell {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .deck-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.9rem 1.75rem;
      border-bottom: 1px solid var(--border);
      background: rgba(9, 11, 15, 0.9);
      backdrop-filter: blur(12px);
      position: sticky;
      top: 0;
      z-index: 20;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .brand-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--accent);
    }
    .slide-counter {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      color: var(--muted);
    }
    .deck-stage {
      flex: 1;
      max-width: 1320px;
      width: 100%;
      margin: 0 auto;
      padding: 2rem 1.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .slide {
      display: none;
      width: 100%;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: clamp(1.5rem, 3.5vw, 3rem);
      animation: fadeSlide 0.35s ease;
    }
    .slide.active { display: block; }
    @keyframes fadeSlide {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .cover-slide {
      text-align: center;
      padding: clamp(2.5rem, 6vw, 4.5rem) clamp(1.5rem, 4vw, 3.5rem);
      background: radial-gradient(circle at 50% 20%, #19202d 0%, var(--surface) 75%);
    }
    .eyebrow {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.74rem;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--accent-text);
      margin-bottom: 0.85rem;
    }
    .cover-title {
      margin: 0 auto 1.1rem;
      max-width: 820px;
      font-size: clamp(1.8rem, 4vw, 2.85rem);
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1.16;
    }
    .cover-summary {
      margin: 0 auto 1.75rem;
      max-width: 720px;
      color: #cbd5e1;
      font-size: 1.05rem;
      line-height: 1.7;
    }
    .meta-row {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.65rem;
      margin-bottom: 2rem;
    }
    .badge {
      background: var(--accent-soft);
      color: var(--accent-text);
      border: 1px solid rgba(249, 115, 22, 0.28);
      border-radius: 999px;
      padding: 0.28rem 0.75rem;
      font-size: 0.78rem;
      font-weight: 600;
    }
    .mono {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.78rem;
      color: var(--muted);
    }
    .slide-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
      gap: 2rem;
      align-items: start;
    }
    @media (max-width: 920px) {
      .slide-grid { grid-template-columns: 1fr; }
    }
    .video-frame {
      position: relative;
      width: 100%;
      aspect-ratio: 16 / 9;
      background: #000;
      border-radius: 14px;
      overflow: hidden;
      border: 1px solid var(--border);
    }
    .video-frame iframe {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      border: 0;
    }
    .video-caption {
      margin-top: 0.85rem;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.75rem;
    }
    .yt-link {
      margin-left: auto;
      font-size: 0.8rem;
      color: var(--accent-text);
      text-decoration: none;
    }
    .yt-link:hover { text-decoration: underline; }
    .slide-heading {
      margin: 0 0 1rem;
      font-size: clamp(1.35rem, 2.5vw, 1.85rem);
      font-weight: 800;
      letter-spacing: -0.02em;
      line-height: 1.25;
    }
    .rich-text {
      margin: 0 0 1.15rem;
      font-size: 0.98rem;
      line-height: 1.72;
      color: #e2e8f0;
    }
    .quote {
      margin: 0 0 1.15rem;
      padding: 0.75rem 1rem;
      background: rgba(255, 255, 255, 0.03);
      border-left: 3px solid var(--accent);
      border-radius: 0 8px 8px 0;
      color: var(--muted);
      font-style: italic;
      font-size: 0.88rem;
      line-height: 1.6;
    }
    .section-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.72rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--accent-text);
      margin-bottom: 0.5rem;
    }
    .takeaways {
      margin: 0;
      padding-left: 1.15rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      font-size: 0.9rem;
      color: #cbd5e1;
      line-height: 1.55;
    }
    .insights-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1rem;
      margin: 1.5rem 0 2rem;
    }
    .insight-card {
      background: var(--elevated);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1rem 1.15rem;
    }
    .insight-card p {
      margin: 0.45rem 0 0;
      font-size: 0.92rem;
      line-height: 1.6;
      color: #e2e8f0;
    }
    .insight-num {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.74rem;
      color: var(--accent-text);
      font-weight: 600;
    }
    .sources-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 0.6rem;
      margin-top: 0.75rem;
    }
    .source-pill {
      display: inline-block;
      background: var(--elevated);
      border: 1px solid var(--border);
      color: var(--muted);
      border-radius: 10px;
      padding: 0.5rem 0.85rem;
      font-size: 0.8rem;
      text-decoration: none;
    }
    .source-pill strong { color: var(--text); }
    .source-pill:hover { border-color: var(--accent); color: var(--text); }
    .deck-footer {
      border-top: 1px solid var(--border);
      padding: 0.9rem 1.75rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      background: rgba(9, 11, 15, 0.92);
    }
    .nav-btn {
      background: var(--elevated);
      color: var(--text);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 0.55rem 1.05rem;
      font-weight: 600;
      font-size: 0.86rem;
      cursor: pointer;
    }
    .nav-btn.primary {
      background: var(--accent);
      color: #090b0f;
      border-color: transparent;
    }
    .nav-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .dots { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; }
    .dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.18);
      border: 0;
      cursor: pointer;
      padding: 0;
    }
    .dot.active { width: 24px; border-radius: 999px; background: var(--accent); }
  </style>
</head>
<body>
  <div class="deck-shell">
    <header class="deck-header">
      <div class="brand"><span class="brand-dot"></span><span>AIvideON</span></div>
      <div class="slide-counter" id="counter">1 / ${totalSlides}</div>
    </header>

    <main class="deck-stage">
      <section class="slide cover-slide active" data-slide="0">
        <div class="eyebrow">${escapeHtml(t.presentationCoverLabel)}</div>
        <h1 class="cover-title">${escapeHtml(synthesis.synthesisTitle)}</h1>
        <p class="cover-summary">${escapeHtml(synthesis.executiveSummary)}</p>
        <div class="meta-row">
          <span class="badge">${clips.length} ${escapeHtml(t.clipsCount)}</span>
          <span class="badge">${formatTime(totalSeconds)}</span>
          ${uniqueCreators
            .map((c) => `<span class="badge">${escapeHtml(c)}</span>`)
            .join('')}
        </div>
        <button class="nav-btn primary" onclick="goTo(1)">${escapeHtml(t.nextSlide)} →</button>
      </section>

      ${clipSlidesHtml}

      <section class="slide" data-slide="${totalSlides - 1}">
        <div class="eyebrow">${escapeHtml(t.presentationOutroLabel)}</div>
        <h2 class="slide-heading">${escapeHtml(
          synthesis.outroSlide?.headline || synthesis.synthesisTitle
        )}</h2>
        ${
          synthesis.outroSlide?.body
            ? `<p class="rich-text">${escapeHtml(synthesis.outroSlide.body)}</p>`
            : ''
        }
        <div class="insights-grid">${insightsHtml}</div>
        <div class="section-label">${escapeHtml(t.tabSources)}</div>
        <div class="sources-wrap">${sourcesHtml}</div>
      </section>
    </main>

    <footer class="deck-footer">
      <button class="nav-btn" id="prevBtn" onclick="goTo(current - 1)">← ${escapeHtml(
        t.prevSlide
      )}</button>
      <div class="dots" id="dots"></div>
      <button class="nav-btn primary" id="nextBtn" onclick="goTo(current + 1)">${escapeHtml(
        t.nextSlide
      )} →</button>
    </footer>
  </div>

  <script>
    const slides = Array.from(document.querySelectorAll('.slide'));
    const counter = document.getElementById('counter');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dotsEl = document.getElementById('dots');
    let current = 0;

    slides.forEach((_, i) => {
      const b = document.createElement('button');
      b.className = 'dot' + (i === 0 ? ' active' : '');
      b.onclick = () => goTo(i);
      dotsEl.appendChild(b);
    });

    function goTo(index) {
      if (index < 0 || index >= slides.length) return;
      const prevIframe = slides[current].querySelector('iframe');
      if (prevIframe) prevIframe.src = '';
      slides[current].classList.remove('active');
      dotsEl.children[current].classList.remove('active');

      current = index;
      slides[current].classList.add('active');
      dotsEl.children[current].classList.add('active');

      const nextIframe = slides[current].querySelector('iframe');
      if (nextIframe && nextIframe.dataset.src) {
        nextIframe.src = nextIframe.dataset.src;
      }

      counter.textContent = (current + 1) + ' / ' + slides.length;
      prevBtn.disabled = current === 0;
      nextBtn.disabled = current === slides.length - 1;
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { goTo(current + 1); }
      if (e.key === 'ArrowLeft') { goTo(current - 1); }
    });

    prevBtn.disabled = true;
  </script>
</body>
</html>`;
}

export function openPresentationInNewTab(
  synthesis: SynthesisResult,
  language: Language
): void {
  const html = generatePresentationHtml(synthesis, language);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export function downloadPresentationHtml(
  synthesis: SynthesisResult,
  language: Language
): void {
  const html = generatePresentationHtml(synthesis, language);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const slug = synthesis.synthesisTitle
    .toLowerCase()
    .replace(/[^a-z0-9\u0370-\u03ff]+/gi, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
  a.href = url;
  a.download = `AIvideON-${slug || 'presentation'}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => URL.revokeObjectURL(url), 10000);
}
