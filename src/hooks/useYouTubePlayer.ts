import { useCallback, useEffect, useRef, useState } from 'react';
import type { SynthesizedClip } from '../types';

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement | string,
        options: {
          width?: string | number;
          height?: string | number;
          videoId?: string;
          playerVars?: Record<string, string | number | undefined>;
          events?: {
            onReady?: (event: { target: YTPlayerInstance }) => void;
            onStateChange?: (event: { data: number; target: YTPlayerInstance }) => void;
          };
        }
      ) => YTPlayerInstance;
      PlayerState?: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayerInstance {
  loadVideoById: (options: {
    videoId: string;
    startSeconds?: number;
    endSeconds?: number;
  }) => void;
  cueVideoById: (options: {
    videoId: string;
    startSeconds?: number;
    endSeconds?: number;
  }) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  setPlaybackRate: (rate: number) => void;
  setVolume: (volume: number) => void;
  getCurrentTime: () => number;
  getPlayerState: () => number;
  destroy: () => void;
}

let ytApiPromise: Promise<void> | null = null;

function loadYouTubeIframeApi(): Promise<void> {
  if (window.YT && window.YT.Player) {
    return Promise.resolve();
  }
  if (ytApiPromise) {
    return ytApiPromise;
  }

  ytApiPromise = new Promise<void>((resolve) => {
    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prevCallback) prevCallback();
      resolve();
    };

    const existingScript = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]'
    );
    if (!existingScript) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      document.head.appendChild(tag);
    }
  });

  return ytApiPromise;
}

interface UseYouTubePlayerProps {
  activeClip: SynthesizedClip | null;
  autoPlayOnClipChange: boolean;
  playbackRate: number;
  suppressEndCheck?: boolean;
  onClipEnded: () => void;
}

export function useYouTubePlayer({
  activeClip,
  autoPlayOnClipChange,
  playbackRate,
  suppressEndCheck = false,
  onClipEnded,
}: UseYouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayerInstance | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [currentSeconds, setCurrentSeconds] = useState(0);

  const onClipEndedRef = useRef(onClipEnded);
  onClipEndedRef.current = onClipEnded;

  const activeClipRef = useRef(activeClip);
  activeClipRef.current = activeClip;

  const autoPlayRef = useRef(autoPlayOnClipChange);
  autoPlayRef.current = autoPlayOnClipChange;

  const playbackRateRef = useRef(playbackRate);
  playbackRateRef.current = playbackRate;

  const suppressEndCheckRef = useRef(suppressEndCheck);
  suppressEndCheckRef.current = suppressEndCheck;

  const endedFiredForClipRef = useRef<string | null>(null);
  const clipLoadedAtRef = useRef<number>(0);

  const hasClip = Boolean(activeClip);

  useEffect(() => {
    if (!hasClip) return;
    let mounted = true;

    loadYouTubeIframeApi().then(() => {
      if (!mounted || !containerRef.current || !window.YT?.Player) return;
      if (playerRef.current) return;

      const playerDiv = document.createElement('div');
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(playerDiv);

      const initialClip = activeClipRef.current;
      clipLoadedAtRef.current = Date.now();

      playerRef.current = new window.YT.Player(playerDiv, {
        width: '100%',
        height: '100%',
        videoId: initialClip?.videoId,
        playerVars: {
          autoplay: autoPlayRef.current ? 1 : 0,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          origin: window.location.origin,
          start: initialClip?.startSeconds,
          end: initialClip?.endSeconds,
        },
        events: {
          onReady: (event) => {
            if (!mounted) return;
            setIsReady(true);
            event.target.setPlaybackRate(playbackRateRef.current);
            event.target.setVolume(100);
            if (initialClip) {
              setCurrentSeconds(initialClip.startSeconds);
              if (autoPlayRef.current) {
                event.target.loadVideoById({
                  videoId: initialClip.videoId,
                  startSeconds: initialClip.startSeconds,
                  endSeconds: initialClip.endSeconds,
                });
              }
            }
          },
          onStateChange: (event) => {
            if (!mounted) return;
            const YTState = window.YT?.PlayerState;
            const state = event.data;
            const clip = activeClipRef.current;

            if (state === (YTState?.PLAYING ?? 1)) {
              setIsPlaying(true);
              event.target.setPlaybackRate(playbackRateRef.current);
            } else if (state === (YTState?.PAUSED ?? 2)) {
              setIsPlaying(false);
            } else if (state === (YTState?.ENDED ?? 0)) {
              setIsPlaying(false);
              const elapsedSinceLoad = Date.now() - clipLoadedAtRef.current;
              if (
                clip &&
                !suppressEndCheckRef.current &&
                elapsedSinceLoad > 1200 &&
                endedFiredForClipRef.current !== clip.id
              ) {
                endedFiredForClipRef.current = clip.id;
                setIsFadingOut(false);
                onClipEndedRef.current();
              }
            }
          },
        },
      });
    });

    return () => {
      mounted = false;
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // ignore
        }
        playerRef.current = null;
      }
      setIsReady(false);
      setIsPlaying(false);
      setIsFadingOut(false);
    };
  }, [hasClip]);

  // Load new clip whenever activeClip changes
  useEffect(() => {
    if (!isReady || !playerRef.current || !activeClip) return;

    endedFiredForClipRef.current = null;
    clipLoadedAtRef.current = Date.now();
    setIsFadingOut(false);
    setCurrentSeconds(activeClip.startSeconds);

    try {
      playerRef.current.setVolume(100);
    } catch {
      // ignore
    }

    const payload = {
      videoId: activeClip.videoId,
      startSeconds: activeClip.startSeconds,
      endSeconds: activeClip.endSeconds,
    };

    if (autoPlayRef.current) {
      playerRef.current.loadVideoById(payload);
    } else {
      playerRef.current.cueVideoById(payload);
    }
  }, [activeClip?.id, activeClip?.videoId, activeClip?.startSeconds, activeClip?.endSeconds, isReady]);

  // Sync playback rate
  useEffect(() => {
    if (isReady && playerRef.current) {
      try {
        playerRef.current.setPlaybackRate(playbackRate);
      } catch {
        // ignore
      }
    }
  }, [playbackRate, isReady]);

  // Poll every 100ms for smooth audio fade-in/fade-out, visual fade, and reliable endSeconds transition
  useEffect(() => {
    if (!isReady) return;

    const FADE_OUT_SEC = 1.4;
    const FADE_IN_SEC = 0.8;

    const interval = window.setInterval(() => {
      const player = playerRef.current;
      const clip = activeClipRef.current;
      if (!player || !clip) return;
      if (suppressEndCheckRef.current) return;

      const elapsedSinceLoad = Date.now() - clipLoadedAtRef.current;
      if (elapsedSinceLoad < 900) return;

      try {
        const state = player.getPlayerState();
        const isCurrentlyPlaying = state === (window.YT?.PlayerState?.PLAYING ?? 1);
        if (!isCurrentlyPlaying) return;

        const time = player.getCurrentTime();
        if (typeof time !== 'number' || Number.isNaN(time)) return;

        setCurrentSeconds(time);

        const clipDuration = Math.max(1, clip.endSeconds - clip.startSeconds);
        const fromStart = time - clip.startSeconds;
        const remaining = clip.endSeconds - time;

        // Smooth audio fade-in at the beginning of the clip
        if (clipDuration > 3 && fromStart >= 0 && fromStart < FADE_IN_SEC) {
          const vol = Math.min(100, Math.max(15, Math.round((fromStart / FADE_IN_SEC) * 100)));
          player.setVolume(vol);
        } else if (clipDuration > 4 && remaining <= FADE_OUT_SEC && remaining > 0) {
          // Smooth audio + visual fade-out at the end of the clip
          const ratio = Math.max(0, Math.min(1, remaining / FADE_OUT_SEC));
          player.setVolume(Math.round(ratio * 100));
          setIsFadingOut(true);
        } else if (remaining > FADE_OUT_SEC) {
          player.setVolume(100);
          setIsFadingOut(false);
        }

        if (remaining <= 0.15 && endedFiredForClipRef.current !== clip.id) {
          endedFiredForClipRef.current = clip.id;
          player.setVolume(0);
          player.pauseVideo();
          setIsFadingOut(false);
          onClipEndedRef.current();
        }
      } catch {
        // ignore transient player read errors
      }
    }, 100);

    return () => window.clearInterval(interval);
  }, [isReady]);

  const play = useCallback(() => {
    clipLoadedAtRef.current = Date.now();
    setIsFadingOut(false);
    try {
      playerRef.current?.setVolume(20);
      playerRef.current?.playVideo();
    } catch {
      // ignore
    }
  }, []);

  const pause = useCallback(() => {
    playerRef.current?.pauseVideo();
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      playerRef.current?.pauseVideo();
    } else {
      playerRef.current?.setVolume(100);
      playerRef.current?.playVideo();
    }
  }, [isPlaying]);

  const seekToSecond = useCallback((seconds: number) => {
    if (!playerRef.current) return;
    setIsFadingOut(false);
    playerRef.current.setVolume(100);
    playerRef.current.seekTo(seconds, true);
    setCurrentSeconds(seconds);
  }, []);

  return {
    containerRef,
    isReady,
    isPlaying,
    isFadingOut,
    currentSeconds,
    play,
    pause,
    togglePlay,
    seekToSecond,
  };
}
