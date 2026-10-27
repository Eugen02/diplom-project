import { makeAutoObservable } from "mobx";
import { PlaylistInterface } from "../types/interfaces/Playlist.interface";

export class PlaylistStore {
  public playlists: PlaylistInterface[] = [];

  constructor() {
    makeAutoObservable(this);

    this.setPlaylists = this.setPlaylists.bind(this);
  }

  setPlaylists(playlists: PlaylistInterface[]) {
    this.playlists = playlists;
  }
}
