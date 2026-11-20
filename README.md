# AIvideON — AI Video Synthesis Studio

**AIvideON** synthesizes targeted, timestamped video lessons from multiple YouTube creators using **Gemini AI** multimodal video understanding and the **YouTube IFrame Player API**.

Instead of watching 3–5 long videos from start to finish, enter what you want to learn:
1. **Discovery**: Automatically searches YouTube (via YouTube Data API v3) or uses your custom YouTube URLs.
2. **Multimodal Analysis**: Gemini AI inspects each video's audio/transcript and visual frames to pinpoint the exact `startSeconds` – `endSeconds` segments that answer your query.
3. **Composite Playback**: A single unified YouTube player stitches those segments together seamlessly — automatically jumping from one creator's timestamped clip to the next — alongside synchronized AI explanations, transcript quotes, and key takeaways.

## Running Locally

```bash
npm install
npm run dev
```

Open the app, click **Try Live Demo** to test the composite player immediately, or add your **Gemini API Key** (and optional **YouTube Data API v3 Key**) in **API Settings** (stored locally in `localStorage`).
