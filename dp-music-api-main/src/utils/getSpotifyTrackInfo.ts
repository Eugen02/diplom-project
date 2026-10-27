import axios from "axios";

// Spotify's Web API now requires the developer account to have an active
// Premium subscription (403 "Active premium subscription required for the
// owner of the app"), even for basic client-credentials catalog lookups, and
// no longer reliably returns 30s previews even when it is available. Deezer's
// public search API needs no auth/subscription and returns both cover art
// and a playable 30s preview - it's looked up by artist+track name since it
// doesn't share Spotify's track id space.
//
// Deezer preview URLs are signed and expire ~15 minutes after being issued
// (`hdnea=exp=...`), so they must never be persisted: only the stable Deezer
// track id is stored, and a fresh preview URL is fetched at play time.
const DEEZER_API = "https://api.deezer.com";
const DEFAULT_COVER = "https://www.afrocharts.com/images/song_cover.png";
const MAX_CONCURRENT_REQUESTS = 4;

// Deezer's public API is rate-limited per IP (reports put it around 50
// requests / 5s); stay comfortably under that with a rolling window.
const RATE_LIMIT_WINDOW_MS = 5000;
const RATE_LIMIT_MAX_REQUESTS = 35;
const requestTimestamps: number[] = [];

// Refetch a preview this long before its signature expires.
const PREVIEW_EXPIRY_MARGIN_MS = 60 * 1000;
const PREVIEW_FALLBACK_TTL_MS = 5 * 60 * 1000;

interface TrackMetadata {
  trackCover: string;
  artists: { name: string }[];
  name: string;
  deezerId: number | null;
}

interface PreviewResult {
  deezerId: number | null;
  previewUrl: string | null;
}

const FALLBACK: TrackMetadata = {
  trackCover: DEFAULT_COVER,
  artists: [],
  name: "",
  deezerId: null,
};

const metadataCache = new Map<string, TrackMetadata>();
const previewCache = new Map<number, { url: string; expiresAt: number }>();

let activeRequests = 0;
const queue: (() => void)[] = [];

const acquireSlot = (): Promise<void> =>
  new Promise((resolve) => {
    const tryAcquire = () => {
      if (activeRequests < MAX_CONCURRENT_REQUESTS) {
        activeRequests += 1;
        resolve();
      } else {
        queue.push(tryAcquire);
      }
    };

    tryAcquire();
  });

const releaseSlot = (): void => {
  activeRequests -= 1;
  const next = queue.shift();

  if (next) {
    next();
  }
};

const waitForRateLimitSlot = async (): Promise<void> => {
  for (;;) {
    const now = Date.now();

    while (
      requestTimestamps.length &&
      now - requestTimestamps[0] > RATE_LIMIT_WINDOW_MS
    ) {
      requestTimestamps.shift();
    }

    if (requestTimestamps.length < RATE_LIMIT_MAX_REQUESTS) {
      requestTimestamps.push(now);

      return;
    }

    const waitMs = RATE_LIMIT_WINDOW_MS - (now - requestTimestamps[0]) + 10;

    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }
};

const deezerGet = async (path: string, params?: object): Promise<any> => {
  await acquireSlot();

  try {
    await waitForRateLimitSlot();

    const { data } = await axios.get(`${DEEZER_API}${path}`, {
      params,
      timeout: 5000,
    });

    return data;
  } finally {
    releaseSlot();
  }
};

const searchDeezerTrack = async (artistName: string, trackName: string) => {
  const data = await deezerGet("/search", {
    q: `${artistName} ${trackName}`,
    limit: 1,
  });

  return data?.data?.[0] || null;
};

const previewExpiry = (url: string): number => {
  const match = url.match(/exp=(\d+)/);

  return match
    ? Number(match[1]) * 1000 - PREVIEW_EXPIRY_MARGIN_MS
    : Date.now() + PREVIEW_FALLBACK_TTL_MS;
};

const rememberPreview = (deezerId: number, url: string): void => {
  previewCache.set(deezerId, { url, expiresAt: previewExpiry(url) });
};

export const getSpotifyTrackInfo = async (
  artistName: string,
  trackName: string
): Promise<TrackMetadata> => {
  if (!artistName && !trackName) {
    return FALLBACK;
  }

  const cacheKey = `${artistName}::${trackName}`.toLowerCase();
  const cached = metadataCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    const result = await searchDeezerTrack(artistName, trackName);

    const metadata: TrackMetadata = result
      ? {
          trackCover:
            result.album?.cover_big || result.album?.cover_medium || DEFAULT_COVER,
          artists: result.artist?.name ? [{ name: result.artist.name }] : [],
          name: result.title || "",
          deezerId: result.id || null,
        }
      : FALLBACK;

    if (result?.id && result.preview) {
      rememberPreview(result.id, result.preview);
    }

    metadataCache.set(cacheKey, metadata);

    return metadata;
  } catch (error) {
    return FALLBACK;
  }
};

// Fresh, playable preview URL. Uses the stored Deezer id when known, falling
// back to a search (whose result id the caller should persist).
export const getDeezerPreview = async (
  deezerId: number | null | undefined,
  artistName: string,
  trackName: string
): Promise<PreviewResult> => {
  if (deezerId) {
    const cached = previewCache.get(deezerId);

    if (cached && cached.expiresAt > Date.now()) {
      return { deezerId, previewUrl: cached.url };
    }
  }

  try {
    const result = deezerId
      ? await deezerGet(`/track/${deezerId}`)
      : await searchDeezerTrack(artistName, trackName);

    if (!result?.id || result.error) {
      return { deezerId: deezerId || null, previewUrl: null };
    }

    if (result.preview) {
      rememberPreview(result.id, result.preview);
    }

    return { deezerId: result.id, previewUrl: result.preview || null };
  } catch (error) {
    return { deezerId: deezerId || null, previewUrl: null };
  }
};
