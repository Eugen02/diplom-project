import { makeAutoObservable } from "mobx";
import { TrackInterface } from "../types/interfaces/Track.interface";

export class PlayerStore {
  public track: TrackInterface | null = null;
  public queue: TrackInterface[] = [];
  public currentIndex: number = -1;
  public isPlaying: boolean = false;
  public currentTimeMs: number = 0;
  public durationMs: number = 0;

  constructor() {
    makeAutoObservable(this);

    this.setQueue = this.setQueue.bind(this);
    this.playNext = this.playNext.bind(this);
    this.playPrevious = this.playPrevious.bind(this);
    this.togglePlaying = this.togglePlaying.bind(this);
    this.setIsPlaying = this.setIsPlaying.bind(this);
    this.setDurationMs = this.setDurationMs.bind(this);
    this.setCurrentTimeMs = this.setCurrentTimeMs.bind(this);
  }

  // Selects a track to play, remembering the list it was picked from (the
  // currently viewed grid/playlist) so playNext/playPrevious can navigate it.
  setQueue(tracks: TrackInterface[], startIndex: number) {
    if (!tracks.length) {
      return;
    }

    const safeIndex = Math.min(Math.max(startIndex, 0), tracks.length - 1);

    this.queue = tracks;
    this.currentIndex = safeIndex;
    this.track = tracks[safeIndex];
    this.durationMs = tracks[safeIndex]?.durationMs || 0;
    this.currentTimeMs = 0;
    this.isPlaying = true;
  }

  playNext() {
    if (!this.queue.length) {
      return;
    }

    const nextIndex = (this.currentIndex + 1) % this.queue.length;

    this.currentIndex = nextIndex;
    this.track = this.queue[nextIndex];
    this.durationMs = this.queue[nextIndex]?.durationMs || 0;
    this.currentTimeMs = 0;
    this.isPlaying = true;
  }

  playPrevious() {
    if (!this.queue.length) {
      return;
    }

    const prevIndex =
      (this.currentIndex - 1 + this.queue.length) % this.queue.length;

    this.currentIndex = prevIndex;
    this.track = this.queue[prevIndex];
    this.durationMs = this.queue[prevIndex]?.durationMs || 0;
    this.currentTimeMs = 0;
    this.isPlaying = true;
  }

  setDurationMs(durationMs: number) {
    this.durationMs = durationMs;
  }

  togglePlaying() {
    this.isPlaying = !this.isPlaying;
  }

  setIsPlaying(isPlaying: boolean) {
    this.isPlaying = isPlaying;
  }

  setCurrentTimeMs(currentTimeMs: number) {
    this.currentTimeMs = currentTimeMs;
  }
}
