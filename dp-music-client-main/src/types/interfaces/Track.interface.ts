export interface TrackInterface {
  id?: string;
  artistName: string;
  trackName: string;
  year: number;
  genre: string;
  trackId: string;
  popularity?: number;
  danceability?: number;
  energy?: number;
  key?: number;
  loudness?: number;
  mode?: number;
  speechiness?: number;
  acousticness?: number;
  instrumentalness?: number;
  liveness?: number;
  valence?: number;
  tempo?: number;
  durationMs?: number;
  timeSgnature?: number;
  trackUrl?: string;
  trackCover?: string;
  artists?: any[];
}
