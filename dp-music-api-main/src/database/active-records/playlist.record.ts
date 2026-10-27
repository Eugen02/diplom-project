import { enrichTrackWithMetadata } from "./track.record";
import { PlaylistModel } from "../models/playlist.model";

interface PlaylistRecordInterface {
  getAllPlaylists: (ownerId: string) => Promise<any>;
  getPlaylistById: (id: string) => Promise<any>;
  createPlaylist: (playlist: any) => Promise<any>;
}

export class PlaylistRecord implements PlaylistRecordInterface {
  async getAllPlaylists(ownerId: string): Promise<any> {
    const playlists = await PlaylistModel.find({ owner: ownerId })
      .populate("tracks")
      .exec();

    const playlistsWithSpotifyMetadata = await Promise.all(
      playlists.map(async (playlist: any) => {
        const { tracks = [] } = playlist || {};

        const tracksWithSpotifyMetadata = await Promise.all(
          tracks.map((track: any) => enrichTrackWithMetadata(track))
        );

        return {
          ...playlist._doc,
          id: playlist._id,
          tracks: tracksWithSpotifyMetadata,
        };
      })
    );

    return playlistsWithSpotifyMetadata;
  }

  async getPlaylistById(id: string): Promise<any> {
    const playlist = await PlaylistModel.findById(id).populate("tracks").exec();

    const { tracks = [] } = playlist || {};

    const tracksWithSpotifyMetadata = await Promise.all(
      tracks.map((track: any) => enrichTrackWithMetadata(track))
    );

    return {
      // @ts-ignore
      ...playlist?._doc,
      tracks: tracksWithSpotifyMetadata,
    };
  }

  async createPlaylist(playlist: any): Promise<any> {
    const createdPlaylist = await PlaylistModel.create(playlist);

    return createdPlaylist;
  }

  async getOwnerId(id: string): Promise<string | undefined> {
    const playlist = await PlaylistModel.findById(id).select("owner");

    return playlist?.owner?.toString();
  }

  async deletePlaylist(id: string): Promise<any> {
    const deletedPlaylist = await PlaylistModel.findByIdAndDelete(id);

    return deletedPlaylist;
  }

  async addTrackToPlaylist(id: string, trackId: any): Promise<any> {
    const playlist = await PlaylistModel.findById(id);

    const isTrackAlreadyInPlaylist = playlist?.tracks.includes(trackId);

    if (isTrackAlreadyInPlaylist) {
      return playlist;
    }

    playlist?.tracks.push(trackId);

    const updatedPlaylist = await playlist?.save();

    return updatedPlaylist;
  }

  async removeTrackFromPlaylist(id: string, trackId: any): Promise<any> {
    const playlist = await PlaylistModel.findById(id);

    const isTrackAlreadyInPlaylist = playlist?.tracks.includes(trackId);

    if (!isTrackAlreadyInPlaylist) {
      return playlist;
    }

    // @ts-ignore
    playlist?.tracks.pull(trackId);

    const updatedPlaylist = await playlist?.save();

    return updatedPlaylist;
  }
}

export const playlistRecord = new PlaylistRecord();
