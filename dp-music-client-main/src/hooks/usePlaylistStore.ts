import { PlaylistStore } from "../stores/PlaylistStore";
import { StoresEnum, useStore } from "./useStore";

export const usePlaylistStore = () => {
  const { playlists, setPlaylists } = useStore(
    StoresEnum.PLAYLIST_STORE
  ) as PlaylistStore;

  return {
    playlists,
    setPlaylists,
  };
};
