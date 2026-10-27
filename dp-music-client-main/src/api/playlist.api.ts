import { httpClient } from "./HttpClient";

export class PlaylistApi {
  private PLAYLIST_ENDPOINT = "playlist";

  public getAllPlaylists = async (): Promise<any> => {
    const { data } = await httpClient.get(`${this.PLAYLIST_ENDPOINT}/all`);

    return data;
  };

  public getPlaylistById = async (id?: string): Promise<any> => {
    const { data } = await httpClient.get(`${this.PLAYLIST_ENDPOINT}/${id}`);

    return data;
  };

  public createPlaylist = async (name: string): Promise<any> => {
    const { createdPlaylist } = await httpClient.post(
      `${this.PLAYLIST_ENDPOINT}`,
      {
        playlist: { name },
      }
    );

    return createdPlaylist;
  };

  public createRecommendedPlaylist = async (
    name: string,
    genres: string[]
  ): Promise<any> => {
    const { createdPlaylist } = await httpClient.post(
      `${this.PLAYLIST_ENDPOINT}/recommendation`,
      { name, genres }
    );

    return createdPlaylist;
  };

  public addTrackToPlaylist = async (
    playlistId: string,
    trackId: string
  ): Promise<any> => {
    const { updatedPlaylist } = await httpClient.put(
      `${this.PLAYLIST_ENDPOINT}/${playlistId}/add-track`,
      {
        trackId,
      }
    );

    return updatedPlaylist;
  };

  public removeTrackFromPlaylist = async (
    playlistId: string,
    trackId: string
  ): Promise<any> => {
    const { updatedPlaylist } = await httpClient.put(
      `${this.PLAYLIST_ENDPOINT}/${playlistId}/remove-track`,
      {
        trackId,
      }
    );

    return updatedPlaylist;
  };

  public deletePlaylist = async (playlistId: string): Promise<any> => {
    return httpClient.delete(`${this.PLAYLIST_ENDPOINT}/${playlistId}`);
  };

  public getRecommendationSummary = async (
    playlistId?: string
  ): Promise<any> => {
    if (!playlistId) {
      return;
    }

    const { data } = await httpClient.get(
      `${this.PLAYLIST_ENDPOINT}/${playlistId}/recommendation/summary`
    );

    return data;
  };
}

export const playlistApi = new PlaylistApi();
