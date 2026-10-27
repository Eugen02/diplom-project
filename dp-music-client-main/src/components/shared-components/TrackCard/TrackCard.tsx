import React, { ReactElement } from "react";

import {
  ArtistNameStyledWrapper,
  PlayIconStyledWrapper,
  TrackCardStyledWrapper,
  TrackInfoStyledWrapper,
  TrackNameStyledWrapper,
} from "./TrackCard.styled";
import { TrackCover } from "../TrackCover/TrackCover";
import { FaPlayCircle } from "react-icons/fa";
import { usePlayerStore } from "../../../hooks/usePlayerStore";
import { TrackInterface } from "../../../types/interfaces/Track.interface";
import { Artists } from "../Artists/Artists";

interface TrackCardProps {
  track: TrackInterface;
  // The list this card belongs to (e.g. the whole grid) and this card's
  // position in it, so the player's next/previous buttons can navigate
  // through the same list. Falls back to a single-track queue if omitted.
  queue?: TrackInterface[];
  index?: number;
}

export const TrackCard = (props: TrackCardProps): ReactElement => {
  const { track, queue, index } = props;

  const { trackCover, trackName, artists } = track || {};

  const { setQueue } = usePlayerStore();

  const startPlaying = (): void => {
    const effectiveQueue = queue && queue.length ? queue : [track];
    const effectiveIndex =
      typeof index === "number" ? index : effectiveQueue.indexOf(track);

    setQueue(effectiveQueue, Math.max(effectiveIndex, 0));
  };

  return (
    <TrackCardStyledWrapper onClick={startPlaying}>
      <TrackInfoStyledWrapper>
        <TrackCover coverUrl={trackCover || ""} size={170} margin="0 0 18px" />
        <TrackNameStyledWrapper>{trackName}</TrackNameStyledWrapper>
        <Artists artists={artists || []} />
      </TrackInfoStyledWrapper>

      <PlayIconStyledWrapper>
        <FaPlayCircle />
      </PlayIconStyledWrapper>
    </TrackCardStyledWrapper>
  );
};
