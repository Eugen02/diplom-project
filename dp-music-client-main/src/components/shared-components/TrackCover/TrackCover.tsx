import React, { ReactElement } from "react";

import { TrackCoverStyledWrapper } from "./TrackCover.styled";

interface TrackCoverProps {
  coverUrl: string;
  size: number;
  margin?: string;
}

const DEFAULT_COVER =
  "https://community.spotify.com/t5/image/serverpage/image-id/25294i2836BD1C1A31BDF2?v=v2";

export const TrackCover = (props: TrackCoverProps): ReactElement => {
  const { coverUrl = DEFAULT_COVER, size, margin } = props;

  return (
    <TrackCoverStyledWrapper
      src={coverUrl}
      style={{
        height: size,
        width: size,
        margin,
      }}
    />
  );
};
