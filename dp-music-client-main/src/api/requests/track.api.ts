import { httpClient } from "../HttpClient";

export class TrackApi {
  private TRACK_ENDPOINT = "track";

  getRootTracks = async (): Promise<any> => {
    const { data } = await httpClient.get(`${this.TRACK_ENDPOINT}/root`);

    return data;
  };

  getGenres = async (): Promise<string[]> => {
    const { data } = await httpClient.get(`${this.TRACK_ENDPOINT}/genres`);

    return data || [];
  };

  likeTrack = async (trackId: string): Promise<any> => {
    const { data } = await httpClient.put(
      `${this.TRACK_ENDPOINT}/${trackId}/like`,
      {}
    );

    return data;
  };

  unlikeTrack = async (trackId: string): Promise<any> => {
    const { data } = await httpClient.put(
      `${this.TRACK_ENDPOINT}/${trackId}/unlike`,
      {}
    );

    return data;
  };

  // Preview URLs are signed with a short expiry, so they're fetched fresh at
  // play time instead of being taken from track lists.
  getPreview = async (trackId: string): Promise<string | null> => {
    const { previewUrl } = await httpClient.get(
      `${this.TRACK_ENDPOINT}/${trackId}/preview`
    );

    return previewUrl || null;
  };

  logPlay = async (trackId: string): Promise<{ ad: any }> => {
    const result = await httpClient.post(
      `${this.TRACK_ENDPOINT}/${trackId}/play`,
      {}
    );

    return result || { ad: null };
  };
}

export const trackApi = new TrackApi();
