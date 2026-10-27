import { createContext, useContext } from "react";
import { UserStore } from "../stores/UserStore";
import { PlayerStore } from "../stores/PlayerStore";
import { PlaylistStore } from "../stores/PlaylistStore";

export enum StoresEnum {
  USER_STORE = "userStore",
  PLAYER_STORE = "playerStore",
  PLAYLIST_STORE = "playlistStore",
}

export interface StoreInterface {
  userStore: UserStore;
  playerStore: PlayerStore;
  playlistStore: PlaylistStore;
}

export const store: StoreInterface = {
  [StoresEnum.USER_STORE]: new UserStore(),
  [StoresEnum.PLAYER_STORE]: new PlayerStore(),
  [StoresEnum.PLAYLIST_STORE]: new PlaylistStore(),
};

export const StoreContext = createContext(store);

export const useStore = (store: StoresEnum) => {
  const stores: StoreInterface = useContext(StoreContext);

  return stores[store];
};
