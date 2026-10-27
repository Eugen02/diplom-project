import { PlayerStore } from "../stores/PlayerStore";
import { StoresEnum, useStore } from "./useStore";

export const usePlayerStore = () => {
  const {
    track,
    queue,
    currentIndex,
    durationMs,
    isPlaying,
    currentTimeMs,
    setCurrentTimeMs,
    setQueue,
    playNext,
    playPrevious,
    setDurationMs,
    togglePlaying,
    setIsPlaying,
  } = useStore(StoresEnum.PLAYER_STORE) as PlayerStore;

  return {
    durationMs,
    isPlaying,
    track,
    queue,
    currentIndex,
    currentTimeMs,
    setCurrentTimeMs,
    setQueue,
    playNext,
    playPrevious,
    setDurationMs,
    togglePlaying,
    setIsPlaying,
  };
};
