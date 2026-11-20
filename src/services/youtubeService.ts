import type { YouTubeVideoCandidate } from '../types';

export function extractYouTubeVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Direct 11-char video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    const host = url.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      const id = url.pathname.slice(1).split('/')[0];
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      const vParam = url.searchParams.get('v');
      if (vParam && /^[a-zA-Z0-9_-]{11}$/.test(vParam)) {
        return vParam;
      }

      const pathParts = url.pathname.split('/').filter(Boolean);
      if (
        pathParts.length >= 2 &&
        ['shorts', 'embed', 'live', 'v'].includes(pathParts[0]) &&
        /^[a-zA-Z0-9_-]{11}$/.test(pathParts[1])
      ) {
        return pathParts[1];
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function parseIsoDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  return hours * 3600 + minutes * 60 + seconds;
}

export function buildYouTubeThumbnail(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export function buildYouTubeUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export async function searchYouTubeVideos(
  query: string,
  youtubeApiKey: string,
  maxResults = 6
): Promise<YouTubeVideoCandidate[]> {
  const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
  searchUrl.searchParams.set('part', 'snippet');
  searchUrl.searchParams.set('type', 'video');
  searchUrl.searchParams.set('videoEmbeddable', 'true');
  searchUrl.searchParams.set('q', query);
  searchUrl.searchParams.set('maxResults', String(Math.min(maxResults, 12)));
  searchUrl.searchParams.set('key', youtubeApiKey.trim());

  const searchRes = await fetch(searchUrl.toString());
  if (!searchRes.ok) {
    const errBody = await searchRes.json().catch(() => ({}));
    const msg = errBody?.error?.message || `YouTube Search API error (${searchRes.status})`;
    throw new Error(msg);
  }

  const searchData = await searchRes.json();
  const items = Array.isArray(searchData.items) ? searchData.items : [];
  const videoIds: string[] = items
    .map((item: { id?: { videoId?: string } }) => item.id?.videoId)
    .filter((id: unknown): id is string => typeof id === 'string' && id.length > 0);

  if (videoIds.length === 0) {
    return [];
  }

  return fetchVideosByIds(videoIds, youtubeApiKey);
}

export async function fetchVideosByIds(
  videoIds: string[],
  youtubeApiKey?: string
): Promise<YouTubeVideoCandidate[]> {
  const uniqueIds = Array.from(new Set(videoIds));
  if (uniqueIds.length === 0) return [];

  if (youtubeApiKey && youtubeApiKey.trim().length > 0) {
    const videosUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
    videosUrl.searchParams.set('part', 'snippet,contentDetails');
    videosUrl.searchParams.set('id', uniqueIds.join(','));
    videosUrl.searchParams.set('key', youtubeApiKey.trim());

    const res = await fetch(videosUrl.toString());
    if (res.ok) {
      const data = await res.json();
      const items = Array.isArray(data.items) ? data.items : [];
      return items.map(
        (item: {
          id: string;
          snippet?: {
            title?: string;
            channelTitle?: string;
            publishedAt?: string;
            description?: string;
            thumbnails?: { high?: { url?: string }; medium?: { url?: string } };
          };
          contentDetails?: { duration?: string };
        }) => ({
          videoId: item.id,
          url: buildYouTubeUrl(item.id),
          title: item.snippet?.title || `YouTube Video (${item.id})`,
          channelTitle: item.snippet?.channelTitle || 'YouTube Creator',
          thumbnailUrl:
            item.snippet?.thumbnails?.high?.url ||
            item.snippet?.thumbnails?.medium?.url ||
            buildYouTubeThumbnail(item.id),
          publishedAt: item.snippet?.publishedAt,
          durationSeconds: item.contentDetails?.duration
            ? parseIsoDuration(item.contentDetails.duration)
            : undefined,
          description: item.snippet?.description,
        })
      );
    }
  }

  // Fallback without YouTube API key using YouTube oEmbed
  const candidates = await Promise.all(
    uniqueIds.map(async (videoId): Promise<YouTubeVideoCandidate> => {
      const url = buildYouTubeUrl(videoId);
      try {
        const oembedRes = await fetch(
          `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
        );
        if (oembedRes.ok) {
          const data = await oembedRes.json();
          return {
            videoId,
            url,
            title: data.title || `YouTube Video (${videoId})`,
            channelTitle: data.author_name || 'YouTube Creator',
            thumbnailUrl: data.thumbnail_url || buildYouTubeThumbnail(videoId),
          };
        }
      } catch {
        // Ignore oEmbed failure and fall back to basic metadata
      }
      return {
        videoId,
        url,
        title: `YouTube Video (${videoId})`,
        channelTitle: 'YouTube Creator',
        thumbnailUrl: buildYouTubeThumbnail(videoId),
      };
    })
  );

  return candidates;
}
