import React, { ReactElement, ReactNode } from "react";

import { TrackNameStyledWrapper, TrackStyledWrapper } from "./Track.styled";
import { TrackCover } from "../TrackCover/TrackCover";
import { Artists } from "../Artists/Artists";
import { ArtistInterface } from "../../../types/interfaces/Artist.interface";
import { LikeButton } from "../../composit-components/Player/Player";
import { AddToPlaylistButton } from "../AddToPlaylistButton/AddToPlaylistButton";
import { FaTrash } from "react-icons/fa";
import { colors } from "../../../constants/colors";
import { usePlayerStore } from "../../../hooks/usePlayerStore";

interface TrackProps {
  trackId: string;
  coverUrl: string;
  trackName: string;
  artists: ArtistInterface[];
  onRemove?: () => void;
  onAddedToPlaylist?: (playlistId: string) => void;
  // The full track object (for playback) plus the list it belongs to and
  // its position in it, so clicking a row plays it and next/previous can
  // navigate the same list. Falls back to a single-track queue if omitted.
  track?: any;
  queue?: any[];
  index?: number;
  // Extra control shown before the row actions (e.g. a recommendation match badge).
  badge?: ReactNode;
}

export const Track = (props: TrackProps): ReactElement => {
  const {
    trackId,
    trackName,
    coverUrl,
    artists,
    onRemove,
    onAddedToPlaylist,
    track,
    queue,
    index,
    badge,
  } = props;

  const { setQueue } = usePlayerStore();

  const playableTrack = track || { id: trackId, trackName, trackCover: coverUrl, artists };

  const handlePlay = () => {
    const effectiveQueue = queue && queue.length ? queue : [playableTrack];
    const effectiveIndex =
      typeof index === "number" ? index : effectiveQueue.indexOf(playableTrack);

    setQueue(effectiveQueue, Math.max(effectiveIndex, 0));
  };

  return (
    <TrackStyledWrapper onClick={handlePlay} style={{ cursor: "pointer" }}>
      <TrackCover coverUrl={coverUrl} size={70} />

      <div
        style={{
          marginLeft: 18,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <TrackNameStyledWrapper>{trackName}</TrackNameStyledWrapper>
        <Artists artists={artists} />
      </div>

      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {badge}
        <AddToPlaylistButton trackId={trackId} onAdd={onAddedToPlaylist} />
        <LikeButton trackId={trackId} />

        {onRemove && (
          <div style={{ cursor: "pointer" }} onClick={onRemove}>
            <FaTrash color={colors.gray} />
          </div>
        )}
      </div>
    </TrackStyledWrapper>
  );
};
