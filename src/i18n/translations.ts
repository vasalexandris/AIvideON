import type { Language } from '../types';

export interface Translations {
  brandTagline: string;
  history: string;
  settings: string;
  keysReady: string;
  keysMissing: string;
  heroTitle: string;
  heroSubtitle: string;
  modeAuto: string;
  modeManual: string;
  queryPlaceholder: string;
  manualUrlsLabel: string;
  manualUrlsPlaceholder: string;
  addUrl: string;
  synthesizeBtn: string;
  synthesizingBtn: string;
  tryDemoBtn: string;
  examplesLabel: string;
  examples: { label: string; query: string }[];
  pipelinePlanning: string;
  pipelineSearching: string;
  pipelineAnalyzing: string;
  pipelineSynthesizing: string;
  clipOf: string;
  synthesizedFrom: string;
  ofOriginalVideo: string;
  autoAdvance: string;
  replayClip: string;
  prevClip: string;
  nextClip: string;
  speed: string;
  whyThisClip: string;
  transcriptExcerpt: string;
  keyTakeaways: string;
  watchOnYoutube: string;
  tabStoryboard: string;
  tabGuide: string;
  tabSources: string;
  executiveSummary: string;
  keyInsights: string;
  enableClip: string;
  disableClip: string;
  noActiveClips: string;
  demoBadge: string;
  settingsTitle: string;
  settingsSubtitle: string;
  geminiKeyLabel: string;
  geminiKeyHint: string;
  youtubeKeyLabel: string;
  youtubeKeyHint: string;
  modelLabel: string;
  maxVideosLabel: string;
  saveSettings: string;
  cancel: string;
  historyTitle: string;
  historyEmpty: string;
  loadSynthesis: string;
  deleteSynthesis: string;
  clipsCount: string;
  errorNoGeminiKey: string;
  errorNoYoutubeKey: string;
  errorNoUrls: string;
  errorNoQuery: string;
  newSynthesis: string;
  moveUp: string;
  moveDown: string;
  statusPending: string;
  statusAnalyzing: string;
  statusDone: string;
  statusSkipped: string;
  statusError: string;
}

export const translations: Record<Language, Translations> = {
  el: {
    brandTagline: 'AI Συνθετικό Στούντιο Βίντεο',
    history: 'Ιστορικό',
    settings: 'Ρυθμίσεις API',
    keysReady: 'API Έτοιμο',
    keysMissing: 'Απαιτείται API Key',
    heroTitle: 'Μάθε από 10 βίντεο στον χρόνο του ενός.',
    heroSubtitle:
      'Πες στο AIvideON τι θέλεις να μάθεις. Το Gemini AI αναλύει βίντεο του YouTube, εντοπίζει τα ακριβή χρονικά σημεία που απαντούν στο ερώτημά σου και συνθέτει ένα ενιαίο, συνεχόμενο μάθημα.',
    modeAuto: 'Αυτόματη Αναζήτηση YouTube + AI',
    modeManual: 'Δικά σου YouTube URLs + AI',
    queryPlaceholder:
      'π.χ. Τι νέο φέρνουν τα AI agents με MCP και tool calling, και ποια είναι τα καλύτερα tips;',
    manualUrlsLabel: 'Πρόσθεσε YouTube URLs (ένα ή περισσότερα)',
    manualUrlsPlaceholder: 'https://www.youtube.com/watch?v=... ή https://youtu.be/...',
    addUrl: 'Προσθήκη',
    synthesizeBtn: 'Δημιουργία Σύνθεσης',
    synthesizingBtn: 'Γίνεται Σύνθεση...',
    tryDemoBtn: 'Δοκίμασε Live Demo',
    examplesLabel: 'Έτοιμα παραδείγματα:',
    examples: [
      {
        label: 'AI Agents & Workflows',
        query: 'Πώς χτίζουμε πρακτικά AI Agents με tool calling και ποια λάθη να αποφεύγουμε;',
      },
      {
        label: 'Gemini Video & Multimodal',
        query: 'Πώς αξιοποιούμε το multimodal video understanding του Gemini σε πραγματικές εφαρμογές;',
      },
      {
        label: 'Prompt Engineering Tips',
        query: 'Προχωρημένα tips & tricks για structured outputs και καλύτερο reasoning στα LLMs',
      },
    ],
    pipelinePlanning: 'Σχεδιασμός αναζήτησης με Gemini...',
    pipelineSearching: 'Αναζήτηση σχετικών βίντεο στο YouTube...',
    pipelineAnalyzing: 'Ανάλυση βίντεο & εντοπισμός χρονικών σημείων (timestamps)...',
    pipelineSynthesizing: 'Σύνθεση τελικής ροής & σημειώσεων...',
    clipOf: 'Απόσπασμα',
    synthesizedFrom: 'Σύνθεση',
    ofOriginalVideo: 'από συνολικά',
    autoAdvance: 'Αυτόματη μετάβαση',
    replayClip: 'Επανάληψη',
    prevClip: 'Προηγούμενο',
    nextClip: 'Επόμενο',
    speed: 'Ταχύτητα',
    whyThisClip: 'Γιατί επιλέχθηκε αυτό το σημείο',
    transcriptExcerpt: 'Τι ακούγεται / παρουσιάζεται',
    keyTakeaways: 'Βασικά σημεία που πρέπει να κρατήσεις',
    watchOnYoutube: 'Άνοιγμα στο YouTube',
    tabStoryboard: 'Ροή Clips',
    tabGuide: 'Συνολικός Οδηγός',
    tabSources: 'Πηγές Βίντεο',
    executiveSummary: 'Συνολική Σύνοψη Σύνθεσης',
    keyInsights: 'Κύρια Συμπεράσματα & Πρακτικά Βήματα',
    enableClip: 'Ενεργοποίηση clip',
    disableClip: 'Παράλειψη clip',
    noActiveClips: 'Δεν υπάρχουν ενεργά clips. Ενεργοποίησε τουλάχιστον ένα από τη λίστα.',
    demoBadge: 'LIVE DEMO',
    settingsTitle: 'Ρυθμίσεις API & Μοντέλου',
    settingsSubtitle:
      'Τα κλειδιά αποθηκεύονται τοπικά μόνο στον browser σου (localStorage) και δεν αποστέλλονται σε κανέναν server.',
    geminiKeyLabel: 'Gemini API Key (Υποχρεωτικό για ανάλυση)',
    geminiKeyHint: 'Απόκτησε δωρεάν key από το Google AI Studio (aistudio.google.com).',
    youtubeKeyLabel: 'YouTube Data API v3 Key (Για αυτόματη αναζήτηση)',
    youtubeKeyHint:
      'Απόκτησε key από το Google Cloud Console. Προαιρετικό αν χρησιμοποιείς "Δικά σου YouTube URLs".',
    modelLabel: 'Μοντέλο Gemini',
    maxVideosLabel: 'Μέγιστα βίντεο προς ανάλυση',
    saveSettings: 'Αποθήκευση',
    cancel: 'Ακύρωση',
    historyTitle: 'Αποθηκευμένες Συνθέσεις',
    historyEmpty: 'Δεν έχεις δημιουργήσει ακόμη κάποια σύνθεση.',
    loadSynthesis: 'Φόρτωση',
    deleteSynthesis: 'Διαγραφή',
    clipsCount: 'clips',
    errorNoGeminiKey: 'Χρειάζεται Gemini API Key. Άνοιξε τις Ρυθμίσεις API για να το προσθέσεις.',
    errorNoYoutubeKey:
      'Για αυτόματη αναζήτηση χρειάζεται YouTube Data API v3 Key, ή διάλεξε "Δικά σου YouTube URLs".',
    errorNoUrls: 'Πρόσθεσε τουλάχιστον ένα έγκυρο YouTube URL.',
    errorNoQuery: 'Γράψε τι θέλεις να μάθεις ή να συνθέσεις.',
    newSynthesis: 'Νέα Σύνθεση',
    moveUp: 'Μετακίνηση πάνω',
    moveDown: 'Μετακίνηση κάτω',
    statusPending: 'Αναμονή',
    statusAnalyzing: 'Ανάλυση...',
    statusDone: 'Έτοιμο',
    statusSkipped: 'Χωρίς σχετικό clip',
    statusError: 'Σφάλμα',
  },
  en: {
    brandTagline: 'AI Video Synthesis Studio',
    history: 'History',
    settings: 'API Settings',
    keysReady: 'API Ready',
    keysMissing: 'API Key Needed',
    heroTitle: 'Learn from 10 videos in the time of one.',
    heroSubtitle:
      'Tell AIvideON what you want to learn. Gemini AI watches YouTube videos, pinpoints the exact timestamps that answer your query, and stitches them into a seamless, guided lesson.',
    modeAuto: 'Auto YouTube Search + AI',
    modeManual: 'Custom YouTube URLs + AI',
    queryPlaceholder:
      'e.g. What is new in AI agents with MCP and tool calling, and what are the best workflows?',
    manualUrlsLabel: 'Add YouTube URLs (one or more)',
    manualUrlsPlaceholder: 'https://www.youtube.com/watch?v=... or https://youtu.be/...',
    addUrl: 'Add URL',
    synthesizeBtn: 'Synthesize Video',
    synthesizingBtn: 'Synthesizing...',
    tryDemoBtn: 'Try Live Demo',
    examplesLabel: 'Try an example:',
    examples: [
      {
        label: 'AI Agents & Workflows',
        query: 'How do we build practical AI agents with tool calling and what pitfalls to avoid?',
      },
      {
        label: 'Gemini Video & Multimodal',
        query: 'How to leverage Gemini multimodal video understanding in real-world web apps?',
      },
      {
        label: 'Prompt Engineering Tips',
        query: 'Advanced tips & tricks for structured outputs and better reasoning in LLMs',
      },
    ],
    pipelinePlanning: 'Planning search strategy with Gemini...',
    pipelineSearching: 'Searching relevant YouTube videos...',
    pipelineAnalyzing: 'Analyzing videos & extracting exact timestamps...',
    pipelineSynthesizing: 'Synthesizing composite timeline & notes...',
    clipOf: 'Clip',
    synthesizedFrom: 'Synthesized',
    ofOriginalVideo: 'from',
    autoAdvance: 'Auto-advance',
    replayClip: 'Replay',
    prevClip: 'Previous',
    nextClip: 'Next',
    speed: 'Speed',
    whyThisClip: 'Why this segment was selected',
    transcriptExcerpt: 'What is being said / shown',
    keyTakeaways: 'Key Takeaways',
    watchOnYoutube: 'Open on YouTube',
    tabStoryboard: 'Clip Storyboard',
    tabGuide: 'Synthesis Guide',
    tabSources: 'Source Videos',
    executiveSummary: 'Executive Synthesis Summary',
    keyInsights: 'Key Insights & Actionable Takeaways',
    enableClip: 'Include clip',
    disableClip: 'Skip clip',
    noActiveClips: 'No active clips selected. Enable at least one clip from the storyboard.',
    demoBadge: 'LIVE DEMO',
    settingsTitle: 'API & Model Settings',
    settingsSubtitle:
      'Keys are stored locally in your browser (localStorage) and are never sent to any third-party server.',
    geminiKeyLabel: 'Gemini API Key (Required for analysis)',
    geminiKeyHint: 'Get a free API key from Google AI Studio (aistudio.google.com).',
    youtubeKeyLabel: 'YouTube Data API v3 Key (For auto search)',
    youtubeKeyHint:
      'Get a key from Google Cloud Console. Optional if you use "Custom YouTube URLs".',
    modelLabel: 'Gemini Model',
    maxVideosLabel: 'Max videos to analyze',
    saveSettings: 'Save Settings',
    cancel: 'Cancel',
    historyTitle: 'Saved Syntheses',
    historyEmpty: 'No saved syntheses yet.',
    loadSynthesis: 'Load',
    deleteSynthesis: 'Delete',
    clipsCount: 'clips',
    errorNoGeminiKey: 'Gemini API Key is required. Open API Settings to add yours.',
    errorNoYoutubeKey:
      'Auto search requires a YouTube Data API v3 Key, or switch to "Custom YouTube URLs".',
    errorNoUrls: 'Add at least one valid YouTube URL.',
    errorNoQuery: 'Enter a topic or question to synthesize.',
    newSynthesis: 'New Synthesis',
    moveUp: 'Move up',
    moveDown: 'Move down',
    statusPending: 'Queued',
    statusAnalyzing: 'Analyzing...',
    statusDone: 'Ready',
    statusSkipped: 'No match',
    statusError: 'Error',
  },
};

export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
